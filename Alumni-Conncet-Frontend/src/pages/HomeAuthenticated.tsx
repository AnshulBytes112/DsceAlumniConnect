import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Calendar, MoreHorizontal, Bell, Clock, Users, Briefcase, BookOpen, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient, type UserProfile } from '@/lib/api';
import { 
  dashboardUser 
} from '@/data/mockData';

import MotionWrapper from '@/components/ui/MotionWrapper';

// Define types for dashboard data
interface DashboardStats {
  jobsApplied: number;
  events: number;
  mentorships: number;
}

interface Announcement {
  id: number;
  title: string;
  description: string;
  time: string;
}

interface JobApplication {
  company: string;
  role: string;
  status: 'Applied' | 'Interview' | 'Rejected';
  date: string;
}

interface Event {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
}

interface ProjectFunding {
  title: string;
  amount: string;
  status: 'Approved' | 'Pending' | 'In Review';
  date: string;
}

export default function HomeAuthenticated() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    stats: DashboardStats | null;
    announcements: Announcement[];
    jobApplications: JobApplication[];
    events: Event[];
    fundings: ProjectFunding[];
  }>({
    stats: null,
    announcements: [],
    jobApplications: [],
    events: [],
    fundings: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch all data in parallel
        const [
          profile,
          stats,
          announcements,
          jobApplications,
          events,
          fundings
        ] = await Promise.all([
          apiClient.getProfile(),
          apiClient.getDashboardStats(),
          apiClient.getAnnouncements(),
          apiClient.getJobApplications(),
          apiClient.getUpcomingEvents(),
          apiClient.getProjectFundings()
        ]);

        setUserProfile(profile);
        setDashboardData({
          stats,
          announcements,
          jobApplications,
          events,
          fundings
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Use real user data or fallback to mock data
  const currentUser = userProfile ? {
    name: `${userProfile.firstName} ${userProfile.lastName}`,
    role: userProfile.headline || 'Alumni',
    initials: `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase(),
    avatar: userProfile.profilePicture
  } : dashboardUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Helmet>
        <title>Home - DSCE Alumni Connect</title>
      </Helmet>
      
      <MotionWrapper className="p-6 pt-24 max-w-[1600px] mx-auto">
        {/* Hero Section with Welcome */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Welcome back, <span className="text-brand-accent">{currentUser.name.split(' ')[0]}</span>
          </h1>
          <p className="text-xl text-brand-accent-light mb-8 max-w-3xl mx-auto">
            Your DSCE Alumni journey continues. Connect, grow, and make an impact.
          </p>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/dashboard">
              <Button className="w-full h-20 rounded-2xl bg-white text-black hover:bg-brand-accent hover:text-white transition-all text-lg font-semibold">
                <Briefcase className="mr-3 h-6 w-6" />
                View Dashboard
              </Button>
            </Link>
            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full h-20 rounded-2xl border-white/20 hover:bg-white hover:text-black transition-all text-lg font-semibold">
                <Users className="mr-3 h-6 w-6" />
                Update Profile
              </Button>
            </Link>
            <Link to="/dashboard/announcements">
              <Button variant="outline" className="w-full h-20 rounded-2xl border-white/20 hover:bg-white hover:text-black transition-all text-lg font-semibold">
                <Bell className="mr-3 h-6 w-6" />
                View Updates
              </Button>
            </Link>
          </div>
        </header>

        {/* Quick Stats Overview */}
        {dashboardData.stats && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Your Activity Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-blue-500 to-blue-300 rounded-3xl p-8 text-center">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-white/90" />
                <div className="text-4xl font-bold mb-2">{dashboardData.stats.jobsApplied}</div>
                <div className="text-lg font-medium opacity-90">Jobs Applied</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-300 rounded-3xl p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-white/90" />
                <div className="text-4xl font-bold mb-2">{dashboardData.stats.events}</div>
                <div className="text-lg font-medium opacity-90">Events Attended</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-300 rounded-3xl p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-white/90" />
                <div className="text-4xl font-bold mb-2">{dashboardData.stats.mentorships}</div>
                <div className="text-lg font-medium opacity-90">Mentorships</div>
              </div>
            </div>
          </section>
        )}

        {/* Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recent Announcements */}
          <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Recent Announcements</h3>
              <Link to="/dashboard/announcements">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.announcements.slice(0, 3).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <h4 className="font-semibold mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.description}</p>
                  <span className="text-xs text-brand-accent">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Upcoming Events</h3>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                  <Calendar className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.events.slice(0, 3).map((event, i) => (
                <div key={i} className="flex items-start p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-12 text-center mr-4 pt-1">
                    <div className="text-xs text-gray-400 uppercase">{event.month}</div>
                    <div className="text-lg font-bold">{event.day}</div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{event.title}</h4>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {event.time.split(' - ')[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-6">Ready to Engage More?</h2>
          <p className="text-xl text-brand-accent-light mb-8 max-w-2xl mx-auto">
            Explore opportunities, connect with fellow alumni, and stay updated with the latest from DSCE.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full px-8 py-4 bg-white text-black hover:bg-brand-accent hover:text-white transition-all">
                Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/dashboard/profile">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-4 border-white/20 hover:bg-white hover:text-black transition-all">
                Update Profile
              </Button>
            </Link>
          </div>
        </section>
      </MotionWrapper>
    </div>
  );
}
