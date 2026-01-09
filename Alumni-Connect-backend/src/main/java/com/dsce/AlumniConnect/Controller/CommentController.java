package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.CommentResponse;
import com.dsce.AlumniConnect.DTO.CreateCommentRequest;
import com.dsce.AlumniConnect.Service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({ "/api/comments", "/comments" })
@RequiredArgsConstructor
@Slf4j
public class CommentController {
    private final CommentService commentService;


    @PostMapping
    public ResponseEntity<?> createComment(@Valid @RequestBody CreateCommentRequest request, Authentication authentication) {
        try {
            log.info("Creating new comment for post: {} by user: {}", request.getPostId(), authentication.getName());
            CommentResponse comment = commentService.createComment(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(comment);
        } catch (Exception e) {
            log.error("Error creating comment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPostId(@PathVariable String postId, Authentication authentication) {
        try {
            log.info("Fetching comments for post: {} by user: {}", postId, authentication.getName());

            List<CommentResponse> comments = commentService.getCommentsByPostId(postId, authentication.getName());
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            log.error("Error fetching comments: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId, Authentication authentication) {
        try {
            log.info("Deleting comment: {} by user: {}", commentId, authentication.getName());
            commentService.deleteComment(commentId, authentication.getName());
            return ResponseEntity.ok().body("Comment deleted successfully");
        } catch (Exception e) {
            log.error("Error deleting comment: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
