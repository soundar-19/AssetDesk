package com.assetdesk.config;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.User;
import com.assetdesk.domain.Vendor;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeUsers();
        initializeVendors();
        initializeAssets();
    }

    private void initializeUsers() {
        if (userRepository.count() == 0) {
            userRepository.save(createUser("SYSTEM", "System Administrator", "system@assetdesk.com", "system123", "+1-555-0100", User.Role.ADMIN, "Information Technology", "System Administrator", LocalDate.now()));
            userRepository.save(createUser("EMP001", "John Doe", "john.doe@assetdesk.com", "password123", "+1-555-0101", User.Role.EMPLOYEE, "Human Resources", "HR Specialist", LocalDate.now().minusMonths(6)));
            userRepository.save(createUser("IT001", "IT Support Team", "itsupport@assetdesk.com", "itsupport123", "+1-555-0102", User.Role.IT_SUPPORT, "Information Technology", "IT Support Specialist", LocalDate.now()));
            userRepository.save(createUser("EMP002", "Jane Smith", "jane.smith@assetdesk.com", "password123", "+1-555-0103", User.Role.EMPLOYEE, "Finance", "Financial Analyst", LocalDate.now().minusMonths(3)));
            userRepository.save(createUser("EMP003", "Mike Johnson", "mike.johnson@assetdesk.com", "password123", "+1-555-0104", User.Role.EMPLOYEE, "Marketing", "Marketing Manager", LocalDate.now().minusMonths(12)));
            userRepository.save(createUser("IT002", "Sarah Wilson", "sarah.wilson@assetdesk.com", "password123", "+1-555-0105", User.Role.IT_SUPPORT, "Information Technology", "Senior IT Specialist", LocalDate.now().minusMonths(8)));
            userRepository.save(createUser("ADM001", "Robert Brown", "robert.brown@assetdesk.com", "password123", "+1-555-0106", User.Role.ADMIN, "Administration", "Operations Manager", LocalDate.now().minusMonths(18)));
        }
    }

    private void initializeVendors() {
        if (vendorRepository.count() == 0) {
            vendorRepository.save(createVendor("Dell Technologies", "John Dell", "sales@dell.com", "+1-800-DELL-123", "One Dell Way, Round Rock, TX 78682"));
            vendorRepository.save(createVendor("HP Inc.", "Sarah HP", "enterprise@hp.com", "+1-800-HP-HELP", "1501 Page Mill Road, Palo Alto, CA 94304"));
            vendorRepository.save(createVendor("Lenovo Group", "Mike Lenovo", "business@lenovo.com", "+1-855-253-6686", "1009 Think Place, Morrisville, NC 27560"));
            vendorRepository.save(createVendor("Microsoft Corporation", "Bill Gates", "enterprise@microsoft.com", "+1-800-MICROSOFT", "One Microsoft Way, Redmond, WA 98052"));
            vendorRepository.save(createVendor("Apple Inc.", "Tim Cook", "business@apple.com", "+1-800-APL-CARE", "One Apple Park Way, Cupertino, CA 95014"));
            vendorRepository.save(createVendor("Canon Inc.", "Canon Support", "support@canon.com", "+1-800-CANON-US", "One Canon Park, Melville, NY 11747"));
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

            // Hardware Assets
            assetRepository.save(createAsset("LAP001", "Dell Latitude 7420", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "Latitude 7420", "DL7420001", LocalDate.now().minusMonths(6), LocalDate.now().plusYears(3), dell, new BigDecimal("1299.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("LAP002", "HP EliteBook 840", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "EliteBook 840", "HP840002", LocalDate.now().minusMonths(4), LocalDate.now().plusYears(3), hp, new BigDecimal("1199.99"), Asset.Status.ALLOCATED));
            assetRepository.save(createAsset("LAP003", "Lenovo ThinkPad X1", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "ThinkPad X1", "TP1003", LocalDate.now().minusMonths(8), LocalDate.now().plusYears(2), lenovo, new BigDecimal("1599.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("LAP004", "MacBook Pro 14", Asset.Category.HARDWARE, Asset.AssetType.LAPTOP, "MacBook Pro", "MBP14004", LocalDate.now().minusMonths(2), LocalDate.now().plusYears(3), apple, new BigDecimal("2399.99"), Asset.Status.ALLOCATED));
            
            assetRepository.save(createAsset("DSK001", "Dell OptiPlex 7090", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "OptiPlex 7090", "OP7090001", LocalDate.now().minusMonths(10), LocalDate.now().plusYears(3), dell, new BigDecimal("899.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("DSK002", "HP EliteDesk 800", Asset.Category.HARDWARE, Asset.AssetType.DESKTOP, "EliteDesk 800", "ED800002", LocalDate.now().minusMonths(7), LocalDate.now().plusYears(3), hp, new BigDecimal("799.99"), Asset.Status.ALLOCATED));
            
            assetRepository.save(createAsset("MON001", "Dell UltraSharp 27", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "UltraSharp U2722DE", "US27001", LocalDate.now().minusMonths(5), LocalDate.now().plusYears(3), dell, new BigDecimal("449.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("MON002", "HP E24 G5", Asset.Category.HARDWARE, Asset.AssetType.MONITOR, "E24 G5", "E24G5002", LocalDate.now().minusMonths(3), LocalDate.now().plusYears(3), hp, new BigDecimal("199.99"), Asset.Status.ALLOCATED));
            
            assetRepository.save(createAsset("PRT001", "Canon imageRUNNER", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "imageRUNNER ADVANCE", "IRA001", LocalDate.now().minusMonths(12), LocalDate.now().plusYears(2), canon, new BigDecimal("2999.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("PRT002", "HP LaserJet Pro", Asset.Category.HARDWARE, Asset.AssetType.PRINTER, "LaserJet Pro M404n", "LJP404002", LocalDate.now().minusMonths(9), LocalDate.now().plusYears(2), hp, new BigDecimal("199.99"), Asset.Status.MAINTENANCE));
            
            // Software Assets
            assetRepository.save(createAsset("SW001", "Microsoft Office 365", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Office 365 Business", "O365001", LocalDate.now().minusMonths(1), LocalDate.now().plusYears(1), microsoft, new BigDecimal("149.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("SW002", "Windows 11 Pro", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Windows 11 Professional", "W11PRO002", LocalDate.now().minusMonths(6), null, microsoft, new BigDecimal("199.99"), Asset.Status.ALLOCATED));
            assetRepository.save(createAsset("SW003", "Adobe Creative Suite", Asset.Category.SOFTWARE, Asset.AssetType.LICENSE, "Creative Cloud", "ACS003", LocalDate.now().minusMonths(3), LocalDate.now().plusYears(1), microsoft, new BigDecimal("599.99"), Asset.Status.AVAILABLE));
            
            // Accessories
            assetRepository.save(createAsset("ACC001", "Logitech MX Master 3", Asset.Category.ACCESSORIES, Asset.AssetType.MOUSE, "MX Master 3", "MXM3001", LocalDate.now().minusMonths(2), LocalDate.now().plusYears(2), null, new BigDecimal("99.99"), Asset.Status.AVAILABLE));
            assetRepository.save(createAsset("ACC002", "Dell Wireless Keyboard", Asset.Category.ACCESSORIES, Asset.AssetType.KEYBOARD, "KB216", "KB216002", LocalDate.now().minusMonths(4), LocalDate.now().plusYears(3), dell, new BigDecimal("29.99"), Asset.Status.ALLOCATED));
            assetRepository.save(createAsset("ACC003", "USB-C to HDMI Cable", Asset.Category.ACCESSORIES, Asset.AssetType.CABLE, "USB-C HDMI", "USBCHDMI003", LocalDate.now().minusMonths(1), null, null, new BigDecimal("19.99"), Asset.Status.AVAILABLE));
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

    private Asset createAsset(String assetTag, String name, Asset.Category category, Asset.AssetType type, String model, String serialNumber, LocalDate purchaseDate, LocalDate warrantyExpiryDate, Vendor vendor, BigDecimal cost, Asset.Status status) {
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
        return asset;
    }
}