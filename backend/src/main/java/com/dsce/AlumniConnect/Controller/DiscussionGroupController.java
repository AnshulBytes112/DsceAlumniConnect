package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.DiscussionGroupRepository;
import com.dsce.AlumniConnect.Repository.DiscussionTopicRepository;
import com.dsce.AlumniConnect.Repository.DiscussionPostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.entity.DiscussionGroup;
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
@RequestMapping({ "/api/discussions/groups", "/discussions/groups" })
@RequiredArgsConstructor
public class DiscussionGroupController {

    private final DiscussionGroupRepository groupRepository;
    private final DiscussionTopicRepository topicRepository;
    private final DiscussionPostRepository postRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<DiscussionGroup>> getAllGroups(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        
        log.info("Fetching discussion groups - category: {}, search: {}", category, search);
        
        List<DiscussionGroup> groups;
        
        if (search != null && !search.isEmpty()) {
            groups = groupRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(search);
        } else if (category != null && !category.isEmpty()) {
            groups = groupRepository.findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(category);
        } else {
            groups = groupRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        }
        
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(@PathVariable String id) {
        log.info("Fetching discussion group: {}", id);
        
        Optional<DiscussionGroup> group = groupRepository.findById(id);
        if (group.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        return ResponseEntity.ok(group.get());
    }

    @PostMapping
    public ResponseEntity<?> createGroup(
            @RequestBody DiscussionGroup group,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Creating new discussion group: {}", group.getName());
        
        if (groupRepository.existsByName(group.getName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "A group with this name already exists"));
        }
        
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        group.setCreatedBy(currentUser.getId());
        group.setCreatedByName(currentUser.getFirstName() + " " + currentUser.getLastName());
        group.setCreatedAt(LocalDateTime.now());
        group.setUpdatedAt(LocalDateTime.now());
        group.setMembers(new ArrayList<>(List.of(currentUser.getId())));
        group.setModerators(new ArrayList<>(List.of(currentUser.getId())));
        group.setTopicCount(0);
        group.setPostCount(0);
        group.setMemberCount(1);
        group.setIsActive(true);
        
        DiscussionGroup savedGroup = groupRepository.save(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGroup);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(
            @PathVariable String id,
            @RequestBody DiscussionGroup groupUpdate,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Updating discussion group: {}", id);
        
        Optional<DiscussionGroup> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        DiscussionGroup group = existingGroup.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Check if user is creator or moderator
        if (!group.getCreatedBy().equals(currentUser.getId()) && 
            !group.getModerators().contains(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to update this group"));
        }
        
        // Update fields
        if (groupUpdate.getName() != null) group.setName(groupUpdate.getName());
        if (groupUpdate.getDescription() != null) group.setDescription(groupUpdate.getDescription());
        if (groupUpdate.getCategory() != null) group.setCategory(groupUpdate.getCategory());
        if (groupUpdate.getTags() != null) group.setTags(groupUpdate.getTags());
        if (groupUpdate.getIcon() != null) group.setIcon(groupUpdate.getIcon());
        if (groupUpdate.getColor() != null) group.setColor(groupUpdate.getColor());
        if (groupUpdate.getIsPrivate() != null) group.setIsPrivate(groupUpdate.getIsPrivate());
        if (groupUpdate.getIsActive() != null) group.setIsActive(groupUpdate.getIsActive());
        
        group.setUpdatedAt(LocalDateTime.now());
        
        DiscussionGroup updatedGroup = groupRepository.save(group);
        return ResponseEntity.ok(updatedGroup);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Deleting discussion group: {}", id);
        
        Optional<DiscussionGroup> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        DiscussionGroup group = existingGroup.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only creator or admin can delete
        if (!group.getCreatedBy().equals(currentUser.getId()) && 
            currentUser.getRole() != User.Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to delete this group"));
        }
        
        // Soft delete
        group.setIsActive(false);
        group.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(group);
        
        return ResponseEntity.ok(Map.of("message", "Discussion group deleted successfully"));
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<?> joinGroup(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("User joining discussion group: {}", id);
        
        Optional<DiscussionGroup> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        DiscussionGroup group = existingGroup.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (group.getMembers().contains(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You are already a member of this group"));
        }
        
        group.getMembers().add(currentUser.getId());
        group.setMemberCount(group.getMembers().size());
        group.setUpdatedAt(LocalDateTime.now());
        
        groupRepository.save(group);
        
        return ResponseEntity.ok(Map.of("message", "Successfully joined the group"));
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("User leaving discussion group: {}", id);
        
        Optional<DiscussionGroup> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Discussion group not found"));
        }
        
        DiscussionGroup group = existingGroup.get();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!group.getMembers().contains(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "You are not a member of this group"));
        }
        
        // Creator cannot leave their own group
        if (group.getCreatedBy().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Group creator cannot leave the group"));
        }
        
        group.getMembers().remove(currentUser.getId());
        group.getModerators().remove(currentUser.getId());
        group.setMemberCount(group.getMembers().size());
        group.setUpdatedAt(LocalDateTime.now());
        
        groupRepository.save(group);
        
        return ResponseEntity.ok(Map.of("message", "Successfully left the group"));
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<DiscussionGroup>> getMyGroups(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        log.info("Fetching groups for current user");
        
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<DiscussionGroup> groups = groupRepository.findByMembersContainingOrderByLastPostAtDesc(currentUser.getId());
        
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        log.info("Fetching discussion group categories");
        
        List<DiscussionGroup> groups = groupRepository.findByIsActiveTrueOrderByCreatedAtDesc();
        Set<String> categories = new HashSet<>();
        
        for (DiscussionGroup group : groups) {
            if (group.getCategory() != null) {
                categories.add(group.getCategory());
            }
        }
        
        return ResponseEntity.ok(new ArrayList<>(categories));
    }
}
