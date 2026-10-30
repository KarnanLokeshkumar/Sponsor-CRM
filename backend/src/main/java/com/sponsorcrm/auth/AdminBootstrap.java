package com.sponsorcrm.auth;
import org.springframework.beans.factory.annotation.Value;import org.springframework.boot.CommandLineRunner;import org.springframework.context.annotation.Bean;import org.springframework.context.annotation.Configuration;import org.springframework.security.crypto.password.PasswordEncoder;
@Configuration public class AdminBootstrap {
 @Bean CommandLineRunner createInitialAdmin(UserAccountRepository users,PasswordEncoder encoder,@Value("${CRM_ADMIN_EMAIL:}") String email,@Value("${CRM_ADMIN_PASSWORD:}") String password){return args->{if(email!=null&&!email.isBlank()&&password!=null&&!password.isBlank()&&users.findByEmailIgnoreCase(email).isEmpty()){UserAccount u=new UserAccount();u.setEmail(email.trim().toLowerCase());u.setPasswordHash(encoder.encode(password));u.setRole("ADMIN");u.setActive(true);users.save(u);}};}
}
