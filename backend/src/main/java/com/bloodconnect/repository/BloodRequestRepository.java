package com.bloodconnect.repository;

import com.bloodconnect.model.BloodRequest;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findAllByOrderByCreatedAtDesc();

    List<BloodRequest> findByStatusIgnoreCaseOrderByCreatedAtDesc(String status);

    List<BloodRequest> findByRequiredBloodGroupIgnoreCaseOrderByCreatedAtDesc(String bloodGroup);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM BloodRequest r WHERE r.id = :id")
    Optional<BloodRequest> findByIdForUpdate(@Param("id") Long id);
}
