import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bell, Shield, Moon, ChevronRight, LogOut, Mail, Smartphone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Settings - DSCE Alumni Connect</title>
      </Helmet>

      <div className="max-w-[1600px] mx-auto p-6 pt-32">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-dsce-blue">Settings</h1>
          <p className="text-dsce-text-dark mt-2">Manage your account preferences and configurations.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-dsce-blue/10 sticky top-32">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-dsce-blue text-white shadow-md' 
                          : 'text-gray-600 hover:bg-dsce-blue/5 hover:text-dsce-blue'
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-dsce-gold' : ''}`} />
                        <span className="font-medium">{tab.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-dsce-gold" />}
                    </button>
                  );
                })}
              </nav>
              
              <div className="mt-8 pt-8 border-t border-gray-100 px-4 pb-4">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-lg border border-dsce-blue/10 min-h-[500px]"
              >
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-dsce-text-dark mb-4">Profile Settings</h2>
                      <p className="text-gray-500">Manage your public profile information.</p>
                    </div>
                    
                    <div className="bg-dsce-blue/5 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-dsce-blue text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
                          <User />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-dsce-text-dark">Your Profile</h3>
                          <p className="text-sm text-gray-500">Update your photo and personal details</p>
                        </div>
                      </div>
                      <Button onClick={() => navigate('/dashboard/profile/edit-profile')}>
                        Edit Profile
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-lg text-dsce-text-dark">Account Type</h3>
                      <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-medium">Alumni Account</p>
                          <p className="text-sm text-gray-500">Verified Member</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Active</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-dsce-text-dark mb-4">Notification Preferences</h2>
                      <p className="text-gray-500">Choose how you want to be notified.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="flex items-start">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mr-4">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Email Notifications</h3>
                            <p className="text-sm text-gray-500">Receive updates about events and announcements</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="flex items-start">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mr-4">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Push Notifications</h3>
                            <p className="text-sm text-gray-500">Receive notifications on your device</p>
                          </div>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-dsce-text-dark mb-4">Security</h2>
                      <p className="text-gray-500">Protect your account and data.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="flex items-start">
                          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg mr-4">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Password</h3>
                            <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                          </div>
                        </div>
                        <Button variant="outline">Change Password</Button>
                      </div>

                      <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                        <div className="flex items-start">
                          <div className="p-2 bg-green-100 text-green-600 rounded-lg mr-4">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-dsce-text-dark mb-4">Appearance</h2>
                      <p className="text-gray-500">Customize the look and feel.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 border-2 border-dsce-blue rounded-2xl bg-white text-left relative overflow-hidden group">
                        <div className="absolute top-2 right-2 text-dsce-blue">
                          <Check className="w-5 h-5" />
                        </div>
                        <div className="w-full h-24 bg-gray-100 rounded-xl mb-3 border border-gray-200"></div>
                        <span className="font-medium text-gray-900">Light Mode</span>
                      </button>
                      <button className="p-4 border-2 border-transparent hover:border-gray-200 rounded-2xl bg-gray-50 text-left transition-all">
                        <div className="w-full h-24 bg-gray-800 rounded-xl mb-3"></div>
                        <span className="font-medium text-gray-900">Dark Mode</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component for check icon
const Check = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Settings;
