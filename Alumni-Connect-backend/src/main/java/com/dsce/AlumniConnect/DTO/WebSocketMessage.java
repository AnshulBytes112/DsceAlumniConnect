package com.dsce.AlumniConnect.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    
    private String type; // "NEW_POST", "NEW_TOPIC", "LIKE", "DELETE", "EDIT"
    private String topicId;
    private String groupId;
    private Object payload;
    private String senderId;
    private String senderName;
    private LocalDateTime timestamp;
    
    public WebSocketMessage(String type, String topicId, String groupId, Object payload) {
        this.type = type;
        this.topicId = topicId;
        this.groupId = groupId;
        this.payload = payload;
        this.timestamp = LocalDateTime.now();
    }
}
