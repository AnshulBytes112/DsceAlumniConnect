import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import {
    MapPin, Mail, Linkedin, Globe, Briefcase, GraduationCap,
    Award, FolderKanban, Code, ArrowLeft, Shield, CheckCircle2
} from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';

const API_BASE_URL = 'http://localhost:8080';

export default function AlumniDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [alumniData, setAlumniData] = useState<UserProfile | null>(null);

    useEffect(() => {
        const fetchAlumni = async () => {
            if (!id) return;
            try {
                const data = await apiClient.getAlumniById(id);
                setAlumniData(data);
            } catch (error) {
                console.error('Failed to fetch alumni data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlumni();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="text-xl text-dsce-blue font-semibold animate-pulse">Loading Alumni Profile...</div>
            </div>
        );
    }

    if (!alumniData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-dsce-blue/10 text-center max-w-md">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="h-10 w-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-dsce-text-dark mb-2">Alumni Not Found</h2>
                    <p className="text-gray-500 mb-8">
                        The alumni profile you're looking for doesn't exist or has been removed.
                    </p>
                    <Button onClick={() => navigate('/alumni')} className="w-full bg-dsce-blue text-white hover:bg-dsce-blue/90">
                        Back to Directory
                    </Button>
                </div>
            </div>
        );
    }

    const fullName = `${alumniData.firstName} ${alumniData.lastName}`;
    const profilePicUrl = alumniData.profilePicture
        ? (alumniData.profilePicture.startsWith('http') ? alumniData.profilePicture : `${API_BASE_URL}/${alumniData.profilePicture}`)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
            <Helmet>
                <title>{fullName} - Alumni Detail</title>
            </Helmet>

            <MotionWrapper className="p-6 pt-24 max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/alumni')}
                    className="mb-8 text-dsce-blue hover:bg-dsce-blue/5 flex items-center gap-2 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Directory
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Info Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-xl text-center relative overflow-hidden">
                            <div className="relative mx-auto mb-6 h-40 w-40">
                                <div className="absolute inset-0 bg-dsce-blue/20 rounded-full blur-2xl"></div>
                                <div className="relative h-full w-full rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue p-[4px]">
                                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                        {profilePicUrl ? (
                                            <img src={profilePicUrl} alt={fullName} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                                                <span className="text-white text-4xl font-bold">
                                                    {alumniData.firstName[0]}{alumniData.lastName[0]}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-dsce-text-dark mb-2">{fullName}</h1>
                            <p className="text-dsce-blue font-semibold mb-6 flex items-center justify-center gap-2">
                                {alumniData.headline || 'Member'}
                                {alumniData.verificationStatus === 'APPROVED' && (
                                    <CheckCircle2 className="h-4 w-4 text-green-500 fill-green-500/10" />
                                )}
                            </p>

                            <div className="flex flex-col gap-4 text-left bg-dsce-bg-light/50 rounded-2xl p-6 border border-dsce-blue/5">
                                <div className="flex items-center text-sm text-gray-700">
                                    <Mail className="h-5 w-5 mr-3 text-dsce-blue" />
                                    <span className="truncate font-medium">{alumniData.email}</span>
                                </div>
                                {alumniData.location && (
                                    <div className="flex items-center text-sm text-gray-700">
                                        <MapPin className="h-5 w-5 mr-3 text-dsce-blue" />
                                        <span className="font-medium">{alumniData.location}</span>
                                    </div>
                                )}
                                {alumniData.graduationYear && (
                                    <div className="flex items-center text-sm text-gray-700">
                                        <GraduationCap className="h-5 w-5 mr-3 text-dsce-blue" />
                                        <span className="font-medium">Class of {alumniData.graduationYear} • {alumniData.department}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8 justify-center">
                                {alumniData.linkedinProfile && (
                                    <a href={alumniData.linkedinProfile} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-12 w-12 rounded-full border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue/5">
                                            <Linkedin className="h-5 w-5" />
                                        </Button>
                                    </a>
                                )}
                                {alumniData.website && (
                                    <a href={alumniData.website} target="_blank" rel="noopener noreferrer">
                                        <Button variant="outline" size="sm" className="h-12 w-12 rounded-full border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue/5">
                                            <Globe className="h-5 w-5" />
                                        </Button>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Details Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* About / Bio */}
                        {alumniData.bio && (
                            <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                                <h2 className="text-xl font-bold text-dsce-text-dark mb-4 flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-dsce-blue" />
                                    About
                                </h2>
                                <p className="text-gray-700 leading-relaxed font-light whitespace-pre-wrap">
                                    {alumniData.bio}
                                </p>
                            </section>
                        )}

                        {/* Experience */}
                        <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                            <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-dsce-blue" />
                                Experience
                            </h2>
                            {alumniData.workExperiences && alumniData.workExperiences.length > 0 ? (
                                <div className="space-y-8">
                                    {alumniData.workExperiences.map((exp, idx) => (
                                        <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-gray-100 last:before:hidden">
                                            <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-dsce-blue ring-4 ring-dsce-blue/10"></div>
                                            <h3 className="font-bold text-lg text-gray-900">{exp.jobTitle}</h3>
                                            <p className="text-dsce-blue font-medium">{exp.company}</p>
                                            <p className="text-sm text-gray-400 mb-3">{exp.date}</p>
                                            <ul className="space-y-2">
                                                {exp.descriptions?.map((desc, i) => (
                                                    <li key={i} className="text-gray-600 text-sm list-disc list-inside">
                                                        {desc}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No professional experience listed.</p>
                            )}
                        </section>

                        {/* Education */}
                        <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                            <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                <GraduationCap className="h-6 w-6 text-dsce-blue" />
                                Education
                            </h2>
                            {alumniData.educations && alumniData.educations.length > 0 ? (
                                <div className="space-y-8">
                                    {alumniData.educations.map((edu, idx) => (
                                        <div key={idx} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-px before:bg-gray-100 last:before:hidden">
                                            <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full bg-dsce-gold ring-4 ring-dsce-gold/10"></div>
                                            <h3 className="font-bold text-lg text-gray-900">{edu.school}</h3>
                                            <p className="text-dsce-blue font-medium">{edu.degree}</p>
                                            <p className="text-sm text-gray-400 mb-2">{edu.date}</p>
                                            {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic">No education details listed.</p>
                            )}
                        </section>

                        {/* Sub-sections grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Projects */}
                            <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                                <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                    <FolderKanban className="h-6 w-6 text-dsce-blue" />
                                    Projects
                                </h2>
                                {alumniData.projects && alumniData.projects.length > 0 ? (
                                    <div className="space-y-6">
                                        {alumniData.projects.map((proj, idx) => (
                                            <div key={idx}>
                                                <h3 className="font-bold text-gray-900">{proj.project}</h3>
                                                <p className="text-xs text-gray-400 mb-2">{proj.date}</p>
                                                <ul className="space-y-1">
                                                    {proj.descriptions?.slice(0, 2).map((desc, i) => (
                                                        <li key={i} className="text-gray-600 text-xs list-disc list-inside truncate">
                                                            {desc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">No projects listed.</p>
                                )}
                            </section>

                            {/* Skills */}
                            <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                                <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                    <Code className="h-6 w-6 text-dsce-blue" />
                                    Skills
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {alumniData.skills && alumniData.skills.length > 0 ? (
                                        alumniData.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-dsce-blue/5 text-dsce-blue rounded-full text-xs font-semibold border border-dsce-blue/10">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic text-sm">No skills listed.</p>
                                    )}
                                </div>

                                {alumniData.featuredSkills && alumniData.featuredSkills.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Featured Skills</h3>
                                        <div className="space-y-4">
                                            {alumniData.featuredSkills.map((fs, idx) => (
                                                <div key={idx} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="font-medium">{fs.skill}</span>
                                                        <span className="text-gray-400">{(fs.rating || 0) * 20}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-dsce-blue to-dsce-light-blue"
                                                            style={{ width: `${(fs.rating || 0) * 20}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        </div>

                        {/* Achievements */}
                        {alumniData.achievements && alumniData.achievements.length > 0 && (
                            <section className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                                <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                    <Award className="h-6 w-6 text-dsce-gold" />
                                    Achievements
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {alumniData.achievements.map((ach, idx) => (
                                        <div key={idx} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-dsce-gold/10 flex items-center justify-center flex-shrink-0">
                                                <Award className="h-5 w-5 text-dsce-gold" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm">{ach.title}</h3>
                                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{ach.description}</p>
                                                <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase">{ach.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </MotionWrapper>
        </div>
    );
}
