package com.sponsorcrm.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;

class SponsorTest {

    @Test
    void updatePreservesCreationTimestamp() {
        Sponsor sponsor = new Sponsor();
        LocalDateTime createdAt = sponsor.getCreatedAt();

        sponsor.touch();

        assertEquals(createdAt, sponsor.getCreatedAt());
        assertNotNull(sponsor.getUpdatedAt());
    }
}
