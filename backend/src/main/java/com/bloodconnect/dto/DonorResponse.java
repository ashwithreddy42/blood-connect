package com.bloodconnect.dto;

import com.bloodconnect.model.Donor;

public class DonorResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String bloodGroup;
    private String city;
    private boolean available;

    public DonorResponse() {
    }

    public DonorResponse(Long id, String name, String email, String phone, String bloodGroup, String city, boolean available) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.bloodGroup = bloodGroup;
        this.city = city;
        this.available = available;
    }

    public static DonorResponse fromEntity(Donor donor) {
        if (donor == null) {
            return null;
        }
        return new DonorResponse(
            donor.getId(),
            donor.getName(),
            donor.getEmail(),
            donor.getPhone(),
            donor.getBloodGroup(),
            donor.getCity(),
            donor.isAvailable()
        );
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public String getCity() {
        return city;
    }

    public boolean isAvailable() {
        return available;
    }
}
