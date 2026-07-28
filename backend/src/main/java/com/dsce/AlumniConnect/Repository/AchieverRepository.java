package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Achiever;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchieverRepository extends MongoRepository<Achiever, String> {
    List<Achiever> findAllByOrderByCreatedAtDesc();
}
