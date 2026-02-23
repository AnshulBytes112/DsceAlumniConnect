package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepository extends MongoRepository<JobPost, String> {
    List<JobPost> findByActiveTrueOrderByCreatedAtDesc();

    List<JobPost> findByPostedByIdOrderByCreatedAtDesc(String postedById);
}
