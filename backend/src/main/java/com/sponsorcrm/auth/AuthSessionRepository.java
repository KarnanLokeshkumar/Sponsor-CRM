package com.sponsorcrm.auth;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface AuthSessionRepository extends JpaRepository<AuthSession,Long>{ Optional<AuthSession> findByTokenHash(String hash); void deleteByTokenHash(String hash); }
