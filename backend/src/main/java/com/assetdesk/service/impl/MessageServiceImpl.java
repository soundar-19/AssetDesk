package com.assetdesk.service.impl;

import com.assetdesk.dto.message.MessageRequestDTO;
import com.assetdesk.dto.message.MessageResponseDTO;
import com.assetdesk.domain.Message;
import com.assetdesk.repository.MessageRepository;
import com.assetdesk.repository.IssueRepository;
import com.assetdesk.repository.UserRepository;
import com.assetdesk.service.MessageService;
import com.assetdesk.config.AppConfig;
import com.assetdesk.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {
    
    private final MessageRepository messageRepository;
    private final IssueRepository issueRepository;
    private final UserRepository userRepository;
    private final AppConfig appConfig;
    
    @Override
    public MessageResponseDTO sendMessage(MessageRequestDTO messageRequestDTO, Long senderId) {
        var issue = issueRepository.findById(messageRequestDTO.getIssueId())
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", messageRequestDTO.getIssueId()));
        
        if (issue.getStatus() == com.assetdesk.domain.Issue.Status.RESOLVED || 
            issue.getStatus() == com.assetdesk.domain.Issue.Status.CLOSED) {
            throw new IllegalStateException("Cannot send messages on resolved or closed issues");
        }
        
        Message message = messageRequestDTO.toEntity();
        message.setIssue(issue);
        message.setSender(userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId)));
        
        Message savedMessage = messageRepository.save(message);
        return MessageResponseDTO.fromEntity(savedMessage);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponseDTO> getAllMessages(Pageable pageable) {
        return messageRepository.findAll(pageable)
            .map(MessageResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public MessageResponseDTO getMessageById(Long id) {
        Message message = messageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        return MessageResponseDTO.fromEntity(message);
    }
    
    @Override
    public MessageResponseDTO sendSystemMessage(Long issueId, String messageText) {
        Message message = new Message();
        message.setIssue(issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId)));
        message.setSender(userRepository.findById(appConfig.getSystemUserId())
            .orElseThrow(() -> new ResourceNotFoundException("System User", "id", appConfig.getSystemUserId())));
        message.setMessageText(messageText);
        message.setIsSystemMessage(true);
        
        Message savedMessage = messageRepository.save(message);
        return MessageResponseDTO.fromEntity(savedMessage);
    }
    
    @Override
    public MessageResponseDTO sendIssueMessage(Long issueId, String messageText, Long senderId, org.springframework.web.multipart.MultipartFile image) {
        var issue = issueRepository.findById(issueId)
            .orElseThrow(() -> new ResourceNotFoundException("Issue", "id", issueId));
        
        if (issue.getStatus() == com.assetdesk.domain.Issue.Status.RESOLVED || 
            issue.getStatus() == com.assetdesk.domain.Issue.Status.CLOSED) {
            throw new IllegalStateException("Cannot send messages on resolved or closed issues");
        }
        
        Message message = new Message();
        message.setIssue(issue);
        message.setSender(userRepository.findById(senderId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", senderId)));
        message.setMessageText(messageText != null ? messageText : "");
        message.setIsSystemMessage(false);
        
        // Handle file upload
        if (image != null && !image.isEmpty()) {
            try {
                byte[] fileBytes = image.getBytes();
                System.out.println("File uploaded: " + image.getOriginalFilename() + ", Size: " + fileBytes.length + ", Type: " + image.getContentType());
                message.setImageData(fileBytes);
                message.setImageType(image.getContentType());
                message.setFileName(image.getOriginalFilename());
            } catch (Exception e) {
                System.out.println("Failed to process file: " + e.getMessage());
                throw new RuntimeException("Failed to process file", e);
            }
        }
        
        Message savedMessage = messageRepository.save(message);
        return MessageResponseDTO.fromEntity(savedMessage);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getMessagesByIssue(Long issueId) {
        return messageRepository.findByIssueIdOrderByTimestampAsc(issueId).stream()
            .map(MessageResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<MessageResponseDTO> getMessagesBySender(Long senderId) {
        return messageRepository.findBySenderIdOrderByTimestampDesc(senderId).stream()
            .map(MessageResponseDTO::fromEntity)
            .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponseDTO> getReceivedMessages(Long userId, Pageable pageable) {
        return messageRepository.findReceivedMessages(userId, pageable)
            .map(MessageResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponseDTO> getSentMessages(Long userId, Pageable pageable) {
        return messageRepository.findBySenderIdOrderByTimestampDesc(userId, pageable)
            .map(MessageResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponseDTO> getUnreadMessages(Long userId, Pageable pageable) {
        return messageRepository.findUnreadMessages(userId, pageable)
            .map(MessageResponseDTO::fromEntity);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessages(userId);
    }
    
    @Override
    public void markAsRead(Long id) {
        Message message = messageRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Message", "id", id));
        message.setIsRead(true);
        messageRepository.save(message);
    }
    
    @Override
    public void deleteMessage(Long id) {
        messageRepository.deleteById(id);
    }
}