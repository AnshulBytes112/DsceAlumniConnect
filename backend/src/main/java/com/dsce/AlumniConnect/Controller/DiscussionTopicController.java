package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.DiscussionGroupRepository;
import com.dsce.AlumniConnect.Repository.DiscussionTopicRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.DiscussionGroup;
import com.dsce.AlumniConnect.entity.DiscussionTopic;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@RestController
@RequestMapping({ "/api/discussions/topics", "/discussions/topics" })
@RequiredArgsConstructor
public class DiscussionTopicController {

    private final DiscussionTopicRepository topicRepository;
    private final DiscussionGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ForumWebSocketController webSocketController;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getTopicsByGroup(
            @PathVariable String groupId,
            @RequestParam(required = false, defaultValue = "activity") String sortBy) {
        
        log.info("Fetching topics for group: {}, sorted by: {}", groupId, sortBy);
        
        Optional<DiscussionGroup> group = groupRepository.findById(groupId);
        if (group.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        List<DiscussionTopic> topics;
        if ("newest".equals(sortBy)) {
            topics = topicRepository.findByGroupIdAndIsDeletedFalseOrderByCreatedAtDesc(groupId);
        } else {
            // Default: sort by pinned first, then last activity
            topics = topicRepository.findByGroupIdAndIsDeletedFalseOrderByIsPinnedDescLastReplyAtDesc(groupId);
        }
        
        return ResponseEntity.ok(topics);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTopicById(@PathVariable String id) {
        log.info("Fetching topic: {}", id);
        
        Optional<DiscussionTopic> topic = topicRepository.findById(id);
        if (topic.isEmpty() || topic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        // Increment view count
        DiscussionTopic t = topic.get();
        t.setViewCount(t.getViewCount() + 1);
        topicRepository.save(t);
        
        return ResponseEntity.ok(t);
    }

    @PostMapping
    public ResponseEntity<?> createTopic(
            @RequestBody DiscussionTopic topic,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Creating new topic in group: {}", topic.getGroupId());
        
        Optional<DiscussionGroup> group = groupRepository.findById(topic.getGroupId());
        if (group.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        DiscussionGroup g = group.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if private group and user is member
        if (g.getIsPrivate() && !g.getMembers().contains(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You must be a member of this private group to create topics"));
        }
        
        topic.setGroupName(g.getName());
        topic.setAuthorId(currentUser.getId());
        topic.setAuthorName(currentUser.getFirstName() + " " + currentUser.getLastName());
        topic.setAuthorAvatar(currentUser.getProfilePicture());
        topic.setAuthorRole(currentUser.getRole() != null ? currentUser.getRole().toString() : null);
        topic.setCreatedAt(LocalDateTime.now());
        topic.setUpdatedAt(LocalDateTime.now());
        topic.setViewCount(0);
        topic.setReplyCount(0);
        topic.setLikeCount(0);
        topic.setIsPinned(false);
        topic.setIsLocked(false);
        topic.setIsDeleted(false);
        
        DiscussionTopic savedTopic = topicRepository.save(topic);
        
        // Update group stats
        g.setTopicCount(g.getTopicCount() + 1);
        g.setPostCount(g.getPostCount() + 1);
        g.setLastTopicId(savedTopic.getId());
        g.setLastTopicTitle(savedTopic.getTitle());
        g.setLastPostAt(LocalDateTime.now());
        g.setLastPostBy(currentUser.getId());
        g.setLastPostByName(currentUser.getFirstName() + " " + currentUser.getLastName());
        g.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(g);
        
        // Broadcast via WebSocket
        webSocketController.broadcastNewTopic(g.getId(), savedTopic);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTopic);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTopic(
            @PathVariable String id,
            @RequestBody DiscussionTopic topicUpdate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Updating topic: {}", id);
        
        Optional<DiscussionTopic> existingTopic = topicRepository.findById(id);
        if (existingTopic.isEmpty() || existingTopic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic topic = existingTopic.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is author
        if (!topic.getAuthorId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only edit your own topics"));
        }
        
        // Check if topic is locked
        if (topic.getIsLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "This topic is locked and cannot be edited"));
        }
        
        if (topicUpdate.getTitle() != null) topic.setTitle(topicUpdate.getTitle());
        if (topicUpdate.getContent() != null) topic.setContent(topicUpdate.getContent());
        if (topicUpdate.getTags() != null) topic.setTags(topicUpdate.getTags());
        
        topic.setUpdatedAt(LocalDateTime.now());
        
        DiscussionTopic updatedTopic = topicRepository.save(topic);
        return ResponseEntity.ok(updatedTopic);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTopic(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Deleting topic: {}", id);
        
        Optional<DiscussionTopic> existingTopic = topicRepository.findById(id);
        if (existingTopic.isEmpty() || existingTopic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic topic = existingTopic.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is author or moderator
        Optional<DiscussionGroup> group = groupRepository.findById(topic.getGroupId());
        boolean isModerator = group.isPresent() && 
                (group.get().getModerators().contains(currentUser.getId()) ||
                 group.get().getCreatedBy().equals(currentUser.getId()));
        
        if (!topic.getAuthorId().equals(currentUser.getId()) && !isModerator && 
            currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to delete this topic"));
        }
        
        // Soft delete
        topic.setIsDeleted(true);
        topic.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(topic);
        
        // Update group stats
        if (group.isPresent()) {
            DiscussionGroup g = group.get();
            g.setTopicCount(Math.max(0, g.getTopicCount() - 1));
            g.setUpdatedAt(LocalDateTime.now());
            groupRepository.save(g);
        }
        
        return ResponseEntity.ok(Map.of("message", "Topic deleted successfully"));
    }

    @PostMapping("/{id}/pin")
    public ResponseEntity<?> pinTopic(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Pinning/unpinning topic: {}", id);
        
        Optional<DiscussionTopic> existingTopic = topicRepository.findById(id);
        if (existingTopic.isEmpty() || existingTopic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic topic = existingTopic.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is moderator
        Optional<DiscussionGroup> group = groupRepository.findById(topic.getGroupId());
        boolean isModerator = group.isPresent() && 
                (group.get().getModerators().contains(currentUser.getId()) ||
                 group.get().getCreatedBy().equals(currentUser.getId()));
        
        if (!isModerator && currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only moderators can pin topics"));
        }
        
        topic.setIsPinned(!topic.getIsPinned());
        topic.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(topic);
        
        String message = topic.getIsPinned() ? "Topic pinned" : "Topic unpinned";
        return ResponseEntity.ok(Map.of("message", message, "isPinned", topic.getIsPinned()));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<?> lockTopic(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Locking/unlocking topic: {}", id);
        
        Optional<DiscussionTopic> existingTopic = topicRepository.findById(id);
        if (existingTopic.isEmpty() || existingTopic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic topic = existingTopic.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is moderator
        Optional<DiscussionGroup> group = groupRepository.findById(topic.getGroupId());
        boolean isModerator = group.isPresent() && 
                (group.get().getModerators().contains(currentUser.getId()) ||
                 group.get().getCreatedBy().equals(currentUser.getId()));
        
        if (!isModerator && currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only moderators can lock topics"));
        }
        
        topic.setIsLocked(!topic.getIsLocked());
        topic.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(topic);
        
        String message = topic.getIsLocked() ? "Topic locked" : "Topic unlocked";
        return ResponseEntity.ok(Map.of("message", message, "isLocked", topic.getIsLocked()));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeTopic(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Liking topic: {}", id);
        
        Optional<DiscussionTopic> existingTopic = topicRepository.findById(id);
        if (existingTopic.isEmpty() || existingTopic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic topic = existingTopic.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (topic.getLikedBy() == null) {
            topic.setLikedBy(new ArrayList<>());
        }
        
        if (topic.getLikedBy().contains(currentUser.getId())) {
            // Unlike
            topic.getLikedBy().remove(currentUser.getId());
            topic.setLikeCount(topic.getLikeCount() - 1);
        } else {
            // Like
            topic.getLikedBy().add(currentUser.getId());
            topic.setLikeCount(topic.getLikeCount() + 1);
        }
        
        topicRepository.save(topic);
        
        // Broadcast like via WebSocket
        webSocketController.broadcastTopicLike(topic.getId(), topic.getGroupId(), 
            topic.getLikeCount(), currentUser.getId());
        
        return ResponseEntity.ok(Map.of(
                "message", "Topic like updated",
                "likeCount", topic.getLikeCount(),
                "isLiked", topic.getLikedBy().contains(currentUser.getId())
        ));
    }
}
