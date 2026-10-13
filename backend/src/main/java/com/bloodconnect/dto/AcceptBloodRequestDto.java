package com.bloodconnect.dto;

import jakarta.validation.constraints.NotNull;

public class AcceptBloodRequestDto {

    @NotNull(message = "Donor ID is required to accept a request")
    private Long donorId;

    private String notes;

    public AcceptBloodRequestDto() {
    }

    public AcceptBloodRequestDto(Long donorId, String notes) {
        this.donorId = donorId;
        this.notes = notes;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
