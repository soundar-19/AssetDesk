package com.assetdesk.controller;

import com.assetdesk.dto.user.UserRequestDTO;
import com.assetdesk.dto.user.UserUpdateDTO;
import com.assetdesk.dto.user.UserResponseDTO;
import com.assetdesk.dto.user.ChangePasswordDTO;
import com.assetdesk.dto.user.AdminPasswordResetDTO;
import com.assetdesk.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {
    
    private final UserService userService;
    
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO createdUser = userService.createUser(userRequestDTO);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<UserResponseDTO> getUserByEmployeeId(@PathVariable String employeeId) {
        UserResponseDTO user = userService.getUserByEmployeeId(employeeId);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        UserResponseDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir) {
        Pageable pageable = PageRequest.of(page, size,
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<UserResponseDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<UserResponseDTO>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String employeeId,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size,
            sortBy != null ? org.springframework.data.domain.Sort.by(
                "desc".equalsIgnoreCase(sortDir) ? 
                org.springframework.data.domain.Sort.Direction.DESC : 
                org.springframework.data.domain.Sort.Direction.ASC, sortBy) : 
            org.springframework.data.domain.Sort.unsorted());
        Page<UserResponseDTO> users = userService.searchUsers(name, email, employeeId, 
            department, role, status, pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByRole(
            @PathVariable String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponseDTO> users = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/department/{department}")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByDepartment(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponseDTO> users = userService.getUsersByDepartment(department, pageable);
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<UserResponseDTO>> getUsersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponseDTO> users = userService.getUsersByStatus(status, pageable);
        return ResponseEntity.ok(users);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateDTO userUpdateDTO) {
        UserResponseDTO updatedUser = userService.updateUser(id, userUpdateDTO);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/change-password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @Valid @RequestBody ChangePasswordDTO changePasswordDTO) {
        userService.changePassword(id, changePasswordDTO);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{id}/admin-reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminResetPassword(@PathVariable Long id, @Valid @RequestBody AdminPasswordResetDTO adminPasswordResetDTO) {
        userService.adminResetPassword(id, adminPasswordResetDTO);
        return ResponseEntity.ok().build();
    }
}