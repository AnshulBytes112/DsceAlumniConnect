package com.dsce.AlumniConnect.config;

import com.dsce.AlumniConnect.Repository.AnnouncementRepository;
import com.dsce.AlumniConnect.entity.Announcement;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

        private final AnnouncementRepository announcementRepository;

        public DataSeeder(AnnouncementRepository announcementRepository) {
                this.announcementRepository = announcementRepository;
        }

        @Override
        public void run(String... args) throws Exception {
                if (announcementRepository.count() == 0) {
                        announcementRepository.save(new Announcement("DB: Alumni Meetup 2025",
                                        "Join us for the annual alumni meetup. (Fetched from Database)", "2 hours ago",
                                        LocalDateTime.now()));
                        announcementRepository.save(new Announcement("DB: New Mentorship Program",
                                        "We are launching a new mentorship program. (Fetched from Database)", "1 day ago",
                                        LocalDateTime.now().minusDays(1)));
                        announcementRepository.save(new Announcement("DB: Campus Recruitment",
                                        "Top tech companies are visiting. (Fetched from Database)", "2 days ago",
                                        LocalDateTime.now().minusDays(2)));
                }
        }
}
