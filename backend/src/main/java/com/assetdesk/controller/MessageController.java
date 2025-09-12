package com.assetdesk.controller;

import com.assetdesk.dto.message.MessageRequestDTO;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.assetdesk.dto.message.MessageResponseDTO;
import com.assetdesk.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {
    
    private final MessageService messageService;
    
    @PostMapping
    public ResponseEntity<MessageResponseDTO> sendMessage(@Valid @RequestBody MessageRequestDTO messageRequestDTO, @RequestParam Long senderId) {
        MessageResponseDTO sentMessage = messageService.sendMessage(messageRequestDTO, senderId);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }
    
    @PostMapping("/system")
    public ResponseEntity<MessageResponseDTO> sendSystemMessage(@RequestParam Long issueId, @RequestParam String messageText) {
        MessageResponseDTO systemMessage = messageService.sendSystemMessage(issueId, messageText);
        return new ResponseEntity<>(systemMessage, HttpStatus.CREATED);
    }
    
    @PostMapping("/issue-messages")
    public ResponseEntity<MessageResponseDTO> sendIssueMessage(
            @RequestParam Long issueId,
            @RequestParam(required = false) String message,
            @RequestParam Long senderId,
            @RequestParam(required = false) MultipartFile image) {
        System.out.println("Received message request - IssueId: " + issueId + ", SenderId: " + senderId + ", Message: " + message);
        if (image != null) {
            System.out.println("Image received: " + image.getOriginalFilename() + ", Size: " + image.getSize());
        } else {
            System.out.println("No image received");
        }
        MessageResponseDTO sentMessage = messageService.sendIssueMessage(issueId, message, senderId, image);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }
    
    @GetMapping
    public ResponseEntity<Page<MessageResponseDTO>> getAllMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponseDTO> messages = messageService.getAllMessages(pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/issue/{issueId}")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesByIssue(@PathVariable Long issueId) {
        List<MessageResponseDTO> messages = messageService.getMessagesByIssue(issueId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/sender/{senderId}")
    public ResponseEntity<List<MessageResponseDTO>> getMessagesBySender(@PathVariable Long senderId) {
        List<MessageResponseDTO> messages = messageService.getMessagesBySender(senderId);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/received")
    public ResponseEntity<Page<MessageResponseDTO>> getReceivedMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponseDTO> messages = messageService.getReceivedMessages(userId, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/sent")
    public ResponseEntity<Page<MessageResponseDTO>> getSentMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponseDTO> messages = messageService.getSentMessages(userId, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread")
    public ResponseEntity<Page<MessageResponseDTO>> getUnreadMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Long userId) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MessageResponseDTO> messages = messageService.getUnreadMessages(userId, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Long> getUnreadMessageCount(@RequestParam Long userId) {
        Long count = messageService.getUnreadMessageCount(userId);
        return ResponseEntity.ok(count);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        messageService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/image/{messageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long messageId) {
        try {
            System.out.println("Serving image for message ID: " + messageId);
            MessageResponseDTO message = messageService.getMessageById(messageId);
            if (message.getImageData() != null && message.getImageData().length > 0) {
                String contentType = message.getImageType() != null ? message.getImageType() : "image/jpeg";
                System.out.println("Image found - Size: " + message.getImageData().length + ", Type: " + contentType);
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(message.getImageData());
            } else {
                System.out.println("No image data found for message " + messageId);
            }
        } catch (Exception e) {
            System.out.println("Error serving image: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/file/{messageId}")
    public ResponseEntity<byte[]> getFile(@PathVariable Long messageId) {
        try {
            System.out.println("Serving file for message ID: " + messageId);
            MessageResponseDTO message = messageService.getMessageById(messageId);
            if (message.getImageData() != null && message.getImageData().length > 0) {
                String contentType = message.getImageType() != null ? message.getImageType() : "application/octet-stream";
                String fileName = message.getFileName() != null ? message.getFileName() : "file";
                System.out.println("File found - Size: " + message.getImageData().length + ", Type: " + contentType + ", Name: " + fileName);
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .body(message.getImageData());
            } else {
                System.out.println("No file data found for message " + messageId);
            }
        } catch (Exception e) {
            System.out.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/test-image/{messageId}")
    public ResponseEntity<String> testImage(@PathVariable Long messageId) {
        try {
            MessageResponseDTO message = messageService.getMessageById(messageId);
            boolean hasImage = message.getImageData() != null && message.getImageData().length > 0;
            return ResponseEntity.ok("Message " + messageId + " has image: " + hasImage + ", Size: " + (hasImage ? message.getImageData().length : 0));
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }
}