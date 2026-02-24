import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Search, Briefcase, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api';
import type { JobPostDTO } from '../lib/api';
import JobCard from '../components/JobCard';
import { mockJobs } from '../data/mockData';
import CreateJobModal from '../components/CreateJobModal';
import MotionWrapper from '../components/ui/MotionWrapper';
import { Button } from '../components/ui/Button';

const Jobs = () => {
    const [jobs, setJobs] = useState<JobPostDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [filter, setFilter] = useState('all'); // all, my-jobs
    const [search, setSearch] = useState('');

    const fetchJobs = async () => {
        setLoading(true);
        setError('');
        try {
            let data: JobPostDTO[];
            if (filter === 'my-jobs') {
                data = await apiClient.getMyJobs();
            } else {
                data = await apiClient.getAllJobs();
            }
            // Sort by created date desc if not already
            data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Fallback to mock data if no jobs found from API
            if (data.length === 0 && filter === 'all') {
                console.log('No jobs from API, using mock data');
                setJobs(mockJobs as JobPostDTO[]);
            } else {
                setJobs(data);
            }
        } catch (err) {
            setError('Failed to load jobs');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, [filter]);

    const handleJobCreated = () => {
        fetchJobs();
    };

    const handleJobDeleted = (id: string) => {
        setJobs(prev => prev.filter(job => job.id !== id));
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            job.company.toLowerCase().includes(search.toLowerCase()) ||
            job.description.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-dsce-bg-light">
            <Helmet>
                <title>Job Board - DSCE Alumni Connect</title>
            </Helmet>

            {/* Hero Header */}
            <div className="relative bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-dsce-gold rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative max-w-7xl mx-auto text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20 shadow-xl">
                            <Briefcase className="h-8 w-8 text-dsce-gold" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                            Alumni <span className="text-dsce-gold">Job Board</span>
                        </h1>
                        <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            Discover career opportunities, exclusive openings, and referrals shared by the DSCE alumni network.
                        </p>
                    </motion.div>
                </div>
            </div>

            <MotionWrapper className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20">

                {/* Actions Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex-1 w-full md:w-auto">
                        {/* Search Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-xl border border-dsce-blue/5 p-2 flex items-center"
                        >
                            <Search className="ml-4 h-5 w-5 text-gray-400 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by title, company, or keywords..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-3 bg-transparent border-none rounded-xl focus:outline-none text-gray-800 placeholder-gray-400"
                            />
                            {search && (
                                <button onClick={() => setSearch('')} className="p-2 text-gray-400 hover:text-dsce-blue transition-colors">
                                    <X size={18} />
                                </button>
                            )}
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 w-full md:w-auto"
                    >
                        <div className="flex p-1 bg-white rounded-xl border border-dsce-blue/10 shadow-sm">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
                                    ? 'bg-dsce-blue/10 text-dsce-blue'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => setFilter('my-jobs')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'my-jobs'
                                    ? 'bg-dsce-blue/10 text-dsce-blue'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                My Posts
                            </button>
                        </div>

                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-gradient-to-r from-dsce-blue to-blue-600 hover:from-dsce-blue/90 hover:to-blue-600/90 text-white shadow-lg shadow-blue-500/20"
                        >
                            <Plus size={18} className="mr-2" />
                            Post Job
                        </Button>
                    </motion.div>
                </div>

                {/* Content Area */}
                <div className="bg-transparent">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-700">
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'Opportunity' : 'Opportunities'} Found
                        </h2>
                        <button
                            onClick={fetchJobs}
                            disabled={loading}
                            className="p-2 text-gray-400 hover:text-dsce-blue transition-colors rounded-full hover:bg-white"
                            title="Refresh"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-100 shadow-sm"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm">
                            <p className="text-red-500 mb-4">{error}</p>
                            <Button variant="outline" onClick={fetchJobs} className="text-dsce-blue border-dsce-blue">Try Again</Button>
                        </div>
                    ) : filteredJobs.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm"
                        >
                            <div className="bg-blue-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="h-10 w-10 text-blue-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                {filter === 'my-jobs'
                                    ? "You haven't posted any jobs yet. Share an opportunity with your network!"
                                    : "No active job listings found matching your criteria. Check back later or be the first to post one!"}
                            </p>
                            <Button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="bg-dsce-blue text-white"
                            >
                                <Plus size={18} className="mr-2" />
                                Post a Job
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {filteredJobs.map((job, index) => (
                                    <motion.div
                                        key={job.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <JobCard job={job} onDelete={handleJobDeleted} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </MotionWrapper>

            <CreateJobModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onJobCreated={handleJobCreated}
            />
        </div>
    );
};

export default Jobs;
