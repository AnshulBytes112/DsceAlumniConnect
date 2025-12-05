package com.dsce.AlumniConnect.config;

import com.dsce.AlumniConnect.Repository.AnnouncementRepository;
import com.dsce.AlumniConnect.Repository.EventRepository;
import com.dsce.AlumniConnect.entity.Announcement;
import com.dsce.AlumniConnect.entity.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

        private final AnnouncementRepository announcementRepository;
        private final EventRepository eventRepository;

        @Override
        public void run(String... args) throws Exception {
                // Clear existing data to ensure we don't have duplicates and to prove we are
                // using DB data
                announcementRepository.deleteAll();
                eventRepository.deleteAll();

                // Seed distinct data
                announcementRepository.save(new Announcement(null, "DB: Alumni Meetup 2025",
                                "Join us for the annual alumni meetup. (Fetched from Database)", "2 hours ago",
                                LocalDateTime.now()));
                announcementRepository.save(new Announcement(null, "DB: New Mentorship Program",
                                "We are launching a new mentorship program. (Fetched from Database)", "1 day ago",
                                LocalDateTime.now().minusDays(1)));
                announcementRepository.save(new Announcement(null, "DB: Campus Recruitment",
                                "Top tech companies are visiting. (Fetched from Database)", "2 days ago",
                                LocalDateTime.now().minusDays(2)));

                eventRepository.save(new Event(null, "DB: Annual Reunion", "12", "DEC", "10:00 AM", "Main Auditorium",
                                LocalDateTime.now().plusDays(7)));
                eventRepository.save(new Event(null, "DB: AI Tech Talk", "05", "JAN", "2:00 PM", "Seminar Hall 1",
                                LocalDateTime.now().plusDays(30)));
                eventRepository.save(new Event(null, "DB: Startup Session", "20", "JAN", "11:00 AM",
                                "Incubation Center", LocalDateTime.now().plusDays(45)));
        }
}
