import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Calendar, MoreHorizontal, Bell, Clock, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiClient, type UserProfile } from '@/lib/api';

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
import { 
  dashboardUser 
} from '@/data/mockData';

import MotionWrapper from '@/components/ui/MotionWrapper';

export default function Dashboard() {
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
      <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Dashboard - DSCE Alumni Connect</title>
      </Helmet>
      
      <MotionWrapper className="p-6 pt-24 max-w-[1600px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dsce-blue">Welcome back, {currentUser.name.split(' ')[0]}</h1>
            <p className="text-dsce-text-dark">Here's what's happening with your network today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
               <Bell className="h-6 w-6 text-gray-600 hover:text-dsce-blue cursor-pointer transition-colors" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-dsce-bg-light"></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Active Applications (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 text-center relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-4 right-4 text-gray-600 hover:text-dsce-blue cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <div className="relative mx-auto mb-4 h-24 w-24">
                <div className="absolute inset-0 bg-dsce-blue/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue p-[2px]">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-2xl font-bold text-dsce-blue">
                    {currentUser.initials}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-4 border-white flex items-center justify-center">
                   <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-dsce-text-dark">{currentUser.name}</h3>
              <p className="text-sm text-gray-600 mb-6">{currentUser.role}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6 border-t border-dsce-blue/10 pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-dsce-blue">12</div>
                  <div className="text-xs text-gray-600">Applied</div>
                </div>
                <div className="text-center border-l border-dsce-blue/10">
                  <div className="text-lg font-bold text-dsce-blue">56</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center border-l border-dsce-blue/10">
                  <div className="text-lg font-bold text-dsce-blue">12</div>
                  <div className="text-xs text-gray-600">Events</div>
                </div>
              </div>
              
              <Button className="w-full rounded-full bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all font-semibold">
                View Profile
              </Button>
            </div>

            {/* Active Applications */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
               <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Active Applications</h3>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-400 border-2 border-white flex items-center justify-center text-xs text-white">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded-full bg-dsce-blue border-2 border-white flex items-center justify-center text-xs font-bold text-white">
                    +2
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {dashboardData.jobApplications.map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-dsce-blue/10 hover:border-dsce-light-blue/50 transition-colors group shadow-sm hover:shadow-md">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-dsce-blue/10 flex items-center justify-center text-lg font-bold text-dsce-blue">
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-dsce-text-dark">{job.role}</h4>
                        <p className="text-xs text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Interview' ? 'bg-dsce-gold/20 text-dsce-blue' :
                      job.status === 'Applied' ? 'bg-dsce-light-blue/20 text-dsce-blue' :
                      'bg-red-500/20 text-red-700'
                    }`}>
                      {job.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Column - Stats & Announcements (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Gradient Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dashboardData.stats ? [
                { label: 'Jobs Applied', value: dashboardData.stats.jobsApplied.toString(), icon: Briefcase },
                { label: 'Events', value: dashboardData.stats.events.toString(), icon: Calendar }
              ].map((stat, i) => {
                 const Icon = stat.icon;
                 const gradients = [
                   "from-dsce-blue to-dsce-light-blue",
                   "from-dsce-blue to-dsce-gold"
                 ];
                 return (
                   <div key={i} className={`rounded-3xl p-6 bg-gradient-to-br ${gradients[i]} text-white relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300`}>
                      <div className="absolute top-4 right-4 bg-white/20 p-2 rounded-full backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-white/90" />
                      </div>
                      <div className="mt-8">
                        <div className="text-4xl font-bold mb-1">{stat.value}</div>
                        <div className="text-sm font-medium opacity-90">{stat.label}</div>
                      </div>
                      <div className="mt-4 h-1 w-full bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/40 w-[70%] rounded-full"></div>
                      </div>
                   </div>
                 );
              }) : (
                // Loading skeleton for stats
                [1, 2].map((i) => (
                  <div key={i} className="rounded-3xl p-6 bg-dsce-blue/10 animate-pulse">
                    <div className="h-32"></div>
                  </div>
                ))
              )}
            </div>

            {/* Announcements */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Announcements</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10">
                  <MoreHorizontal className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-6">
                {dashboardData.announcements.map((item) => (
                  <div key={item.id} className="relative pl-4 border-l-2 border-dsce-blue/10 hover:border-dsce-light-blue transition-colors">
                    <h4 className="text-sm font-semibold text-dsce-text-dark">{item.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-dsce-blue mt-2 block">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Events & Fundings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Upcoming Events</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10">
                  <Calendar className="h-4 w-4 text-gray-600" />
                </Button>
              </div>
              <div className="space-y-6">
                {dashboardData.events.slice(0, 3).map((event, i) => (
                  <div key={i} className="flex items-start group">
                    <div className="w-14 text-center mr-4 pt-1">
                      <div className="text-xs text-gray-600 uppercase">{event.month}</div>
                      <div className="text-lg font-bold text-dsce-blue">{event.day}</div>
                    </div>
                    <div className="flex-1 pb-6 border-b border-dsce-blue/10 last:border-0 last:pb-0">
                      <h4 className="font-semibold text-dsce-text-dark group-hover:text-dsce-light-blue transition-colors">{event.title}</h4>
                      <div className="flex items-center text-xs text-gray-600 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {event.time.split(' - ')[0]}
                      </div>
                    </div>
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -ml-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-dsce-blue/10 text-center">
                <button className="text-sm text-dsce-blue hover:text-dsce-light-blue transition-colors flex items-center justify-center w-full">
                  See all events <MoreHorizontal className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Project Fundings */}
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-dsce-text-dark">Project Fundings</h3>
              </div>
              <div className="space-y-5">
                {dashboardData.fundings.map((project, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-dsce-text-dark">{project.title}</span>
                      <span className="text-gray-600">{project.amount}</span>
                    </div>
                    <div className="h-2 w-full bg-dsce-blue/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          project.status === 'Approved' ? 'bg-green-500 w-full' :
                          project.status === 'Pending' ? 'bg-dsce-gold w-[60%]' :
                          'bg-dsce-light-blue w-[40%]'
                        }`}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                       <span className={`text-[10px] uppercase font-bold ${
                          project.status === 'Approved' ? 'text-green-600' :
                          project.status === 'Pending' ? 'text-dsce-blue' :
                          'text-dsce-blue'
                       }`}>{project.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
