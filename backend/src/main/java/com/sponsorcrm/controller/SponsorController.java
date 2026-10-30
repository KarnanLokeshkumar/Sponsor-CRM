package com.sponsorcrm.controller;
import com.sponsorcrm.entity.Sponsor; import com.sponsorcrm.repository.SponsorRepository;
import jakarta.validation.Valid; import org.springframework.data.domain.*; import org.springframework.data.jpa.domain.Specification; import org.springframework.http.HttpStatus; import org.springframework.web.bind.annotation.*; import org.springframework.web.server.ResponseStatusException;
@RestController @RequestMapping("/api/sponsors") @CrossOrigin(origins="http://localhost:5173") public class SponsorController {
 private final SponsorRepository repo; public SponsorController(SponsorRepository repo){this.repo=repo;}
 @GetMapping public Page<Sponsor> list(@RequestParam(defaultValue="") String search,@RequestParam(defaultValue="") String status,@RequestParam(defaultValue="") String industry,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="10") int size){
 Specification<Sponsor> spec=(r,q,b)->b.conjunction(); if(!search.isBlank()) spec=spec.and((r,q,b)->b.or(b.like(b.lower(r.get("name")),"%"+search.toLowerCase()+"%"),b.like(b.lower(r.get("email")),"%"+search.toLowerCase()+"%"),b.like(b.lower(r.get("industry")),"%"+search.toLowerCase()+"%")));
 if(!status.isBlank()) spec=spec.and((r,q,b)->b.equal(r.get("status"),status)); if(!industry.isBlank()) spec=spec.and((r,q,b)->b.equal(r.get("industry"),industry)); return repo.findAll(spec,PageRequest.of(Math.max(0,page),Math.min(100,Math.max(1,size)),Sort.by("id").descending())); }
 @GetMapping("/{id}") public Sponsor get(@PathVariable Long id){return repo.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Sponsor not found"));}
 @PostMapping public Sponsor create(@Valid @RequestBody Sponsor s){s.setId(null);return repo.save(s);}
 @PutMapping("/{id}") public Sponsor update(@PathVariable Long id,@Valid @RequestBody Sponsor s){Sponsor old=get(id);old.setName(s.getName());old.setIndustry(s.getIndustry());old.setWebsite(s.getWebsite());old.setEmail(s.getEmail());old.setPhone(s.getPhone());old.setCity(s.getCity());old.setStatus(s.getStatus());old.setNotes(s.getNotes());return repo.save(old);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){repo.delete(get(id));}
 @GetMapping("/stats") public Object stats(){return java.util.Map.of("total",repo.count(),"active",repo.count((r,q,b)->b.equal(r.get("status"),"ACTIVE")),"inactive",repo.count((r,q,b)->b.equal(r.get("status"),"INACTIVE")),"inDiscussion",repo.count((r,q,b)->b.equal(r.get("status"),"IN_DISCUSSION")));}
}
