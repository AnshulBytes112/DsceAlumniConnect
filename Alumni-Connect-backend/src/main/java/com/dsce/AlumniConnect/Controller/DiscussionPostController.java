package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.DiscussionGroupRepository;
import com.dsce.AlumniConnect.Repository.DiscussionTopicRepository;
import com.dsce.AlumniConnect.Repository.DiscussionPostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.DiscussionGroup;
import com.dsce.AlumniConnect.entity.DiscussionTopic;
import com.dsce.AlumniConnect.entity.DiscussionPost;
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
@RequestMapping({ "/api/discussions/posts", "/discussions/posts" })
@RequiredArgsConstructor
public class DiscussionPostController {

    private final DiscussionPostRepository postRepository;
    private final DiscussionTopicRepository topicRepository;
    private final DiscussionGroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ForumWebSocketController webSocketController;

    @GetMapping("/topic/{topicId}")
    public ResponseEntity<?> getPostsByTopic(@PathVariable String topicId) {
        log.info("Fetching posts for topic: {}", topicId);
        
        Optional<DiscussionTopic> topic = topicRepository.findById(topicId);
        if (topic.isEmpty() || topic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        List<DiscussionPost> posts = postRepository.findByTopicIdAndIsDeletedFalseOrderByCreatedAtAsc(topicId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        log.info("Fetching post: {}", id);
        
        Optional<DiscussionPost> post = postRepository.findById(id);
        if (post.isEmpty() || post.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found"));
        }
        
        return ResponseEntity.ok(post.get());
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestBody DiscussionPost post,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Creating new post in topic: {}", post.getTopicId());
        
        Optional<DiscussionTopic> topic = topicRepository.findById(post.getTopicId());
        if (topic.isEmpty() || topic.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Topic not found"));
        }
        
        DiscussionTopic t = topic.get();
        
        // Check if topic is locked
        if (t.getIsLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "This topic is locked and cannot receive new posts"));
        }
        
        Optional<DiscussionGroup> group = groupRepository.findById(t.getGroupId());
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
                    .body(Map.of("error", "You must be a member of this private group to post"));
        }
        
        post.setGroupId(t.getGroupId());
        post.setAuthorId(currentUser.getId());
        post.setAuthorName(currentUser.getFirstName() + " " + currentUser.getLastName());
        post.setAuthorAvatar(currentUser.getProfilePicture());
        post.setAuthorRole(currentUser.getRole() != null ? currentUser.getRole().toString() : null);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        post.setLikeCount(0);
        post.setIsDeleted(false);
        
        DiscussionPost savedPost = postRepository.save(post);
        
        // Update topic stats
        t.setReplyCount(t.getReplyCount() + 1);
        t.setLastReplyId(savedPost.getId());
        t.setLastReplyAt(LocalDateTime.now());
        t.setLastReplyBy(currentUser.getId());
        t.setLastReplyByName(currentUser.getFirstName() + " " + currentUser.getLastName());
        t.setUpdatedAt(LocalDateTime.now());
        topicRepository.save(t);
        
        // Update group stats
        g.setPostCount(g.getPostCount() + 1);
        g.setLastPostAt(LocalDateTime.now());
        g.setLastPostBy(currentUser.getId());
        g.setLastPostByName(currentUser.getFirstName() + " " + currentUser.getLastName());
        g.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(g);
        
        // Broadcast via WebSocket
        webSocketController.broadcastNewPost(t.getId(), g.getId(), savedPost);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestBody DiscussionPost postUpdate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Updating post: {}", id);
        
        Optional<DiscussionPost> existingPost = postRepository.findById(id);
        if (existingPost.isEmpty() || existingPost.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found"));
        }
        
        DiscussionPost post = existingPost.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is author
        if (!post.getAuthorId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only edit your own posts"));
        }
        
        if (postUpdate.getContent() != null) post.setContent(postUpdate.getContent());
        if (postUpdate.getMentions() != null) post.setMentions(postUpdate.getMentions());
        
        post.setUpdatedAt(LocalDateTime.now());
        
        DiscussionPost updatedPost = postRepository.save(post);
        
        // Broadcast edit via WebSocket
        webSocketController.broadcastPostEdit(post.getTopicId(), post.getGroupId(), updatedPost);
        
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Deleting post: {}", id);
        
        Optional<DiscussionPost> existingPost = postRepository.findById(id);
        if (existingPost.isEmpty() || existingPost.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found"));
        }
        
        DiscussionPost post = existingPost.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is author or moderator
        Optional<DiscussionTopic> topic = topicRepository.findById(post.getTopicId());
        Optional<DiscussionGroup> group = groupRepository.findById(post.getGroupId());
        
        boolean isModerator = group.isPresent() && 
                (group.get().getModerators().contains(currentUser.getId()) ||
                 group.get().getCreatedBy().equals(currentUser.getId()));
        
        if (!post.getAuthorId().equals(currentUser.getId()) && !isModerator && 
            currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to delete this post"));
        }
        
        // Soft delete
        post.setIsDeleted(true);
        post.setUpdatedAt(LocalDateTime.now());
        postRepository.save(post);
        
        // Update topic stats
        if (topic.isPresent()) {
            DiscussionTopic t = topic.get();
            t.setReplyCount(Math.max(0, t.getReplyCount() - 1));
            t.setUpdatedAt(LocalDateTime.now());
            topicRepository.save(t);
        }
        
        // Update group stats
        if (group.isPresent()) {
            DiscussionGroup g = group.get();
            g.setPostCount(Math.max(0, g.getPostCount() - 1));
            g.setUpdatedAt(LocalDateTime.now());
            groupRepository.save(g);
        }
        
        // Broadcast delete via WebSocket
        webSocketController.broadcastPostDelete(post.getTopicId(), post.getGroupId(), post.getId());
        
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Liking post: {}", id);
        
        Optional<DiscussionPost> existingPost = postRepository.findById(id);
        if (existingPost.isEmpty() || existingPost.get().getIsDeleted()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Post not found"));
        }
        
        DiscussionPost post = existingPost.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (post.getLikedBy() == null) {
            post.setLikedBy(new ArrayList<>());
        }
        
        if (post.getLikedBy().contains(currentUser.getId())) {
            // Unlike
            post.getLikedBy().remove(currentUser.getId());
            post.setLikeCount(post.getLikeCount() - 1);
        } else {
            // Like
            post.getLikedBy().add(currentUser.getId());
            post.setLikeCount(post.getLikeCount() + 1);
        }
        
        postRepository.save(post);
        
        // Broadcast like via WebSocket
        webSocketController.broadcastPostLike(post.getTopicId(), post.getGroupId(), post.getId(), 
            post.getLikeCount(), currentUser.getId());
        
        return ResponseEntity.ok(Map.of(
                "message", "Post like updated",
                "likeCount", post.getLikeCount(),
                "isLiked", post.getLikedBy().contains(currentUser.getId())
        ));
    }

    @GetMapping("/recent")
    public ResponseEntity<?> getRecentPosts() {
        log.info("Fetching recent posts from all groups");
        
        // Get posts from the last 7 days across all groups
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        
        List<DiscussionPost> posts = postRepository.findByGroupIdAndIsDeletedFalseOrderByCreatedAtDesc(null);
        // Filter to last week manually since MongoDB query might be complex
        posts = posts.stream()
                .filter(p -> p.getCreatedAt() != null && p.getCreatedAt().isAfter(weekAgo))
                .limit(20)
                .toList();
        
        return ResponseEntity.ok(posts);
    }
}
