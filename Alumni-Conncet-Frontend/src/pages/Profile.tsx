import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import {
  MapPin, Mail, Shield, Bell, Edit,
  Phone, GraduationCap, Linkedin, Globe,
  CheckCircle2, Clock, XCircle,
  Wrench, Star, FolderKanban, Trophy,
} from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';

const API_BASE_URL = 'http://localhost:8080';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

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
                      <img src={`${API_BASE_URL}/${user.profilePicture}`} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                        <span className="text-white text-3xl font-bold">
                          {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'}
                        </span>
                      </div>
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
                  <MapPin className="h-4 w-4 mr-3 text-dsce-blue flex-shrink-0" />
                  <span>{user?.location || 'Location not set'}</span>
                </div>
                {profileData?.contactNumber && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-3 text-dsce-blue flex-shrink-0" />
                    <span>{profileData.contactNumber}</span>
                  </div>
                )}
                {profileData?.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="h-4 w-4 mr-3 text-dsce-blue flex-shrink-0" />
                    <span>{profileData.department}{profileData.graduationYear ? ` · ${profileData.graduationYear}` : ''}</span>
                  </div>
                )}
              </div>

              {/* Verification Badge */}
              {profileData?.verificationStatus && (
                <div className="flex justify-center mt-3">
                  {profileData.verificationStatus === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-200">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verified Alumni
                    </span>
                  )}
                  {profileData.verificationStatus === 'PENDING' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Clock className="h-3.5 w-3.5" /> Verification Pending
                    </span>
                  )}
                  {profileData.verificationStatus === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-200">
                      <XCircle className="h-3.5 w-3.5" /> Verification Rejected
                    </span>
                  )}
                </div>
              )}

              {/* Social Links */}
              {(profileData?.linkedinProfile || profileData?.website) && (
                <div className="flex flex-col gap-2 mt-3">
                  {profileData.linkedinProfile && (
                    <a
                      href={profileData.linkedinProfile.startsWith('http') ? profileData.linkedinProfile : `https://${profileData.linkedinProfile}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                    >
                      <Linkedin className="h-4 w-4" /> LinkedIn Profile
                    </a>
                  )}
                  {profileData.website && (
                    <a
                      href={profileData.website.startsWith('http') ? profileData.website : `https://${profileData.website}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <Globe className="h-4 w-4" /> Personal Website
                    </a>
                  )}
                </div>
              )}

              <Button
                onClick={() => navigate('/dashboard/profile/edit-profile')}
                className="w-full mt-6 rounded-full bg-dsce-gold text-dsce-blue hover:bg-dsce-blue/80 hover:text-dsce-gold-hover transition-all font-semibold"
              >
                Edit Profile
              </Button>
            </div>

            {/* About / Bio */}
            {profileData?.bio && (
              <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-dsce-text-dark">About</h3>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10" onClick={() => navigate('/dashboard/profile/edit-profile')}>
                    <Edit className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{profileData.bio}</p>
              </div>
            )}

            {/* Skills & Expertise */}
            <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-dsce-blue" />
                  <h3 className="font-bold text-dsce-text-dark">Skills & Expertise</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10" onClick={() => navigate('/dashboard/profile/edit-profile')}>
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              {profileData?.skills && profileData.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-dsce-blue/10 text-dsce-blue text-xs font-medium rounded-full border border-dsce-blue/20 hover:bg-dsce-blue/20 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No skills added yet.</p>
              )}
              {profileData?.featuredSkills && profileData.featuredSkills.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Featured Skills</p>
                  {profileData.featuredSkills.map((fs, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{fs.skill}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} className={`h-3.5 w-3.5 ${s < (fs.rating ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                    <span className="text-dsce-blue font-bold">
                      {(() => {
                        if (!user) return 0;
                        let score = 0;

                        // Basic Info (40%)
                        if (user.firstName) score += 10;
                        if (user.lastName) score += 10;
                        if (user.headline) score += 10;
                        if (user.location) score += 10;

                        // Assets (20%)
                        if (user.profilePicture) score += 10;
                        if (user.resumeUrl) score += 10;

                        // Details (40%)
                        if (user.educations && user.educations.length > 0) score += 15;
                        if (user.workExperiences && user.workExperiences.length > 0) score += 15;
                        if (user.skills && user.skills.length > 0) score += 10;

                        return Math.min(score, 100);
                      })()}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-dsce-blue to-dsce-light-blue rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${(() => {
                          if (!user) return 0;
                          let score = 0;
                          // Basic Info
                          if (user.firstName) score += 10;
                          if (user.lastName) score += 10;
                          if (user.headline) score += 10;
                          if (user.location) score += 10;
                          // Assets
                          if (user.profilePicture) score += 10;
                          if (user.resumeUrl) score += 10;
                          // Details
                          if (user.educations && user.educations.length > 0) score += 15;
                          if (user.workExperiences && user.workExperiences.length > 0) score += 15;
                          if (user.skills && user.skills.length > 0) score += 10;
                          return Math.min(score, 100);
                        })()}%`
                      }}
                    ></div>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10"
                    onClick={() => navigate('/dashboard/profile/edit-profile')}
                  >
                    <Edit className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {profileData?.educations && profileData.educations.length > 0 ? (
                    profileData.educations.map((edu, index) => (
                      <div key={index}>
                        <p className="font-semibold text-gray-800">{edu.school}</p>
                        <p className="text-sm text-gray-600">{edu.degree}</p>
                        <p className="text-xs text-gray-400">{edu.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No education details added.</p>
                  )}
                </div>
              </div>

              <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-dsce-text-dark">Experience</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10"
                    onClick={() => navigate('/dashboard/profile/edit-profile')}
                  >
                    <Edit className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {profileData?.workExperiences && profileData.workExperiences.length > 0 ? (
                    profileData.workExperiences.map((exp, index) => (
                      <div key={index}>
                        <p className="font-semibold text-gray-800">{exp.jobTitle}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-xs text-gray-400">{exp.date}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No experience details added.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-dsce-blue" />
                  <h3 className="font-bold text-dsce-text-dark">Projects</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10" onClick={() => navigate('/dashboard/profile/edit-profile')}>
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              {profileData?.projects && profileData.projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profileData.projects.map((proj, index) => (
                    <div key={index} className="rounded-2xl border border-dsce-blue/10 bg-dsce-blue/[0.02] p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{proj.project}</p>
                        <FolderKanban className="h-4 w-4 text-dsce-blue/40 flex-shrink-0 ml-2" />
                      </div>
                      {proj.date && <p className="text-xs text-gray-400 mb-2">{proj.date}</p>}
                      {proj.descriptions && proj.descriptions.length > 0 && (
                        <ul className="space-y-0.5">
                          {proj.descriptions.map((d, di) => (
                            <li key={di} className="text-xs text-gray-500 list-disc list-inside">{d}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No projects added yet.</p>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-dsce-blue" />
                  <h3 className="font-bold text-dsce-text-dark">Achievements</h3>
                </div>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-dsce-blue/10" onClick={() => navigate('/dashboard/profile/edit-profile')}>
                  <Edit className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
              {profileData?.achievements && profileData.achievements.length > 0 ? (
                <div className="space-y-3">
                  {profileData.achievements.map((ach, index) => (
                    <div key={index} className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-transparent border border-yellow-100 hover:border-yellow-200 transition-colors">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{ach.title}</p>
                        {ach.description && <p className="text-xs text-gray-600 mt-0.5">{ach.description}</p>}
                        {ach.date && <p className="text-xs text-gray-400 mt-1">{ach.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No achievements added yet.</p>
              )}
            </div>
          </div>
        </div>
      </MotionWrapper>
    </div>
  );
}
