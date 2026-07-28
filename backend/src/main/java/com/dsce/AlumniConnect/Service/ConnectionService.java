package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.Repository.ConnectionRequestRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.ConnectionRequest;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionService {

    private final ConnectionRequestRepository connectionRequestRepository;
    private final UserRepository userRepository;

    public ConnectionRequest sendConnectionRequest(String senderId, String receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("Cannot send connection request to yourself");
        }

        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        // Check if request already exists (either direction)
        boolean exists = connectionRequestRepository.existsBySenderIdAndReceiverId(senderId, receiverId) ||
                         connectionRequestRepository.existsBySenderIdAndReceiverId(receiverId, senderId);
        
        if (exists) {
            throw new IllegalStateException("Connection request already exists");
        }

        ConnectionRequest request = new ConnectionRequest();
        request.setSenderId(senderId);
        request.setReceiverId(receiverId);
        request.setStatus(ConnectionRequest.ConnectionStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        return connectionRequestRepository.save(request);
    }
}
