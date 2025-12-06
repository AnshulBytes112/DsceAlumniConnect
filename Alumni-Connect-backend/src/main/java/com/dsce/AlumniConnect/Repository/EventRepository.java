package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.Event;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends MongoRepository<Event, String> {
}
