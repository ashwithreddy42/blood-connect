package com.bloodconnect.dto;

import jakarta.validation.constraints.NotNull;

public class RejectBloodRequestDto {

    @NotNull(message = "Donor ID is required to reject a request")
    private Long donorId;

    private String reason;

    public RejectBloodRequestDto() {
    }

    public RejectBloodRequestDto(Long donorId, String reason) {
        this.donorId = donorId;
        this.reason = reason;
    }

    public Long getDonorId() {
        return donorId;
    }

    public void setDonorId(Long donorId) {
        this.donorId = donorId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
