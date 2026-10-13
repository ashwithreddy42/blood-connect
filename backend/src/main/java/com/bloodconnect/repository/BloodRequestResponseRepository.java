package com.bloodconnect.repository;

import com.bloodconnect.model.BloodRequestResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestResponseRepository extends JpaRepository<BloodRequestResponse, Long> {

    List<BloodRequestResponse> findByBloodRequestIdOrderByCreatedAtDesc(Long requestId);

    List<BloodRequestResponse> findByDonorIdOrderByCreatedAtDesc(Long donorId);
}
