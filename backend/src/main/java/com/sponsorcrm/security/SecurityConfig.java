package com.sponsorcrm.security;

import com.sponsorcrm.auth.AuthSessionRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            AuthSessionRepository sessions
    ) throws Exception {

        http
            // REST API configuration
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})

            // Disable browser-based authentication
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // Use token-based stateless authentication
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // Endpoint access rules
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers(
                    "/api/auth/login",
                    "/api/health",
                    "/error"
                ).permitAll()

                // Allow browser CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Admin endpoints require ROLE_ADMIN
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // All other endpoints require authentication
                .anyRequest().authenticated()
            )

            // Validate Bearer tokens using the existing session filter
            .addFilterBefore(
                new SessionAuthenticationFilter(sessions),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}