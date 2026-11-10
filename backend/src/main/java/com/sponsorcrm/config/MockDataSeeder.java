package com.sponsorcrm.config;

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

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;

@Component
@Profile("demo")
public class MockDataSeeder implements CommandLineRunner {

    private final SponsorRepository sponsors;
    private final CampaignRepository campaigns;
    private final DeliverableRepository deliverables;
    private final BenefitRepository benefits;
    private final WorkspaceRecordRepository workspaceRecords;

    public MockDataSeeder(
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

    @Override
    @Transactional
    public void run(String... args) {

        System.out.println("[MockDataSeeder] Checking demo data...");

        // 1. Sponsors
        Sponsor northstar = getOrCreateSponsor(
                "Northstar Electronics",
                "Technology",
                "https://northstar.example",
                "partnerships@northstar.example",
                "+91 98765 10001",
                "Bengaluru",
                "ACTIVE",
                "Premium technology brand interested in family and sports content."
        );

        Sponsor greenleaf = getOrCreateSponsor(
                "GreenLeaf Foods",
                "Food & Beverage",
                "https://greenleaf.example",
                "marketing@greenleaf.example",
                "+91 98765 10002",
                "Chennai",
                "ACTIVE",
                "Regional food brand exploring seasonal campaigns."
        );

        Sponsor urbanmove = getOrCreateSponsor(
                "UrbanMove",
                "Fitness",
                "https://urbanmove.example",
                "brand@urbanmove.example",
                "+91 98765 10003",
                "Hyderabad",
                "IN_DISCUSSION",
                "Fitness brand evaluating an OTT partnership."
        );

        Sponsor bluepeak = getOrCreateSponsor(
                "BluePeak Finance",
                "Financial Services",
                "https://bluepeak.example",
                "alliances@bluepeak.example",
                "+91 98765 10004",
                "Mumbai",
                "ACTIVE",
                "Financial services sponsor with a focus on responsible reach."
        );

        // 2. Campaigns
        Campaign summer = getOrCreateCampaign(
                "Summer Streaming Festival",
                northstar,
                "Increase brand awareness through premium summer entertainment placements.",
                LocalDate.now().minusDays(10),
                LocalDate.now().plusDays(35),
                "ACTIVE"
        );

        Campaign food = getOrCreateCampaign(
                "Good Food, Good Stories",
                greenleaf,
                "Connect the brand with food and lifestyle audiences.",
                LocalDate.now().plusDays(5),
                LocalDate.now().plusDays(50),
                "PLANNED"
        );

        Campaign wellness = getOrCreateCampaign(
                "Move More Challenge",
                urbanmove,
                "Promote healthy habits through sports and wellness content.",
                LocalDate.now().minusDays(20),
                LocalDate.now().plusDays(10),
                "ACTIVE"
        );

        // 3. Deliverables
        createDeliverable(
                "PRE_ROLL",
                "Featured entertainment titles",
                "15-second pre-roll placement on selected festival content.",
                summer,
                LocalDate.now().plusDays(4),
                "SCHEDULED"
        );

        createDeliverable(
                "BANNER_AD",
                "Home screen hero banner",
                "Desktop and mobile home screen banner placement.",
                food,
                LocalDate.now().plusDays(12),
                "PLANNED"
        );

        createDeliverable(
                "MID_ROLL",
                "Sports and wellness collection",
                "Mid-roll placement within selected wellness programming.",
                wellness,
                LocalDate.now().minusDays(2),
                "IN_PROGRESS"
        );

        // 4. Benefits
        createBenefit(
                "HOMEPAGE_PLACEMENT",
                "Premium home page visibility for the campaign period.",
                northstar,
                summer,
                30,
                18,
                "IN_PROGRESS"
        );

        createBenefit(
                "CONTENT_SPONSORSHIP",
                "Brand association with selected food and lifestyle content.",
                greenleaf,
                food,
                12,
                0,
                "PENDING"
        );

        createBenefit(
                "PROMOTIONAL_VISIBILITY",
                "Promotional mentions across wellness campaign assets.",
                urbanmove,
                wellness,
                20,
                20,
                "DELIVERED"
        );

        // 5. Generic CRM workspace records

        // Contacts
        seedWorkspace("contacts", "Northstar - Priya Nair",
                "Marketing Director; primary sponsor contact.",
                "OPEN", "HIGH", "Aarav Mehta", 14, northstar.getId());

        seedWorkspace("contacts", "GreenLeaf - Karthik Rao",
                "Brand Partnerships Manager; campaign coordination.",
                "IN_PROGRESS", "MEDIUM", "Diya Shah", 20, greenleaf.getId());

        // Leads
        seedWorkspace("leads", "Apex Mobile - OTT partnership enquiry",
                "Inbound lead interested in a launch sponsorship.",
                "OPEN", "HIGH", "Aarav Mehta", 7, null);

        seedWorkspace("leads", "FitLife Studios - brand awareness",
                "Potential sponsor identified through an industry event.",
                "IN_PROGRESS", "MEDIUM", "Diya Shah", 12, null);

        // Pipeline
        seedWorkspace("pipeline", "Northstar annual partnership",
                "Commercial discussion for a multi-campaign annual agreement.",
                "IN_PROGRESS", "HIGH", "Aarav Mehta", 10, northstar.getId());

        seedWorkspace("pipeline", "BluePeak finance awareness package",
                "Initial package shared; awaiting sponsor feedback.",
                "OPEN", "MEDIUM", "Diya Shah", 18, bluepeak.getId());

        // Packages
        seedWorkspace("packages", "Platinum OTT Partner",
                "Premium home page, content and campaign visibility package.",
                "OPEN", "HIGH", "Partnerships Team", 30, null);

        seedWorkspace("packages", "Gold Campaign Partner",
                "Campaign-level placements and selected promotional benefits.",
                "OPEN", "MEDIUM", "Partnerships Team", 35, null);

        // Opportunities
        seedWorkspace("opportunities", "Northstar festive season expansion",
                "Potential expansion into the festive content catalogue.",
                "IN_PROGRESS", "HIGH", "Aarav Mehta", 25, northstar.getId());

        seedWorkspace("opportunities", "BluePeak financial literacy series",
                "Potential sponsored educational content series.",
                "OPEN", "MEDIUM", "Diya Shah", 40, bluepeak.getId());

        // Proposals
        seedWorkspace("proposals", "Northstar - Annual Partnership Proposal",
                "Proposal covering three campaign periods and premium placements.",
                "IN_PROGRESS", "HIGH", "Aarav Mehta", 8, northstar.getId());

        seedWorkspace("proposals", "GreenLeaf - Seasonal Content Proposal",
                "Proposal for food and lifestyle content integration.",
                "OPEN", "MEDIUM", "Diya Shah", 15, greenleaf.getId());

        // Contracts
        seedWorkspace("contracts", "Northstar - Master Sponsorship Agreement",
                "Draft agreement pending legal review.",
                "IN_PROGRESS", "HIGH", "Legal Team", 12, northstar.getId());

        seedWorkspace("contracts", "BluePeak - Campaign Agreement",
                "Agreement shared for sponsor review.",
                "OPEN", "MEDIUM", "Legal Team", 22, bluepeak.getId());

        // Events
        seedWorkspace("events", "OTT Partner Connect 2026",
                "Partner networking and upcoming content showcase.",
                "OPEN", "HIGH", "Events Team", 28, null);

        seedWorkspace("events", "Year-End Sponsor Review",
                "Quarterly performance and relationship review meeting.",
                "IN_PROGRESS", "MEDIUM", "Partnerships Team", 16, null);

        // Communications
        seedWorkspace("communications", "Northstar campaign kickoff call",
                "Discussed campaign timeline, creative assets and placement dates.",
                "COMPLETED", "MEDIUM", "Aarav Mehta", 0, northstar.getId());

        seedWorkspace("communications", "GreenLeaf proposal follow-up email",
                "Sent proposal summary and requested feedback on placements.",
                "OPEN", "MEDIUM", "Diya Shah", 3, greenleaf.getId());

        // Tasks
        seedWorkspace("tasks", "Collect Northstar creative assets",
                "Request final logo, brand guidelines and video creative.",
                "IN_PROGRESS", "HIGH", "Aarav Mehta", 2, northstar.getId());

        seedWorkspace("tasks", "Prepare GreenLeaf campaign calendar",
                "Draft the activation calendar and share it for approval.",
                "OPEN", "MEDIUM", "Diya Shah", 6, greenleaf.getId());

        // Follow-ups
        seedWorkspace("follow-ups", "Follow up on BluePeak proposal",
                "Check whether the sponsor has reviewed the proposal.",
                "OPEN", "HIGH", "Diya Shah", 1, bluepeak.getId());

        seedWorkspace("follow-ups", "Confirm Northstar campaign assets",
                "Confirm delivery date for final campaign assets.",
                "IN_PROGRESS", "MEDIUM", "Aarav Mehta", 4, northstar.getId());

        // Sponsor Portal
        seedWorkspace("sponsor-portal", "Northstar portal access request",
                "Prepare sponsor access and share campaign progress view.",
                "OPEN", "MEDIUM", "Support Team", 9, northstar.getId());

        seedWorkspace("sponsor-portal", "GreenLeaf portal onboarding",
                "Prepare onboarding instructions for sponsor stakeholders.",
                "IN_PROGRESS", "LOW", "Support Team", 14, greenleaf.getId());

        // Documents
        seedWorkspace("documents", "Northstar brand guidelines",
                "Latest approved brand guidelines for campaign production.",
                "COMPLETED", "MEDIUM", "Aarav Mehta", 0, northstar.getId());

        seedWorkspace("documents", "GreenLeaf proposal deck",
                "Working proposal presentation and placement details.",
                "OPEN", "MEDIUM", "Diya Shah", 5, greenleaf.getId());

        // Notifications
        seedWorkspace("notifications", "Northstar asset deadline reminder",
                "Creative assets are due shortly for the active campaign.",
                "OPEN", "HIGH", "Aarav Mehta", 1, northstar.getId());

        seedWorkspace("notifications", "Weekly sponsor review reminder",
                "Review open sponsor conversations and next actions.",
                "OPEN", "LOW", "Partnerships Team", 5, null);

        // Reports
        seedWorkspace("reports", "October sponsorship performance report",
                "Monthly summary of sponsor activity and campaign delivery.",
                "COMPLETED", "MEDIUM", "Analytics Team", 0, null);

        seedWorkspace("reports", "November pipeline review",
                "Review pipeline stages, open proposals and expected closures.",
                "IN_PROGRESS", "HIGH", "Analytics Team", 7, null);

        // ROI Analytics
        seedWorkspace("roi-analytics", "Summer Festival campaign ROI",
                "Review reach, engagement and delivered campaign value.",
                "IN_PROGRESS", "HIGH", "Analytics Team", 10, northstar.getId());

        seedWorkspace("roi-analytics", "Food content placement results",
                "Compile available campaign placement and engagement results.",
                "OPEN", "MEDIUM", "Analytics Team", 20, greenleaf.getId());

        // Sponsor Health
        seedWorkspace("sponsor-health", "Northstar relationship review",
                "Strong engagement; confirm next-quarter priorities.",
                "IN_PROGRESS", "HIGH", "Aarav Mehta", 12, northstar.getId());

        seedWorkspace("sponsor-health", "UrbanMove engagement check",
                "Follow up on campaign delivery feedback and renewal interest.",
                "OPEN", "MEDIUM", "Diya Shah", 8, urbanmove.getId());

        // Users & Roles - workspace demo records only
        seedWorkspace("users", "Aarav Mehta - Partnership Manager",
                "Demo workspace user record; does not create a login account.",
                "OPEN", "MEDIUM", "Administrator", 0, null);

        seedWorkspace("users", "Diya Shah - Account Manager",
                "Demo workspace user record; does not create a login account.",
                "OPEN", "MEDIUM", "Administrator", 0, null);

        // Audit Logs
        seedWorkspace("audit-logs", "Demo seed operation",
                "Sample audit entry for UI demonstration only.",
                "COMPLETED", "LOW", "System", 0, null);

        seedWorkspace("audit-logs", "Workspace settings review",
                "Sample settings review entry for UI demonstration only.",
                "OPEN", "LOW", "Administrator", 5, null);

        System.out.println("[MockDataSeeder] Demo seed completed.");
        System.out.println("Sponsors: " + sponsors.count());
        System.out.println("Campaigns: " + campaigns.count());
        System.out.println("Deliverables: " + deliverables.count());
        System.out.println("Benefits: " + benefits.count());
        System.out.println("Workspace records: " + workspaceRecords.count());
    }

    // ------------------------------------------------
    // Sponsor helper
    // ------------------------------------------------

    private Sponsor getOrCreateSponsor(
            String name,
            String industry,
            String website,
            String email,
            String phone,
            String city,
            String status,
            String notes) {

        return sponsors.findAll().stream()
                .filter(s -> email.equalsIgnoreCase(s.getEmail()))
                .findFirst()
                .orElseGet(() -> {
                    Sponsor s = new Sponsor();
                    s.setName(name);
                    s.setIndustry(industry);
                    s.setWebsite(website);
                    s.setEmail(email);
                    s.setPhone(phone);
                    s.setCity(city);
                    s.setStatus(status);
                    s.setNotes(notes);
                    return sponsors.save(s);
                });
    }

    // ------------------------------------------------
    // Campaign helper
    // ------------------------------------------------

    private Campaign getOrCreateCampaign(
            String name,
            Sponsor sponsor,
            String objective,
            LocalDate start,
            LocalDate end,
            String status) {

        return campaigns.findAll().stream()
                .filter(c -> name.equalsIgnoreCase(c.getName()))
                .findFirst()
                .orElseGet(() -> {
                    Campaign c = new Campaign();
                    c.setName(name);
                    c.setSponsor(sponsor);
                    c.setObjective(objective);
                    c.setStartDate(start);
                    c.setEndDate(end);
                    c.setStatus(status);
                    return campaigns.save(c);
                });
    }

    // ------------------------------------------------
    // Deliverable helper
    // ------------------------------------------------

    private void createDeliverable(
            String type,
            String placement,
            String description,
            Campaign campaign,
            LocalDate date,
            String status) {

        boolean exists = deliverables.findAll().stream()
                .anyMatch(d ->
                        type.equals(d.getType())
                        && placement.equals(d.getPlacement()));

        if (exists) {
            return;
        }

        Deliverable d = new Deliverable();
        d.setType(type);
        d.setPlacement(placement);
        d.setDescription(description);
        d.setCampaign(campaign);
        d.setScheduledDate(date);
        d.setStatus(status);

        deliverables.save(d);
    }

    // ------------------------------------------------
    // Benefit helper
    // ------------------------------------------------

    private void createBenefit(
            String type,
            String description,
            Sponsor sponsor,
            Campaign campaign,
            Integer target,
            Integer actual,
            String status) {

        boolean exists = benefits.findAll().stream()
                .anyMatch(b ->
                        b.getSponsor() != null
                        && b.getCampaign() != null
                        && Objects.equals(
                                b.getSponsor().getId(), sponsor.getId())
                        && Objects.equals(
                                b.getCampaign().getId(), campaign.getId())
                        && type.equals(b.getType()));

        if (exists) {
            return;
        }

        Benefit b = new Benefit();
        b.setType(type);
        b.setDescription(description);
        b.setSponsor(sponsor);
        b.setCampaign(campaign);
        b.setTargetValue(target);
        b.setActualValue(actual);
        b.setStatus(status);

        benefits.save(b);
    }

    // ------------------------------------------------
    // Workspace helper
    // ------------------------------------------------

    private void seedWorkspace(
            String moduleKey,
            String title,
            String description,
            String status,
            String priority,
            String owner,
            int dueInDays,
            Long sponsorId) {

        boolean exists = workspaceRecords.findAll().stream()
                .anyMatch(r ->
                        moduleKey.equals(r.getModuleKey())
                        && title.equalsIgnoreCase(r.getTitle()));

        if (exists) {
            return;
        }

        WorkspaceRecord r = new WorkspaceRecord();
        r.setModuleKey(moduleKey);
        r.setTitle(title);
        r.setDescription(description);
        r.setStatus(status);
        r.setPriority(priority);
        r.setOwner(owner);

        r.setDueDate(
                dueInDays == 0
                        ? null
                        : LocalDate.now().plusDays(dueInDays)
        );

        r.setRelatedSponsorId(sponsorId);
        r.setCustomFields("{}");

        workspaceRecords.save(r);
    }
}