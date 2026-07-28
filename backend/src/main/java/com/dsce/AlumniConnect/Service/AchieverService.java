package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.Repository.AchieverRepository;
import com.dsce.AlumniConnect.entity.Achiever;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AchieverService {

    private final AchieverRepository achieverRepository;

    public List<Achiever> getAllAchievers() {
        return achieverRepository.findAllByOrderByCreatedAtDesc();
    }

    public Achiever addAchiever(Achiever achiever) {
        achiever.setCreatedAt(LocalDateTime.now());
        return achieverRepository.save(achiever);
    }

    public Achiever updateAchiever(String id, Achiever updatedAchiever) {
        return achieverRepository.findById(id).map(existing -> {
            existing.setName(updatedAchiever.getName());
            existing.setHeadline(updatedAchiever.getHeadline());
            existing.setLocation(updatedAchiever.getLocation());
            existing.setGraduationYear(updatedAchiever.getGraduationYear());
            if (updatedAchiever.getImageUrl() != null) {
                existing.setImageUrl(updatedAchiever.getImageUrl());
            }
            return achieverRepository.save(existing);
        }).orElseThrow(() -> new IllegalArgumentException("Achiever not found"));
    }

    public void deleteAchiever(String id) {
        achieverRepository.deleteById(id);
    }
}
