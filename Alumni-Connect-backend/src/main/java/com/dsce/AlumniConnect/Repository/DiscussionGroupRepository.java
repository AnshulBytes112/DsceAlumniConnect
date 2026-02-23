package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.DiscussionGroup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiscussionGroupRepository extends MongoRepository<DiscussionGroup, String> {
    
    List<DiscussionGroup> findByIsActiveTrueOrderByCreatedAtDesc();
    
    List<DiscussionGroup> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(String category);
    
    List<DiscussionGroup> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    Optional<DiscussionGroup> findByName(String name);
    
    List<DiscussionGroup> findByMembersContainingOrderByLastPostAtDesc(String userId);
    
    List<DiscussionGroup> findByCreatedByOrderByCreatedAtDesc(String userId);
    
    boolean existsByName(String name);
}
