package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.ConnectionRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConnectionRequestRepository extends MongoRepository<ConnectionRequest, String> {
    Optional<ConnectionRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);
    List<ConnectionRequest> findByReceiverIdAndStatus(String receiverId, ConnectionRequest.ConnectionStatus status);
    List<ConnectionRequest> findBySenderIdAndStatus(String senderId, ConnectionRequest.ConnectionStatus status);
    boolean existsBySenderIdAndReceiverId(String senderId, String receiverId);
}
