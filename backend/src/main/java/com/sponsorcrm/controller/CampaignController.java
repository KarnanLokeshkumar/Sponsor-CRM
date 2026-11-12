package com.sponsorcrm.controller;

import com.sponsorcrm.entity.*;
import com.sponsorcrm.repository.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "http://localhost:5173")
public class CampaignController {
    private final CampaignRepository repo;
    private final SponsorRepository sponsors;

    public CampaignController(CampaignRepository r, SponsorRepository s) {
        repo = r;
        sponsors = s;
    }

    @GetMapping
    public List<Campaign> all() {
        return repo.findAll();
    }

    @PostMapping
    public Campaign create(@Valid @RequestBody Campaign c) {
        c.setSponsor(sponsors.findById(c.getSponsor().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sponsor not found")));
        return repo.save(c);
    }

    @PutMapping("/{id}")
    public Campaign update(@PathVariable Long id, @Valid @RequestBody Campaign c) {
        Campaign x = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        x.setName(c.getName());
        x.setObjective(c.getObjective());
        x.setStartDate(c.getStartDate());
        x.setEndDate(c.getEndDate());
        x.setStatus(c.getStatus());
        x.setSponsor(sponsors.findById(c.getSponsor().getId()).orElseThrow());
        return repo.save(x);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
