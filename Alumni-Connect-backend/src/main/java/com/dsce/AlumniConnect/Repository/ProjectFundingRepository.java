package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.ProjectFunding;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectFundingRepository extends MongoRepository<ProjectFunding, String> {
    List<ProjectFunding> findByUserId(String userId);
}
