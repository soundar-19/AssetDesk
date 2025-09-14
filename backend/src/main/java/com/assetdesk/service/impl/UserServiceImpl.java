package com.assetdesk.service.impl;

import com.assetdesk.dto.user.UserRequestDTO;
import com.assetdesk.dto.user.UserUpdateDTO;
import com.assetdesk.dto.user.UserResponseDTO;
import com.assetdesk.dto.user.ChangePasswordDTO;
import com.assetdesk.dto.user.AdminPasswordResetDTO;
import com.assetdesk.domain.User;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Locale;
import com.assetdesk.exception.ResourceNotFoundException;
import com.assetdesk.exception.DuplicateResourceException;
import com.assetdesk.exception.InvalidOperationException;
import org.springframework.data.jpa.domain.Specification;
import static com.assetdesk.spec.UserSpecifications.*;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
        if (userRepository.findByEmployeeId(userRequestDTO.getEmployeeId()).isPresent()) {
            throw new DuplicateResourceException("User", "employeeId", userRequestDTO.getEmployeeId());
        }
        
        if (userRepository.findByEmail(userRequestDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User", "email", userRequestDTO.getEmail());
        }
        
        User user = userRequestDTO.toEntity();
        user.setPassword(passwordEncoder.encode(userRequestDTO.getPassword()));
        User savedUser = userRepository.save(user);
        return UserResponseDTO.fromEntity(savedUser);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserResponseDTO.fromEntity(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmployeeId(String employeeId) {
        User user = userRepository.findByEmployeeId(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "employeeId", employeeId));
        return UserResponseDTO.fromEntity(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return UserResponseDTO.fromEntity(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
            .map(UserResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsersByRole(String role, Pageable pageable) {
        User.Role userRole = User.Role.valueOf(role.toUpperCase(Locale.ROOT));
        return userRepository.findByRole(userRole, pageable)
            .map(UserResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsersByDepartment(String department, Pageable pageable) {
        return userRepository.findByDepartment(department, pageable)
            .map(UserResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> getUsersByStatus(String status, Pageable pageable) {
        User.Status userStatus = User.Status.valueOf(status.toUpperCase(Locale.ROOT));
        return userRepository.findByStatus(userStatus, pageable)
            .map(UserResponseDTO::fromEntity);
    }
    
    @Override
    public UserResponseDTO updateUser(Long id, UserUpdateDTO userUpdateDTO) {
        User existingUser = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if (!existingUser.getEmployeeId().equals(userUpdateDTO.getEmployeeId()) && 
            userRepository.findByEmployeeId(userUpdateDTO.getEmployeeId()).isPresent()) {
            throw new DuplicateResourceException("User", "employeeId", userUpdateDTO.getEmployeeId());
        }
        
        if (!existingUser.getEmail().equals(userUpdateDTO.getEmail()) && 
            userRepository.findByEmail(userUpdateDTO.getEmail()).isPresent()) {
            throw new DuplicateResourceException("User", "email", userUpdateDTO.getEmail());
        }
        
        existingUser.setEmployeeId(userUpdateDTO.getEmployeeId());
        existingUser.setName(userUpdateDTO.getName());
        existingUser.setEmail(userUpdateDTO.getEmail());
        existingUser.setPhoneNumber(userUpdateDTO.getPhoneNumber());
        existingUser.setRole(userUpdateDTO.getRole());
        existingUser.setDepartment(userUpdateDTO.getDepartment());
        existingUser.setDesignation(userUpdateDTO.getDesignation());
        existingUser.setStatus(userUpdateDTO.getStatus());
        existingUser.setDateJoined(userUpdateDTO.getDateJoined());
        
        User updatedUser = userRepository.save(existingUser);
        return UserResponseDTO.fromEntity(updatedUser);
    }
    
    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    @Override
    public void changePassword(Long userId, ChangePasswordDTO changePasswordDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (!passwordEncoder.matches(changePasswordDTO.getCurrentPassword(), user.getPassword())) {
            throw new InvalidOperationException("Current password is incorrect");
        }
        
        user.setPassword(passwordEncoder.encode(changePasswordDTO.getNewPassword()));
        userRepository.save(user);
    }
    
    @Override
    public void adminResetPassword(Long userId, AdminPasswordResetDTO adminPasswordResetDTO) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setPassword(passwordEncoder.encode(adminPasswordResetDTO.getNewPassword()));
        userRepository.save(user);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserResponseDTO> searchUsers(String name, String email, String employeeId, 
            String department, String role, String status, Pageable pageable) {
        Specification<User> spec = Specification.where(null);
        
        // Check if this is a global search (same term in multiple fields)
        boolean isGlobalSearch = name != null && name.equals(email) && name.equals(employeeId);
        
        if (isGlobalSearch) {
            spec = spec.and(hasGlobalSearch(name));
        } else {
            // Individual field searches
            spec = spec.and(hasNameLike(name))
                .and(hasEmailLike(email))
                .and(hasEmployeeIdLike(employeeId));
        }
        
        // Add other filters
        spec = spec.and(hasDepartmentLike(department))
            .and(hasRole(role))
            .and(hasStatus(status));
            
        return userRepository.findAll(spec, pageable).map(UserResponseDTO::fromEntity);
    }
}