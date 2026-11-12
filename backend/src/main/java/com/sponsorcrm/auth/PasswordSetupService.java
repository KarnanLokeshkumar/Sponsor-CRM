package com.sponsorcrm.auth;

import com.sponsorcrm.security.TokenUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
public class PasswordSetupService {

        private final PasswordSetupTokenRepository tokens;
        private final UserAccountRepository users;
        private final PasswordEncoder passwordEncoder;

        public PasswordSetupService(
                        PasswordSetupTokenRepository tokens,
                        UserAccountRepository users,
                        PasswordEncoder passwordEncoder) {
                this.tokens = tokens;
                this.users = users;
                this.passwordEncoder = passwordEncoder;
        }

        @Transactional
        public void setupPassword(String rawToken, String newPassword) {

                if (rawToken == null || rawToken.isBlank()) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Password setup token is required");
                }

                String tokenHash = TokenUtil.hash(rawToken);

                PasswordSetupToken setupToken = tokens.findByTokenHash(tokenHash)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.BAD_REQUEST,
                                                "Invalid or expired password setup link"));

                if (setupToken.isUsed()
                                || setupToken.getExpiresAt().isBefore(LocalDateTime.now())) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Invalid or expired password setup link");
                }

                UserAccount user = setupToken.getUser();

                if (!user.isActive()) {
                        throw new ResponseStatusException(
                                        HttpStatus.FORBIDDEN,
                                        "This account is inactive");
                }

                if (newPassword == null || newPassword.length() < 8) {
                        throw new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Password must contain at least 8 characters");
                }

                user.setPasswordHash(passwordEncoder.encode(newPassword));
                users.save(user);

                setupToken.setUsed(true);
                tokens.save(setupToken);
        }
}