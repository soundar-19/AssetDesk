package com.assetdesk.config;

import com.assetdesk.domain.*;
import com.assetdesk.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final VendorRepository vendorRepository;
    private final AssetAllocationRepository assetAllocationRepository;
    private final AssetRequestRepository assetRequestRepository;
    private final IssueRepository issueRepository;
    private final ServiceRecordRepository serviceRecordRepository;
    private final NotificationRepository notificationRepository;
    private final CommonIssueRepository commonIssueRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeVendors();
        initializeAssets();
        initializeAssetAllocations();
        initializeAssetRequests();
        initializeIssues();
        initializeServiceRecords();
        initializeCommonIssues();
        initializeNotifications();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(createUser("SYSTEM", "System Administrator", "system@assetdesk.com", "system123", "+919876543210", User.Role.ADMIN, "Information Technology", "System Administrator", LocalDate.now(), User.Status.ACTIVE));
            userRepository.save(createUser("EMP001", "Soundar Raja", "sr@assetdesk.com", "password123", "+919876543211", User.Role.EMPLOYEE, "Information Technology", "Software Engineer", LocalDate.now().minusMonths(6), User.Status.ACTIVE));
            userRepository.save(createUser("EMP002", "Lokeshwaran", "lokeshwaran@assetdesk.com", "password123", "+919876543212", User.Role.EMPLOYEE, "R&D", "Developer", LocalDate.now().minusMonths(4), User.Status.ACTIVE));
            userRepository.save(createUser("EMP003", "Hari Ram", "hari.ram@assetdesk.com", "password123", "+919876543213", User.Role.EMPLOYEE, "Human Resources", "HR Specialist", LocalDate.now().minusMonths(3), User.Status.ACTIVE));
            userRepository.save(createUser("EMP004", "Adrin", "adrin@assetdesk.com", "password123", "+919876543214", User.Role.EMPLOYEE, "Finance", "Financial Analyst", LocalDate.now().minusMonths(5), User.Status.ACTIVE));
            userRepository.save(createUser("EMP006", "Jeff", "jeff@assetdesk.com", "password123", "+919876543216", User.Role.EMPLOYEE, "Marketing", "Marketing Manager", LocalDate.now().minusMonths(12), User.Status.ACTIVE));
            userRepository.save(createUser("EMP007", "Pradeep", "pradeep@assetdesk.com", "password123", "+919876543217", User.Role.EMPLOYEE, "Operations", "Operations Specialist", LocalDate.now().minusMonths(7), User.Status.ACTIVE));
            userRepository.save(createUser("EMP008", "Swetha", "swetha@assetdesk.com", "password123", "+919876543218", User.Role.EMPLOYEE, "Quality Assurance", "QA Engineer", LocalDate.now().minusMonths(9), User.Status.ACTIVE));
            userRepository.save(createUser("EMP009", "Sri Gayathri", "srigayathri@assetdesk.com", "password123", "+919876543219", User.Role.EMPLOYEE, "Design", "UI/UX Designer", LocalDate.now().minusMonths(2), User.Status.ACTIVE));
            userRepository.save(createUser("EMP010", "Suraj", "suraj@assetdesk.com", "password123", "+919876543220", User.Role.IT_SUPPORT, "Information Technology", "Senior IT Specialist", LocalDate.now().minusMonths(10), User.Status.ACTIVE));
            userRepository.save(createUser("EMP011", "Aadhitya", "aadhitya@assetdesk.com", "password123", "+919876543221", User.Role.EMPLOYEE, "Research", "Research Analyst", LocalDate.now().minusMonths(1), User.Status.ACTIVE));
        }
    }

    private void initializeVendors() {
        if (vendorRepository.count() == 0) {
            vendorRepository.save(createVendor("Dell Technologies", "John Dell", "sales@dell.com", "+918040407000", "One Dell Way, Round Rock, TX 78682"));
            vendorRepository.save(createVendor("HP Inc.", "Sarah HP", "enterprise@hp.com", "+918025524000", "1501 Page Mill Road, Palo Alto, CA 94304"));
            vendorRepository.save(createVendor("Lenovo Group", "Mike Lenovo", "business@lenovo.com", "+911244628000", "1009 Think Place, Morrisville, NC 27560"));
            vendorRepository.save(createVendor("Microsoft Corporation", "Bill Gates", "enterprise@microsoft.com", "+918040404000", "One Microsoft Way, Redmond, WA 98052"));
            vendorRepository.save(createVendor("Apple Inc.", "Tim Cook", "business@apple.com", "+918040403000", "One Apple Park Way, Cupertino, CA 95014"));
            vendorRepository.save(createVendor("Canon Inc.", "Canon Support", "support@canon.com", "+911244629000", "One Canon Park, Melville, NY 11747"));
        }
    }

    private void initializeAssets() {
        if (assetRepository.count() == 0) {
            Vendor dell = vendorRepository.findByName("Dell Technologies").orElse(null);
            Vendor hp = vendorRepository.findByName("HP Inc.").orElse(null);
            Vendor lenovo = vendorRepository.findByName("Lenovo Group").orElse(null);
            Vendor microsoft = vendorRepository.findByName("Microsoft Corporation").orElse(null);
            Vendor apple = vendorRepository.findByName("Apple Inc.").orElse(null);
            Vendor canon = vendorRepository.findByName("Canon Inc.").orElse(null);

            for (int i = 1; i <= 15; i++) {
                Asset.Status status = i <= 8 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                LocalDate warrantyDate;
                if (i <= 5) {
                    warrantyDate = i <= 2 ? LocalDate.of(2025, 9, 10) : (i == 3 ? LocalDate.of(2025, 9, 17) : LocalDate.of(2025, 9, 25));
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "Dell Latitude 7420", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "Latitude 7420", "DL7420" + String.format("%03d", i), LocalDate.now().minusMonths(6), warrantyDate, dell, new BigDecimal("1299.99"), status, false, null, null));
                } else if (i <= 10) {
                    warrantyDate = i == 6 ? LocalDate.of(2025, 9, 15) : LocalDate.now().plusYears(3);
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "HP EliteBook 840", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "EliteBook 840", "HP840" + String.format("%03d", i), LocalDate.now().minusMonths(4), warrantyDate, hp, new BigDecimal("1199.99"), status, false, null, null));
                } else {
                    warrantyDate = i == 11 ? LocalDate.of(2025, 9, 20) : LocalDate.now().plusYears(2);
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "Lenovo ThinkPad X1", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "ThinkPad X1", "TP1" + String.format("%03d", i), LocalDate.now().minusMonths(8), warrantyDate, lenovo, new BigDecimal("1599.99"), status, false, null, null));
                }
            }

            for (int i = 1; i <= 12; i++) {
                Asset.Status status = i <= 6 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                LocalDate warrantyDate;
                if (i <= 6) {
                    warrantyDate = i == 1 ? LocalDate.of(2025, 9, 12) : (i == 2 ? LocalDate.of(2025, 9, 18) : LocalDate.now().plusYears(3));
                    assetRepository.save(createAsset(String.format("DSK%03d", i), "Dell OptiPlex 7090", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "OptiPlex 7090", "OP7090" + String.format("%03d", i), LocalDate.now().minusMonths(10), warrantyDate, dell, new BigDecimal("899.99"), status, false, null, null));
                } else {
                    warrantyDate = i == 7 ? LocalDate.of(2025, 9, 16) : LocalDate.now().plusYears(3);
                    assetRepository.save(createAsset(String.format("DSK%03d", i), "HP EliteDesk 800", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "EliteDesk 800", "ED800" + String.format("%03d", i), LocalDate.now().minusMonths(7), warrantyDate, hp, new BigDecimal("799.99"), status, false, null, null));
                }
            }

            for (int i = 1; i <= 20; i++) {
                Asset.Status status = i <= 12 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                LocalDate warrantyDate;
                if (i <= 10) {
                    warrantyDate = (i == 3 ? LocalDate.of(2025, 9, 14) : (i == 4 ? LocalDate.of(2025, 9, 19) : LocalDate.now().plusYears(3)));
                    assetRepository.save(createAsset(String.format("MON%03d", i), "Dell UltraSharp 27", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "UltraSharp U2722DE", "US27" + String.format("%03d", i), LocalDate.now().minusMonths(5), warrantyDate, dell, new BigDecimal("449.99"), status, false, null, null));
                } else {
                    warrantyDate = i == 11 ? LocalDate.of(2025, 9, 13) : LocalDate.now().plusYears(3);
                    assetRepository.save(createAsset(String.format("MON%03d", i), "HP E24 G5", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "E24 G5", "E24G5" + String.format("%03d", i), LocalDate.now().minusMonths(3), warrantyDate, hp, new BigDecimal("199.99"), status, false, null, null));
                }
            }

            for (int i = 1; i <= 10; i++) {
                Asset.Status status;
                if (i <= 3) status = Asset.Status.AVAILABLE;
                else if (i <= 5) status = Asset.Status.ALLOCATED;
                else if (i <= 7) status = Asset.Status.MAINTENANCE;
                else if (i == 8) status = Asset.Status.RETIRED;
                else status = Asset.Status.LOST;
                
                if (i <= 5) {
                    assetRepository.save(createAsset(String.format("PRT%03d", i), "Canon imageRUNNER", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "imageRUNNER ADVANCE", "IRA" + String.format("%03d", i), LocalDate.now().minusMonths(12), LocalDate.now().plusYears(2), canon, new BigDecimal("2999.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("PRT%03d", i), "HP LaserJet Pro", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "LaserJet Pro M404n", "LJP404" + String.format("%03d", i), LocalDate.now().minusMonths(9), LocalDate.now().plusYears(2), hp, new BigDecimal("199.99"), status, false, null, null));
                }
            }

            for (int i = 1; i <= 25; i++) {
                Asset.Status status = i <= 15 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                if (i <= 10) {
                    int totalLicenses = 5;
                    int usedLicenses = status == Asset.Status.ALLOCATED ? Math.min(i, totalLicenses) : 0;
                    assetRepository.save(createAsset(String.format("SW%03d", i), "Microsoft Office 365", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Office 365 Business", "O365" + String.format("%03d", i), LocalDate.now().minusMonths(1), LocalDate.now().plusYears(1), microsoft, new BigDecimal("149.99"), usedLicenses >= totalLicenses ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE, true, totalLicenses, usedLicenses));
                } else if (i <= 20) {
                    int totalLicenses = 3;
                    int usedLicenses = status == Asset.Status.ALLOCATED ? Math.min(i-10, totalLicenses) : 0;
                    assetRepository.save(createAsset(String.format("SW%03d", i), "Windows 11 Pro", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Windows 11 Professional", "W11PRO" + String.format("%03d", i), LocalDate.now().minusMonths(6), null, microsoft, new BigDecimal("199.99"), usedLicenses >= totalLicenses ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE, true, totalLicenses, usedLicenses));
                } else {
                    int totalLicenses = 2;
                    int usedLicenses = status == Asset.Status.ALLOCATED ? Math.min(i-20, totalLicenses) : 0;
                    assetRepository.save(createAsset(String.format("SW%03d", i), "Adobe Creative Suite", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Creative Cloud", "ACS" + String.format("%03d", i), LocalDate.now().minusMonths(3), LocalDate.now().plusYears(1), microsoft, new BigDecimal("599.99"), usedLicenses >= totalLicenses ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE, true, totalLicenses, usedLicenses));
                }
            }

            for (int i = 1; i <= 35; i++) {
                Asset.Status status;
                if (i <= 18) status = Asset.Status.ALLOCATED;
                else if (i <= 28) status = Asset.Status.AVAILABLE;
                else if (i <= 31) status = Asset.Status.MAINTENANCE;
                else if (i <= 33) status = Asset.Status.RETIRED;
                else status = Asset.Status.LOST;
                
                if (i <= 10) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Logitech MX Master 3", Asset.Category.ACCESSORIES, Asset.AssetType.MOUSE, "MX Master 3", "MXM3" + String.format("%03d", i), LocalDate.now().minusMonths(2), LocalDate.now().plusYears(2), null, new BigDecimal("99.99"), status, false, null, null));
                } else if (i <= 20) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Dell Wireless Keyboard", Asset.Category.ACCESSORIES, Asset.AssetType.KEYBOARD, "KB216", "KB216" + String.format("%03d", i), LocalDate.now().minusMonths(4), LocalDate.now().plusYears(3), dell, new BigDecimal("29.99"), status, false, null, null));
                } else if (i <= 25) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "USB-C to HDMI Cable", Asset.Category.ACCESSORIES, Asset.AssetType.CABLE, "USB-C HDMI", "USBCHDMI" + String.format("%03d", i), LocalDate.now().minusMonths(1), null, null, new BigDecimal("19.99"), status, false, null, null));
                } else if (i <= 30) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Logitech H800 Headset", Asset.Category.ACCESSORIES, Asset.AssetType.HEADSET, "H800 Wireless", "H800" + String.format("%03d", i), LocalDate.now().minusMonths(6), LocalDate.now().plusYears(2), null, new BigDecimal("119.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Logitech C920 Webcam", Asset.Category.ACCESSORIES, Asset.AssetType.WEBCAM, "C920 HD Pro", "C920" + String.format("%03d", i), LocalDate.now().minusMonths(8), LocalDate.now().plusYears(3), null, new BigDecimal("79.99"), status, false, null, null));
                }
            }
        }
    }

    private User createUser(String employeeId, String name, String email, String password, String phoneNumber, User.Role role, String department, String designation, LocalDate dateJoined, User.Status status) {
        User user = new User();
        user.setEmployeeId(employeeId);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setDepartment(department);
        user.setDesignation(designation);
        user.setStatus(status);
        user.setDateJoined(dateJoined);
        if (status == User.Status.ACTIVE && Math.random() > 0.3) {
            user.setLastLogin(LocalDateTime.now().minusDays((int)(Math.random() * 7)));
        }
        return user;
    }

    private Vendor createVendor(String name, String contactPerson, String email, String phoneNumber, String address) {
        Vendor vendor = new Vendor();
        vendor.setName(name);
        vendor.setContactPerson(contactPerson);
        vendor.setEmail(email);
        vendor.setPhoneNumber(phoneNumber);
        vendor.setAddress(address);
        vendor.setStatus(Vendor.Status.ACTIVE);
        return vendor;
    }

    private Asset createAsset(String assetTag, String name, Asset.Category category, Asset.AssetType type, String model, String serialNumber, LocalDate purchaseDate, LocalDate warrantyExpiryDate, Vendor vendor, BigDecimal cost, Asset.Status status, Boolean isShareable, Integer totalLicenses, Integer usedLicenses) {
        Asset asset = new Asset();
        asset.setAssetTag(assetTag);
        asset.setName(name);
        asset.setCategory(category);
        asset.setType(type);
        asset.setModel(model);
        asset.setSerialNumber(serialNumber);
        asset.setPurchaseDate(purchaseDate);
        asset.setWarrantyExpiryDate(warrantyExpiryDate);
        asset.setVendor(vendor);
        asset.setCost(cost);
        asset.setUsefulLifeYears(3);
        asset.setStatus(status);
        asset.setIsShareable(isShareable);
        asset.setTotalLicenses(totalLicenses);
        asset.setUsedLicenses(usedLicenses);
        return asset;
    }

    private void initializeAssetAllocations() {
        if (assetAllocationRepository.count() == 0) {
            User soundar = userRepository.findByEmployeeId("EMP001").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            User dimple = userRepository.findByEmployeeId("EMP003").orElse(null);
            User rin = userRepository.findByEmployeeId("EMP004").orElse(null);
            User jeff = userRepository.findByEmployeeId("EMP006").orElse(null);
            User radeep = userRepository.findByEmployeeId("EMP007").orElse(null);
            User swaytha = userRepository.findByEmployeeId("EMP008").orElse(null);
            User srigayatree = userRepository.findByEmployeeId("EMP009").orElse(null);
            User aacash = userRepository.findByEmployeeId("EMP010").orElse(null);
            User auditya = userRepository.findByEmployeeId("EMP011").orElse(null);
            
            User[] users = {soundar, lokesh, dimple, rin, jeff, radeep, swaytha, srigayatree, aacash, auditya};
            
            for (int i = 1; i <= 8; i++) {
                Asset laptop = assetRepository.findByAssetTag(String.format("LAP%03d", i)).orElse(null);
                if (laptop != null && i <= users.length) {
                    assetAllocationRepository.save(createAllocation(laptop, users[i-1], LocalDate.now().minusMonths(i), "Work laptop allocation"));
                }
            }
            
            for (int i = 1; i <= 6; i++) {
                Asset desktop = assetRepository.findByAssetTag(String.format("DSK%03d", i)).orElse(null);
                if (desktop != null && i <= users.length) {
                    assetAllocationRepository.save(createAllocation(desktop, users[i-1], LocalDate.now().minusMonths(i), "Workstation allocation"));
                }
            }
            
            for (int i = 1; i <= 12; i++) {
                Asset monitor = assetRepository.findByAssetTag(String.format("MON%03d", i)).orElse(null);
                if (monitor != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(monitor, user, LocalDate.now().minusWeeks(i), "Monitor allocation"));
                }
            }
            
            for (int i = 1; i <= 15; i++) {
                Asset software = assetRepository.findByAssetTag(String.format("SW%03d", i)).orElse(null);
                if (software != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(software, user, LocalDate.now().minusWeeks(i), "Software license allocation"));
                }
            }
            
            for (int i = 1; i <= 18; i++) {
                Asset accessory = assetRepository.findByAssetTag(String.format("ACC%03d", i)).orElse(null);
                if (accessory != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(accessory, user, LocalDate.now().minusWeeks(i), "Accessory allocation"));
                }
            }
            
            Asset printer4 = assetRepository.findByAssetTag("PRT004").orElse(null);
            Asset printer5 = assetRepository.findByAssetTag("PRT005").orElse(null);
            if (printer4 != null) {
                assetAllocationRepository.save(createAllocation(printer4, users[0], LocalDate.now().minusMonths(2), "Shared printer for IT department"));
            }
            if (printer5 != null) {
                assetAllocationRepository.save(createAllocation(printer5, users[2], LocalDate.now().minusMonths(1), "Shared printer for HR department"));
            }
        }
    }

    private void initializeAssetRequests() {
        System.out.println("Initializing asset requests...");
        long existingCount = assetRequestRepository.count();
        System.out.println("Existing asset requests count: " + existingCount);
        if (existingCount == 0) {
            User pradeep = userRepository.findByEmployeeId("EMP007").orElse(null);
            User swetha = userRepository.findByEmployeeId("EMP008").orElse(null);
            User dimple = userRepository.findByEmployeeId("EMP003").orElse(null);
            User rin = userRepository.findByEmployeeId("EMP004").orElse(null);
            User jeff = userRepository.findByEmployeeId("EMP006").orElse(null);
            User srigayatree = userRepository.findByEmployeeId("EMP009").orElse(null);
            User auditya = userRepository.findByEmployeeId("EMP011").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            User admin = userRepository.findByEmployeeId("EMP001").orElse(null);
            User itSupport = userRepository.findByEmployeeId("EMP010").orElse(null);
            
            assetRequestRepository.save(createAssetRequest(swetha, AssetRequest.RequestType.ADDITIONAL, "HARDWARE", "MONITOR", "External Monitor", "Dell UltraSharp 27", 450.0, "Need dual monitor setup for QA testing across multiple browsers", AssetRequest.Priority.MEDIUM, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(dimple, AssetRequest.RequestType.NEW_ASSET, "ACCESSORIES", "HEADSET", "Wireless Headset", "Logitech H800", 120.0, "For video conferences and HR interviews", AssetRequest.Priority.LOW, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(auditya, AssetRequest.RequestType.UPGRADE, "HARDWARE", "LAPTOP", "High Performance Laptop", "MacBook Pro 16", 2500.0, "Current laptop insufficient for data analysis and machine learning tasks", AssetRequest.Priority.URGENT, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(jeff, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "TABLET", "Sales Tablet", "iPad Air", 600.0, "For client presentations and mobile CRM access", AssetRequest.Priority.HIGH, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(lokesh, AssetRequest.RequestType.ADDITIONAL, "SOFTWARE", "LICENSE", "Development Tools", "JetBrains IntelliJ IDEA", 200.0, "Need IDE license for Java development projects", AssetRequest.Priority.MEDIUM, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(srigayatree, AssetRequest.RequestType.REPLACEMENT, "ACCESSORIES", "MOUSE", "Ergonomic Mouse", "Logitech MX Vertical", 80.0, "Current mouse causing wrist strain during design work", AssetRequest.Priority.LOW, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(jeff, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "PRINTER", "Color Printer", "Canon PIXMA Pro", 800.0, "Need color printing for marketing materials and presentations", AssetRequest.Priority.MEDIUM, AssetRequest.Status.PENDING, null));
            assetRequestRepository.save(createAssetRequest(pradeep, AssetRequest.RequestType.ADDITIONAL, "ACCESSORIES", "WEBCAM", "4K Webcam", "Logitech Brio", 200.0, "For high-quality video conferences with clients", AssetRequest.Priority.LOW, AssetRequest.Status.PENDING, null));
            
            assetRequestRepository.save(createAssetRequest(pradeep, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "LAPTOP", "Development Laptop", "ThinkPad X1 Carbon", 1500.0, "Need for software development and operations work", AssetRequest.Priority.HIGH, AssetRequest.Status.APPROVED, admin));
            assetRequestRepository.save(createAssetRequest(rin, AssetRequest.RequestType.REPLACEMENT, "HARDWARE", "DESKTOP", "Workstation Replacement", "HP Z4 G4", 1800.0, "Current desktop experiencing frequent crashes and performance issues", AssetRequest.Priority.HIGH, AssetRequest.Status.APPROVED, admin));
            assetRequestRepository.save(createAssetRequest(swetha, AssetRequest.RequestType.ADDITIONAL, "ACCESSORIES", "KEYBOARD", "Mechanical Keyboard", "Dell KB522", 60.0, "Need ergonomic keyboard for extended testing sessions", AssetRequest.Priority.MEDIUM, AssetRequest.Status.APPROVED, itSupport));
            assetRequestRepository.save(createAssetRequest(dimple, AssetRequest.RequestType.NEW_ASSET, "SOFTWARE", "LICENSE", "HR Software", "BambooHR License", 300.0, "Need HR management software for employee records", AssetRequest.Priority.MEDIUM, AssetRequest.Status.APPROVED, admin));
            assetRequestRepository.save(createAssetRequest(pradeep, AssetRequest.RequestType.ADDITIONAL, "ACCESSORIES", "CHARGER", "Laptop Charger", "Universal USB-C", 80.0, "Backup charger for travel and client visits", AssetRequest.Priority.LOW, AssetRequest.Status.APPROVED, itSupport));
            
            // REJECTED requests (6 requests)
            assetRequestRepository.save(createAssetRequest(jeff, AssetRequest.RequestType.ADDITIONAL, "HARDWARE", "TABLET", "iPad Pro", "iPad Pro 12.9", 1200.0, "For mobile presentations and design work", AssetRequest.Priority.LOW, AssetRequest.Status.REJECTED, admin, "Budget constraints for current quarter. Use existing laptop for presentations."));
            assetRequestRepository.save(createAssetRequest(srigayatree, AssetRequest.RequestType.NEW_ASSET, "SOFTWARE", "LICENSE", "Adobe Photoshop", "Creative Cloud Individual", 600.0, "For advanced design and photo editing work", AssetRequest.Priority.MEDIUM, AssetRequest.Status.REJECTED, admin, "Alternative free software (GIMP) available. Budget allocated to higher priority requests."));
            assetRequestRepository.save(createAssetRequest(lokesh, AssetRequest.RequestType.UPGRADE, "HARDWARE", "MONITOR", "Gaming Monitor", "ASUS ROG 32 inch", 800.0, "For better development experience and testing", AssetRequest.Priority.LOW, AssetRequest.Status.REJECTED, admin, "Standard monitors sufficient for development work. Gaming features not required."));
            assetRequestRepository.save(createAssetRequest(auditya, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "DESKTOP", "High-End Workstation", "Dell Precision 7000", 3500.0, "For complex data analysis and AI model training", AssetRequest.Priority.MEDIUM, AssetRequest.Status.REJECTED, admin, "Exceeds budget limits. Cloud computing resources recommended instead."));
            assetRequestRepository.save(createAssetRequest(pradeep, AssetRequest.RequestType.ADDITIONAL, "ACCESSORIES", "SPEAKER", "Bluetooth Speaker", "Bose SoundLink", 150.0, "For team meetings and presentations", AssetRequest.Priority.LOW, AssetRequest.Status.REJECTED, admin, "Existing conference room audio equipment sufficient."));
            assetRequestRepository.save(createAssetRequest(swetha, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "LAPTOP", "MacBook Pro", "MacBook Pro 14", 2200.0, "For iOS app development and client demos", AssetRequest.Priority.MEDIUM, AssetRequest.Status.REJECTED, admin, "No iOS development projects currently planned. Windows laptop sufficient."));
            
            // FULFILLED requests (7 requests)
            Asset fulfilledLaptop = assetRepository.findByAssetTag("LAP009").orElse(null);
            Asset fulfilledMonitor = assetRepository.findByAssetTag("MON013").orElse(null);
            Asset fulfilledKeyboard = assetRepository.findByAssetTag("ACC015").orElse(null);
            Asset fulfilledMouse = assetRepository.findByAssetTag("ACC005").orElse(null);
            Asset fulfilledHeadset = assetRepository.findByAssetTag("ACC026").orElse(null);
            Asset fulfilledWebcam = assetRepository.findByAssetTag("ACC035").orElse(null);
            Asset fulfilledSoftware = assetRepository.findByAssetTag("SW015").orElse(null);
            
            assetRequestRepository.save(createAssetRequestFulfilled(dimple, AssetRequest.RequestType.REPLACEMENT, "HARDWARE", "LAPTOP", "Replacement Laptop", "Dell Latitude 7420", 1300.0, "Previous laptop damaged due to liquid spill", AssetRequest.Priority.HIGH, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledLaptop));
            assetRequestRepository.save(createAssetRequestFulfilled(jeff, AssetRequest.RequestType.ADDITIONAL, "HARDWARE", "MONITOR", "Second Monitor", "HP E24 G5", 200.0, "Productivity improvement for marketing campaigns", AssetRequest.Priority.MEDIUM, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledMonitor));
            assetRequestRepository.save(createAssetRequestFulfilled(lokesh, AssetRequest.RequestType.NEW_ASSET, "ACCESSORIES", "KEYBOARD", "Wireless Keyboard", "Dell KB216", 30.0, "Ergonomic keyboard for development work", AssetRequest.Priority.LOW, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledKeyboard));
            assetRequestRepository.save(createAssetRequestFulfilled(srigayatree, AssetRequest.RequestType.REPLACEMENT, "ACCESSORIES", "MOUSE", "Design Mouse", "Logitech MX Master 3", 100.0, "Previous mouse buttons not working properly", AssetRequest.Priority.MEDIUM, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledMouse));
            assetRequestRepository.save(createAssetRequestFulfilled(swetha, AssetRequest.RequestType.NEW_ASSET, "ACCESSORIES", "HEADSET", "Testing Headset", "Logitech H800", 120.0, "For audio testing in QA processes", AssetRequest.Priority.MEDIUM, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledHeadset));
            assetRequestRepository.save(createAssetRequestFulfilled(auditya, AssetRequest.RequestType.ADDITIONAL, "ACCESSORIES", "WEBCAM", "HD Webcam", "Logitech C920", 80.0, "For client video calls and presentations", AssetRequest.Priority.MEDIUM, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledWebcam));
            assetRequestRepository.save(createAssetRequestFulfilled(pradeep, AssetRequest.RequestType.NEW_ASSET, "SOFTWARE", "LICENSE", "Office Suite", "Microsoft Office 365", 150.0, "For document creation and collaboration", AssetRequest.Priority.HIGH, AssetRequest.Status.FULFILLED, admin, itSupport, fulfilledSoftware));
            
            // CANCELLED requests (3 requests)
            assetRequestRepository.save(createAssetRequest(rin, AssetRequest.RequestType.NEW_ASSET, "ACCESSORIES", "WEBCAM", "4K Webcam", "Logitech Brio", 200.0, "For video streaming and recording", AssetRequest.Priority.LOW, AssetRequest.Status.CANCELLED, null));
            assetRequestRepository.save(createAssetRequest(auditya, AssetRequest.RequestType.ADDITIONAL, "HARDWARE", "PRINTER", "Personal Printer", "HP LaserJet", 300.0, "For printing research documents", AssetRequest.Priority.LOW, AssetRequest.Status.CANCELLED, null));
            assetRequestRepository.save(createAssetRequest(jeff, AssetRequest.RequestType.UPGRADE, "ACCESSORIES", "ADAPTER", "USB Hub", "Anker 7-in-1", 50.0, "For connecting multiple devices", AssetRequest.Priority.LOW, AssetRequest.Status.CANCELLED, null));
            
            System.out.println("Asset requests initialization completed. Total count: " + assetRequestRepository.count());
        } else {
            System.out.println("Asset requests already exist, skipping initialization.");
        }
    }

    private void initializeIssues() {
        if (issueRepository.count() == 0) {
            User soundar = userRepository.findByEmployeeId("EMP001").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            User dimple = userRepository.findByEmployeeId("EMP003").orElse(null);
            User rin = userRepository.findByEmployeeId("EMP004").orElse(null);
            User jeff = userRepository.findByEmployeeId("EMP006").orElse(null);
            User pradeep = userRepository.findByEmployeeId("EMP007").orElse(null);
            User swetha = userRepository.findByEmployeeId("EMP008").orElse(null);
            User itSupport = userRepository.findByEmployeeId("EMP010").orElse(null);
            
            Asset laptop1 = assetRepository.findByAssetTag("LAP002").orElse(null);
            Asset laptop2 = assetRepository.findByAssetTag("LAP003").orElse(null);
            Asset laptop3 = assetRepository.findByAssetTag("LAP004").orElse(null);
            Asset desktop1 = assetRepository.findByAssetTag("DSK001").orElse(null);
            Asset desktop2 = assetRepository.findByAssetTag("DSK002").orElse(null);
            Asset monitor1 = assetRepository.findByAssetTag("MON001").orElse(null);
            Asset monitor2 = assetRepository.findByAssetTag("MON002").orElse(null);
            Asset printer1 = assetRepository.findByAssetTag("PRT002").orElse(null);
            Asset printer2 = assetRepository.findByAssetTag("PRT003").orElse(null);
            Asset software1 = assetRepository.findByAssetTag("SW001").orElse(null);
            
            // OPEN issues
            issueRepository.save(createIssue(printer1, lokesh, itSupport, "Printer not responding", "Printer shows offline status and won't print documents", Issue.IssueType.CONNECTIVITY_ISSUE, Issue.Priority.MEDIUM, Issue.Status.OPEN, LocalDateTime.now().minusHours(4)));
            issueRepository.save(createIssue(monitor2, dimple, null, "Monitor flickering", "Screen flickers intermittently, especially during startup", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.LOW, Issue.Status.OPEN, LocalDateTime.now().minusHours(2)));
            issueRepository.save(createIssue(desktop2, rin, null, "Blue screen errors", "Computer crashes with blue screen error multiple times daily", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.CRITICAL, Issue.Status.OPEN, LocalDateTime.now().minusMinutes(30)));
            
            // IN_PROGRESS issues
            issueRepository.save(createIssue(laptop1, soundar, itSupport, "Laptop overheating", "Laptop gets very hot during intensive tasks and fan runs constantly", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.HIGH, Issue.Status.IN_PROGRESS, LocalDateTime.now().minusDays(2)));
            issueRepository.save(createIssue(laptop2, jeff, itSupport, "Slow performance", "Laptop takes very long to boot and applications run slowly", Issue.IssueType.PERFORMANCE_PROBLEM, Issue.Priority.MEDIUM, Issue.Status.IN_PROGRESS, LocalDateTime.now().minusDays(1)));
            issueRepository.save(createIssue(software1, pradeep, itSupport, "License activation failed", "Unable to activate Microsoft Office license, showing expired message", Issue.IssueType.SOFTWARE_ISSUE, Issue.Priority.HIGH, Issue.Status.IN_PROGRESS, LocalDateTime.now().minusHours(8)));
            
            // RESOLVED issues
            issueRepository.save(createResolvedIssue(laptop3, swetha, itSupport, "Keyboard keys not working", "Several keys on keyboard not responding to input", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.MEDIUM, Issue.Status.RESOLVED, LocalDateTime.now().minusDays(5), LocalDateTime.now().minusDays(3), "Replaced keyboard assembly. Issue resolved.", 85.0));
            issueRepository.save(createResolvedIssue(desktop1, dimple, itSupport, "Network connectivity issues", "Unable to connect to company network and internet", Issue.IssueType.CONNECTIVITY_ISSUE, Issue.Priority.HIGH, Issue.Status.RESOLVED, LocalDateTime.now().minusDays(7), LocalDateTime.now().minusDays(6), "Updated network drivers and reconfigured network settings.", 0.0));
            issueRepository.save(createResolvedIssue(monitor1, rin, itSupport, "Display color distortion", "Colors appear washed out and contrast is poor", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.LOW, Issue.Status.RESOLVED, LocalDateTime.now().minusDays(10), LocalDateTime.now().minusDays(8), "Calibrated monitor settings and updated display drivers.", 0.0));
            
            // CLOSED issues
            issueRepository.save(createClosedIssue(printer2, jeff, itSupport, "Paper jam frequent", "Printer frequently jams when printing multiple pages", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.MEDIUM, Issue.Status.CLOSED, LocalDateTime.now().minusDays(15), LocalDateTime.now().minusDays(12), "Cleaned paper feed mechanism and replaced worn rollers. User trained on proper paper loading.", 120.0));
            issueRepository.save(createClosedIssue(laptop3, soundar, itSupport, "Battery not charging", "Laptop battery does not charge when plugged in", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.HIGH, Issue.Status.CLOSED, LocalDateTime.now().minusDays(20), LocalDateTime.now().minusDays(18), "Replaced battery and power adapter. Issue completely resolved.", 180.0));
        }
    }

    private void initializeServiceRecords() {
        if (serviceRecordRepository.count() == 0) {
            Asset laptop1 = assetRepository.findByAssetTag("LAP001").orElse(null);
            Asset laptop2 = assetRepository.findByAssetTag("LAP002").orElse(null);
            Asset laptop3 = assetRepository.findByAssetTag("LAP003").orElse(null);
            Asset desktop1 = assetRepository.findByAssetTag("DSK001").orElse(null);
            Asset desktop2 = assetRepository.findByAssetTag("DSK002").orElse(null);
            Asset printer1 = assetRepository.findByAssetTag("PRT001").orElse(null);
            Asset printer2 = assetRepository.findByAssetTag("PRT002").orElse(null);
            Asset printer3 = assetRepository.findByAssetTag("PRT003").orElse(null);
            Asset monitor1 = assetRepository.findByAssetTag("MON001").orElse(null);
            Asset monitor2 = assetRepository.findByAssetTag("MON002").orElse(null);
            
            Vendor dell = vendorRepository.findByName("Dell Technologies").orElse(null);
            Vendor hp = vendorRepository.findByName("HP Inc.").orElse(null);
            Vendor canon = vendorRepository.findByName("Canon Inc.").orElse(null);
            
            // Hardware Upgrades
            serviceRecordRepository.save(createServiceRecord(laptop1, LocalDate.now().minusMonths(1), "RAM upgrade from 8GB to 16GB and SSD cleaning", new BigDecimal("150.00"), "Hardware Upgrade", "Dell Technician", dell, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(desktop1, LocalDate.now().minusMonths(2), "Graphics card upgrade and system optimization", new BigDecimal("320.00"), "Hardware Upgrade", "HP Service Team", hp, "COMPLETED"));
            
            // Preventive Maintenance
            serviceRecordRepository.save(createServiceRecord(printer1, LocalDate.now().minusWeeks(2), "Routine maintenance, toner replacement, and calibration", new BigDecimal("75.00"), "Preventive Maintenance", "Canon Service", canon, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(laptop2, LocalDate.now().minusWeeks(3), "System cleanup, thermal paste replacement, and fan cleaning", new BigDecimal("95.00"), "Preventive Maintenance", "Dell Technician", dell, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(desktop2, LocalDate.now().minusWeeks(1), "Dust cleaning, cable management, and performance optimization", new BigDecimal("60.00"), "Preventive Maintenance", "HP Service Team", hp, "COMPLETED"));
            
            // Repairs
            serviceRecordRepository.save(createServiceRecord(laptop3, LocalDate.now().minusDays(10), "Keyboard replacement due to multiple key failures", new BigDecimal("85.00"), "Repair", "Dell Technician", dell, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(printer2, LocalDate.now().minusDays(5), "Paper feed mechanism repair and roller replacement", new BigDecimal("120.00"), "Repair", "Canon Service", canon, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(monitor1, LocalDate.now().minusDays(15), "Display calibration and color correction", new BigDecimal("40.00"), "Calibration", "Dell Technician", dell, "COMPLETED"));
            
            // Warranty Services
            serviceRecordRepository.save(createServiceRecord(monitor2, LocalDate.now().minusDays(20), "Screen replacement under warranty", new BigDecimal("0.00"), "Warranty Repair", "HP Service Team", hp, "COMPLETED"));
            serviceRecordRepository.save(createServiceRecord(printer3, LocalDate.now().minusDays(25), "Print head replacement under warranty", new BigDecimal("0.00"), "Warranty Repair", "Canon Service", canon, "COMPLETED"));
            
            // Scheduled/Pending Services
            serviceRecordRepository.save(createServiceRecord(laptop1, LocalDate.now().plusWeeks(2), "Scheduled quarterly maintenance and system update", new BigDecimal("80.00"), "Preventive Maintenance", "Dell Technician", dell, "SCHEDULED"));
            serviceRecordRepository.save(createServiceRecord(printer1, LocalDate.now().plusMonths(1), "Annual maintenance and parts inspection", new BigDecimal("100.00"), "Preventive Maintenance", "Canon Service", canon, "SCHEDULED"));
        }
    }

    private void initializeCommonIssues() {
        if (commonIssueRepository.count() == 0) {
            // Hardware issues
            commonIssueRepository.save(createCommonIssue("Laptop won't start", "Laptop does not power on when pressing power button", "1. Check power cable connection\n2. Try different power outlet\n3. Remove battery and try with AC power only\n4. Hold power button for 30 seconds to discharge\n5. Contact IT support if issue persists", "Laptop"));
            commonIssueRepository.save(createCommonIssue("Laptop overheating", "Laptop becomes very hot and fan runs constantly", "1. Clean air vents with compressed air\n2. Use laptop on hard, flat surface\n3. Close unnecessary applications\n4. Check task manager for high CPU usage\n5. Contact IT for thermal paste replacement if needed", "Laptop"));
            commonIssueRepository.save(createCommonIssue("Monitor no display", "Monitor shows no signal or black screen", "1. Check cable connections (power and video)\n2. Try different video cable\n3. Test with another computer\n4. Check monitor power button and settings\n5. Contact IT support for replacement", "Monitor"));
            commonIssueRepository.save(createCommonIssue("Printer paper jam", "Paper is stuck in the printer", "1. Turn off printer and unplug power\n2. Open all access panels carefully\n3. Remove jammed paper gently in direction of paper path\n4. Check for torn pieces\n5. Close panels and restart printer", "Printer"));
            commonIssueRepository.save(createCommonIssue("Keyboard keys not working", "Some keys on keyboard not responding", "1. Clean keyboard with compressed air\n2. Check for stuck keys or debris\n3. Try external keyboard to test\n4. Update keyboard drivers\n5. Contact IT for keyboard replacement", "Keyboard"));
            
            // Software issues
            commonIssueRepository.save(createCommonIssue("Software won't start", "Application fails to launch or crashes on startup", "1. Restart the application\n2. Restart computer\n3. Run application as administrator\n4. Check for software updates\n5. Reinstall application if needed", "Software"));
            commonIssueRepository.save(createCommonIssue("License activation failed", "Software license shows as expired or invalid", "1. Check internet connection\n2. Verify license key is correct\n3. Contact software vendor\n4. Check license server connectivity\n5. Contact IT for license renewal", "Software"));
            
            // Network issues
            commonIssueRepository.save(createCommonIssue("Slow internet connection", "Internet browsing and downloads are very slow", "1. Restart your router/modem\n2. Check for background downloads/updates\n3. Run internet speed test\n4. Try wired connection instead of WiFi\n5. Contact IT support for network issues", "Network"));
            commonIssueRepository.save(createCommonIssue("Cannot connect to WiFi", "Unable to connect to company wireless network", "1. Forget and reconnect to WiFi network\n2. Check WiFi password\n3. Restart network adapter\n4. Update WiFi drivers\n5. Contact IT for network configuration", "Network"));
            
            // General issues
            commonIssueRepository.save(createCommonIssue("Computer running slow", "System performance is sluggish and unresponsive", "1. Restart computer\n2. Check available disk space (need 15% free)\n3. Close unnecessary programs\n4. Run disk cleanup\n5. Contact IT for system optimization", "Performance"));
        }
    }

    private void initializeNotifications() {
        if (notificationRepository.count() == 0) {
            User soundar = userRepository.findByEmployeeId("EMP001").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            User dimple = userRepository.findByEmployeeId("EMP003").orElse(null);
            User rin = userRepository.findByEmployeeId("EMP004").orElse(null);
            User jeff = userRepository.findByEmployeeId("EMP006").orElse(null);
            User pradeep = userRepository.findByEmployeeId("EMP007").orElse(null);
            User swetha = userRepository.findByEmployeeId("EMP008").orElse(null);
            User itSupport = userRepository.findByEmployeeId("EMP010").orElse(null);
            
            // Asset allocation notifications
            notificationRepository.save(createNotification(soundar, "Asset Allocated", "Laptop LAP001 has been allocated to you", Notification.Type.ASSET_ALLOCATED, false, LocalDateTime.now().minusHours(2)));
            notificationRepository.save(createNotification(lokesh, "Asset Allocated", "Desktop DSK001 has been allocated to you", Notification.Type.ASSET_ALLOCATED, true, LocalDateTime.now().minusDays(1)));
            notificationRepository.save(createNotification(dimple, "Asset Allocated", "Monitor MON003 has been allocated to you", Notification.Type.ASSET_ALLOCATED, true, LocalDateTime.now().minusDays(2)));
            
            // Issue notifications
            notificationRepository.save(createNotification(itSupport, "Issue Assigned", "Hardware issue reported for Laptop LAP002 has been assigned to you", Notification.Type.ISSUE_ASSIGNED, false, LocalDateTime.now().minusHours(4)));
            notificationRepository.save(createNotification(lokesh, "Issue Update", "Your reported printer issue has been resolved", Notification.Type.ISSUE_RESOLVED, true, LocalDateTime.now().minusDays(3)));
            notificationRepository.save(createNotification(swetha, "Issue Created", "Your issue report for keyboard malfunction has been created", Notification.Type.ISSUE_UPDATED, true, LocalDateTime.now().minusDays(5)));
            
            // Request notifications
            notificationRepository.save(createNotification(pradeep, "Request Approved", "Your laptop request has been approved by administration", Notification.Type.SUCCESS, false, LocalDateTime.now().minusHours(6)));
            notificationRepository.save(createNotification(jeff, "Request Rejected", "Your tablet request has been rejected due to budget constraints", Notification.Type.WARNING, true, LocalDateTime.now().minusDays(4)));
            notificationRepository.save(createNotification(rin, "Request Fulfilled", "Your desktop replacement request has been fulfilled", Notification.Type.SUCCESS, false, LocalDateTime.now().minusHours(12)));
            
            // Warranty expiry notifications
            notificationRepository.save(createNotification(soundar, "Warranty Expiring", "Warranty for Laptop LAP005 expires in 30 days", Notification.Type.WARRANTY_EXPIRING, false, LocalDateTime.now().minusHours(1)));
            notificationRepository.save(createNotification(itSupport, "Warranty Expired", "Warranty for Printer PRT001 has expired", Notification.Type.WARNING, true, LocalDateTime.now().minusDays(7)));
            
            // Service notifications
            notificationRepository.save(createNotification(dimple, "Service Scheduled", "Maintenance scheduled for your laptop LAP003 next week", Notification.Type.MAINTENANCE_DUE, false, LocalDateTime.now().minusHours(8)));
            notificationRepository.save(createNotification(rin, "Service Completed", "Maintenance completed for Desktop DSK002", Notification.Type.SUCCESS, true, LocalDateTime.now().minusDays(1)));
        }
    }

    private AssetAllocation createAllocation(Asset asset, User user, LocalDate allocatedDate, String remarks) {
        AssetAllocation allocation = new AssetAllocation();
        allocation.setAsset(asset);
        allocation.setUser(user);
        allocation.setAllocatedDate(allocatedDate);
        allocation.setRemarks(remarks);
        return allocation;
    }

    private AssetRequest createAssetRequest(User requester, AssetRequest.RequestType type, String category, String assetType, String assetName, String model, Double cost, String justification, AssetRequest.Priority priority, AssetRequest.Status status, User approvedBy) {
        return createAssetRequest(requester, type, category, assetType, assetName, model, cost, justification, priority, status, approvedBy, null);
    }
    
    private AssetRequest createAssetRequest(User requester, AssetRequest.RequestType type, String category, String assetType, String assetName, String model, Double cost, String justification, AssetRequest.Priority priority, AssetRequest.Status status, User approvedBy, String rejectionReason) {
        AssetRequest request = new AssetRequest();
        request.setRequestedBy(requester);
        request.setRequestType(type);
        request.setCategory(category);
        request.setAssetType(assetType);
        request.setAssetName(assetName);
        request.setPreferredModel(model);
        request.setEstimatedCost(cost);
        request.setBusinessJustification(justification);
        request.setPriority(priority);
        request.setStatus(status);
        request.setRequestedDate(LocalDateTime.now().minusDays((int)(Math.random() * 30) + 1));
        
        if (status == AssetRequest.Status.APPROVED && approvedBy != null) {
            request.setApprovedBy(approvedBy);
            request.setApprovedDate(LocalDateTime.now().minusDays((int)(Math.random() * 5) + 1));
        } else if (status == AssetRequest.Status.REJECTED && approvedBy != null) {
            request.setRejectedBy(approvedBy);
            request.setRejectedDate(LocalDateTime.now().minusDays((int)(Math.random() * 3) + 1));
            request.setRejectionReason(rejectionReason);
        }
        return request;
    }
    
    private AssetRequest createAssetRequestFulfilled(User requester, AssetRequest.RequestType type, String category, String assetType, String assetName, String model, Double cost, String justification, AssetRequest.Priority priority, AssetRequest.Status status, User approvedBy, User fulfilledBy, Asset allocatedAsset) {
        AssetRequest request = createAssetRequest(requester, type, category, assetType, assetName, model, cost, justification, priority, status, approvedBy);
        request.setFulfilledBy(fulfilledBy);
        request.setFulfilledDate(LocalDateTime.now().minusDays((int)(Math.random() * 2) + 1));
        request.setAllocatedAsset(allocatedAsset);
        request.setRemarks("Request fulfilled successfully");
        return request;
    }

    private Issue createIssue(Asset asset, User reportedBy, User assignedTo, String title, String description, Issue.IssueType type, Issue.Priority priority, Issue.Status status, LocalDateTime createdAt) {
        Issue issue = new Issue();
        issue.setAsset(asset);
        issue.setReportedBy(reportedBy);
        issue.setAssignedTo(assignedTo);
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setType(type);
        issue.setPriority(priority);
        issue.setStatus(status);
        issue.setCreatedAt(createdAt);
        return issue;
    }
    
    private Issue createResolvedIssue(Asset asset, User reportedBy, User assignedTo, String title, String description, Issue.IssueType type, Issue.Priority priority, Issue.Status status, LocalDateTime createdAt, LocalDateTime resolvedAt, String resolutionNotes, Double resolutionCost) {
        Issue issue = createIssue(asset, reportedBy, assignedTo, title, description, type, priority, status, createdAt);
        issue.setResolvedAt(resolvedAt);
        issue.setResolutionNotes(resolutionNotes);
        issue.setResolutionCost(resolutionCost);
        return issue;
    }
    
    private Issue createClosedIssue(Asset asset, User reportedBy, User assignedTo, String title, String description, Issue.IssueType type, Issue.Priority priority, Issue.Status status, LocalDateTime createdAt, LocalDateTime resolvedAt, String resolutionNotes, Double resolutionCost) {
        Issue issue = createResolvedIssue(asset, reportedBy, assignedTo, title, description, type, priority, status, createdAt, resolvedAt, resolutionNotes, resolutionCost);
        return issue;
    }

    private ServiceRecord createServiceRecord(Asset asset, LocalDate serviceDate, String description, BigDecimal cost, String serviceType, String performedBy, Vendor vendor, String status) {
        ServiceRecord record = new ServiceRecord();
        record.setAsset(asset);
        record.setServiceDate(serviceDate);
        record.setServiceDescription(description);
        record.setServiceCost(cost);
        record.setServiceType(serviceType);
        record.setPerformedBy(performedBy);
        record.setVendor(vendor);
        record.setStatus(status);
        if ("SCHEDULED".equals(status)) {
            record.setNextServiceDate(serviceDate.plusMonths(3));
            record.setNotes("Scheduled service - awaiting confirmation");
        } else if ("COMPLETED".equals(status)) {
            record.setNotes("Service completed successfully");
        }
        return record;
    }

    private CommonIssue createCommonIssue(String title, String description, String steps, String category) {
        CommonIssue issue = new CommonIssue();
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setSteps(steps);
        issue.setCategory(category);
        return issue;
    }

    private Notification createNotification(User user, String title, String message, Notification.Type type, Boolean isRead, LocalDateTime createdAt) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(isRead);
        notification.setCreatedAt(createdAt);
        return notification;
    }
}