package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.DiscussionPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionPostRepository extends MongoRepository<DiscussionPost, String> {
    
    List<DiscussionPost> findByTopicIdAndIsDeletedFalseOrderByCreatedAtAsc(String topicId);
    
    List<DiscussionPost> findByTopicIdAndIsDeletedFalseOrderByCreatedAtDesc(String topicId);
    
    List<DiscussionPost> findByGroupIdAndIsDeletedFalseOrderByCreatedAtDesc(String groupId);
    
    List<DiscussionPost> findByAuthorIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId);
    
    long countByTopicIdAndIsDeletedFalse(String topicId);
    
    long countByGroupIdAndIsDeletedFalse(String groupId);
    
    List<DiscussionPost> findByParentPostIdAndIsDeletedFalseOrderByCreatedAtAsc(String parentPostId);
}
