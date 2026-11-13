package com.sponsorcrm.repository;

import com.sponsorcrm.entity.Deliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DeliverableRepository extends JpaRepository<Deliverable, Long>, JpaSpecificationExecutor<Deliverable> {
}
