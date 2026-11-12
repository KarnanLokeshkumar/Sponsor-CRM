package com.sponsorcrm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "workspace_records")
public class WorkspaceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 60)
    private String moduleKey;
    @NotBlank
    @Column(nullable = false, length = 180)
    private String title;
    @Column(length = 3000)
    private String description;
    @Column(columnDefinition = "TEXT")
    private String customFields;
    @Column(length = 40)
    private String status = "OPEN";
    @Column(length = 40)
    private String priority = "MEDIUM";
    @Column(length = 180)
    private String owner;
    private LocalDate dueDate;
    private Long relatedSponsorId;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long v) {
        id = v;
    }

    public String getModuleKey() {
        return moduleKey;
    }

    public void setModuleKey(String v) {
        moduleKey = v;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String v) {
        title = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public String getCustomFields() {
        return customFields;
    }

    public void setCustomFields(String v) {
        customFields = v;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String v) {
        priority = v;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String v) {
        owner = v;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate v) {
        dueDate = v;
    }

    public Long getRelatedSponsorId() {
        return relatedSponsorId;
    }

    public void setRelatedSponsorId(Long v) {
        relatedSponsorId = v;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
