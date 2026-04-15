import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { 
  MapPin, 
  Mail, 
  Shield, 
  Bell, 
  Edit, 
  Download, 
  Share2, 
  Briefcase, 
  GraduationCap as GradCap, 
  FolderKanban, 
  Award, 
  Code, 
  Linkedin, 
  Globe, 
  Phone,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'http://localhost:8080';

type TabType = 'overview' | 'experience' | 'education' | 'portfolio' | 'expertise';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        setProfileData(profile);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleDownloadResume = async () => {
    if (!user?.id) return;
    try {
      const blob = await apiClient.downloadResume(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Resume_${user.firstName}_${user.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download resume:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dsce-bg-light flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xl text-dsce-blue font-semibold flex flex-col items-center"
        >
          <div className="h-12 w-12 border-4 border-dsce-blue border-t-dsce-gold rounded-full animate-spin mb-4"></div>
          Restoring Profile...
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Shield },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GradCap },
    { id: 'portfolio', label: 'Portfolio', icon: FolderKanban },
    { id: 'expertise', label: 'Expertise', icon: Code },
  ];

  const profileScore = (() => {
    if (!user) return 0;
    let score = 0;
    if (user.firstName) score += 10;
    if (user.lastName) score += 10;
    if (user.headline) score += 10;
    if (user.location) score += 10;
    if (user.profilePicture) score += 10;
    if (user.resumeUrl) score += 10;
    if (user.educations && user.educations.length > 0) score += 15;
    if (user.workExperiences && user.workExperiences.length > 0) score += 15;
    if (user.skills && user.skills.length > 0) score += 10;
    return Math.min(score, 100);
  })();

  return (
    <div className="min-h-screen bg-dsce-bg-light text-gray-800 pb-20">
      <Helmet>
        <title>{user?.firstName} {user?.lastName} - Profile | DSCE Alumni Connect</title>
      </Helmet>
      
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 animate-profile-gradient bg-gradient-to-br from-dsce-blue via-[#003366] to-dsce-gold opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-dsce-gold/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-dsce-blue/30 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative max-w-[1400px] mx-auto h-full px-6 flex flex-col justify-end pb-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                {/* Profile Picture */}
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative group"
                >
                    <div className="h-40 w-40 rounded-3xl p-[4px] bg-white/20 backdrop-blur-md shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-dsce-gold to-white/0 opacity-50"></div>
                        <div className="h-full w-full rounded-[20px] bg-white flex items-center justify-center overflow-hidden border border-white/30">
                            {user?.profilePicture ? (
                                <img src={`${API_BASE_URL}/${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                                    <span className="text-white text-5xl font-bold">
                                        {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    {user?.verificationStatus === 'APPROVED' && (
                        <div className="absolute -bottom-2 -right-2 bg-dsce-gold text-dsce-blue p-1.5 rounded-full shadow-lg border-2 border-white">
                            <CheckCircle2 className="h-5 w-5 fill-dsce-blue text-dsce-gold" />
                        </div>
                    )}
                </motion.div>

                {/* Basic Details */}
                <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="flex-1 text-center md:text-left space-y-2 mb-2"
                >
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight drop-shadow-md">
                            {user?.firstName} {user?.lastName}
                        </h1>
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-bold text-dsce-gold uppercase tracking-wider">
                            {user?.role || 'Alumni'}
                        </span>
                    </div>
                    <p className="text-xl text-dsce-bg-cream/90 font-medium max-w-2xl">
                        {user?.headline || 'Connecting generations of excellence'}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-white/80 text-sm font-medium">
                        {user?.location && (
                            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <MapPin className="h-4 w-4 text-dsce-gold" />
                                {user.location}
                            </div>
                        )}
                        {user?.department && (
                            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <GradCap className="h-4 w-4 text-dsce-gold" />
                                {user.department} {user?.graduationYear ? `'${user.graduationYear.toString().slice(-2)}` : ''}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex items-center gap-3"
                >
                    <Button 
                        onClick={() => navigate('/dashboard/profile/edit-profile')}
                        className="rounded-xl bg-dsce-gold text-dsce-blue hover:bg-white transition-all font-bold px-6 h-12 shadow-xl shadow-dsce-gold/20"
                    >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-white/20 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-dsce-blue h-12 w-12"
                        >
                            <Share2 className="h-5 w-5" />
                        </Button>
                        <Bell className="h-6 w-6 text-white/80 hover:text-dsce-gold cursor-pointer transition-colors ml-4" />
                    </div>
                </motion.div>
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-3">
                <div className="glass-card rounded-3xl p-6 shadow-xl space-y-8 sticky top-24">
                    {/* Tabs */}
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Navigation</p>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as TabType)}
                                className={cn(
                                    "w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group",
                                    activeTab === tab.id 
                                        ? "bg-dsce-blue text-white shadow-lg shadow-dsce-blue/20" 
                                        : "hover:bg-dsce-blue/5 text-gray-500 hover:text-dsce-blue"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <tab.icon className={cn("h-5 w-5", activeTab === tab.id ? "text-dsce-gold" : "text-gray-400 group-hover:text-dsce-blue")} />
                                    <span className="font-semibold text-sm">{tab.label}</span>
                                </div>
                                {activeTab === tab.id && (
                                    <motion.div layoutId="activeTabIndicator">
                                        <ChevronRight className="h-4 w-4 text-dsce-gold" />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Completion Status */}
                    <div className="pt-6 border-t border-gray-100">
                        <div className="flex justify-between items-end mb-3">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Profile Strength</p>
                                <p className="text-sm font-bold text-dsce-blue">
                                    {profileScore < 50 ? 'Beginner' : profileScore < 90 ? 'Intermediate' : 'Professional'}
                                </p>
                            </div>
                            <span className="text-xl font-black text-dsce-blue">{profileScore}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${profileScore}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full bg-gradient-to-r from-dsce-blue to-dsce-gold"
                            ></motion.div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                            {profileScore < 100 
                                ? "Adding more details increases your visibility to the network."
                                : "Your profile is state-of-the-art! Go explore the network."
                            }
                        </p>
                    </div>

                    {/* Resume Card (if exists) */}
                    {user?.resumeUrl && (
                        <div className="p-4 bg-dsce-blue/5 rounded-2xl border border-dsce-blue/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-dsce-blue text-dsce-gold rounded-xl">
                                    <FolderKanban className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-dsce-blue">Resume</p>
                                    <p className="text-[10px] text-gray-500">Professional CV</p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleDownloadResume}
                                className="w-full bg-dsce-blue text-white hover:bg-dsce-blue/90 rounded-xl h-10 text-xs font-bold"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download CV
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card rounded-3xl p-8 shadow-xl min-h-[600px]"
                    >
                        {activeTab === 'overview' && (
                            <div className="space-y-10">
                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-6 flex items-center gap-3">
                                        <Shield className="h-6 w-6 text-dsce-gold" />
                                        Professional Biography
                                    </h3>
                                    <div className="p-6 bg-dsce-bg-cream/50 border border-dsce-blue/5 rounded-2xl">
                                        <p className="text-gray-600 leading-relaxed italic text-lg">
                                            {user?.bio || "No professional biography added yet. Update your profile to tell your story."}
                                        </p>
                                    </div>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Contact Information</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 hover:bg-dsce-blue/5 rounded-2xl transition-colors border border-transparent hover:border-dsce-blue/10">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-dsce-blue">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-gray-400 capitalize underline-offset-4 underline">Email Address</p>
                                                    <p className="text-sm font-semibold text-dsce-blue">{user?.email}</p>
                                                </div>
                                            </div>
                                            {user?.contactNumber && (
                                                <div className="flex items-center gap-4 p-4 hover:bg-dsce-blue/5 rounded-2xl transition-colors border border-transparent hover:border-dsce-blue/10">
                                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-dsce-blue">
                                                        <Phone className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 capitalize underline-offset-4 underline">Contact Number</p>
                                                        <p className="text-sm font-semibold text-dsce-blue">{user.contactNumber}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {user?.linkedinProfile && (
                                                <div className="flex items-center gap-4 p-4 hover:bg-dsce-blue/5 rounded-2xl transition-colors border border-transparent hover:border-dsce-blue/10 cursor-pointer" onClick={() => window.open(user.linkedinProfile, '_blank')}>
                                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#0077b5]">
                                                        <Linkedin className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 capitalize underline-offset-4 underline">LinkedIn Profile</p>
                                                        <p className="text-sm font-semibold text-dsce-blue flex items-center gap-1">
                                                            Professional Profile <ExternalLink className="h-3 w-3" />
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {user?.website && (
                                                <div className="flex items-center gap-4 p-4 hover:bg-dsce-blue/5 rounded-2xl transition-colors border border-transparent hover:border-dsce-blue/10 cursor-pointer" onClick={() => window.open(user.website, '_blank')}>
                                                    <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-dsce-blue">
                                                        <Globe className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 capitalize underline-offset-4 underline">Personal Website</p>
                                                        <p className="text-sm font-semibold text-dsce-blue flex items-center gap-1">
                                                            View Website <ExternalLink className="h-3 w-3" />
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    <section>
                                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">Network Activity</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-dsce-blue to-[#003366] p-6 rounded-3xl text-white shadow-lg overflow-hidden relative group">
                                                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                <p className="text-xs font-bold text-dsce-gold mb-1">Status</p>
                                                <p className="text-xl font-black">Active</p>
                                            </div>
                                            <div className="bg-white border border-dsce-blue/10 p-6 rounded-3xl shadow-sm text-dsce-blue relative overflow-hidden group">
                                                 <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-dsce-gold/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                                <p className="text-xs font-bold text-gray-400 mb-1">Joined</p>
                                                <p className="text-xl font-black">{user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 p-6 glass-card-dark rounded-3xl border-2 border-dashed border-dsce-blue/10 flex flex-col items-center justify-center gap-2">
                                            <p className="text-xs font-bold text-gray-400">Collaborations</p>
                                            <p className="text-sm text-center text-dsce-blue/60 italic font-medium px-4">Open to mentoring and project collaborations.</p>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-8 flex items-center gap-3">
                                        <Briefcase className="h-6 w-6 text-dsce-gold" />
                                        Professional Journey
                                    </h3>
                                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-4 before:bottom-0 before:w-[2px] before:bg-gradient-to-b before:from-dsce-blue before:via-dsce-gold before:to-transparent">
                                        {profileData?.workExperiences && profileData.workExperiences.length > 0 ? (
                                            profileData.workExperiences.map((exp, index) => (
                                                <motion.div 
                                                    key={index}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="relative pl-12 group"
                                                >
                                                    <div className="absolute left-0 top-1 h-10 w-10 rounded-full bg-white border-4 border-dsce-blue flex items-center justify-center z-10 group-hover:scale-110 transition-transform shadow-md">
                                                        <Briefcase className="h-4 w-4 text-dsce-blue" />
                                                    </div>
                                                    <div className="p-6 bg-white border border-dsce-blue/5 rounded-2xl group-hover:border-dsce-blue/20 group-hover:shadow-xl group-hover:shadow-dsce-blue/5 transition-all">
                                                        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                            <div>
                                                                <h4 className="text-xl font-black text-dsce-blue">{exp.jobTitle}</h4>
                                                                <p className="text-dsce-gold font-bold">{exp.company}</p>
                                                            </div>
                                                            <span className="px-3 py-1 bg-dsce-blue/5 rounded-full text-xs font-bold text-dsce-blue border border-dsce-blue/10">
                                                                {exp.currentlyWorking ? 'PRESENT' : exp.date || (exp.month && exp.year ? `${exp.month} ${exp.year}` : 'Date not provided')}
                                                            </span>
                                                        </div>
                                                        {exp.descriptions && exp.descriptions.length > 0 && (
                                                            <ul className="space-y-3">
                                                                {exp.descriptions.map((desc, i) => (
                                                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                                                                        <div className="h-1.5 w-1.5 rounded-full bg-dsce-gold mt-1.5 shrink-0"></div>
                                                                        {desc}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="ml-12 p-10 glass-card-dark rounded-3xl border-2 border-dashed border-dsce-blue/10 text-center">
                                                <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">Your professional journey is waiting to be shared.</p>
                                                <Button 
                                                    variant="ghost" 
                                                    className="mt-2 text-dsce-blue font-bold hover:bg-transparent hover:underline"
                                                    onClick={() => navigate('/dashboard/profile/edit-profile')}
                                                >
                                                    Add Experience
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'education' && (
                            <div className="space-y-8">
                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-8 flex items-center gap-3">
                                        <GradCap className="h-6 w-6 text-dsce-gold" />
                                        Educational Background
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profileData?.educations && profileData.educations.length > 0 ? (
                                            profileData.educations.map((edu, index) => (
                                                <motion.div 
                                                    key={index}
                                                    whileHover={{ y: -5 }}
                                                    className="p-6 bg-white border border-dsce-blue/5 rounded-3xl shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
                                                >
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-dsce-gold/5 rounded-bl-full transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform duration-500"></div>
                                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 text-dsce-blue border border-gray-50">
                                                        <GradCap className="h-6 w-6" />
                                                    </div>
                                                    <h4 className="text-lg font-black text-dsce-blue mb-1">{edu.school}</h4>
                                                    <p className="text-dsce-gold font-bold mb-4">{edu.degree}</p>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Timeline</span>
                                                            <span className="text-xs font-black text-dsce-blue">
                                                                {edu.date || (edu.year ? `Class of ${edu.year}` : 'N/A')}
                                                            </span>
                                                        </div>
                                                        {edu.gpa && (
                                                            <div className="text-right">
                                                                <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Score</span>
                                                                <span className="block text-sm font-black text-dsce-blue">{edu.gpa}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="col-span-full p-10 glass-card-dark rounded-3xl border-2 border-dashed border-dsce-blue/10 text-center">
                                                <GradCap className="h-10 w-10 text-gray-300 mx-auto mb-4" />
                                                <p className="text-gray-500 font-medium">Add your educational milestones to complete your profile.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'portfolio' && (
                            <div className="space-y-12">
                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-8 flex items-center gap-3">
                                        <FolderKanban className="h-6 w-6 text-dsce-gold" />
                                        Featured Projects
                                    </h3>
                                    <div className="space-y-6">
                                        {profileData?.projects && profileData.projects.length > 0 ? (
                                            profileData.projects.map((proj, index) => (
                                                <motion.div 
                                                    key={index}
                                                    className="group p-8 bg-gradient-to-br from-white to-gray-50/50 border border-dsce-blue/5 rounded-[40px] hover:border-dsce-blue/20 transition-all shadow-sm hover:shadow-2xl hover:shadow-dsce-blue/5 overflow-hidden relative"
                                                >
                                                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-dsce-blue/5 rounded-full blur-3xl group-hover:bg-dsce-gold/10 transition-colors"></div>
                                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black text-dsce-gold uppercase tracking-[0.3em]">Project {index + 1}</p>
                                                            <h4 className="text-2xl font-black text-dsce-blue">{proj.project}</h4>
                                                        </div>
                                                        <span className="px-4 py-2 bg-white rounded-2xl text-xs font-black text-dsce-blue shadow-sm border border-gray-100 flex items-center gap-2">
                                                            <FolderKanban className="h-3 w-3 text-dsce-gold" />
                                                            {proj.date || "Completed"}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {proj.descriptions?.map((desc, i) => (
                                                            <p key={i} className="text-gray-600 leading-relaxed font-medium">
                                                                {desc}
                                                            </p>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="p-10 glass-card-dark rounded-3xl border-2 border-dashed border-dsce-blue/10 text-center">
                                                <p className="text-gray-500 font-medium">Showcase your best work here.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-8 flex items-center gap-3">
                                        <Award className="h-6 w-6 text-dsce-gold" />
                                        Industry Achievements
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {profileData?.achievements && profileData.achievements.length > 0 ? (
                                            profileData.achievements.map((ach, index) => (
                                                <div key={index} className="flex gap-4 p-6 bg-dsce-blue/5 rounded-3xl border border-dsce-blue/10 relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                                        <Award className="h-20 w-20" />
                                                    </div>
                                                    <div className="h-12 w-12 shrink-0 bg-dsce-blue text-dsce-gold rounded-2xl flex items-center justify-center shadow-lg">
                                                        <Award className="h-6 w-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-dsce-blue mb-1">{ach.title}</h4>
                                                        <p className="text-xs text-gray-500 font-bold mb-3">{ach.date}</p>
                                                        <p className="text-sm text-gray-600 leading-relaxed font-medium">{ach.description}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-full p-10 glass-card-dark rounded-3xl border-2 border-dashed border-dsce-blue/10 text-center">
                                                <p className="text-gray-500 font-medium">Highlight your accolades and awards.</p>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'expertise' && (
                            <div className="space-y-12">
                                <section>
                                    <h3 className="text-2xl font-black text-dsce-blue mb-8 flex items-center gap-3">
                                        <Code className="h-6 w-6 text-dsce-gold" />
                                        Core Expertise
                                    </h3>
                                    <div className="flex flex-wrap gap-4 mt-6">
                                        {user?.skills && user.skills.length > 0 ? (
                                            user.skills.map((skill, index) => (
                                                <motion.span 
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="px-6 py-3 bg-white border border-dsce-blue/10 rounded-2xl shadow-sm text-sm font-bold text-dsce-blue hover:border-dsce-gold hover:text-dsce-gold transition-all flex items-center gap-2 group"
                                                >
                                                    <div className="h-1.5 w-1.5 rounded-full bg-dsce-blue group-hover:bg-dsce-gold transition-colors"></div>
                                                    {skill}
                                                </motion.span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 font-medium p-10 glass-card-dark rounded-3xl w-full text-center border-2 border-dashed border-dsce-blue/10">
                                                List your primary skills and competencies.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                {profileData?.featuredSkills && profileData.featuredSkills.length > 0 && (
                                    <section>
                                        <h3 className="text-2xl font-black text-dsce-blue mb-8">Skill Proficiency</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {profileData.featuredSkills.map((fs, index) => (
                                                <div key={index} className="space-y-3">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-base font-black text-dsce-blue">{fs.skill}</span>
                                                        <span className="text-xs font-bold text-dsce-gold uppercase tracking-tighter">Level {(fs.rating || 0) * 20}%</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-50">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${(fs.rating || 0) * 20}%` }}
                                                            viewport={{ once: true }}
                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                            className="h-full bg-gradient-to-r from-dsce-blue to-dsce-gold rounded-full"
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}
