package com.assetdesk.service.impl;

import com.assetdesk.domain.Asset;
import com.assetdesk.domain.Notification;
import com.assetdesk.domain.User;
import com.assetdesk.repository.AssetRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WarrantyExpiryNotificationJob {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Runs daily at 08:00 server time
    @Scheduled(cron = "0 0 8 * * *")
    public void notifyWarrantyExpiring() {
        int days = 30;
        var start = java.time.LocalDate.now();
        var end = start.plusDays(days);
        var expiringList = assetRepository.findByWarrantyExpiryDateBetween(start, end, PageRequest.of(0, 500));
        if (expiringList.hasContent()) {
            List<User> admins = userRepository.findByRole(User.Role.ADMIN);
            List<User> itSupport = userRepository.findByRole(User.Role.IT_SUPPORT);
            for (Asset a : expiringList.getContent()) {
                String title = "Warranty expiring soon";
                String message = String.format("Asset %s (%s) warranty expires on %s", a.getName(), a.getAssetTag(), a.getWarrantyExpiryDate());
                for (User u : admins) {
                    notificationService.createNotification(u.getId(), title, message, Notification.Type.WARRANTY_EXPIRING, null, a.getId());
                }
                for (User u : itSupport) {
                    notificationService.createNotification(u.getId(), title, message, Notification.Type.WARRANTY_EXPIRING, null, a.getId());
                }
            }
        }
    }
}


