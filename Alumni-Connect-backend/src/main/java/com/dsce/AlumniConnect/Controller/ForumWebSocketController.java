package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.WebSocketMessage;
import com.dsce.AlumniConnect.entity.DiscussionPost;
import com.dsce.AlumniConnect.entity.DiscussionTopic;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ForumWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Client subscribes to: /topic/forum/{groupId}
     * To receive real-time updates for all topics in a group
     */
    
    /**
     * Client subscribes to: /topic/topic/{topicId}
     * To receive real-time updates for a specific topic
     */

    /**
     * Broadcast a new post to all subscribers of the topic
     */
    public void broadcastNewPost(String topicId, String groupId, DiscussionPost post) {
        log.info("Broadcasting new post to topic: {}, group: {}", topicId, groupId);
        WebSocketMessage message = new WebSocketMessage(
            "NEW_POST", 
            topicId, 
            groupId, 
            post
        );
        message.setSenderId(post.getAuthorId());
        message.setSenderName(post.getAuthorName());
        
        // Send to topic-specific subscribers
        messagingTemplate.convertAndSend("/topic/topic/" + topicId, message);
        // Also send to group subscribers
        messagingTemplate.convertAndSend("/topic/forum/" + groupId, message);
    }

    /**
     * Broadcast a new topic to all subscribers of the group
     */
    public void broadcastNewTopic(String groupId, DiscussionTopic topic) {
        log.info("Broadcasting new topic to group: {}", groupId);
        WebSocketMessage message = new WebSocketMessage(
            "NEW_TOPIC", 
            topic.getId(), 
            groupId, 
            topic
        );
        message.setSenderId(topic.getAuthorId());
        message.setSenderName(topic.getAuthorName());
        
        messagingTemplate.convertAndSend("/topic/forum/" + groupId, message);
    }

    /**
     * Broadcast post like update
     */
    public void broadcastPostLike(String topicId, String groupId, String postId, int likeCount, String userId) {
        log.info("Broadcasting post like: postId={}, likes={}", postId, likeCount);
        WebSocketMessage message = new WebSocketMessage(
            "LIKE_POST", 
            topicId, 
            groupId, 
            new LikePayload(postId, likeCount, userId)
        );
        
        messagingTemplate.convertAndSend("/topic/topic/" + topicId, message);
    }

    /**
     * Broadcast topic like update
     */
    public void broadcastTopicLike(String topicId, String groupId, int likeCount, String userId) {
        log.info("Broadcasting topic like: topicId={}, likes={}", topicId, likeCount);
        WebSocketMessage message = new WebSocketMessage(
            "LIKE_TOPIC", 
            topicId, 
            groupId, 
            new LikePayload(topicId, likeCount, userId)
        );
        
        messagingTemplate.convertAndSend("/topic/topic/" + topicId, message);
        messagingTemplate.convertAndSend("/topic/forum/" + groupId, message);
    }

    /**
     * Broadcast post deletion
     */
    public void broadcastPostDelete(String topicId, String groupId, String postId) {
        log.info("Broadcasting post delete: postId={}", postId);
        WebSocketMessage message = new WebSocketMessage(
            "DELETE_POST", 
            topicId, 
            groupId, 
            new DeletePayload(postId)
        );
        
        messagingTemplate.convertAndSend("/topic/topic/" + topicId, message);
        messagingTemplate.convertAndSend("/topic/forum/" + groupId, message);
    }

    /**
     * Broadcast post edit
     */
    public void broadcastPostEdit(String topicId, String groupId, DiscussionPost post) {
        log.info("Broadcasting post edit: postId={}", post.getId());
        WebSocketMessage message = new WebSocketMessage(
            "EDIT_POST", 
            topicId, 
            groupId, 
            post
        );
        
        messagingTemplate.convertAndSend("/topic/topic/" + topicId, message);
    }

    /**
     * Handle client joining a topic (for tracking online users if needed)
     */
    @MessageMapping("/topic/{topicId}/join")
    @SendTo("/topic/topic/{topicId}")
    public WebSocketMessage handleJoinTopic(@DestinationVariable String topicId, 
                                            @Payload WebSocketMessage message) {
        log.info("User joined topic: {}", topicId);
        message.setType("USER_JOINED");
        return message;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LikePayload {
        private String id; // postId or topicId
        private int likeCount;
        private String userId;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DeletePayload {
        private String id;
    }
}
