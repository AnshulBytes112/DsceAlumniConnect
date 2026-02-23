import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, MapPin, Mail, Briefcase, Building2, GraduationCap,
    Globe, Linkedin, Phone, Star, Trophy, FolderKanban,
    CheckCircle2, Clock, XCircle, Wrench, Award, Calendar,
    BookOpen,
} from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';
import { Button } from '@/components/ui/Button';

const API_BASE_URL = 'http://localhost:8080';

/* ── small helpers ─────────────────────────────────── */
function Section({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-4">
                <span className="text-dsce-blue">{icon}</span>
                <h3 className="font-bold text-dsce-text-dark">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function Empty({ text }: { text: string }) {
    return <p className="text-sm text-gray-400 italic">{text}</p>;
}

function VerificationBadge({ status }: { status?: string }) {
    if (!status) return null;
    const cfg = {
        APPROVED: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: 'Verified Alumni', cls: 'bg-green-100 text-green-700 border-green-200' },
        PENDING: { icon: <Clock className="h-3.5 w-3.5" />, label: 'Verification Pending', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
        REJECTED: { icon: <XCircle className="h-3.5 w-3.5" />, label: 'Verification Rejected', cls: 'bg-red-100 text-red-700 border-red-200' },
    }[status];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function AlumniProfileDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // The Alumni directory passes the full UserProfile via router state as a fast-path
    const stateProfile = (location.state as { profile?: UserProfile })?.profile ?? null;

    const [profile, setProfile] = useState<UserProfile | null>(stateProfile);
    const [loading, setLoading] = useState(!stateProfile);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id || stateProfile) return;               // already have data from state
        const load = async () => {
            try {
                const data = await apiClient.getAlumniById(id);
                setProfile(data);
            } catch (e: any) {
                setError(e.message ?? 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, stateProfile]);

    /* ── loading / error states ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-2 border-dsce-blue border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-dsce-blue font-semibold">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-semibold mb-4">{error ?? 'Profile not found.'}</p>
                    <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
                </div>
            </div>
        );
    }

    const p = profile;
    const fullName = `${p.firstName} ${p.lastName}`;
    const initials = `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}`.toUpperCase();
    const currentWork = p.workExperiences?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
            <Helmet>
                <title>{fullName} - DSCE Alumni Connect</title>
                <meta name="description" content={`View ${fullName}'s alumni profile on DSCE Alumni Connect`} />
            </Helmet>

            {/* ── Hero Banner ── */}
            <div className="relative bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue pt-28 pb-32 px-4 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-dsce-gold rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                </div>
                <div className="relative max-w-6xl mx-auto">
                    <button
                        id="back-to-directory-btn"
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Alumni Directory
                    </button>
                </div>
            </div>

            {/* ── Profile Card (overlapping hero) ── */}
            <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-10 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-3xl shadow-xl border border-dsce-blue/10 p-6 md:p-8 mb-6"
                >
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-dsce-blue to-dsce-light-blue p-[3px] shadow-xl">
                                <div className="h-full w-full rounded-2xl bg-white overflow-hidden flex items-center justify-center">
                                    {p.profilePicture ? (
                                        <img
                                            src={`${API_BASE_URL}/${p.profilePicture}`}
                                            alt={fullName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                                            <span className="text-white text-3xl font-bold">{initials}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow">
                                <div className="bg-green-400 h-3 w-3 rounded-full border-2 border-white" />
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-dsce-text-dark">{fullName}</h1>
                                <VerificationBadge status={p.verificationStatus} />
                            </div>
                            <p className="text-dsce-blue font-semibold mb-3">{p.headline || (currentWork ? `${currentWork.jobTitle} at ${currentWork.company}` : 'DSCE Alumni')}</p>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                {p.location && (
                                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gray-400" />{p.location}</span>
                                )}
                                {p.department && (
                                    <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-gray-400" />
                                        {p.department}{p.graduationYear ? ` · Class of ${p.graduationYear}` : ''}
                                    </span>
                                )}
                                {currentWork?.company && (
                                    <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gray-400" />{currentWork.company}</span>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-3 flex-shrink-0 w-full md:w-auto">
                            {p.email && (
                                <a
                                    id={`email-alumni-${p.id}`}
                                    href={`mailto:${p.email}`}
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-dsce-blue text-white text-sm font-semibold hover:bg-dsce-blue/90 transition-colors"
                                >
                                    <Mail className="h-4 w-4" /> Send Email
                                </a>
                            )}
                            {p.linkedinProfile && (
                                <a
                                    id={`linkedin-alumni-${p.id}`}
                                    href={p.linkedinProfile.startsWith('http') ? p.linkedinProfile : `https://${p.linkedinProfile}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
                                >
                                    <Linkedin className="h-4 w-4" /> LinkedIn
                                </a>
                            )}
                            {p.website && (
                                <a
                                    id={`website-alumni-${p.id}`}
                                    href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
                                >
                                    <Globe className="h-4 w-4" /> Website
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* ── Main Content Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* About */}
                        {p.bio && (
                            <Section title="About" icon={<BookOpen className="h-4 w-4" />}>
                                <p className="text-sm text-gray-600 leading-relaxed">{p.bio}</p>
                            </Section>
                        )}

                        {/* Contact */}
                        <Section title="Contact & Links" icon={<Mail className="h-4 w-4" />}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail className="h-4 w-4 text-dsce-blue flex-shrink-0" />
                                    <a href={`mailto:${p.email}`} className="hover:text-dsce-blue transition-colors truncate">{p.email}</a>
                                </div>
                                {p.contactNumber && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone className="h-4 w-4 text-dsce-blue flex-shrink-0" />
                                        <span>{p.contactNumber}</span>
                                    </div>
                                )}
                                {p.linkedinProfile && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Linkedin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                        <a href={p.linkedinProfile.startsWith('http') ? p.linkedinProfile : `https://${p.linkedinProfile}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">LinkedIn Profile</a>
                                    </div>
                                )}
                                {p.website && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Globe className="h-4 w-4 text-dsce-blue flex-shrink-0" />
                                        <a href={p.website.startsWith('http') ? p.website : `https://${p.website}`} target="_blank" rel="noopener noreferrer" className="text-dsce-blue hover:underline truncate">Personal Website</a>
                                    </div>
                                )}
                            </div>
                        </Section>

                        {/* Skills */}
                        <Section title="Skills & Expertise" icon={<Wrench className="h-4 w-4" />}>
                            {p.skills && p.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {p.skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1 bg-dsce-blue/10 text-dsce-blue text-xs font-medium rounded-full border border-dsce-blue/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <Empty text="No skills listed." />
                            )}
                            {p.featuredSkills && p.featuredSkills.length > 0 && (
                                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Featured</p>
                                    {p.featuredSkills.map((fs, i) => (
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
                        </Section>
                    </div>

                    {/* RIGHT (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Education & Experience side by side */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Section title="Education" icon={<GraduationCap className="h-4 w-4" />}>
                                <div className="space-y-4">
                                    {p.educations && p.educations.length > 0 ? p.educations.map((edu, i) => (
                                        <div key={i} className="border-l-2 border-dsce-blue/20 pl-3">
                                            <p className="font-semibold text-gray-800 text-sm">{edu.school}</p>
                                            <p className="text-sm text-gray-600">{edu.degree}</p>
                                            {edu.gpa && <p className="text-xs text-gray-500">GPA: {edu.gpa}</p>}
                                            <p className="text-xs text-gray-400 mt-0.5">{edu.date}</p>
                                            {edu.descriptions?.map((d, di) => (
                                                <p key={di} className="text-xs text-gray-500 mt-0.5 list-disc list-inside">• {d}</p>
                                            ))}
                                        </div>
                                    )) : <Empty text="No education details." />}
                                </div>
                            </Section>

                            <Section title="Experience" icon={<Briefcase className="h-4 w-4" />}>
                                <div className="space-y-4">
                                    {p.workExperiences && p.workExperiences.length > 0 ? p.workExperiences.map((exp, i) => (
                                        <div key={i} className="border-l-2 border-dsce-light-blue/30 pl-3">
                                            <p className="font-semibold text-gray-800 text-sm">{exp.jobTitle}</p>
                                            <p className="text-sm text-gray-600">{exp.company}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{exp.date}</p>
                                            {exp.descriptions?.map((d, di) => (
                                                <p key={di} className="text-xs text-gray-500 mt-0.5">• {d}</p>
                                            ))}
                                        </div>
                                    )) : <Empty text="No experience details." />}
                                </div>
                            </Section>
                        </div>

                        {/* Projects */}
                        <Section title="Projects" icon={<FolderKanban className="h-4 w-4" />}>
                            {p.projects && p.projects.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {p.projects.map((proj, i) => (
                                        <div key={i} className="rounded-2xl border border-dsce-blue/10 bg-dsce-blue/[0.02] p-4 hover:shadow-sm transition-shadow">
                                            <div className="flex items-start justify-between mb-1">
                                                <p className="font-semibold text-gray-800 text-sm">{proj.project}</p>
                                                <FolderKanban className="h-4 w-4 text-dsce-blue/40 flex-shrink-0 ml-2" />
                                            </div>
                                            {proj.date && <p className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Calendar className="h-3 w-3" />{proj.date}</p>}
                                            {proj.descriptions?.map((d, di) => (
                                                <p key={di} className="text-xs text-gray-500">• {d}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty text="No projects listed." />
                            )}
                        </Section>

                        {/* Achievements */}
                        <Section title="Achievements" icon={<Trophy className="h-4 w-4" />}>
                            {p.achievements && p.achievements.length > 0 ? (
                                <div className="space-y-3">
                                    {p.achievements.map((ach, i) => (
                                        <div key={i} className="flex gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-transparent border border-yellow-100 hover:border-yellow-200 transition-colors">
                                            <Award className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-semibold text-gray-800 text-sm">{ach.title}</p>
                                                {ach.description && <p className="text-xs text-gray-600 mt-0.5">{ach.description}</p>}
                                                {ach.date && <p className="text-xs text-gray-400 mt-1">{ach.date}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Empty text="No achievements listed." />
                            )}
                        </Section>

                    </div>
                </div>
            </div>
        </div>
    );
}
