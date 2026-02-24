import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import {
    MapPin, Mail, Briefcase, ArrowLeft, ExternalLink, Calendar,
    Building2, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { apiClient, type JobPostDTO } from '@/lib/api';
import { mockJobs } from '@/data/mockData';

export default function JobDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<JobPostDTO | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                // Try real API first
                const data = await apiClient.getJobById(id);
                if (data && data.id) {
                    setJob(data);
                } else {
                    // Fallback to mock data if API returns empty or fails
                    const mockJob = mockJobs.find(j => j.id === id);
                    if (mockJob) setJob(mockJob as any);
                }
            } catch (error) {
                console.error('Failed to fetch job data:', error);
                // Fallback to mock data on error
                const mockJob = mockJobs.find(j => j.id === id);
                if (mockJob) setJob(mockJob as any);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
                <div className="text-xl text-dsce-blue font-semibold animate-pulse">Loading Job Details...</div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-dsce-blue/10 text-center max-w-md">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-10 w-10 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-dsce-text-dark mb-2">Job Not Found</h2>
                    <p className="text-gray-500 mb-8">
                        The job posting you're looking for doesn't exist or has expired.
                    </p>
                    <Button onClick={() => navigate('/jobs')} className="w-full bg-dsce-blue text-white hover:bg-dsce-blue/90">
                        Back to Job Board
                    </Button>
                </div>
            </div>
        );
    }

    const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
            <Helmet>
                <title>{job.title} at {job.company} - Job Detail</title>
            </Helmet>

            <MotionWrapper className="p-6 pt-24 max-w-5xl mx-auto pb-20">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/jobs')}
                    className="mb-8 text-dsce-blue hover:bg-dsce-blue/5 flex items-center gap-2 group"
                >
                    <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    Back to Job Board
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Header Info */}
                    <div className="lg:col-span-12">
                        <div className="bg-white rounded-3xl p-8 md:p-10 border border-dsce-blue/10 shadow-xl relative overflow-hidden">
                            {/* Accent Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-dsce-blue/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-dsce-gold/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

                            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="px-3 py-1 rounded-full bg-dsce-blue/10 text-dsce-blue text-xs font-bold uppercase tracking-wider border border-dsce-blue/10">
                                            {job.type}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                            <Calendar className="h-3.5 w-3.5 mr-1.5 text-dsce-blue" />
                                            Posted on {postedDate}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-dsce-text-dark mb-2 leading-tight">
                                        {job.title}
                                    </h1>
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                                        <div className="flex items-center text-gray-700 font-medium">
                                            <Building2 className="h-5 w-5 mr-2 text-dsce-blue" />
                                            {job.company}
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="h-5 w-5 mr-2 text-dsce-blue" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="h-5 w-5 mr-2 text-dsce-gold" />
                                            Full Time
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                    {job.applicationLink && (
                                        <Button
                                            onClick={() => window.open(job.applicationLink, '_blank')}
                                            className="bg-dsce-blue text-white hover:bg-dsce-blue/90 h-12 px-8 rounded-2xl shadow-lg shadow-dsce-blue/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <ExternalLink size={18} className="mr-2" />
                                            Apply Now
                                        </Button>
                                    )}
                                    {job.contactEmail && (
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = `mailto:${job.contactEmail}`}
                                            className="border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue/5 h-12 px-8 rounded-2xl transition-all hover:scale-[1.02]"
                                        >
                                            <Mail size={18} className="mr-2" />
                                            Contact Recruiter
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Left Column - Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                            <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-dsce-blue" />
                                Job Description
                            </h2>
                            <div className="text-gray-700 leading-relaxed space-y-4 font-light whitespace-pre-wrap">
                                {job.description}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-8 border border-dsce-blue/10 shadow-lg">
                            <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center gap-2">
                                <CheckCircle2 className="h-6 w-6 text-dsce-blue" />
                                Requirements
                            </h2>
                            <div className="text-gray-700 leading-relaxed space-y-4 font-light whitespace-pre-wrap">
                                {job.requirements}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-gradient-to-br from-dsce-blue to-[#002244] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-dsce-gold" />
                                About Poster
                            </h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl font-bold border border-white/20 shadow-inner">
                                    {job.postedByName?.[0] || 'A'}
                                </div>
                                <div>
                                    <div className="font-bold text-white text-lg">{job.postedByName}</div>
                                    <div className="text-blue-200 text-sm">DSCE Alumni</div>
                                </div>
                            </div>

                            <p className="text-blue-100 text-sm leading-relaxed mb-6 font-light">
                                This opportunity was shared by a DSCE alumni member. You can reach out directly via email for referrals or questions.
                            </p>

                            <Button
                                onClick={() => navigate('/alumni')}
                                className="w-full bg-dsce-gold text-dsce-blue hover:bg-dsce-gold/90 font-bold rounded-xl h-12 transition-all"
                            >
                                Connect with Alumni
                            </Button>
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-white rounded-3xl p-6 border border-dsce-blue/10 shadow-lg">
                            <h3 className="text-sm font-bold text-dsce-text-dark mb-4 uppercase tracking-wider flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-dsce-gold" />
                                Job Search Tips
                            </h3>
                            <ul className="space-y-3">
                                <li className="text-xs text-gray-500 flex items-start gap-2">
                                    <div className="h-1 w-1 rounded-full bg-dsce-blue mt-1.5 flex-shrink-0"></div>
                                    Verify the company through official websites or LinkedIn.
                                </li>
                                <li className="text-xs text-gray-500 flex items-start gap-2">
                                    <div className="h-1 w-1 rounded-full bg-dsce-blue mt-1.5 flex-shrink-0"></div>
                                    Never pay any money for job opportunities or background checks.
                                </li>
                                <li className="text-xs text-gray-500 flex items-start gap-2">
                                    <div className="h-1 w-1 rounded-full bg-dsce-blue mt-1.5 flex-shrink-0"></div>
                                    Be cautious of roles offering unusually high salaries for minimal work.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </MotionWrapper>
        </div>
    );
}
