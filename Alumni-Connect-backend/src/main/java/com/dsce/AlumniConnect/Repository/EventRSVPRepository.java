package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.EventRSVP;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRSVPRepository extends MongoRepository<EventRSVP, String> {
    List<EventRSVP> findByUserIdAndStatus(String userId, EventRSVP.RsvpStatus status);

    Optional<EventRSVP> findByUserIdAndEventId(String userId, String eventId);
}
