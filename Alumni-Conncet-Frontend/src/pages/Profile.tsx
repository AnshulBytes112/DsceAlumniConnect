import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Edit, Mail, User, Bell, Shield, MapPin } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
        <div className="text-xl text-dsce-blue font-semibold">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Profile - DSCE Alumni Connect</title>
      </Helmet>
      
      <MotionWrapper className="p-6 pt-24 max-w-[1600px] mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-dsce-blue">My Profile</h1>
            <p className="text-dsce-text-dark">Manage your personal information and account settings.</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
               <Bell className="h-6 w-6 text-gray-600 hover:text-dsce-blue cursor-pointer transition-colors" />
               <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-dsce-bg-light"></span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Profile Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-8 text-center relative overflow-hidden shadow-lg">
              <div className="absolute top-4 right-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/dashboard/profile/edit-profile')}
                  className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/90 text-dsce-blue"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="relative mx-auto mb-6 h-32 w-32">
                <div className="absolute inset-0 bg-dsce-blue/20 rounded-full blur-xl"></div>
                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue p-[3px]">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                    {user?.profilePicture ? (
                        <img src={user.profilePicture} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <User className="h-16 w-16 text-dsce-blue/50" />
                    )}
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-dsce-text-dark mb-1">{user?.firstName} {user?.lastName}</h2>
              <p className="text-dsce-blue font-medium mb-6">{user?.headline || 'Alumni Member'}</p>
              
              <div className="flex flex-col gap-3 text-left bg-white/50 rounded-xl p-4 border border-dsce-blue/5">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-3 text-dsce-blue" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Shield className="h-4 w-4 mr-3 text-dsce-blue" />
                  <span>{user?.role || 'User'}</span>
                </div>
                 <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-3 text-dsce-blue" />
                  <span>Bangalore, India</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/dashboard/profile/edit-profile')}
                className="w-full mt-6 rounded-full bg-dsce-gold text-dsce-blue hover:bg-dsce-blue/80 hover:text-dsce-gold-hover transition-all font-semibold"
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Right Column - Details & Stats (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Profile Completion / Status */}
            <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-dsce-text-dark mb-4">Profile Status</h3>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-gray-700">Profile Completion</span>
                            <span className="text-dsce-blue font-bold">85%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-dsce-blue to-dsce-light-blue w-[85%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Complete your profile to get better recommendations.</p>
                        <Button 
                            onClick={() => navigate('/dashboard/profile/edit-profile')}
                            className="w-full mt-4 rounded-full bg-dsce-blue text-white hover:bg-dsce-gold-hover/80 hover:text-dsce-blue transition-all font-semibold text-sm"
                        >
                            Complete Profile
                        </Button>
                    </div>
                </div>
            </div>

            {/* Additional Info Sections */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-dsce-text-dark">Education</h3>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10">
                            <Edit className="h-4 w-4 text-gray-400" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-gray-800">Dayananda Sagar College of Engineering</p>
                            <p className="text-sm text-gray-600">Bachelor of Engineering - BE</p>
                            <p className="text-xs text-gray-400">2018 - 2022</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-dsce-text-dark">Experience</h3>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10">
                            <Edit className="h-4 w-4 text-gray-400" />
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <p className="font-semibold text-gray-800">Software Engineer</p>
                            <p className="text-sm text-gray-600">Tech Company Inc.</p>
                            <p className="text-xs text-gray-400">2022 - Present</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
