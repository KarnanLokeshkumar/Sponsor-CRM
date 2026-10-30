package com.sponsorcrm.repository;
import com.sponsorcrm.entity.WorkspaceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
public interface WorkspaceRecordRepository extends JpaRepository<WorkspaceRecord, Long>, JpaSpecificationExecutor<WorkspaceRecord> {}
