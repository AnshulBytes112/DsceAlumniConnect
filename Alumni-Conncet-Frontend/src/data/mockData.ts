import { createElement } from 'react';
import { Users, BookOpen, Calendar, Briefcase, Home, LayoutDashboard, History, HeartHandshake, Newspaper, Link, LogIn, Trophy, Star, Award, Heart } from 'lucide-react';

export const menuItems = [
    { label: 'Home', link: '/', ariaLabel: 'Go to Home', icon: createElement(Home, { className: 'w-5 h-5' }) },
    { label: 'Dashboard', link: '/dashboard', ariaLabel: 'Go to Dashboard', icon: createElement(LayoutDashboard, { className: 'w-5 h-5' }) },
    { label: 'Legacy', link: '#legacy', ariaLabel: 'View Legacy', icon: createElement(History, { className: 'w-5 h-5' }) },
    { label: 'Fundraising', link: '#fundraising', ariaLabel: 'View Fundraising', icon: createElement(HeartHandshake, { className: 'w-5 h-5' }) },
    { label: 'News', link: '#news', ariaLabel: 'View News', icon: createElement(Newspaper, { className: 'w-5 h-5' }) },
    { label: 'Events', link: '/dashboard/events', ariaLabel: 'View Events', icon: createElement(Calendar, { className: 'w-5 h-5' }) },
    { label: 'Quick Links', link: '#quick-links', ariaLabel: 'Quick Links', icon: createElement(Link, { className: 'w-5 h-5' }) },
    { label: 'Login / Join', link: '/login', ariaLabel: 'Login or Join', icon: createElement(LogIn, { className: 'w-5 h-5' }) },
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
    { 
        id: '1', 
        day: '12', 
        month: 'DEC', 
        title: 'Annual Alumni Reunion', 
        time: '10:00 AM - 5:00 PM',
        starttime: '10:00',
        endtime: '17:00',
        location: 'Main Auditorium',
        description: 'Join us for the biggest alumni gathering of the year with networking, dinner, and entertainment.',
        category: 'social',
        maxParticipants: 200,
        registrationDeadline: '2025-12-10',
        virtualLink: '',
        organizerName: 'DSCE Alumni Association',
        organizerContact: 'alumni@dsce.edu'
    },
    { 
        id: '2', 
        day: '05', 
        month: 'JAN', 
        title: 'Tech Talk: Future of AI', 
        time: '2:00 PM - 4:00 PM',
        starttime: '14:00',
        endtime: '16:00',
        location: 'Seminar Hall 1',
        description: 'An insightful talk on the latest developments in Artificial Intelligence and its impact on industry.',
        category: 'seminar',
        maxParticipants: 100,
        registrationDeadline: '2025-01-03',
        virtualLink: 'https://zoom.us/j/ai-talk',
        organizerName: 'Computer Science Department',
        organizerContact: 'cs@dsce.edu'
    },
    { 
        id: '3', 
        day: '20', 
        month: 'JAN', 
        title: 'Startup Mentorship Session', 
        time: '11:00 AM - 1:00 PM',
        starttime: '11:00',
        endtime: '13:00',
        location: 'Incubation Center',
        description: 'Connect with successful entrepreneurs and get guidance on your startup journey.',
        category: 'career',
        maxParticipants: 50,
        registrationDeadline: '2025-01-18',
        virtualLink: '',
        organizerName: 'Entrepreneurship Cell',
        organizerContact: 'ecell@dsce.edu'
    },
];

export const features = [
    { icon: Users, title: 'Network', desc: 'Connect with peers and seniors across industries.' },
    { icon: BookOpen, title: 'Mentorship', desc: 'Guide the next generation or find your own mentor.' },
    { icon: Briefcase, title: 'Jobs', desc: 'Apply for jobs and internships.' },
];

export const notableAlumni = [
    { name: 'Archana BS', batch: '1998', role: 'Asst. Commissioner of Police, Central Reserve Police Force (C.R.P.F), Govt. of India', image: 'https://pbs.twimg.com/profile_images/1221837516816306177/_Ld4un5A_400x400.jpg' },
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

export const mockAlumni = [
    {
        id: 1,
        name: 'Archana BS',
        graduationYear: 2004,
        department: 'Computer Science',
        location: 'New Delhi',
        company: 'Central Reserve Police Force (C.R.P.F)',
        position: 'Asst. Commissioner of Police',
        achievements: ['First IPS Officer from DSCE Batch 2004', 'National Police Medal for Excellence'],
        email: 'archana.bs@crpf.gov.in',
        linkedin: '#',
        image: '/alumni1(archana bs).jpg'
    },
    {
        id: 2,
        name: 'Avinash Chukka',
        graduationYear: 2008,
        department: 'Computer Science',
        location: 'United States',
        company: 'Cardlytics',
        position: 'Vice President of Products',
        achievements: ['Led Product Strategy for Fortune 500 Clients', 'Pioneered Data Analytics Platform'],
        email: 'avinash.chukka@cardlytics.com',
        linkedin: '#',
        image: '/alumni2(avinashchukka).jpg'
    },
    {
        id: 3,
        name: 'Ashutosh Pandey',
        graduationYear: 2019,
        department: 'Computer Science',
        location: 'Bangalore',
        company: 'AMD',
        position: 'Compiler Engineer',
        achievements: ['GSoC Contributor', 'LinkedIn Top Voice', 'SIH 2019 Winner', 'LLVM BLR Contributor'],
        email: 'ashutosh.pandey@amd.com',
        linkedin: '#',
        image: '/alumni3(ashutosh-pandey).jpg'
    },
    {
        id: 4,
        name: 'Nosthush Kenjige',
        graduationYear: 2015,
        department: 'Mechanical',
        location: 'United States',
        company: 'USA Cricket',
        position: 'Professional Cricket Player',
        achievements: ['Team USA Cricket Player', 'International Cricket Debut 2021'],
        email: 'nosthush.kenjige@usacricket.org',
        linkedin: '#',
        image: '/alumni4(nosthush kenjige).webp'
    },
    {
        id: 5,
        name: 'Vikram Singh',
        graduationYear: 2022,
        department: 'Civil',
        location: 'Delhi',
        company: 'L&T',
        position: 'Project Manager',
        achievements: ['Young Engineer Award 2023', 'Led Metro Project'],
        email: 'vikram.singh@example.com',
        linkedin: '#',
        image: null
    },
    {
        id: 6,
        name: 'Neha Gupta',
        graduationYear: 2017,
        department: 'Computer Science',
        location: 'San Francisco',
        company: 'Meta',
        position: 'Engineering Manager',
        achievements: ['Meta Leadership Award', 'Women in Tech Speaker'],
        email: 'neha.gupta@example.com',
        linkedin: '#',
        image: null
    }
];

export const landingTimelineEvents = [
    { year: "1979", title: "Foundation", desc: "DSCE established with vision of excellence in engineering education", side: "left" },
    { year: "1985", title: "First Graduation", desc: "First batch of engineers graduate, marking the beginning of our legacy", side: "right" },
    { year: "1995", title: "NBA Accreditation", desc: "First NBA accreditation, recognizing our quality standards", side: "left" },
    { year: "2005", title: "Research Excellence", desc: "Establishment of multiple research centers and labs", side: "right" },
    { year: "2015", title: "Autonomous Status", desc: "Granted autonomous status for curriculum innovation", side: "left" },
    { year: "2025", title: "Global Network", desc: "50,000+ alumni making impact across 35+ countries", side: "right" }
];

export const landingTestimonials = [
    {
        quote: "DSCE provided me not just with technical knowledge, but with the confidence to dream big and achieve even bigger. The foundation I got here took me to NASA.",
        name: "Priya Sharma",
        batch: "2010 ECE",
        role: "NASA Research Scientist",
        rating: 5
    },
    {
        quote: "The network I built at DSCE has been invaluable. From batchmates to seniors, everyone helped me grow my startup from idea to IPO.",
        name: "Amit Patel",
        batch: "2008 MECH",
        role: "Founder, GreenTech",
        rating: 5
    },
    {
        quote: "DSCE taught me to think differently, to challenge conventions. That mindset helped me lead innovation at one of the world's biggest tech companies.",
        name: "Sarah Johnson",
        batch: "2012 ISE",
        role: "VP, Google",
        rating: 5
    }
];

export const landingNotableAchievers = [
    {
        name: "Rajesh Kumar",
        batch: "2005 CSE",
        achievement: "CEO at TechCorp",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        icon: Trophy
    },
    {
        name: "Priya Sharma",
        batch: "2010 ECE",
        achievement: "NASA Research Scientist",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
        icon: Star
    },
    {
        name: "Amit Patel",
        batch: "2008 MECH",
        achievement: "Founder of GreenTech",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        icon: Award
    },
    {
        name: "Sarah Johnson",
        batch: "2012 ISE",
        achievement: "VP at Google",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        icon: Heart
    }
];

export const campusMemories = [
    "https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1569068348-f0b2e3a6482a?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1554469384-e58e5b4ce0e8?w=500&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=400&fit=crop"
];

export const landingFeatures = [
    { icon: Users, title: 'Networking', desc: 'Connect with 50,000+ alumni worldwide, build meaningful relationships, and expand your professional network.' },
    { icon: BookOpen, title: 'Mentorship', desc: 'Share your experience with current students and guide the next generation of DSCE engineers.' },
    { icon: Briefcase, title: 'Careers', desc: 'Access exclusive job opportunities, career guidance, and professional development resources.' },
];

export const alumniActivities = [
    { icon: Users, title: 'Mentorship Program', desc: 'Share your expertise with current students and help shape the next generation of DSCE engineers.', time: 'Year-round Program - Virtual & In-person' },
];

export const dashboardPosts = [
    {
        id: 1,
        author: 'Priya Sharma',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        role: 'Director, Google AI',
        graduationYear: 2015,
        department: 'Computer Science',
        content: 'Excited to announce that our team at Google is hiring for AI research roles! DSCE alumni, please reach out if you are interested. #AI #Hiring #Google',
        time: '2 hours ago',
        likes: 45,
        comments: 12,
        shares: 5,
        hashtags: ['AI', 'Hiring', 'Google'],
        mentions: [],
        media: [
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?w=600&h=400&fit=crop',
                alt: 'Google AI Research Lab'
            }
        ],
        initialComments: [
            {
                id: 'c1',
                author: 'Amit Patel',
                avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                role: 'Founder, GreenTech',
                content: 'This is amazing! I have a few friends who would be perfect for this role.',
                time: '1 hour ago',
                likes: 3
            },
            {
                id: 'c2',
                author: 'Sarah Johnson',
                avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
                role: 'VP, Vimeo',
                content: 'Congratulations on the new role expansion! The future of AI looks bright.',
                time: '30 mins ago',
                likes: 7
            }
        ]
    },
    {
        id: 2,
        author: 'Amit Patel',
        avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        role: 'Founder, GreenTech',
        graduationYear: 2012,
        department: 'Electronics & Communication',
        content: 'Just wrapped up a great session on sustainable energy at the campus. The students asked some brilliant questions! @DSCE_EnergyClub #Sustainability #GreenTech',
        time: '5 hours ago',
        likes: 32,
        comments: 8,
        shares: 3,
        hashtags: ['Sustainability', 'GreenTech'],
        mentions: ['DSCE_EnergyClub'],
        media: [
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
                alt: 'Sustainable Energy Session'
            },
            {
                type: 'image',
                url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop',
                alt: 'Students Discussion'
            }
        ],
        initialComments: [
            {
                id: 'c3',
                author: 'Prof. Kumar',
                avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
                role: 'Professor, DSCE',
                content: 'Thank you for inspiring our students! Your insights were invaluable.',
                time: '4 hours ago',
                likes: 12
            }
        ]
    },
    {
        id: 3,
        author: 'Sarah Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
        role: 'VP, Vimeo',
        content: 'Looking for a mentor in the video streaming space? I have a few slots open for this month. DM me! #Mentorship #CareerGrowth',
        time: '1 day ago',
        likes: 28,
        comments: 5,
        shares: 2,
        hashtags: ['Mentorship', 'CareerGrowth'],
        mentions: [],
        initialComments: []
    }
];
