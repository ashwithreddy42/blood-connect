package com.bloodconnect.controller;

import com.bloodconnect.dto.AcceptBloodRequestDto;
import com.bloodconnect.dto.BloodRequestCreateDto;
import com.bloodconnect.dto.RejectBloodRequestDto;
import com.bloodconnect.model.BloodRequest;
import com.bloodconnect.model.BloodRequestResponse;
import com.bloodconnect.repository.BloodRequestRepository;
import com.bloodconnect.service.BloodRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class BloodRequestController {

    private final BloodRequestRepository bloodRequestRepository;
    private final BloodRequestService bloodRequestService;

    public BloodRequestController(
            BloodRequestRepository bloodRequestRepository,
            BloodRequestService bloodRequestService
    ) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodRequestService = bloodRequestService;
    }

    @PostMapping
    public ResponseEntity<BloodRequest> createRequest(@Valid @RequestBody BloodRequestCreateDto dto) {
        BloodRequest bloodRequest = new BloodRequest();
        bloodRequest.setRequesterName(dto.getRequesterName().trim());
        bloodRequest.setRequiredBloodGroup(dto.getRequiredBloodGroup().trim().toUpperCase(Locale.ROOT));
        bloodRequest.setHospitalName(dto.getHospitalName().trim());
        bloodRequest.setHospitalLocation(dto.getHospitalLocation().trim());
        bloodRequest.setContactNumber(dto.getContactNumber().trim());
        bloodRequest.setStatus("OPEN");

        BloodRequest saved = bloodRequestRepository.save(bloodRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<BloodRequest>> listRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String bloodGroup
    ) {
        List<BloodRequest> requests;
        if (status != null && !status.isBlank()) {
            requests = bloodRequestRepository.findByStatusIgnoreCaseOrderByCreatedAtDesc(status.trim());
        } else if (bloodGroup != null && !bloodGroup.isBlank()) {
            requests = bloodRequestRepository.findByRequiredBloodGroupIgnoreCaseOrderByCreatedAtDesc(bloodGroup.trim());
        } else {
            requests = bloodRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestById(@PathVariable Long id) {
        return bloodRequestRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "Not Found",
                    "message", "Blood request not found with id: " + id
                )));
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<BloodRequest> acceptRequest(
            @PathVariable Long id,
            @Valid @RequestBody AcceptBloodRequestDto dto
    ) {
        BloodRequest accepted = bloodRequestService.acceptRequest(id, dto);
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(
            @PathVariable Long id,
            @Valid @RequestBody RejectBloodRequestDto dto
    ) {
        Map<String, Object> result = bloodRequestService.rejectRequest(id, dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<BloodRequest> closeRequest(@PathVariable Long id) {
        BloodRequest closed = bloodRequestService.closeRequest(id);
        return ResponseEntity.ok(closed);
    }

    @GetMapping("/{id}/responses")
    public ResponseEntity<List<BloodRequestResponse>> getRequestResponses(@PathVariable Long id) {
        List<BloodRequestResponse> responses = bloodRequestService.getRequestResponses(id);
        return ResponseEntity.ok(responses);
    }
}
