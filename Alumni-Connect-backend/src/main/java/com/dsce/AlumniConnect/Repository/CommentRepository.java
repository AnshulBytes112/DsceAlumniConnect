package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    
    List<Comment> findByPostIdAndIsDeletedOrderByCreatedAtAsc(String postId, Boolean isDeleted);
    
    List<Comment> findByPostIdAndIsDeletedFalseOrderByCreatedAtAsc(String postId);
    
    @Query(value = "{ 'postId': ?0, 'isDeleted': false }", count = true)
    Long countByPostIdAndIsDeletedFalse(String postId);
}
