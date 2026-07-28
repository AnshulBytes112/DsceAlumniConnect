package com.dsce.AlumniConnect.Repository;

import com.dsce.AlumniConnect.entity.GalleryImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryImageRepository extends MongoRepository<GalleryImage, String> {
    List<GalleryImage> findByCategoryOrderByCreatedAtDesc(String category);
}
