package com.bloodconnect.dto;

import jakarta.validation.constraints.NotBlank;

public class BloodRequestCreateDto {

    @NotBlank(message = "Requester name is required")
    private String requesterName;

    @NotBlank(message = "Required blood group is required")
    private String requiredBloodGroup;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotBlank(message = "Hospital location is required")
    private String hospitalLocation;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    public BloodRequestCreateDto() {
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    public String getRequiredBloodGroup() {
        return requiredBloodGroup;
    }

    public void setRequiredBloodGroup(String requiredBloodGroup) {
        this.requiredBloodGroup = requiredBloodGroup;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }

    public String getHospitalLocation() {
        return hospitalLocation;
    }

    public void setHospitalLocation(String hospitalLocation) {
        this.hospitalLocation = hospitalLocation;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }
}
