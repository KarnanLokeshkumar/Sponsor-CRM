package com.sponsorcrm.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

        private final UserAccountRepository userRepository;
        private final PasswordSetupTokenRepository tokenRepository;
        private final PasswordEncoder passwordEncoder;
        private final EmailService emailService;

        private final SecureRandom secureRandom = new SecureRandom();

        public AdminUserController(
                        UserAccountRepository userRepository,
                        PasswordSetupTokenRepository tokenRepository,
                        PasswordEncoder passwordEncoder,
                        EmailService emailService) {

                this.userRepository = userRepository;
                this.tokenRepository = tokenRepository;
                this.passwordEncoder = passwordEncoder;
                this.emailService = emailService;
        }

        @PostMapping
        public ResponseEntity<?> createUser(
                        @Valid @RequestBody CreateUserRequest request) {

                String email = request.email()
                                .trim()
                                .toLowerCase();

                // Check whether the account already exists.
                if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
                        throw new ResponseStatusException(
                                        HttpStatus.CONFLICT,
                                        "An account with this email already exists");
                }

                // Generate a random initial password.
                // This password is never sent to the user.
                byte[] randomPassword = new byte[32];
                secureRandom.nextBytes(randomPassword);

                String initialPassword = Base64.getUrlEncoder()
                                .withoutPadding()
                                .encodeToString(randomPassword);

                // Create the user account.
                UserAccount user = new UserAccount();

                user.setEmail(email);
                user.setPasswordHash(
                                passwordEncoder.encode(initialPassword));

                user.setRole(
                                request.role() == null || request.role().isBlank()
                                                ? "USER"
                                                : request.role().trim().toUpperCase());

                user.setActive(true);

                UserAccount savedUser = userRepository.save(user);

                // Generate a secure password setup token.
                byte[] tokenBytes = new byte[32];
                secureRandom.nextBytes(tokenBytes);

                String rawToken = Base64.getUrlEncoder()
                                .withoutPadding()
                                .encodeToString(tokenBytes);

                // Store only the hashed token.
                PasswordSetupToken setupToken = new PasswordSetupToken();

                setupToken.setUser(savedUser);
                setupToken.setTokenHash(hashToken(rawToken));
                setupToken.setExpiresAt(
                                LocalDateTime.now().plusMinutes(30));
                setupToken.setUsed(false);

                tokenRepository.save(setupToken);

                // Send the password setup email.
                emailService.sendPasswordSetupEmail(
                                email,
                                rawToken);

                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(
                                                Map.of(
                                                                "message",
                                                                "Account created. Password setup email sent.",
                                                                "email",
                                                                email));
        }

        /**
         * Hashes the setup token using SHA-256.
         */
        private String hashToken(String token) {

                try {
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");

                        byte[] hash = digest.digest(
                                        token.getBytes(StandardCharsets.UTF_8));

                        return HexFormat.of().formatHex(hash);

                } catch (NoSuchAlgorithmException exception) {

                        throw new IllegalStateException(
                                        "SHA-256 algorithm is unavailable",
                                        exception);
                }
        }

        /**
         * Request body for creating a user account.
         */
        public record CreateUserRequest(

                        @NotBlank @Email String email,

                        String role

        ) {
        }
}