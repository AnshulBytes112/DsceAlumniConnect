import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Edit, Mail, User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <Helmet>
        <title>Profile - DSCE Alumni Connect</title>
      </Helmet>
      
      <MotionWrapper className="p-6 pt-24 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003366] mb-2">My Profile</h1>
          <p className="text-[#333333]">Manage your alumni profile and information</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Overview Card */}
          <div className="bg-white border border-[#003366]/10 rounded-xl shadow-sm">
            <div className="border-b border-[#003366]/10 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-[#003366] flex items-center text-lg font-semibold">
                  <Edit className="mr-2 h-5 w-5" />
                  Profile Overview
                </h3>
                <Button
                  className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700]"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 rounded-full bg-[#003366] flex items-center justify-center border-4 border-[#FFD700]">
                    <User className="h-12 w-12 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-[#003366] mb-2">
                    {'Alumni Member'}
                  </h2>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center text-[#333333]">
                      <Mail className="mr-2 h-4 w-4 text-[#003366]" />
                      {user?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white border border-[#003366]/10 rounded-xl shadow-sm">
            <div className="p-6">
              <div className="grid gap-4">
                <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] w-full">
                  Complete Profile Setup
                </Button>
                <Button variant="outline" className="border-[#003366]/10 text-[#333333] hover:bg-[#F8F8F8] w-full">
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
