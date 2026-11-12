package com.sponsorcrm.auth;

import com.sponsorcrm.security.TokenUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.SecureRandom;
import java.util.Base64;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserAccountRepository users;
    private final AuthSessionRepository sessions;
    private final PasswordEncoder encoder;

    public AuthController(UserAccountRepository u, AuthSessionRepository s, PasswordEncoder e) {
        users = u;
        sessions = s;
        encoder = e;
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {
    }

    @PostMapping("/login")
    public Map<String, Object> login(@Valid @RequestBody LoginRequest body) {
        UserAccount user = users.findByEmailIgnoreCase(body.email()).filter(UserAccount::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        if (!encoder.matches(body.password(), user.getPasswordHash()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        AuthSession session = new AuthSession();
        session.setTokenHash(TokenUtil.hash(token));
        session.setUser(user);
        session.setExpiresAt(LocalDateTime.now().plusHours(12));
        sessions.save(session);
        return Map.of("token", token, "email", user.getEmail(), "role", user.getRole(), "expiresAt",
                session.getExpiresAt().toString());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(@RequestHeader(value = "Authorization", required = false) String header) {
        if (header != null && header.startsWith("Bearer "))
            sessions.deleteByTokenHash(TokenUtil.hash(header.substring(7)));
    }
}
