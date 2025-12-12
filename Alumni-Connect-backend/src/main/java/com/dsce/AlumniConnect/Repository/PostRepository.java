package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
}
