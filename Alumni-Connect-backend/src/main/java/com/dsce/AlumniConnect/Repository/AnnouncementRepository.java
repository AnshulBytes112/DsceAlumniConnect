package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
    Optional<Announcement> findById(String id);
}
