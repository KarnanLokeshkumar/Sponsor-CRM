package com.sponsorcrm.controller;

import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ModuleController {
    private static final List<String> MODULES = List.of(
            "Sponsors", "Contacts", "Leads", "Sponsorship Pipeline", "Packages",
            "Opportunities", "Proposals", "Contracts", "Events", "Campaigns",
            "Deliverables", "Benefits Tracking", "Communications", "Tasks",
            "Follow-ups", "Sponsor Portal", "Documents", "Notifications",
            "Reports & Analytics", "ROI Analytics", "Sponsor Health",
            "Users & Roles", "Audit Logs & Settings");

    @GetMapping("/api/modules")
    public Map<String, Object> modules() {
        return Map.of("count", MODULES.size(), "modules", MODULES);
    }
}
