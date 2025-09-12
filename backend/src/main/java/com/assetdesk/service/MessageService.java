package com.assetdesk.service;

import com.assetdesk.dto.message.MessageRequestDTO;
import com.assetdesk.dto.message.MessageResponseDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageService {
    
    MessageResponseDTO sendMessage(MessageRequestDTO messageRequestDTO, Long senderId);
    MessageResponseDTO sendSystemMessage(Long issueId, String messageText);
    MessageResponseDTO sendIssueMessage(Long issueId, String message, Long senderId, org.springframework.web.multipart.MultipartFile image);
    Page<MessageResponseDTO> getAllMessages(Pageable pageable);
    MessageResponseDTO getMessageById(Long id);
    List<MessageResponseDTO> getMessagesByIssue(Long issueId);
    List<MessageResponseDTO> getMessagesBySender(Long senderId);
    Page<MessageResponseDTO> getReceivedMessages(Long userId, Pageable pageable);
    Page<MessageResponseDTO> getSentMessages(Long userId, Pageable pageable);
    Page<MessageResponseDTO> getUnreadMessages(Long userId, Pageable pageable);
    Long getUnreadMessageCount(Long userId);
    void markAsRead(Long id);
    void deleteMessage(Long id);
}