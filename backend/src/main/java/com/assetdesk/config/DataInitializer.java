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
            userRepository.save(createUser("SYSTEM", "System Administrator", "system@assetdesk.com", "system123", "+91-98765-43210", User.Role.ADMIN, "Information Technology", "System Administrator", LocalDate.now()));
            userRepository.save(createUser("EMP001", "SR", "sr@assetdesk.com", "password123", "+91-98765-43211", User.Role.ADMIN, "Information Technology", "Software Engineer", LocalDate.now().minusMonths(6)));
            userRepository.save(createUser("EMP002", "LocaseWaran", "lokeshwaran@assetdesk.com", "password123", "+91-98765-43212", User.Role.EMPLOYEE, "Information Technology", "Developer", LocalDate.now().minusMonths(4)));
            userRepository.save(createUser("EMP003", "Dimple Kumar", "dimple.kumar@assetdesk.com", "password123", "+91-98765-43213", User.Role.EMPLOYEE, "Human Resources", "HR Specialist", LocalDate.now().minusMonths(3)));
            userRepository.save(createUser("EMP004", "Rin", "Rin@assetdesk.com", "password123", "+91-98765-43214", User.Role.EMPLOYEE, "Finance", "Financial Analyst", LocalDate.now().minusMonths(5)));
            userRepository.save(createUser("EMP006", "geff", "geff@assetdesk.com", "password123", "+91-98765-43216", User.Role.EMPLOYEE, "Marketing", "Marketing Manager", LocalDate.now().minusMonths(12)));
            userRepository.save(createUser("EMP007", "Radeep", "Radeep@assetdesk.com", "password123", "+91-98765-43217", User.Role.EMPLOYEE, "Operations", "Operations Specialist", LocalDate.now().minusMonths(7)));
            userRepository.save(createUser("EMP008", "Swaytha", "swaytha@assetdesk.com", "password123", "+91-98765-43218", User.Role.EMPLOYEE, "Quality Assurance", "QA Engineer", LocalDate.now().minusMonths(9)));
            userRepository.save(createUser("EMP009", "SriGayatree", "srigayatree@assetdesk.com", "password123", "+91-98765-43219", User.Role.EMPLOYEE, "Design", "UI/UX Designer", LocalDate.now().minusMonths(2)));
            userRepository.save(createUser("EMP010", "AAcash", "AAcash@assetdesk.com", "password123", "+91-98765-43220", User.Role.IT_SUPPORT, "Information Technology", "Senior IT Specialist", LocalDate.now().minusMonths(10)));
            userRepository.save(createUser("EMP011", "auditYa", "auditYa@assetdesk.com", "password123", "+91-98765-43221", User.Role.EMPLOYEE, "Research", "Research Analyst", LocalDate.now().minusMonths(1)));
        }
    }

    private void initializeVendors() {
        if (vendorRepository.count() == 0) {
            vendorRepository.save(createVendor("Dell Technologies", "John Dell", "sales@dell.com", "+91-80-4040-7000", "One Dell Way, Round Rock, TX 78682"));
            vendorRepository.save(createVendor("HP Inc.", "Sarah HP", "enterprise@hp.com", "+91-80-2552-4000", "1501 Page Mill Road, Palo Alto, CA 94304"));
            vendorRepository.save(createVendor("Lenovo Group", "Mike Lenovo", "business@lenovo.com", "+91-124-462-8000", "1009 Think Place, Morrisville, NC 27560"));
            vendorRepository.save(createVendor("Microsoft Corporation", "Bill Gates", "enterprise@microsoft.com", "+91-80-4040-4000", "One Microsoft Way, Redmond, WA 98052"));
            vendorRepository.save(createVendor("Apple Inc.", "Tim Cook", "business@apple.com", "+91-80-4040-3000", "One Apple Park Way, Cupertino, CA 95014"));
            vendorRepository.save(createVendor("Canon Inc.", "Canon Support", "support@canon.com", "+91-124-462-9000", "One Canon Park, Melville, NY 11747"));
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

            // Laptops - 15 units
            for (int i = 1; i <= 15; i++) {
                Asset.Status status = i <= 8 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                if (i <= 5) {
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "Dell Latitude 7420", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "Latitude 7420", "DL7420" + String.format("%03d", i), LocalDate.now().minusMonths(6), LocalDate.now().plusYears(3), dell, new BigDecimal("1299.99"), status, false, null, null));
                } else if (i <= 10) {
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "HP EliteBook 840", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "EliteBook 840", "HP840" + String.format("%03d", i), LocalDate.now().minusMonths(4), LocalDate.now().plusYears(3), hp, new BigDecimal("1199.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("LAP%03d", i), "Lenovo ThinkPad X1", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "ThinkPad X1", "TP1" + String.format("%03d", i), LocalDate.now().minusMonths(8), LocalDate.now().plusYears(2), lenovo, new BigDecimal("1599.99"), status, false, null, null));
                }
            }

            // Desktops - 12 units
            for (int i = 1; i <= 12; i++) {
                Asset.Status status = i <= 6 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                if (i <= 6) {
                    assetRepository.save(createAsset(String.format("DSK%03d", i), "Dell OptiPlex 7090", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "OptiPlex 7090", "OP7090" + String.format("%03d", i), LocalDate.now().minusMonths(10), LocalDate.now().plusYears(3), dell, new BigDecimal("899.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("DSK%03d", i), "HP EliteDesk 800", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "EliteDesk 800", "ED800" + String.format("%03d", i), LocalDate.now().minusMonths(7), LocalDate.now().plusYears(3), hp, new BigDecimal("799.99"), status, false, null, null));
                }
            }

            // Monitors - 20 units
            for (int i = 1; i <= 20; i++) {
                Asset.Status status = i <= 12 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                if (i <= 10) {
                    assetRepository.save(createAsset(String.format("MON%03d", i), "Dell UltraSharp 27", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "UltraSharp U2722DE", "US27" + String.format("%03d", i), LocalDate.now().minusMonths(5), LocalDate.now().plusYears(3), dell, new BigDecimal("449.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("MON%03d", i), "HP E24 G5", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "E24 G5", "E24G5" + String.format("%03d", i), LocalDate.now().minusMonths(3), LocalDate.now().plusYears(3), hp, new BigDecimal("199.99"), status, false, null, null));
                }
            }

            // Printers - 8 units
            for (int i = 1; i <= 8; i++) {
                Asset.Status status = i <= 5 ? Asset.Status.AVAILABLE : (i == 6 ? Asset.Status.MAINTENANCE : Asset.Status.ALLOCATED);
                if (i <= 4) {
                    assetRepository.save(createAsset(String.format("PRT%03d", i), "Canon imageRUNNER", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "imageRUNNER ADVANCE", "IRA" + String.format("%03d", i), LocalDate.now().minusMonths(12), LocalDate.now().plusYears(2), canon, new BigDecimal("2999.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("PRT%03d", i), "HP LaserJet Pro", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "LaserJet Pro M404n", "LJP404" + String.format("%03d", i), LocalDate.now().minusMonths(9), LocalDate.now().plusYears(2), hp, new BigDecimal("199.99"), status, false, null, null));
                }
            }

            // Software Licenses - 25 units
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

            // Accessories - 30 units
            for (int i = 1; i <= 30; i++) {
                Asset.Status status = i <= 18 ? Asset.Status.ALLOCATED : Asset.Status.AVAILABLE;
                if (i <= 10) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Logitech MX Master 3", Asset.Category.ACCESSORIES, Asset.AssetType.MOUSE, "MX Master 3", "MXM3" + String.format("%03d", i), LocalDate.now().minusMonths(2), LocalDate.now().plusYears(2), null, new BigDecimal("99.99"), status, false, null, null));
                } else if (i <= 20) {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "Dell Wireless Keyboard", Asset.Category.ACCESSORIES, Asset.AssetType.KEYBOARD, "KB216", "KB216" + String.format("%03d", i), LocalDate.now().minusMonths(4), LocalDate.now().plusYears(3), dell, new BigDecimal("29.99"), status, false, null, null));
                } else {
                    assetRepository.save(createAsset(String.format("ACC%03d", i), "USB-C to HDMI Cable", Asset.Category.ACCESSORIES, Asset.AssetType.CABLE, "USB-C HDMI", "USBCHDMI" + String.format("%03d", i), LocalDate.now().minusMonths(1), null, null, new BigDecimal("19.99"), status, false, null, null));
                }
            }
        }
    }

    private User createUser(String employeeId, String name, String email, String password, String phoneNumber, User.Role role, String department, String designation, LocalDate dateJoined) {
        User user = new User();
        user.setEmployeeId(employeeId);
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setDepartment(department);
        user.setDesignation(designation);
        user.setStatus(User.Status.ACTIVE);
        user.setDateJoined(dateJoined);
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
            // Get all users for allocation
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
            
            // Allocate laptops (8 allocated)
            for (int i = 1; i <= 8; i++) {
                Asset laptop = assetRepository.findByAssetTag(String.format("LAP%03d", i)).orElse(null);
                if (laptop != null && i <= users.length) {
                    assetAllocationRepository.save(createAllocation(laptop, users[i-1], LocalDate.now().minusMonths(i), "Work laptop allocation"));
                }
            }
            
            // Allocate desktops (6 allocated)
            for (int i = 1; i <= 6; i++) {
                Asset desktop = assetRepository.findByAssetTag(String.format("DSK%03d", i)).orElse(null);
                if (desktop != null && i <= users.length) {
                    assetAllocationRepository.save(createAllocation(desktop, users[i-1], LocalDate.now().minusMonths(i), "Workstation allocation"));
                }
            }
            
            // Allocate monitors (12 allocated)
            for (int i = 1; i <= 12; i++) {
                Asset monitor = assetRepository.findByAssetTag(String.format("MON%03d", i)).orElse(null);
                if (monitor != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(monitor, user, LocalDate.now().minusWeeks(i), "Monitor allocation"));
                }
            }
            
            // Allocate software licenses (15 allocated)
            for (int i = 1; i <= 15; i++) {
                Asset software = assetRepository.findByAssetTag(String.format("SW%03d", i)).orElse(null);
                if (software != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(software, user, LocalDate.now().minusWeeks(i), "Software license allocation"));
                }
            }
            
            // Allocate accessories (18 allocated)
            for (int i = 1; i <= 18; i++) {
                Asset accessory = assetRepository.findByAssetTag(String.format("ACC%03d", i)).orElse(null);
                if (accessory != null) {
                    User user = users[i % users.length];
                    assetAllocationRepository.save(createAllocation(accessory, user, LocalDate.now().minusWeeks(i), "Accessory allocation"));
                }
            }
        }
    }

    private void initializeAssetRequests() {
        if (assetRequestRepository.count() == 0) {
            User pradeep = userRepository.findByEmployeeId("EMP007").orElse(null);
            User swetha = userRepository.findByEmployeeId("EMP008").orElse(null);
            User admin = userRepository.findByEmployeeId("EMP001").orElse(null);
            
            assetRequestRepository.save(createAssetRequest(pradeep, AssetRequest.RequestType.NEW_ASSET, "HARDWARE", "LAPTOP", "Development Laptop", "ThinkPad X1", 1500.0, "Need for software development work", AssetRequest.Priority.HIGH, AssetRequest.Status.APPROVED, admin));
            assetRequestRepository.save(createAssetRequest(swetha, AssetRequest.RequestType.ADDITIONAL, "HARDWARE", "MONITOR", "External Monitor", "Dell 24 inch", 300.0, "Testing multiple screen setups", AssetRequest.Priority.MEDIUM, AssetRequest.Status.PENDING, null));
        }
    }

    private void initializeIssues() {
        if (issueRepository.count() == 0) {
            User soundar = userRepository.findByEmployeeId("EMP001").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            User itSupport = userRepository.findByEmployeeId("EMP010").orElse(null);
            
            Asset laptop1 = assetRepository.findByAssetTag("LAP002").orElse(null);
            Asset printer = assetRepository.findByAssetTag("PRT002").orElse(null);
            
            issueRepository.save(createIssue(laptop1, soundar, itSupport, "Laptop overheating", "Laptop gets very hot during intensive tasks", Issue.IssueType.HARDWARE_MALFUNCTION, Issue.Priority.HIGH, Issue.Status.IN_PROGRESS));
            issueRepository.save(createIssue(printer, lokesh, itSupport, "Printer not responding", "Printer shows offline status", Issue.IssueType.CONNECTIVITY_ISSUE, Issue.Priority.MEDIUM, Issue.Status.OPEN));
        }
    }

    private void initializeServiceRecords() {
        if (serviceRecordRepository.count() == 0) {
            Asset laptop = assetRepository.findByAssetTag("LAP001").orElse(null);
            Asset printer = assetRepository.findByAssetTag("PRT001").orElse(null);
            Vendor dell = vendorRepository.findByName("Dell Technologies").orElse(null);
            Vendor canon = vendorRepository.findByName("Canon Inc.").orElse(null);
            
            serviceRecordRepository.save(createServiceRecord(laptop, LocalDate.now().minusMonths(1), "RAM upgrade and cleaning", new BigDecimal("150.00"), "Hardware Upgrade", "Dell Technician", dell));
            serviceRecordRepository.save(createServiceRecord(printer, LocalDate.now().minusWeeks(2), "Routine maintenance and toner replacement", new BigDecimal("75.00"), "Preventive Maintenance", "Canon Service", canon));
        }
    }

    private void initializeCommonIssues() {
        if (commonIssueRepository.count() == 0) {
            commonIssueRepository.save(createCommonIssue("Laptop won't start", "Laptop does not power on when pressing power button", "1. Check power cable connection\n2. Try different power outlet\n3. Remove battery and try with AC power only\n4. Contact IT support if issue persists", "Laptop"));
            commonIssueRepository.save(createCommonIssue("Slow internet connection", "Internet browsing and downloads are very slow", "1. Restart your router/modem\n2. Check for background downloads\n3. Run speed test\n4. Contact IT support for network issues", "Network"));
            commonIssueRepository.save(createCommonIssue("Printer paper jam", "Paper is stuck in the printer", "1. Turn off printer\n2. Open all access panels\n3. Gently remove jammed paper\n4. Close panels and restart printer", "Printer"));
        }
    }

    private void initializeNotifications() {
        if (notificationRepository.count() == 0) {
            User soundar = userRepository.findByEmployeeId("EMP001").orElse(null);
            User lokesh = userRepository.findByEmployeeId("EMP002").orElse(null);
            
            notificationRepository.save(createNotification(soundar, "Asset Allocated", "Laptop LAP002 has been allocated to you", Notification.Type.ASSET_ALLOCATED));
            notificationRepository.save(createNotification(lokesh, "Issue Assigned", "Issue #1 has been assigned to you for resolution", Notification.Type.ISSUE_ASSIGNED));
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
        if (approvedBy != null) {
            request.setApprovedBy(approvedBy);
            request.setApprovedDate(LocalDateTime.now().minusDays(1));
        }
        return request;
    }

    private Issue createIssue(Asset asset, User reportedBy, User assignedTo, String title, String description, Issue.IssueType type, Issue.Priority priority, Issue.Status status) {
        Issue issue = new Issue();
        issue.setAsset(asset);
        issue.setReportedBy(reportedBy);
        issue.setAssignedTo(assignedTo);
        issue.setTitle(title);
        issue.setDescription(description);
        issue.setType(type);
        issue.setPriority(priority);
        issue.setStatus(status);
        issue.setCreatedAt(LocalDateTime.now().minusDays(2));
        return issue;
    }

    private ServiceRecord createServiceRecord(Asset asset, LocalDate serviceDate, String description, BigDecimal cost, String serviceType, String performedBy, Vendor vendor) {
        ServiceRecord record = new ServiceRecord();
        record.setAsset(asset);
        record.setServiceDate(serviceDate);
        record.setServiceDescription(description);
        record.setServiceCost(cost);
        record.setServiceType(serviceType);
        record.setPerformedBy(performedBy);
        record.setVendor(vendor);
        record.setStatus("COMPLETED");
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

    private Notification createNotification(User user, String title, String message, Notification.Type type) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now().minusHours(2));
        return notification;
    }
}