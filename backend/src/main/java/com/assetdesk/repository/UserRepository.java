package com.assetdesk.repository;

import com.assetdesk.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    
    Optional<User> findByEmployeeId(String employeeId);
    Optional<User> findByEmail(String email);
    List<User> findByRole(User.Role role);
    Page<User> findByRole(User.Role role, Pageable pageable);
    List<User> findByStatus(User.Status status);
    Page<User> findByStatus(User.Status status, Pageable pageable);
    List<User> findByDepartment(String department);
    Page<User> findByDepartment(String department, Pageable pageable);
    
    Page<User> findAll(Pageable pageable);
}