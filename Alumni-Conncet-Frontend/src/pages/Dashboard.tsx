import { Sidebar } from '@/components/layout/Sidebar';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Calendar, MoreHorizontal, Bell, Clock } from 'lucide-react';
import { 
  dashboardStats, 
  dashboardAnnouncements, 
  dashboardUser, 
  dashboardProjectFundings, 
  dashboardJobApplications,
  upcomingEvents 
} from '@/data/mockData';

import MotionWrapper from '@/components/ui/MotionWrapper';

export default function Dashboard() {


  return (
    <div className="min-h-screen bg-brand-bg text-white">
      <Helmet>
        <title>Dashboard - DSCE Alumni Connect</title>
      </Helmet>
      <Sidebar />
      
      <MotionWrapper className="p-6 pt-24 max-w-[1600px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {dashboardUser.name.split(' ')[0]}</h1>
            <p className="text-brand-accent-light">Here's what's happening with your network today.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
               <Bell className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer transition-colors" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-brand-bg"></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile & Active Applications (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6 text-center relative overflow-hidden group">
              <div className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <div className="relative mx-auto mb-4 h-24 w-24">
                <div className="absolute inset-0 bg-brand-accent/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-brand-accent to-purple-600 p-[2px]">
                  <div className="h-full w-full rounded-full bg-brand-bg flex items-center justify-center text-2xl font-bold">
                    {dashboardUser.initials}
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 h-6 w-6 rounded-full border-4 border-brand-bg flex items-center justify-center">
                   <div className="h-2 w-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-xl font-bold">{dashboardUser.name}</h3>
              <p className="text-sm text-gray-400 mb-6">{dashboardUser.role}</p>
              
              <div className="grid grid-cols-3 gap-2 mb-6 border-t border-white/10 pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold">12</div>
                  <div className="text-xs text-gray-500">Applied</div>
                </div>
                <div className="text-center border-l border-white/10">
                  <div className="text-lg font-bold">56</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
                <div className="text-center border-l border-white/10">
                  <div className="text-lg font-bold">12</div>
                  <div className="text-xs text-gray-500">Events</div>
                </div>
              </div>
              
              <Button className="w-full rounded-full bg-white text-black hover:bg-brand-accent hover:text-white transition-all">
                View Profile
              </Button>
            </div>

            {/* Active Applications (Moved from Middle) */}
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
               <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Active Applications</h3>
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 w-8 rounded-full bg-gray-700 border-2 border-brand-bg flex items-center justify-center text-xs">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
                  <div className="h-8 w-8 rounded-full bg-brand-accent border-2 border-brand-bg flex items-center justify-center text-xs font-bold text-white">
                    +2
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {dashboardJobApplications.map((job, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-lg font-bold">
                        {job.company[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold">{job.role}</h4>
                        <p className="text-xs text-gray-400">{job.company}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === 'Interview' ? 'bg-yellow-500/20 text-yellow-300' :
                      job.status === 'Applied' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-red-500/20 text-red-300'
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
              {dashboardStats.slice(0, 2).map((stat, i) => {
                 const Icon = stat.icon;
                 const gradients = [
                   "from-blue-500 to-blue-300",
                   "from-indigo-500 to-indigo-300"
                 ];
                 return (
                   <div key={i} className={`rounded-3xl p-6 bg-gradient-to-br ${gradients[i]} text-white relative overflow-hidden group`}>
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
              })}
            </div>

            {/* Announcements (Moved from Left) */}
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Announcements</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-6">
                {dashboardAnnouncements.map((item) => (
                  <div key={item.id} className="relative pl-4 border-l-2 border-white/10 hover:border-brand-accent transition-colors">
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                    <span className="text-[10px] text-brand-accent mt-2 block">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Events & Fundings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Upcoming Events (My Meetings) */}
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Upcoming Events</h3>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-6">
                {upcomingEvents.slice(0, 3).map((event, i) => (
                  <div key={i} className="flex items-start group">
                    <div className="w-14 text-center mr-4 pt-1">
                      <div className="text-xs text-gray-400 uppercase">{event.month}</div>
                      <div className="text-lg font-bold">{event.day}</div>
                    </div>
                    <div className="flex-1 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                      <h4 className="font-semibold group-hover:text-brand-accent transition-colors">{event.title}</h4>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {event.time.split(' - ')[0]}
                      </div>
                    </div>
                    <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity -ml-4">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-center">
                <button className="text-sm text-brand-accent hover:text-white transition-colors flex items-center justify-center w-full">
                  See all events <MoreHorizontal className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>

            {/* Project Fundings (Developed Areas) */}
            <div className="bg-gradient-to-br from-brand-accent/10 to-brand-accent/5 border border-brand-accent/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold">Project Fundings</h3>
              </div>
              <div className="space-y-5">
                {dashboardProjectFundings.map((project, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{project.title}</span>
                      <span className="text-gray-400">{project.amount}</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          project.status === 'Approved' ? 'bg-green-500 w-full' :
                          project.status === 'Pending' ? 'bg-yellow-500 w-[60%]' :
                          'bg-blue-500 w-[40%]'
                        }`}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                       <span className={`text-[10px] uppercase font-bold ${
                          project.status === 'Approved' ? 'text-green-400' :
                          project.status === 'Pending' ? 'text-yellow-400' :
                          'text-blue-400'
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
