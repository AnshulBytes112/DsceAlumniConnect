package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.CreatePostRequest;
import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.PostResponse;
import com.dsce.AlumniConnect.DTO.UpdatePostRequest;
import com.dsce.AlumniConnect.Repository.PostRepository;
import com.dsce.AlumniConnect.Service.PostService;
import com.dsce.AlumniConnect.entity.Post;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RestController
@RequestMapping({ "/api/posts", "/posts" })
@RequiredArgsConstructor
public class PostController {
    @Autowired
    private PostRepository postRepository;

    private final PostService postService;

    // Get all posts (feed)
    @GetMapping
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            List<PostResponse> posts = postService.getAllPosts(authentication.getName(), page, size);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            log.error("Error fetching posts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch posts: " + e.getMessage()));
        }
    }

    // Get post by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id, Authentication authentication) {
        try {
            PostResponse post = postService.getPostById(id, authentication.getName());
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error fetching post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse("Post not found: " + e.getMessage()));
        }
    }

    // Create new post
    @PostMapping
    public ResponseEntity<?> createPost(@Valid @RequestBody CreatePostRequest request, Authentication authentication) {
        try {
            log.info("Creating new post for user: {}", authentication.getName());

            // Create post object

            PostResponse post = postService.createPost(request, authentication.getName());

            
            // Handle media field - ensure it's not null

//            post.setLikedBy(new ArrayList<>());
//            post.setReportedBy(new ArrayList<>());

            log.info("Created new post by user: {}", authentication.getName());
            
            // Convert to response object
            return ResponseEntity.status(HttpStatus.CREATED).body(post);
        } catch (Exception e) {
            log.error("Error creating post: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to create post: " + e.getMessage()));
        }
    }

    // Update post
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @Valid @RequestBody UpdatePostRequest request,
            Authentication authentication) {
        try {
            log.info("Updating post {} for user: {}", id, authentication.getName());
            PostResponse post = postService.updatePost(id, request, authentication.getName());
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error updating post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to update post: " + e.getMessage()));
        }
    }

    // Delete post
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id, Authentication authentication) {
        try {
            log.info("Deleting post {} for user: {}", id, authentication.getName());
            postService.deletePost(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to delete post: " + e.getMessage()));
        }
    }

    // Like/Unlike post
    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String id, Authentication authentication) {
        try {
            PostResponse post = postService.toggleLike(id, authentication.getName());
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error toggling like for post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to like post: " + e.getMessage()));
        }
    }

    // Share post
    @PostMapping("/{id}/share")
    public ResponseEntity<?> sharePost(@PathVariable String id, Authentication authentication) {
        try {
            PostResponse post = postService.sharePost(id, authentication.getName());
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            log.error("Error sharing post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to share post: " + e.getMessage()));
        }
    }

    // Report post
    @PostMapping("/{id}/report")
    public ResponseEntity<?> reportPost(@PathVariable String id, Authentication authentication) {
        try {
            postService.reportPost(id, authentication.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error reporting post {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Failed to report post: " + e.getMessage()));
        }
    }

    // Get posts by current user
    @GetMapping("/my-posts")
    public ResponseEntity<?> getMyPosts(Authentication authentication) {
        try {
            List<PostResponse> posts = postService.getPostsByUser(authentication.getName());
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            log.error("Error fetching user posts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch your posts: " + e.getMessage()));
        }
    }
}
