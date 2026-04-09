package com.dsce.AlumniConnect.Controller;

import com.dsce.AlumniConnect.Repository.UserRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.User;
import com.dsce.AlumniConnect.entity.Event;
import com.dsce.AlumniConnect.DTO.EventDTO;
import com.dsce.AlumniConnect.DTO.ErrorResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDate;
import java.time.Period;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;

   @GetMapping("/analytics")
public ResponseEntity<?> getAnalytics() {
    try {
        List<User> users = userRepository.findAll();
        List<User> alumniUsers = users.stream()
                .filter(user -> user.getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalAlumni", alumniUsers.size());

        Map<String, Integer> experienceRanges = new LinkedHashMap<>();
        experienceRanges.put("0-2", 0);
        experienceRanges.put("3-5", 0);
        experienceRanges.put("6-10", 0);
        experienceRanges.put("10+", 0);

        // Define formats once, reuse everywhere
        List<DateTimeFormatter> formatters = List.of(
            DateTimeFormatter.ofPattern("yyyy-MM-dd"),
            DateTimeFormatter.ofPattern("yyyy/MM/dd"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy"),
            DateTimeFormatter.ofPattern("dd-MM-yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm")
        );

        double totalExperienceMonths = 0;
        int experienceCount = 0;
        Map<String, Integer> companies = new HashMap<>();
        Map<String, Integer> departments = new HashMap<>();

        for (User user : alumniUsers) {
            // Count departments
            if (user.getDepartment() != null && !user.getDepartment().isBlank()) {
                String department = user.getDepartment();
                departments.put(department, departments.getOrDefault(department, 0) + 1);
            }

            // Parse experience - try month/year first, then date string
            if (user.getWorkExperiences() == null || user.getWorkExperiences().isEmpty()) continue;

            User.WorkExperience firstExperience = user.getWorkExperiences().get(0);
            LocalDate startDate = null;
            String dateStr = null;

            // Try to parse from month/year fields first
            if (firstExperience.getMonth() != null && firstExperience.getYear() != null) {
                startDate = parseDateFromMonthYear(firstExperience);
                dateStr = firstExperience.getMonth() + " " + firstExperience.getYear();
                log.info("Parsed date from month/year for user {}: {} {} -> {}", 
                    user.getId(), firstExperience.getMonth(), firstExperience.getYear(), startDate);
            }

            // Fallback to date string parsing
            if (startDate == null && firstExperience.getDate() != null && !firstExperience.getDate().isBlank()) {
                dateStr = firstExperience.getDate().trim();
                startDate = tryParseDate(dateStr, formatters);
                log.info("Parsed date from string for user {}: '{}' -> {}", user.getId(), dateStr, startDate);
            }

            if (startDate == null) {
                log.warn("Could not parse date for user {} from any source", user.getId());
                continue;
            }

            if (startDate.isAfter(LocalDate.now())) {
                log.warn("Future start date for user {}: {}", user.getId(), startDate);
                continue;
            }

            Period period = Period.between(startDate, LocalDate.now());
            int years = period.getYears();
            int months = period.getMonths();
            double yearsOfExperience = years + (months / 12.0);

            totalExperienceMonths += (years * 12) + months;
            experienceCount++;

            // Categorize experience
            if (yearsOfExperience <= 2) {
                experienceRanges.put("0-2", experienceRanges.getOrDefault("0-2", 0) + 1);
            } else if (yearsOfExperience <= 5) {
                experienceRanges.put("3-5", experienceRanges.getOrDefault("3-5", 0) + 1);
            } else if (yearsOfExperience <= 10) {
                experienceRanges.put("6-10", experienceRanges.getOrDefault("6-10", 0) + 1);
            } else {
                experienceRanges.put("10+", experienceRanges.getOrDefault("10+", 0) + 1);
            }

            // Count companies
            if (firstExperience.getCompany() != null && !firstExperience.getCompany().isBlank()) {
                String company = firstExperience.getCompany().trim();
                companies.put(company, companies.getOrDefault(company, 0) + 1);
            }

            log.info("Parsed date for user {}: '{}' -> {}", user.getId(), dateStr, startDate);
        }

        // Average experience
        String averageExperienceFormatted;
        if (experienceCount == 0) {
            averageExperienceFormatted = "0 years";
        } else {
            double avgTotalMonths = totalExperienceMonths / experienceCount;
            long avgYears = (long) Math.floor(avgTotalMonths / 12);
            long avgMonths = Math.round(avgTotalMonths % 12);
            averageExperienceFormatted = avgMonths > 0
                ? String.format("%d years %d months", avgYears, avgMonths)
                : String.format("%d years", avgYears);
        }
        analytics.put("averageExperience", averageExperienceFormatted);

        // Top companies
        List<Map<String, Object>> topCompanies = companies.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(entry -> Map.<String, Object>of("company", entry.getKey(), "count", entry.getValue()))
                .collect(Collectors.toList());
        analytics.put("topCompanies", topCompanies);

        // Departments
        List<Map<String, Object>> departmentsList = departments.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .map(entry -> Map.<String, Object>of("department", entry.getKey(), "count", entry.getValue()))
                .collect(Collectors.toList());
        analytics.put("departments", departmentsList);

        // Experience distribution (preserve order)
        List<Map<String, Object>> experienceDistribution = experienceRanges.entrySet().stream()
                .map(entry -> Map.<String, Object>of("range", entry.getKey(), "count", entry.getValue()))
                .collect(Collectors.toList());
        analytics.put("experienceDistribution", experienceDistribution);

        // Recent graduates (within 2 years)
        int currentYear = LocalDate.now().getYear();
        int recentGraduates = (int) alumniUsers.stream()
                .filter(u -> u.getGraduationYear() != null && u.getGraduationYear() >= currentYear - 2)
                .count();
        analytics.put("recentGraduates", recentGraduates);

        // Senior alumni (5+ years) — use month/year parsing for consistency
        int seniorAlumni = (int) alumniUsers.stream()
                .filter(u -> u.getWorkExperiences() != null && !u.getWorkExperiences().isEmpty())
                .filter(u -> {
                    User.WorkExperience exp = u.getWorkExperiences().get(0);
                    LocalDate startDate = null;
                    
                    // Try month/year first
                    if (exp.getMonth() != null && exp.getYear() != null) {
                        startDate = parseDateFromMonthYear(exp);
                    }
                    
                    // Fallback to date string
                    if (startDate == null && exp.getDate() != null && !exp.getDate().isBlank()) {
                        startDate = tryParseDate(exp.getDate().trim(), formatters);
                    }
                    
                    return startDate != null && startDate.isBefore(LocalDate.now().minusYears(5));
                })
                .count();
        analytics.put("seniorAlumni", seniorAlumni);

        return ResponseEntity.ok(analytics);

    } catch (Exception e) {
        log.error("Error fetching analytics: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to fetch analytics"));
    }
}

// Helper: try each formatter, return first successful parse or null
private LocalDate tryParseDate(String dateStr, List<DateTimeFormatter> formatters) {
    for (DateTimeFormatter fmt : formatters) {
        try {
            return LocalDate.parse(dateStr, fmt);
        } catch (Exception ignored) {}
    }
    return null;
}

// Helper: parse date from month and year fields
private LocalDate parseDateFromMonthYear(User.WorkExperience experience) {
    if (experience.getMonth() != null && experience.getYear() != null) {
        try {
            // Map month names to numbers
            Map<String, Integer> monthMap = new HashMap<>();
            monthMap.put("Jan", 1);
            monthMap.put("January", 1);
            monthMap.put("Feb", 2);
            monthMap.put("February", 2);
            monthMap.put("Mar", 3);
            monthMap.put("March", 3);
            monthMap.put("Apr", 4);
            monthMap.put("April", 4);
            monthMap.put("May", 5);
            monthMap.put("Jun", 6);
            monthMap.put("June", 6);
            monthMap.put("Jul", 7);
            monthMap.put("July", 7);
            monthMap.put("Aug", 8);
            monthMap.put("August", 8);
            monthMap.put("Sep", 9);
            monthMap.put("September", 9);
            monthMap.put("Oct", 10);
            monthMap.put("October", 10);
            monthMap.put("Nov", 11);
            monthMap.put("November", 11);
            monthMap.put("Dec", 12);
            monthMap.put("December", 12);
            
            String monthStr = experience.getMonth().trim();
            int month = monthMap.getOrDefault(monthStr, 1); // Default to January if not found
            
            // Handle numeric month
            try {
                month = Integer.parseInt(monthStr);
                if (month < 1 || month > 12) month = 1;
            } catch (NumberFormatException e) {
                // Keep mapped month or default
            }
            
            // Convert year string to integer
            int year = experience.getYear();
            
            return LocalDate.of(year, month, 1);
        } catch (Exception e) {
            log.warn("Error parsing month/year for experience: {}", e.getMessage());
        }
    }
    return null;
}

    @GetMapping("/verifications")
    public ResponseEntity<?> getAllVerifications() {
        try {
            List<User> users = userRepository.findAll();
            List<User> allUsers = users.stream()
                    .filter(user -> user.getRole() != User.Role.ADMIN && user.getRole() != User.Role.ADMIN)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(allUsers);
        } catch (Exception e) {
            log.error("Error fetching verifications: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to fetch verifications"));
        }
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approveUser(@PathVariable String userId) {
        try {
            java.util.Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setVerificationStatus(User.VerificationStatus.APPROVED);
                userRepository.save(user);
                log.info("User {} approved", userId);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found"));
            }
        } catch (Exception e) {
            log.error("Error approving user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to approve user"));
        }
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<?> rejectUser(@PathVariable String userId) {
        try {
            java.util.Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                user.setVerificationStatus(User.VerificationStatus.REJECTED);
                userRepository.save(user);
                log.info("User {} rejected", userId);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found"));
            }
        } catch (Exception e) {
            log.error("Error rejecting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to reject user"));
        }
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventDTO>> getAllEventsForAdmin() {
        try {
            List<Event> events = eventRepository.findAll();
            List<EventDTO> eventDTOs = events.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(eventDTOs);
        } catch (Exception e) {
            log.error("Error fetching events for admin: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(List.of());
        }
    }

    @PostMapping("/events/{eventId}/feature")
    public ResponseEntity<EventDTO> featureEvent(@PathVariable String eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            event.setFeatured(true);
            Event savedEvent = eventRepository.save(event);
            log.info("Event {} featured by admin", eventId);
            return ResponseEntity.ok(convertToDTO(savedEvent));
        } catch (Exception e) {
            log.error("Error featuring event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/events/{eventId}/unfeature")
    public ResponseEntity<EventDTO> unfeatureEvent(@PathVariable String eventId) {
        try {
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            event.setFeatured(false);
            Event savedEvent = eventRepository.save(event);
            log.info("Event {} unfeatured by admin", eventId);
            return ResponseEntity.ok(convertToDTO(savedEvent));
        } catch (Exception e) {
            log.error("Error unfeaturing event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable String eventId) {
        try {
            if (!eventRepository.existsById(eventId)) {
                return ResponseEntity.notFound().build();
            }
            eventRepository.deleteById(eventId);
            log.info("Event {} deleted by admin", eventId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting event: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private EventDTO convertToDTO(Event event) {
        EventDTO dto = new EventDTO();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDay(event.getDay());
        dto.setMonth(event.getMonth());
        dto.setStarttime(event.getStarttime());
        dto.setEndtime(event.getEndtime());
        dto.setTime(event.getTime());
        dto.setDescription(event.getDescription());
        dto.setCategory(event.getCategory());
        dto.setMaxParticipants(event.getMaxParticipants());
        dto.setRegistrationDeadline(event.getRegistrationDeadline());
        dto.setVirtualLink(event.getVirtualLink());
        dto.setOrganizerName(event.getOrganizerName());
        dto.setOrganizerContact(event.getOrganizerContact());
        dto.setLocation(event.getLocation());
        dto.setFeatured(event.isFeatured());
        return dto;
    }

    // Temporary endpoint for testing - Create admin user
    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdminUser() {
        try {
            // This is a temporary endpoint for testing purposes
            // In production, this should be removed or properly secured
            return ResponseEntity.ok("Admin user creation endpoint available for testing");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create admin user: " + e.getMessage());
        }
    }
}
