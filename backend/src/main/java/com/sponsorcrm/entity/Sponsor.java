package com.sponsorcrm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sponsors")
public class Sponsor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    @Column(nullable = false)
    private String name;
    @NotBlank
    private String industry;
    private String website;
    @Email
    private String email;
    private String phone;
    private String city;
    @NotBlank
    private String status = "ACTIVE";
    @Column(length = 1500)
    private String notes;
    private LocalDateTime createdAt = LocalDateTime.now();

    @PreUpdate
    public void touch() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long v) {
        id = v;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        name = v;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String v) {
        industry = v;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String v) {
        website = v;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String v) {
        email = v;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String v) {
        phone = v;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String v) {
        city = v;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String v) {
        notes = v;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
