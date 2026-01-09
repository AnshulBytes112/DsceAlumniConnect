package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.CommentResponse;
import com.dsce.AlumniConnect.DTO.CreateCommentRequest;
import com.dsce.AlumniConnect.entity.Comment;
import com.dsce.AlumniConnect.entity.Post;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.Repository.CommentRepository;
import com.dsce.AlumniConnect.Repository.PostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    public CommentResponse createComment(CreateCommentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));

        Comment comment = new Comment();
        comment.setPostId(request.getPostId());
        comment.setAuthorId(user.getId());
        comment.setAuthorName(user.getFirstName() + " " + user.getLastName());
        comment.setAuthorAvatar(user.getProfilePicture());
        comment.setAuthorRole(getUserRole(user));
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        comment.setLikes(0);
        comment.setLikedBy(new java.util.ArrayList<>());
        comment.setIsDeleted(false);

        Comment savedComment = commentRepository.save(comment);

        // Update post comment count
        post.setComments(post.getComments() + 1);
        postRepository.save(post);

        log.info("Created comment by user: {} on post: {}", userEmail, request.getPostId());
        
        return convertToCommentResponse(savedComment, userEmail);
    }

    public List<CommentResponse> getCommentsByPostId(String postId, String userEmail) {
        List<Comment> comments = commentRepository.findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(postId);
        
        return comments.stream()
                .map(comment -> convertToCommentResponse(comment, userEmail))
                .collect(Collectors.toList());
    }

    public void deleteComment(String commentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Check if user is the author of the comment
        if (!comment.getAuthorId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        comment.setIsDeleted(true);
        commentRepository.save(comment);

        // Update post comment count
        Post post = postRepository.findById(comment.getPostId())
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        post.setComments(Math.max(0, post.getComments() - 1));
        postRepository.save(post);

        log.info("Deleted comment: {} by user: {}", commentId, userEmail);
    }

    private CommentResponse convertToCommentResponse(Comment comment, String currentUserEmail) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setAuthorId(comment.getAuthorId());
        response.setAuthorName(comment.getAuthorName());
        response.setAuthorAvatar(comment.getAuthorAvatar());
        response.setAuthorRole(comment.getAuthorRole());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        response.setLikes(comment.getLikes());
        response.setIsDeleted(comment.getIsDeleted());
        
        // Check if current user liked this comment
        User currentUser = getUserByEmail(currentUserEmail);
        boolean isLiked = comment.getLikedBy() != null && comment.getLikedBy().contains(currentUser.getId());
        response.setIsLiked(isLiked);
        
        // Check if current user is the author
        response.setIsAuthor(comment.getAuthorId().equals(currentUser.getId()));
        
        return response;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getUserRole(User user) {
        // You can implement role logic based on user profile or other criteria
        return user.getRole() != null ? String.valueOf(user.getRole()) : "USER";
    }
}
