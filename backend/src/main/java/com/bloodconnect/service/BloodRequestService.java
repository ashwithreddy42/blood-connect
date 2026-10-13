package com.bloodconnect.service;

import com.bloodconnect.dto.AcceptBloodRequestDto;
import com.bloodconnect.dto.RejectBloodRequestDto;
import com.bloodconnect.model.BloodRequest;
import com.bloodconnect.model.BloodRequestResponse;
import com.bloodconnect.model.Donor;
import com.bloodconnect.repository.BloodRequestRepository;
import com.bloodconnect.repository.BloodRequestResponseRepository;
import com.bloodconnect.repository.DonorRepository;
import com.bloodconnect.util.BloodCompatibility;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final BloodRequestResponseRepository responseRepository;
    private final DonorRepository donorRepository;

    public BloodRequestService(
            BloodRequestRepository bloodRequestRepository,
            BloodRequestResponseRepository responseRepository,
            DonorRepository donorRepository
    ) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.responseRepository = responseRepository;
        this.donorRepository = donorRepository;
    }

    @Transactional
    public BloodRequest acceptRequest(Long requestId, AcceptBloodRequestDto dto) {
        // Acquire pessimistic write lock to prevent race conditions when two donors accept concurrently
        BloodRequest request = bloodRequestRepository.findByIdForUpdate(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found with id: " + requestId));

        if ("ACCEPTED".equalsIgnoreCase(request.getStatus()) || request.getAcceptedDonor() != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This blood request has already been accepted by another donor.");
        }

        if ("CLOSED".equalsIgnoreCase(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This blood request is closed and can no longer be accepted.");
        }

        Donor donor = donorRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found with id: " + dto.getDonorId()));

        if (!donor.isAvailable()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Donor is currently marked as unavailable for donations.");
        }

        List<String> compatibleGroups = BloodCompatibility.getCompatibleDonorGroups(request.getRequiredBloodGroup());
        String donorBloodGroup = donor.getBloodGroup().trim().toUpperCase(Locale.ROOT);
        if (!compatibleGroups.contains(donorBloodGroup)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Donor blood group (" + donor.getBloodGroup() + ") is not compatible with requested blood group (" +
                            request.getRequiredBloodGroup() + "). Compatible donor blood groups are: " + compatibleGroups);
        }

        // Lock acceptance to this donor
        request.setStatus("ACCEPTED");
        request.setAcceptedDonor(donor);
        request.setRespondedAt(LocalDateTime.now());
        BloodRequest savedRequest = bloodRequestRepository.save(request);

        // Record response audit in MySQL
        BloodRequestResponse responseLog = new BloodRequestResponse(
                savedRequest,
                donor,
                "ACCEPTED",
                dto.getNotes() != null ? dto.getNotes().trim() : null
        );
        responseRepository.save(responseLog);

        return savedRequest;
    }

    @Transactional
    public Map<String, Object> rejectRequest(Long requestId, RejectBloodRequestDto dto) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found with id: " + requestId));

        if ("CLOSED".equalsIgnoreCase(request.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot reject a closed blood request.");
        }

        Donor donor = donorRepository.findById(dto.getDonorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Donor not found with id: " + dto.getDonorId()));

        // Record rejection response audit in MySQL
        BloodRequestResponse responseLog = new BloodRequestResponse(
                request,
                donor,
                "REJECTED",
                dto.getReason() != null ? dto.getReason().trim() : null
        );
        responseRepository.save(responseLog);

        // The request remains OPEN for other compatible donors to respond
        return Map.of(
                "status", "SUCCESS",
                "action", "REJECTED",
                "message", "Donor decline recorded. The blood request remains OPEN for other compatible donors.",
                "requestId", requestId,
                "requestStatus", request.getStatus()
        );
    }

    @Transactional
    public BloodRequest closeRequest(Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blood request not found with id: " + requestId));
        request.setStatus("CLOSED");
        return bloodRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<BloodRequestResponse> getRequestResponses(Long requestId) {
        return responseRepository.findByBloodRequestIdOrderByCreatedAtDesc(requestId);
    }
}
