import { Users, BookOpen, Calendar, Briefcase } from 'lucide-react';

export const menuItems = [
    { label: 'Home', link: '/', ariaLabel: 'Go to Home' },
    { label: 'Legacy', link: '#legacy', ariaLabel: 'View Legacy' },
    { label: 'Fundraising', link: '#fundraising', ariaLabel: 'View Fundraising' },
    { label: 'News', link: '#news', ariaLabel: 'View News' },
    { label: 'Events', link: '#events', ariaLabel: 'View Events' },
    { label: 'Login / Join', link: '/login', ariaLabel: 'Login or Join' },
    { label: 'Quick Links', link: '#quick-links', ariaLabel: 'Quick Links' },
];

export const fundraisingProjects = [
    { title: 'New Research Lab', goal: '$50,000', raised: '$35,000', desc: 'Building a state-of-the-art AI research facility for students.' },
    { title: 'Scholarship Fund', goal: '$20,000', raised: '$12,500', desc: 'Supporting meritorious students from underprivileged backgrounds.' },
    { title: 'Green Campus Initiative', goal: '$15,000', raised: '$5,000', desc: 'Planting trees and installing solar panels across the campus.' },
];

export const latestNews = [
    { title: 'DSCE Wins National Innovation Award', date: 'Nov 15, 2024', desc: 'Our students secured first place in the National Tech Hackathon.' },
    { title: 'Alumni Meet 2024 Announced', date: 'Oct 28, 2024', desc: 'Join us this December for the biggest alumni gathering of the decade.' },
    { title: 'New Partnership with Tech Giants', date: 'Sep 10, 2024', desc: 'DSCE signs MoUs with leading tech companies for student internships.' },
    { title: 'Campus Expansion Plans Revealed', date: 'Aug 05, 2024', desc: 'A new academic block is set to be inaugurated next year.' },
];

export const upcomingEvents = [
    { day: '12', month: 'DEC', title: 'Annual Alumni Reunion', time: '10:00 AM - 5:00 PM', location: 'Main Auditorium' },
    { day: '05', month: 'JAN', title: 'Tech Talk: Future of AI', time: '2:00 PM - 4:00 PM', location: 'Seminar Hall 1' },
    { day: '20', month: 'JAN', title: 'Startup Mentorship Session', time: '11:00 AM - 1:00 PM', location: 'Incubation Center' },
];

export const features = [
    { icon: Users, title: 'Network', desc: 'Connect with peers and seniors across industries.' },
    { icon: BookOpen, title: 'Mentorship', desc: 'Guide the next generation or find your own mentor.' },
    { icon: Briefcase, title: 'Jobs', desc: 'Apply for jobs and internships.' },
];

export const notableAlumni = [
    { name: 'Satya Nadella', batch: '1988', role: 'CEO, Microsoft', image: 'https://pbs.twimg.com/profile_images/1221837516816306177/_Ld4un5A_400x400.jpg' },
    { name: 'K. S. Ivan', batch: '1995', role: 'Founder, TechCorp', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { name: 'Priya Sharma', batch: '2005', role: 'Director, Google AI', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { name: 'Rahul Dravid', batch: '1990', role: 'Head Coach, Indian Cricket Team', image: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Rahul_Dravid_in_2023.jpg' },
    { name: 'Anjali Sud', batch: '2004', role: 'CEO, Vimeo', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
];

export const dashboardStats = [
    { label: 'Jobs Applied', value: '12', icon: Briefcase, color: 'brand-accent' },
    { label: 'Events', value: '3', icon: Calendar, color: 'blue-400' },
    { label: 'Mentorships', value: '2', icon: BookOpen, color: 'green-400' },
];

export const dashboardAnnouncements = [
    {
        id: 1,
        title: 'Alumni Meetup 2025',
        description: 'Join us for the annual alumni meetup at the main campus auditorium. Connect with fellow graduates and professors.',
        time: '2 hours ago',
    },
    {
        id: 2,
        title: 'New Mentorship Program',
        description: 'We are launching a new mentorship program for recent graduates. Sign up now to become a mentor or mentee.',
        time: '1 day ago',
    },
    {
        id: 3,
        title: 'Campus Recruitment Drive',
        description: 'Top tech companies are visiting the campus next week. Update your profiles and get ready for interviews.',
        time: '2 days ago',
    },
];

export const dashboardUser = {
    name: 'John Doe',
    role: 'Class of 2023 • CSE',
    initials: 'JD',
    avatar: 'https://github.com/shadcn.png',
};

export const dashboardProjectFundings = [
    { title: 'AI Research Grant', amount: '$50,000', status: 'Approved', date: '2024-01-15' },
    { title: 'Green Campus Initiative', amount: '$15,000', status: 'Pending', date: '2024-02-10' },
    { title: 'Tech Innovation Fund', amount: '$25,000', status: 'In Review', date: '2024-03-05' },
];

export const dashboardJobApplications = [
    { company: 'Google', role: 'Frontend Engineer', status: 'Interview', date: '2024-03-01' },
    { company: 'Microsoft', role: 'SDE II', status: 'Applied', date: '2024-02-28' },
    { company: 'Amazon', role: 'Full Stack Dev', status: 'Rejected', date: '2024-02-15' },
    { company: 'Netflix', role: 'Senior UI Engineer', status: 'Applied', date: '2024-03-10' },
];

export const mockCredentials = {
    email: 'test@example.com',
    password: 'password123',
    user: {
        id: 'mock-user-id',
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        profilePicture: null,
        jwtToken: 'mock-jwt-token',
    }
};
