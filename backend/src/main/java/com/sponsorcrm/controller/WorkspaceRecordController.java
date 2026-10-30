package com.sponsorcrm.controller;

import com.sponsorcrm.entity.WorkspaceRecord;
import com.sponsorcrm.repository.WorkspaceRecordRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.Set;
import java.time.LocalDate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.AccessDeniedException;

@RestController
@RequestMapping("/api/workspace")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkspaceRecordController {
    private static final Set<String> MODULES = Set.of("contacts","leads","pipeline","packages","opportunities","proposals","contracts","events","communications","tasks","follow-ups","sponsor-portal","documents","notifications","reports","roi-analytics","sponsor-health","users","audit-logs");
    private void validateModule(String key) {
        if (!MODULES.contains(key)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown module");
        if ((key.equals("users") || key.equals("audit-logs")) && SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) throw new AccessDeniedException("Administrator access required");
    }

    private final WorkspaceRecordRepository repository;
    public WorkspaceRecordController(WorkspaceRecordRepository repository) { this.repository = repository; }

    @GetMapping("/{moduleKey}")
    public Page<WorkspaceRecord> list(@PathVariable String moduleKey,
        @RequestParam(defaultValue = "") String search,
        @RequestParam(defaultValue = "") String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) {
        validateModule(moduleKey);
        Specification<WorkspaceRecord> spec = (root, query, cb) -> cb.equal(root.get("moduleKey"), moduleKey);
        if (!search.isBlank()) {
            String term = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), term),
                cb.like(cb.lower(root.get("description")), term),
                cb.like(cb.lower(root.get("owner")), term),
                cb.like(cb.lower(root.get("customFields")), term)));
        }
        if (!status.isBlank()) spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        return repository.findAll(spec, PageRequest.of(Math.max(0,page), Math.min(100,Math.max(1,size)), Sort.by(Sort.Direction.DESC,"updatedAt")));
    }

    @GetMapping("/{moduleKey}/summary")
    public Map<String, Long> summary(@PathVariable String moduleKey) {
        validateModule(moduleKey);
        Specification<WorkspaceRecord> all = (root, query, cb) -> cb.equal(root.get("moduleKey"), moduleKey);
        long total = repository.count(all);
        long open = repository.count(all.and((root, query, cb) -> cb.equal(root.get("status"), "OPEN")));
        long progress = repository.count(all.and((root, query, cb) -> cb.equal(root.get("status"), "IN_PROGRESS")));
        long done = repository.count(all.and((root, query, cb) -> cb.equal(root.get("status"), "COMPLETED")));
        long high = repository.count(all.and((root, query, cb) -> root.get("priority").in("HIGH", "URGENT")));
        long overdue = repository.count(all.and((root, query, cb) -> cb.and(root.get("dueDate").isNotNull(), cb.lessThan(root.get("dueDate"), LocalDate.now()), root.get("status").in("OPEN", "IN_PROGRESS", "ON_HOLD"))));
        return Map.of("total", total, "open", open, "progress", progress, "done", done, "highPriority", high, "overdue", overdue);
    }

    @GetMapping("/{moduleKey}/{id}")
    public WorkspaceRecord get(@PathVariable String moduleKey, @PathVariable Long id) {
        validateModule(moduleKey);
        WorkspaceRecord record = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"));
        if (!record.getModuleKey().equals(moduleKey)) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found");
        return record;
    }

    @PostMapping("/{moduleKey}")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceRecord create(@PathVariable String moduleKey, @Valid @RequestBody WorkspaceRecord input) {
        validateModule(moduleKey); input.setId(null); input.setModuleKey(moduleKey); return repository.save(input);
    }

    @PutMapping("/{moduleKey}/{id}")
    public WorkspaceRecord update(@PathVariable String moduleKey, @PathVariable Long id, @Valid @RequestBody WorkspaceRecord input) {
        WorkspaceRecord record = get(moduleKey,id);
        record.setTitle(input.getTitle()); record.setDescription(input.getDescription()); record.setCustomFields(input.getCustomFields()); record.setStatus(input.getStatus());
        record.setPriority(input.getPriority()); record.setOwner(input.getOwner()); record.setDueDate(input.getDueDate());
        record.setRelatedSponsorId(input.getRelatedSponsorId()); return repository.save(record);
    }

    @DeleteMapping("/{moduleKey}/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String moduleKey, @PathVariable Long id) { validateModule(moduleKey); repository.delete(get(moduleKey,id)); }
}
