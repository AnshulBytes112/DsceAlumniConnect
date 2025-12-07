import React, { useState } from 'react';
import { Briefcase, Search, MapPin, Building2, Calendar, Clock, DollarSign, X, Filter, Bookmark, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for job opportunities
const mockJobData = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    description: 'Develop and maintain web applications using modern frameworks.',
    postedDate: '2025-12-01',
    jobType: 'Full-time',
    salary: '$120k - $160k',
    skills: ['React', 'Node.js', 'TypeScript'],
  },
  {
    id: 2,
    title: 'Data Analyst',
    company: 'DataWorks',
    location: 'New York, NY',
    description: 'Analyze and interpret complex datasets to provide insights.',
    postedDate: '2025-12-03',
    jobType: 'Full-time',
    salary: '$90k - $120k',
    skills: ['Python', 'SQL', 'Tableau'],
  },
  {
    id: 3,
    title: 'Product Manager',
    company: 'Innovate Inc.',
    location: 'Remote',
    description: 'Lead product development teams to deliver high-quality solutions.',
    postedDate: '2025-12-05',
    jobType: 'Full-time',
    salary: '$130k - $180k',
    skills: ['Agile', 'Strategy', 'Analytics'],
  },
  {
    id: 4,
    title: 'Frontend Developer',
    company: 'WebSolutions',
    location: 'Austin, TX',
    description: 'Create beautiful and responsive user interfaces.',
    postedDate: '2025-12-04',
    jobType: 'Contract',
    salary: '$100k - $140k',
    skills: ['Vue.js', 'CSS', 'JavaScript'],
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    company: 'CloudTech',
    location: 'Seattle, WA',
    description: 'Manage cloud infrastructure and deployment pipelines.',
    postedDate: '2025-12-02',
    jobType: 'Full-time',
    salary: '$140k - $190k',
    skills: ['AWS', 'Docker', 'Kubernetes'],
  },
];

const JobOpportunities = () => {
  const [jobs] = useState(mockJobData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [savedJobs, setSavedJobs] = useState(new Set());

  const jobTypes = [...new Set(jobs.map(j => j.jobType))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedJobType === 'all' || job.jobType === selectedJobType;
    return matchesSearch && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedJobType('all');
  };

  const toggleSaveJob = (jobId) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const hasActiveFilters = searchTerm !== '' || selectedJobType !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20 shadow-xl">
              <Briefcase className="h-8 w-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Job <span className="text-yellow-400">Opportunities</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              Discover exciting career opportunities posted by our alumni network and leading companies.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20">
        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-blue-600/5 p-4 mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-gray-800 placeholder-gray-400"
              />
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 text-gray-700 min-w-[140px] cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Tags */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 overflow-hidden"
              >
                <span className="text-sm text-gray-500 mr-2">Active Filters:</span>
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-blue-600/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedJobType !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600/10 text-blue-600">
                    Type: {selectedJobType}
                    <button onClick={() => setSelectedJobType('all')} className="ml-2 hover:text-blue-600/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-medium ml-auto"
                >
                  Clear All
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {hasActiveFilters ? 'Search Results' : 'All Opportunities'}
            <span className="ml-3 text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              {filteredJobs.length} found
            </span>
          </h2>
        </div>

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl border border-blue-600/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                      <Briefcase className="h-6 w-6" />
                    </div>
                    <button
                      onClick={() => toggleSaveJob(job.id)}
                      className={`p-2 rounded-full transition-colors ${
                        savedJobs.has(job.id)
                          ? 'bg-yellow-400 text-white'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className="h-4 w-4" fill={savedJobs.has(job.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Job Title & Company */}
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-4">
                    <Building2 className="h-4 w-4 mr-1" />
                    {job.company}
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      {job.jobType}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      {job.salary}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                      Apply
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              We couldn't find any jobs matching your search criteria. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default JobOpportunities;