package com.dsce.AlumniConnect.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "connection_requests")
public class ConnectionRequest {
    @Id
    private String id;
    
    private String senderId;
    private String receiverId;
    
    private ConnectionStatus status = ConnectionStatus.PENDING;
    
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ConnectionStatus {
        PENDING,
        ACCEPTED,
        REJECTED
    }
}
