package com.assetdesk.dto.message;

import com.assetdesk.domain.Message;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MessageRequestDTO {
    
    @NotNull(message = "Issue ID is required")
    private Long issueId;
    
    @NotBlank(message = "Message text is required")
    @Size(min = 1, max = 1000, message = "Message must be between 1 and 1000 characters")
    private String messageText;
    
    private Boolean isSystemMessage = false;
    
    public Message toEntity() {
        Message message = new Message();
        message.setMessageText(this.messageText);
        message.setIsSystemMessage(this.isSystemMessage);
        return message;
    }
}