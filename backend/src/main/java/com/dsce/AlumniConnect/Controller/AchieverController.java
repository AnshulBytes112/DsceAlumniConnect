package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Service.AchieverService;
import com.dsce.AlumniConnect.entity.Achiever;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/achievers")
@RequiredArgsConstructor
public class AchieverController {

    private final AchieverService achieverService;

    @GetMapping
    public ResponseEntity<List<Achiever>> getAllAchievers() {
        return ResponseEntity.ok(achieverService.getAllAchievers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Achiever> addAchiever(@RequestBody Achiever achiever) {
        return ResponseEntity.ok(achieverService.addAchiever(achiever));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Achiever> updateAchiever(@PathVariable String id, @RequestBody Achiever achiever) {
        try {
            return ResponseEntity.ok(achieverService.updateAchiever(id, achiever));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAchiever(@PathVariable String id) {
        achieverService.deleteAchiever(id);
        return ResponseEntity.ok().build();
    }
}
