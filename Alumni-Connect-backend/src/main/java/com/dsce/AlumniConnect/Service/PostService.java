package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.CreatePostRequest;
import com.dsce.AlumniConnect.DTO.ErrorResponse;
import com.dsce.AlumniConnect.DTO.PostResponse;
import com.dsce.AlumniConnect.DTO.UpdatePostRequest;
import com.dsce.AlumniConnect.entity.Post;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.Repository.PostRepository;
import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ImageUtil imageUtil;

    public List<PostResponse> getAllPosts(String userEmail, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        List<Post> posts = postRepository.findAll(pageable).getContent();
        
        return posts.stream()
                .map(post -> convertToPostResponse(post, userEmail))
                .collect(Collectors.toList());
    }

    public PostResponse getPostById(String postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        return convertToPostResponse(post, userEmail);
    }

    public PostResponse createPost(CreatePostRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = new Post();
        post.setAuthorId(user.getId());
        post.setAuthorName(user.getFirstName() + " " + user.getLastName());
        post.setAuthorAvatar(user.getProfilePicture());
        post.setAuthorRole(getUserRole(user));
        post.setGraduationYear(user.getGraduationYear());
        post.setDepartment(user.getDepartment());
        post.setContent(request.getContent());
        
        // Process media - convert base64 to file URLs
        List<String> mediaUrls = new ArrayList<>();
        if (request.getMedia() != null) {
            for (String mediaItem : request.getMedia()) {
                if (ImageUtil.isBase64Image(mediaItem)) {
                    // Convert base64 to file and get URL
                    String imageUrl = imageUtil.saveBase64Image(mediaItem);
                    mediaUrls.add(imageUrl);
                } else {
                    // Already a URL, add as-is
                    mediaUrls.add(mediaItem);
                }
            }
        }
        post.setMedia(mediaUrls);
        
        post.setHashtags(request.getHashtags() != null ? request.getHashtags() : new ArrayList<>());
        post.setMentions(request.getMentions() != null ? request.getMentions() : new ArrayList<>());
        post.setCreatedAt(LocalDateTime.now());
        post.setLikes(0);
        post.setComments(0);
        post.setShares(0);
        post.setLikedBy(new ArrayList<>());
        post.setReportedBy(new ArrayList<>());

        Post savedPost = postRepository.save(post);
        log.info("Created new post by user: {} with {} images", userEmail, mediaUrls.size());
        
        return convertToPostResponse(savedPost, userEmail);
    }

    public PostResponse updatePost(String postId, UpdatePostRequest request, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthorId().equals(getUserByEmail(userEmail).getId())) {
            throw new RuntimeException("You can only edit your own posts");
        }

        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getMedia() != null) {
            post.setMedia(request.getMedia());
        }
        if (request.getHashtags() != null) {
            post.setHashtags(request.getHashtags());
        }
        if (request.getMentions() != null) {
            post.setMentions(request.getMentions());
        }

        Post updatedPost = postRepository.save(post);
        log.info("Updated post {} by user: {}", postId, userEmail);
        
        return convertToPostResponse(updatedPost, userEmail);
    }

    public void deletePost(String postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getAuthorId().equals(getUserByEmail(userEmail).getId())) {
            throw new RuntimeException("You can only delete your own posts");
        }

        postRepository.delete(post);
        log.info("Deleted post {} by user: {}", postId, userEmail);
    }

    public PostResponse toggleLike(String postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = getUserByEmail(userEmail);
        List<String> likedBy = post.getLikedBy() != null ? post.getLikedBy() : new ArrayList<>();

        if (likedBy.contains(user.getId())) {
            likedBy.remove(user.getId());
            post.setLikes(Math.max(0, post.getLikes() - 1));
        } else {
            likedBy.add(user.getId());
            post.setLikes(post.getLikes() + 1);
        }

        post.setLikedBy(likedBy);
        Post updatedPost = postRepository.save(post);
        
        return convertToPostResponse(updatedPost, userEmail);
    }

    public PostResponse sharePost(String postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setShares(post.getShares() + 1);
        Post updatedPost = postRepository.save(post);
        
        log.info("Shared post {} by user: {}", postId, userEmail);
        return convertToPostResponse(updatedPost, userEmail);
    }

    public void reportPost(String postId, String userEmail) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = getUserByEmail(userEmail);
        List<String> reportedBy = post.getReportedBy() != null ? post.getReportedBy() : new ArrayList<>();

        if (reportedBy.contains(user.getId())) {
            throw new RuntimeException("You have already reported this post");
        }

        reportedBy.add(user.getId());
        post.setReportedBy(reportedBy);
        
        postRepository.save(post);
        log.info("Reported post {} by user: {}", postId, userEmail);
    }

    public List<PostResponse> getPostsByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Post> posts = postRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId());
        
        return posts.stream()
                .map(post -> convertToPostResponse(post, userEmail))
                .collect(Collectors.toList());
    }

    private PostResponse convertToPostResponse(Post post, String currentUserEmail) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setAuthorId(post.getAuthorId());
        response.setAuthorName(post.getAuthorName());
        response.setAuthorAvatar(post.getAuthorAvatar());
        response.setAuthorRole(post.getAuthorRole());
        response.setGraduationYear(post.getGraduationYear());
        response.setDepartment(post.getDepartment());
        response.setContent(post.getContent());
        response.setCreatedAt(post.getCreatedAt());
        response.setLikes(post.getLikes());
        response.setComments(post.getComments());
        response.setShares(post.getShares());
        response.setMedia(post.getMedia());
        response.setHashtags(post.getHashtags());
        response.setMentions(post.getMentions());
        
        // Check if current user liked this post
        User currentUser = getUserByEmail(currentUserEmail);
        boolean isLiked = post.getLikedBy() != null && post.getLikedBy().contains(currentUser.getId());
        response.setIsLiked(isLiked);
        
        // Check if current user is the author
        response.setIsAuthor(post.getAuthorId().equals(currentUser.getId()));
        
        response.setIsBookmarked(false); // TODO: Implement bookmark functionality
        
        return response;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getUserRole(User user) {
        if (user.getWorkExperiences() != null && !user.getWorkExperiences().isEmpty()) {
            return user.getWorkExperiences().get(0).getJobTitle() + " at " + user.getWorkExperiences().get(0).getCompany();
        }
        return "DSCE Alumni";
    }
}
