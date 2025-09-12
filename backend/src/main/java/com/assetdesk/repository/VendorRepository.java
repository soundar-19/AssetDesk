package com.assetdesk.repository;

import com.assetdesk.domain.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long>, JpaSpecificationExecutor<Vendor> {
    
    Optional<Vendor> findByName(String name);
    Optional<Vendor> findByEmail(String email);
    List<Vendor> findByNameContainingIgnoreCase(String name);
}