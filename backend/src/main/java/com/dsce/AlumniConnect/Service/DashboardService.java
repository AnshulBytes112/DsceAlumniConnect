package com.dsce.AlumniConnect.Service;

import com.dsce.AlumniConnect.DTO.AnnouncementDTO;
import com.dsce.AlumniConnect.DTO.DashboardStatsDTO;
import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.DTO.FundingDTO;
import com.dsce.AlumniConnect.DTO.JobApplicationDTO;
import com.dsce.AlumniConnect.Repository.AnnouncementRepository;
import com.dsce.AlumniConnect.Repository.JobApplicationRepository;
import com.dsce.AlumniConnect.Repository.ProjectFundingRepository;
import com.dsce.AlumniConnect.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * DashboardService
 * Consolidates all dashboard-related business logic
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProfileService profileService;
    private final EventService eventService;
    private final AnnouncementRepository announcementRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ProjectFundingRepository projectFundingRepository;

    /**
     * Get dashboard statistics for current user
     */
    public DashboardStatsDTO getDashboardStats() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            int jobsApplied = jobApplicationRepository.findByUserId(currentUser.getId()).size();
            int events = eventService.getEventsUserIsAttending().size();
            int mentorships = 0;

            return new DashboardStatsDTO(jobsApplied, events, mentorships);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats", e);
            return new DashboardStatsDTO(0, 0, 0);
        }
    }

    /**
     * Get all announcements as DTOs
     */
    public List<AnnouncementDTO> getAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(a -> new AnnouncementDTO(
                        a.getId(),
                        a.getTitle(),
                        a.getDescription(),
                        a.getTime(),
                        a.getImageUrl(),
                        a.isFeatured()))
                .collect(Collectors.toList());
    }

    /**
     * Get job applications for current user
     */
    public List<JobApplicationDTO> getCurrentUserJobApplications() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            return jobApplicationRepository.findByUserId(currentUser.getId()).stream()
                    .map(j -> new JobApplicationDTO(j.getCompany(), j.getRole(), j.getStatus(), j.getAppliedAt().toString()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching job applications", e);
            return List.of();
        }
    }

    /**
     * Get project fundings
     */
    public List<FundingDTO> getProjectFundings() {
        try {
            return projectFundingRepository.findAll().stream()
                    .map(f -> new FundingDTO(f.getTitle(), f.getAmount(), f.getStatus(), f.getDate()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching project fundings", e);
            return List.of();
        }
    }

    /**
     * Get events current user is attending
     */
    public List<EventDTO> getCurrentUserEvents() {
        try {
            User currentUser = profileService.getCurrentUserProfile();
            log.info("Getting events for user: {}", currentUser.getId());

            List<EventDTO> events = eventService.getEventsUserIsAttending();
            log.info("Found {} events user is attending", events.size());

            return events;
        } catch (Exception e) {
            log.error("Error fetching user events", e);
            return List.of();
        }
    }
}
