package com.sponsorcrm.auth;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordSetupEmail(String recipientEmail, String token) {

        String encodedToken = URLEncoder.encode(
                token,
                StandardCharsets.UTF_8);

        String setupLink = frontendUrl
                + "/set-password?token="
                + encodedToken;

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(recipientEmail);
        message.setSubject("Set up your Sponsor CRM account");

        message.setText(
                "Hello,\n\n"
                        + "An administrator has created a Sponsor CRM account for you.\n\n"
                        + "Use the link below to set your password:\n"
                        + setupLink
                        + "\n\n"
                        + "This link expires in 30 minutes and can only be used once.\n\n"
                        + "If you did not expect this email, please ignore it.");

        mailSender.send(message);
    }
}