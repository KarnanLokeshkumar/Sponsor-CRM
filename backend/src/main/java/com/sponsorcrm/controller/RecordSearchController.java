package com.sponsorcrm.controller;

import com.sponsorcrm.entity.Benefit;
import com.sponsorcrm.entity.Campaign;
import com.sponsorcrm.entity.Deliverable;
import com.sponsorcrm.entity.Sponsor;
import com.sponsorcrm.entity.WorkspaceRecord;
import com.sponsorcrm.repository.BenefitRepository;
import com.sponsorcrm.repository.CampaignRepository;
import com.sponsorcrm.repository.DeliverableRepository;
import com.sponsorcrm.repository.SponsorRepository;
import com.sponsorcrm.repository.WorkspaceRecordRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173")
public class RecordSearchController {
    private static final Set<String> WORKSPACE_MODULES = Set.of(
            "contacts", "leads", "pipeline", "packages", "opportunities",
            "proposals", "contracts", "events", "communications", "tasks",
            "follow-ups", "sponsor-portal", "documents", "notifications",
            "reports", "roi-analytics", "sponsor-health", "users", "audit-logs");

    private final SponsorRepository sponsors;
    private final CampaignRepository campaigns;
    private final DeliverableRepository deliverables;
    private final BenefitRepository benefits;
    private final WorkspaceRecordRepository workspaceRecords;

    public RecordSearchController(
            SponsorRepository sponsors,
            CampaignRepository campaigns,
            DeliverableRepository deliverables,
            BenefitRepository benefits,
            WorkspaceRecordRepository workspaceRecords) {
        this.sponsors = sponsors;
        this.campaigns = campaigns;
        this.deliverables = deliverables;
        this.benefits = benefits;
        this.workspaceRecords = workspaceRecords;
    }

    @GetMapping
    public List<RecordSearchResult> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") int limit) {
        String query = q.trim().toLowerCase();
        if (query.length() < 2 || query.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Search query must be between 2 and 100 characters");
        }

        int resultLimit = Math.min(30, Math.max(1, limit));
        String pattern = "%" + escapeLike(query) + "%";
        PageRequest page = PageRequest.of(0, resultLimit, Sort.by(Sort.Direction.DESC, "id"));
        List<RecordSearchResult> results = new ArrayList<>();

        for (Sponsor sponsor : sponsors.findAll(sponsorMatches(pattern), page)) {
            results.add(new RecordSearchResult(
                    "sponsors",
                    sponsor.getId(),
                    sponsor.getName(),
                    joinDetails(sponsor.getIndustry(), sponsor.getEmail(), sponsor.getCity()),
                    sponsor.getStatus()));
        }

        for (Campaign campaign : campaigns.findAll(campaignMatches(pattern), page)) {
            results.add(new RecordSearchResult(
                    "campaigns",
                    campaign.getId(),
                    campaign.getName(),
                    joinDetails(
                            campaign.getSponsor() == null ? null : campaign.getSponsor().getName(),
                            campaign.getObjective()),
                    campaign.getStatus()));
        }

        for (Deliverable deliverable : deliverables.findAll(deliverableMatches(pattern), page)) {
            results.add(new RecordSearchResult(
                    "deliverables",
                    deliverable.getId(),
                    deliverable.getType(),
                    joinDetails(
                            deliverable.getPlacement(),
                            deliverable.getCampaign() == null ? null : deliverable.getCampaign().getName(),
                            deliverable.getDescription()),
                    deliverable.getStatus()));
        }

        for (Benefit benefit : benefits.findAll(benefitMatches(pattern), page)) {
            results.add(new RecordSearchResult(
                    "benefits",
                    benefit.getId(),
                    benefit.getType(),
                    joinDetails(
                            benefit.getSponsor() == null ? null : benefit.getSponsor().getName(),
                            benefit.getCampaign() == null ? null : benefit.getCampaign().getName(),
                            benefit.getDescription()),
                    benefit.getStatus()));
        }

        Set<String> visibleModules = visibleWorkspaceModules();
        Specification<WorkspaceRecord> workspaceMatches = (root, criteriaQuery, builder) -> builder.and(
                root.get("moduleKey").in(visibleModules),
                builder.or(
                        builder.like(builder.lower(root.get("title")), pattern, '\\'),
                        builder.like(builder.lower(root.get("description")), pattern, '\\'),
                        builder.like(builder.lower(root.get("owner")), pattern, '\\'),
                        builder.like(builder.lower(root.get("customFields")), pattern, '\\'),
                        builder.like(builder.lower(root.get("status")), pattern, '\\'),
                        builder.like(builder.lower(root.get("priority")), pattern, '\\')));

        for (WorkspaceRecord record : workspaceRecords.findAll(
                workspaceMatches,
                PageRequest.of(0, resultLimit, Sort.by(Sort.Direction.DESC, "updatedAt")))) {
            results.add(new RecordSearchResult(
                    record.getModuleKey(),
                    record.getId(),
                    record.getTitle(),
                    joinDetails(record.getOwner(), record.getDescription()),
                    record.getStatus()));
        }

        return results.stream()
                .sorted((left, right) -> {
                    boolean leftTitleMatch = left.title().toLowerCase().startsWith(query);
                    boolean rightTitleMatch = right.title().toLowerCase().startsWith(query);
                    if (leftTitleMatch != rightTitleMatch) {
                        return leftTitleMatch ? -1 : 1;
                    }
                    return left.title().compareToIgnoreCase(right.title());
                })
                .limit(resultLimit)
                .toList();
    }

    private Set<String> visibleWorkspaceModules() {
        boolean isAdmin = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return WORKSPACE_MODULES;
        }
        return WORKSPACE_MODULES.stream()
                .filter(key -> !key.equals("users") && !key.equals("audit-logs"))
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private Specification<Sponsor> sponsorMatches(String pattern) {
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("name")), pattern, '\\'),
                builder.like(builder.lower(root.get("industry")), pattern, '\\'),
                builder.like(builder.lower(root.get("email")), pattern, '\\'),
                builder.like(builder.lower(root.get("website")), pattern, '\\'),
                builder.like(builder.lower(root.get("phone")), pattern, '\\'),
                builder.like(builder.lower(root.get("city")), pattern, '\\'),
                builder.like(builder.lower(root.get("notes")), pattern, '\\'));
    }

    private Specification<Campaign> campaignMatches(String pattern) {
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("name")), pattern, '\\'),
                builder.like(builder.lower(root.get("objective")), pattern, '\\'),
                builder.like(builder.lower(root.join("sponsor").get("name")), pattern, '\\'));
    }

    private Specification<Deliverable> deliverableMatches(String pattern) {
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("type")), pattern, '\\'),
                builder.like(builder.lower(root.get("placement")), pattern, '\\'),
                builder.like(builder.lower(root.get("description")), pattern, '\\'),
                builder.like(builder.lower(root.join("campaign").get("name")), pattern, '\\'));
    }

    private Specification<Benefit> benefitMatches(String pattern) {
        return (root, query, builder) -> builder.or(
                builder.like(builder.lower(root.get("type")), pattern, '\\'),
                builder.like(builder.lower(root.get("description")), pattern, '\\'),
                builder.like(builder.lower(root.join("sponsor").get("name")), pattern, '\\'),
                builder.like(builder.lower(root.join("campaign", jakarta.persistence.JoinType.LEFT)
                        .get("name")), pattern, '\\'));
    }

    private String escapeLike(String query) {
        return query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private String joinDetails(String... details) {
        return java.util.Arrays.stream(details)
                .filter(detail -> detail != null && !detail.isBlank())
                .distinct()
                .collect(java.util.stream.Collectors.joining(" · "));
    }
}
