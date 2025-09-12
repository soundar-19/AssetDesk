package com.assetdesk.dto.message;

import com.assetdesk.domain.Message;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageResponseDTO {
    
    private Long id;
    private Long issueId;
    private Long senderId;
    private String senderName;
    private String messageText;
    private LocalDateTime timestamp;
    private Boolean isSystemMessage;
    private byte[] imageData;
    private String imageType;
    private String fileName;
    private Boolean hasImage;
    
    public static MessageResponseDTO fromEntity(Message message) {
        MessageResponseDTO dto = new MessageResponseDTO();
        dto.setId(message.getId());
        dto.setIssueId(message.getIssue().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderName(message.getSender().getName());
        dto.setMessageText(message.getMessageText());
        dto.setTimestamp(message.getTimestamp());
        dto.setIsSystemMessage(message.getIsSystemMessage());
        dto.setImageData(message.getImageData());
        dto.setImageType(message.getImageType());
        dto.setFileName(message.getFileName());
        dto.setHasImage(message.getImageData() != null && message.getImageData().length > 0);
        return dto;
    }
}