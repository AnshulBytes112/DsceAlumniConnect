package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.DTO.*;
import com.dsce.AlumniConnect.Repository.*;
import com.dsce.AlumniConnect.entity.*;
import com.dsce.AlumniConnect.Service.ProfileService;
import com.dsce.AlumniConnect.Service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping({ "/api/dashboard", "/dashboard" })
@RequiredArgsConstructor
public class DashboardController {

    private final AnnouncementRepository announcementRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ProjectFundingRepository projectFundingRepository;
    private final ProfileService profileService;
    private final EventService eventService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            int jobsApplied = jobApplicationRepository.findByUserId(currentUser.getId()).size();
            int events = eventService.getEventsUserIsAttending().size();
            int mentorships = 0;

            return ResponseEntity.ok(new DashboardStatsDTO(jobsApplied, events, mentorships));
        } catch (Exception e) {
            log.error("Error fetching stats", e);
            return ResponseEntity.ok(new DashboardStatsDTO(0, 0, 0));
        }
    }

    @GetMapping("/announcements")
    public ResponseEntity<List<AnnouncementDTO>> getAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        List<AnnouncementDTO> dtos = announcements.stream()
                .map(a -> new AnnouncementDTO(
                        (long) a.getId().hashCode(),
                        a.getTitle(),
                        a.getDescription(),
                        a.getTime()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/job-applications")
    public ResponseEntity<List<JobApplicationDTO>> getJobApplications() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            List<JobApplication> applications = jobApplicationRepository.findByUserId(currentUser.getId());
            List<JobApplicationDTO> dtos = applications.stream()
                    .map(j -> new JobApplicationDTO(j.getCompany(), j.getRole(), j.getStatus(), j.getDate()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching job applications", e);
            return ResponseEntity.ok(List.of());
        }
    }
    @GetMapping("/get-fundings")
    public ResponseEntity<List<FundingDTO>> getUserFundings() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            List<ProjectFunding> fundings = projectFundingRepository.findAll();
            List<FundingDTO> dtos = fundings.stream()
                    .map(f -> new FundingDTO(f.getTitle(), f.getAmount(), f.getStatus(), f.getDate()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching user fundings", e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getEvents() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            log.info("Getting events for user: {}", currentUser.getId());
            
            List<EventDTO> events = eventService.getEventsUserIsAttending();
            log.info("Found {} events user is attending", events.size());
            
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            log.error("Error fetching events", e);
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/fundings")
    public ResponseEntity<List<FundingDTO>> getFundings() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            log.info("Getting fundings for user: {}", currentUser.getId());
            List<ProjectFunding> fundings = projectFundingRepository.findByUserId(currentUser.getId());
            log.info("Found {} fundings for user: {}", fundings.size(), currentUser.getId());
            List<FundingDTO> dtos = fundings.stream()
                    .map(f -> new FundingDTO(f.getTitle(), f.getAmount(), f.getStatus(), f.getDate()))
                    .collect(Collectors.toList());
            log.info("Returning {} funding DTOs", dtos.size());
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching fundings", e);
            return ResponseEntity.ok(List.of());
        }
    }


    @PostMapping("/fundings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FundingDTO> createFunding(@RequestBody ProjectFunding funding) {
        try {

            User currentUser = profileService.getCurrentUserProfile();
            funding.setUser(currentUser);
            funding.setUserId(currentUser.getId());

            ProjectFunding savedFunding = projectFundingRepository.save(funding);
            FundingDTO dto = new FundingDTO(
                    savedFunding.getTitle(),
                    savedFunding.getAmount(),
                    savedFunding.getStatus(),
                    savedFunding.getDate()
            );
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error creating funding", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
