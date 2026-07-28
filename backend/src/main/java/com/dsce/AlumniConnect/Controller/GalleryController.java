package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.GalleryService;
import com.dsce.AlumniConnect.entity.GalleryImage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/gallery")
@RequiredArgsConstructor
public class GalleryController {

    private final GalleryService galleryService;

    @GetMapping
    public ResponseEntity<List<GalleryImage>> getAllImages() {
        return ResponseEntity.ok(galleryService.getAllImages());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<GalleryImage>> getImagesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(galleryService.getImagesByCategory(category));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GalleryImage> addImage(@RequestBody GalleryImage image) {
        return ResponseEntity.ok(galleryService.addImage(image));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteImage(@PathVariable String id) {
        galleryService.deleteImage(id);
        return ResponseEntity.ok().build();
    }
}
