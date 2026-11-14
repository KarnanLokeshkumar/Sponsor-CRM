package com.sponsorcrm.auth;

import com.sponsorcrm.security.TokenUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PasswordSetupServiceTest {

    private static final String RAW_TOKEN = "one-time-setup-token";

    @Mock
    private PasswordSetupTokenRepository tokens;

    @Mock
    private UserAccountRepository users;

    @Mock
    private PasswordEncoder passwordEncoder;

    private PasswordSetupService service;

    @BeforeEach
    void setUp() {
        service = new PasswordSetupService(tokens, users, passwordEncoder);
    }

    @Test
    void setupPasswordUpdatesAccountAndConsumesToken() {
        UserAccount user = new UserAccount();
        PasswordSetupToken token = tokenFor(user, LocalDateTime.now().plusMinutes(10));
        when(tokens.findByTokenHash(TokenUtil.hash(RAW_TOKEN))).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("new-secure-password")).thenReturn("encoded-password");

        service.setupPassword(RAW_TOKEN, "new-secure-password");

        assertEquals("encoded-password", user.getPasswordHash());
        assertTrue(token.isUsed());
        verify(users).save(user);
        verify(tokens).save(token);
    }

    @Test
    void setupPasswordRejectsExpiredToken() {
        PasswordSetupToken token = tokenFor(new UserAccount(), LocalDateTime.now().minusSeconds(1));
        when(tokens.findByTokenHash(TokenUtil.hash(RAW_TOKEN))).thenReturn(Optional.of(token));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.setupPassword(RAW_TOKEN, "new-secure-password"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void setupPasswordRejectsReusedToken() {
        PasswordSetupToken token = tokenFor(new UserAccount(), LocalDateTime.now().plusMinutes(10));
        token.setUsed(true);
        when(tokens.findByTokenHash(TokenUtil.hash(RAW_TOKEN))).thenReturn(Optional.of(token));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.setupPassword(RAW_TOKEN, "new-secure-password"));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void setupPasswordRejectsInactiveAccount() {
        UserAccount user = new UserAccount();
        user.setActive(false);
        PasswordSetupToken token = tokenFor(user, LocalDateTime.now().plusMinutes(10));
        when(tokens.findByTokenHash(TokenUtil.hash(RAW_TOKEN))).thenReturn(Optional.of(token));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.setupPassword(RAW_TOKEN, "new-secure-password"));

        assertEquals(HttpStatus.FORBIDDEN, exception.getStatusCode());
        assertFalse(token.isUsed());
    }

    private PasswordSetupToken tokenFor(UserAccount user, LocalDateTime expiresAt) {
        PasswordSetupToken token = new PasswordSetupToken();
        token.setUser(user);
        token.setExpiresAt(expiresAt);
        return token;
    }
}
