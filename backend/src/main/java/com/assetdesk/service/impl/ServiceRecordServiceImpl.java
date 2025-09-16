package com.assetdesk.service.impl;

import com.assetdesk.domain.ServiceRecord;
import com.assetdesk.dto.ServiceRecordRequest;
import com.assetdesk.dto.ServiceRecordResponseDTO;
import com.assetdesk.repository.ServiceRecordRepository;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.VendorRepository;
import com.assetdesk.service.ServiceRecordService;
import com.assetdesk.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ServiceRecordServiceImpl implements ServiceRecordService {
    
    private final ServiceRecordRepository serviceRecordRepository;
    private final AssetRepository assetRepository;
    private final VendorRepository vendorRepository;
    private final com.assetdesk.service.NotificationService notificationService;
    private final com.assetdesk.repository.UserRepository userRepository;
    
    @Override
    @Transactional
    public ServiceRecord createServiceRecord(ServiceRecordRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Service record request cannot be null");
        }
        
        ServiceRecord serviceRecord = new ServiceRecord();
        serviceRecord.setAsset(assetRepository.findById(request.getAssetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", request.getAssetId())));
        serviceRecord.setServiceDate(request.getServiceDate());
        serviceRecord.setServiceDescription(request.getDescription());
        serviceRecord.setCost(request.getCost());
        serviceRecord.setServiceType(request.getServiceType());
        serviceRecord.setPerformedBy(request.getPerformedBy());
        serviceRecord.setNextServiceDate(request.getNextServiceDate());
        serviceRecord.setNotes(request.getNotes());
        
        if (request.getVendorId() != null && request.getVendorId() > 0) {
            serviceRecord.setVendor(vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", request.getVendorId())));
        }
        
        ServiceRecord savedRecord = serviceRecordRepository.save(serviceRecord);
        
        // Create notification for service completion
        try {
            // Notify IT support
            List<com.assetdesk.domain.User> itUsers = userRepository.findByRole(com.assetdesk.domain.User.Role.IT_SUPPORT);
            for (com.assetdesk.domain.User itUser : itUsers) {
                notificationService.createNotification(
                    itUser.getId(),
                    "Service Record Created",
                    "New service record created for asset '" + serviceRecord.getAsset().getName() + "'",
                    com.assetdesk.domain.Notification.Type.INFO,
                    null,
                    serviceRecord.getAsset().getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to create service notification: " + e.getMessage());
        }
        
        return savedRecord;
    }
    
    @Override
    @Transactional(readOnly = true)
    public ServiceRecord getServiceRecordById(Long id) {
        return serviceRecordRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ServiceRecord", "id", id));
    }
    
    @Transactional(readOnly = true)
    public ServiceRecordResponseDTO getServiceRecordByIdDTO(Long id) {
        ServiceRecord record = serviceRecordRepository.findByIdWithAssetAndVendor(id)
            .orElseThrow(() -> new ResourceNotFoundException("ServiceRecord", "id", id));
        return convertToDTO(record);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<ServiceRecord> getServiceRecordsByAsset(Long assetId) {
        if (assetId == null || assetId <= 0) {
            throw new IllegalArgumentException("Asset ID must be positive");
        }
        return serviceRecordRepository.findByAssetIdOrderByServiceDateDesc(assetId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BigDecimal getTotalServiceCost(Long assetId) {
        if (assetId == null || assetId <= 0) {
            throw new IllegalArgumentException("Asset ID must be positive");
        }
        BigDecimal totalCost = serviceRecordRepository.getTotalServiceCostByAssetId(assetId);
        return totalCost != null ? totalCost : BigDecimal.ZERO;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getServiceCount(Long assetId) {
        if (assetId == null || assetId <= 0) {
            throw new IllegalArgumentException("Asset ID must be positive");
        }
        Long count = serviceRecordRepository.getServiceCountByAssetId(assetId);
        return count != null ? count : 0L;
    }
    
    @Override
    public ServiceRecord updateServiceRecord(Long id, ServiceRecordRequest request) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Service record ID must be positive");
        }
        if (request == null) {
            throw new IllegalArgumentException("Service record request cannot be null");
        }
        
        ServiceRecord serviceRecord = serviceRecordRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("ServiceRecord", "id", id));
        
        serviceRecord.setAsset(assetRepository.findById(request.getAssetId())
            .orElseThrow(() -> new ResourceNotFoundException("Asset", "id", request.getAssetId())));
        serviceRecord.setServiceDate(request.getServiceDate());
        serviceRecord.setServiceDescription(request.getDescription());
        serviceRecord.setCost(request.getCost());
        serviceRecord.setServiceType(request.getServiceType());
        serviceRecord.setPerformedBy(request.getPerformedBy());
        serviceRecord.setNextServiceDate(request.getNextServiceDate());
        serviceRecord.setNotes(request.getNotes());
        
        if (request.getVendorId() != null && request.getVendorId() > 0) {
            serviceRecord.setVendor(vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", "id", request.getVendorId())));
        } else {
            serviceRecord.setVendor(null);
        }
        
        return serviceRecordRepository.save(serviceRecord);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<ServiceRecord> getAllServiceRecords(Pageable pageable) {
        return serviceRecordRepository.findAll(pageable);
    }
    
    @Transactional(readOnly = true)
    public Page<ServiceRecordResponseDTO> getAllServiceRecordsDTO(Pageable pageable) {
        try {
            Page<ServiceRecord> records = serviceRecordRepository.findAllServiceRecordsExcludingAllocations(pageable);
            System.out.println("Found " + records.getTotalElements() + " service records (excluding allocations)");
            
            List<ServiceRecordResponseDTO> dtos = records.getContent().stream()
                .map(record -> {
                    try {
                        return this.convertToDTO(record);
                    } catch (Exception e) {
                        System.err.println("Error converting record " + record.getId() + ": " + e.getMessage());
                        e.printStackTrace();
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
                
            System.out.println("Converted " + dtos.size() + " DTOs successfully");
            return new PageImpl<>(dtos, pageable, records.getTotalElements());
        } catch (Exception e) {
            System.err.println("Error in getAllServiceRecordsDTO: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    private ServiceRecordResponseDTO convertToDTO(ServiceRecord record) {
        ServiceRecordResponseDTO.ServiceRecordResponseDTOBuilder builder = ServiceRecordResponseDTO.builder()
            .id(record.getId())
            .serviceDate(record.getServiceDate())
            .description(record.getServiceDescription())
            .cost(record.getServiceCost() != null ? record.getServiceCost() : record.getCost())
            .nextServiceDate(record.getNextServiceDate())
            .serviceType(record.getServiceType() != null ? record.getServiceType() : "MAINTENANCE")
            .performedBy(record.getPerformedBy())
            .status(record.getStatus() != null ? record.getStatus() : "COMPLETED")
            .notes(record.getNotes());
        
        if (record.getAsset() != null) {
            var asset = record.getAsset();
            builder.asset(ServiceRecordResponseDTO.AssetInfo.builder()
                .id(asset.getId())
                .assetTag(asset.getAssetTag())
                .name(asset.getName())
                .category(asset.getCategory() != null ? asset.getCategory().toString() : null)
                .type(asset.getType() != null ? asset.getType().toString() : null)
                .model(asset.getModel())
                .serialNumber(asset.getSerialNumber())
                .status(asset.getStatus() != null ? asset.getStatus().toString() : null)
                .build());
        }
        
        if (record.getVendor() != null) {
            var vendor = record.getVendor();
            builder.vendor(ServiceRecordResponseDTO.VendorInfo.builder()
                .id(vendor.getId())
                .name(vendor.getName())
                .build());
        }
        
        return builder.build();
    }
    
    @Override
    public void deleteServiceRecord(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Service record ID must be positive");
        }
        if (!serviceRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("ServiceRecord", "id", id);
        }
        serviceRecordRepository.deleteById(id);
    }
}