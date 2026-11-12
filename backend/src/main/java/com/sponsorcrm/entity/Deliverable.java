package com.sponsorcrm.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "deliverables")
public class Deliverable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank
    private String type;
    private String placement;
    @Column(length = 1200)
    private String description;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    private LocalDate scheduledDate;
    private String status = "PLANNED";

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public void setType(String v) {
        type = v;
    }

    public String getPlacement() {
        return placement;
    }

    public void setPlacement(String v) {
        placement = v;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String v) {
        description = v;
    }

    public Campaign getCampaign() {
        return campaign;
    }

    public void setCampaign(Campaign v) {
        campaign = v;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate v) {
        scheduledDate = v;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String v) {
        status = v;
    }
}
