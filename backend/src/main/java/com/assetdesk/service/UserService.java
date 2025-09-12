package com.assetdesk.service;

import com.assetdesk.dto.user.UserRequestDTO;
import com.assetdesk.dto.user.UserUpdateDTO;
import com.assetdesk.dto.user.UserResponseDTO;
import com.assetdesk.dto.user.ChangePasswordDTO;
import com.assetdesk.dto.user.AdminPasswordResetDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    
    UserResponseDTO createUser(UserRequestDTO userRequestDTO);
    UserResponseDTO getUserById(Long id);
    UserResponseDTO getUserByEmployeeId(String employeeId);
    UserResponseDTO getUserByEmail(String email);
    Page<UserResponseDTO> getAllUsers(Pageable pageable);
    Page<UserResponseDTO> getUsersByRole(String role, Pageable pageable);
    Page<UserResponseDTO> getUsersByDepartment(String department, Pageable pageable);
    Page<UserResponseDTO> getUsersByStatus(String status, Pageable pageable);
    UserResponseDTO updateUser(Long id, UserUpdateDTO userUpdateDTO);
    void deleteUser(Long id);
    void changePassword(Long userId, ChangePasswordDTO changePasswordDTO);
    void adminResetPassword(Long userId, AdminPasswordResetDTO adminPasswordResetDTO);
    Page<UserResponseDTO> searchUsers(String name, String email, String employeeId, 
        String department, String role, String status, Pageable pageable);
}