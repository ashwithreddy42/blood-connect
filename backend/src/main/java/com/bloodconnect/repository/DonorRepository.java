package com.bloodconnect.repository;

import com.bloodconnect.model.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Donor> findByEmailIgnoreCase(String email);

    List<Donor> findByBloodGroupInAndAvailableTrue(List<String> bloodGroups);

    List<Donor> findByBloodGroupInAndCityIgnoreCaseAndAvailableTrue(List<String> bloodGroups, String city);

    List<Donor> findByBloodGroupIgnoreCase(String bloodGroup);

    List<Donor> findByCityIgnoreCase(String city);
}
