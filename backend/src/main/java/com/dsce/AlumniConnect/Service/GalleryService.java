package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.Repository.GalleryImageRepository;
import com.dsce.AlumniConnect.entity.GalleryImage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class GalleryService {

    private final GalleryImageRepository galleryImageRepository;

    public List<GalleryImage> getAllImages() {
        return galleryImageRepository.findAll();
    }

    public List<GalleryImage> getImagesByCategory(String category) {
        return galleryImageRepository.findByCategoryOrderByCreatedAtDesc(category);
    }

    public GalleryImage addImage(GalleryImage image) {
        image.setCreatedAt(LocalDateTime.now());
        return galleryImageRepository.save(image);
    }

    public void deleteImage(String id) {
        galleryImageRepository.deleteById(id);
    }
}
