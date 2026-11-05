package com.sponsorcrm.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PasswordSetupTokenRepository
        extends JpaRepository<PasswordSetupToken, Long> {

    Optional<PasswordSetupToken> findByTokenHash(String tokenHash);

    void deleteByUser(UserAccount user);
}