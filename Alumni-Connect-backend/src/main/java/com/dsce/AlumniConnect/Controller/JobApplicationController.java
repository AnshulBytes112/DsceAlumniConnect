package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.JobApplicationDTO;
import com.dsce.AlumniConnect.Service.JobApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    @Autowired
    private JobApplicationService jobApplicationService;

    @GetMapping("/my")
    public ResponseEntity<List<JobApplicationDTO>> getMyApplications() {
        return ResponseEntity.ok(jobApplicationService.getMyApplications());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobApplicationDTO> updateStatus(@PathVariable String id,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> withdrawApplication(@PathVariable String id) {
        jobApplicationService.withdrawApplication(id);
        return ResponseEntity.ok().build();
    }
}
