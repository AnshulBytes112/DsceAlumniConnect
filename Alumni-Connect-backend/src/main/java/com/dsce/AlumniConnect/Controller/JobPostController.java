package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.JobPostDTO;
import com.dsce.AlumniConnect.Service.JobPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    @Autowired
    private JobPostService jobPostService;

    @Autowired
    private com.dsce.AlumniConnect.Service.JobApplicationService jobApplicationService;

    @PostMapping("/{id}/apply")
    public ResponseEntity<com.dsce.AlumniConnect.DTO.JobApplicationDTO> applyForJob(@PathVariable String id) {
        return ResponseEntity.ok(jobApplicationService.applyForJob(id));
    }

    @GetMapping
    public ResponseEntity<List<JobPostDTO>> getAllJobs() {
        return ResponseEntity.ok(jobPostService.getAllActiveJobs());
    }

    @GetMapping("/my-jobs")
    public ResponseEntity<List<JobPostDTO>> getMyJobs() {
        return ResponseEntity.ok(jobPostService.getMyJobs());
    }

    @PostMapping
    public ResponseEntity<JobPostDTO> createJob(@RequestBody JobPostDTO jobPostDTO) {
        return ResponseEntity.ok(jobPostService.createJobPost(jobPostDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        jobPostService.deleteJobPost(id);
        return ResponseEntity.ok().build();
    }
}
