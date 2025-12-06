package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Announcement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends MongoRepository<Announcement, String> {
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
