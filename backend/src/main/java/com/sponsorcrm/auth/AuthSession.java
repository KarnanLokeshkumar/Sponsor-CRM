package com.sponsorcrm.auth;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity @Table(name="crm_sessions")
public class AuthSession {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=64,unique=true) private String tokenHash;
 @ManyToOne(optional=false,fetch=FetchType.EAGER) private UserAccount user;
 @Column(nullable=false) private LocalDateTime expiresAt;
 public Long getId(){return id;} public String getTokenHash(){return tokenHash;} public void setTokenHash(String v){tokenHash=v;}
 public UserAccount getUser(){return user;} public void setUser(UserAccount v){user=v;} public LocalDateTime getExpiresAt(){return expiresAt;} public void setExpiresAt(LocalDateTime v){expiresAt=v;}
}
