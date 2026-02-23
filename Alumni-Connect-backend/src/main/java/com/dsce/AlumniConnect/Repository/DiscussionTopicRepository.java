package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.DiscussionTopic;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionTopicRepository extends MongoRepository<DiscussionTopic, String> {
    
    List<DiscussionTopic> findByGroupIdAndIsDeletedFalseOrderByIsPinnedDescLastReplyAtDesc(String groupId);
    
    List<DiscussionTopic> findByGroupIdAndIsDeletedFalseOrderByCreatedAtDesc(String groupId);
    
    List<DiscussionTopic> findByAuthorIdAndIsDeletedFalseOrderByCreatedAtDesc(String authorId);
    
    List<DiscussionTopic> findByTitleContainingIgnoreCaseAndIsDeletedFalse(String title);
    
    List<DiscussionTopic> findByTagsContainingAndIsDeletedFalse(String tag);
    
    long countByGroupIdAndIsDeletedFalse(String groupId);
    
    List<DiscussionTopic> findTop5ByIsDeletedFalseOrderByLastReplyAtDesc();
}
