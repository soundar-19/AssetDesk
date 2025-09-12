package com.assetdesk.service;

import com.assetdesk.dto.auth.AuthResponse;
import com.assetdesk.dto.auth.LoginRequest;
import com.assetdesk.domain.User;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.exception.InvalidOperationException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    public AuthResponse authenticate(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new InvalidOperationException("Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidOperationException("User not found"));
        
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(token, user.getEmail(), user.getRole().name(), user.getId());
    }
}