package com.bloodconnect.controller;

import com.bloodconnect.dto.DonorRegisterRequest;
import com.bloodconnect.dto.DonorResponse;
import com.bloodconnect.model.Donor;
import com.bloodconnect.repository.DonorRepository;
import com.bloodconnect.util.BloodCompatibility;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/donors")
@CrossOrigin(origins = "*")
public class DonorController {

    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;

    public DonorController(DonorRepository donorRepository, PasswordEncoder passwordEncoder) {
        this.donorRepository = donorRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping
    public ResponseEntity<?> registerDonor(@Valid @RequestBody DonorRegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        if (donorRepository.existsByEmailIgnoreCase(cleanEmail)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "error", "Email already registered",
                "message", "A donor with this email already exists."
            ));
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());

        Donor donor = new Donor();
        donor.setName(request.getName().trim());
        donor.setEmail(cleanEmail);
        donor.setPassword(hashedPassword);
        donor.setPhone(request.getPhone().trim());
        donor.setBloodGroup(request.getBloodGroup().trim().toUpperCase(Locale.ROOT));
        donor.setCity(request.getCity().trim());
        donor.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        Donor saved = donorRepository.save(donor);
        return ResponseEntity.status(HttpStatus.CREATED).body(DonorResponse.fromEntity(saved));
    }

    @GetMapping
    public ResponseEntity<List<DonorResponse>> listDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city
    ) {
        List<Donor> donors;
        if (bloodGroup != null && !bloodGroup.isBlank()) {
            donors = donorRepository.findByBloodGroupIgnoreCase(bloodGroup.trim());
        } else if (city != null && !city.isBlank()) {
            donors = donorRepository.findByCityIgnoreCase(city.trim());
        } else {
            donors = donorRepository.findAll();
        }

        List<DonorResponse> responses = donors.stream()
                .map(DonorResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/compatible")
    public ResponseEntity<?> findCompatibleDonors(
            @RequestParam String bloodGroup,
            @RequestParam(required = false) String city
    ) {
        String normalizedGroup = bloodGroup.trim().toUpperCase(Locale.ROOT);
        List<String> compatibleGroups = BloodCompatibility.getCompatibleDonorGroups(normalizedGroup);

        List<Donor> matchedDonors;
        if (city != null && !city.isBlank()) {
            matchedDonors = donorRepository.findByBloodGroupInAndCityIgnoreCaseAndAvailableTrue(compatibleGroups, city.trim());
        } else {
            matchedDonors = donorRepository.findByBloodGroupInAndAvailableTrue(compatibleGroups);
        }

        List<DonorResponse> responses = matchedDonors.stream()
                .map(DonorResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(Map.of(
            "requestedBloodGroup", normalizedGroup,
            "compatibleGroups", compatibleGroups,
            "totalFound", responses.size(),
            "donors", responses
        ));
    }
}
