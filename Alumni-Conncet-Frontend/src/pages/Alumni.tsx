import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Search, Users, Calendar, MapPin, Award, GraduationCap, Filter, X, Linkedin, Mail, Briefcase, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAlumni } from '@/data/mockData';
import { apiClient, type UserProfile } from '@/lib/api';

export default function Alumni() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [realAlumni, setRealAlumni] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real alumni data on component mount
  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        console.log('Fetching alumni from backend...');
        const alumni = await apiClient.getAllAlumni();
        console.log('Received alumni:', alumni);
        setRealAlumni(alumni);
      } catch (error) {
        console.warn('Failed to fetch real alumni, using mock data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumni();
  }, []);

  // Combine real alumni with mock data, prioritizing real data
  const allAlumni = realAlumni.length > 0 ? realAlumni.map(user => {
    // Get the most recent work experience
    const currentWork = user.workExperiences?.[0];
    
    // Create achievements from user's actual achievements, work experience, or fallback
    const achievements = [];
    
    // First, use actual achievements if available
    if (user.achievements && user.achievements.length > 0) {
      user.achievements.forEach(ach => {
        if (ach.title) achievements.push(ach.title);
      });
    }
    
    // If no achievements, use work experience
    if (achievements.length === 0 && currentWork?.company) {
      achievements.push(`Works at ${currentWork.company}`);
      if (currentWork?.jobTitle) achievements.push(currentWork.jobTitle);
    }
    
    // Add graduation year if still have space
    if (achievements.length < 3 && user.graduationYear) {
      achievements.push(`Class of ${user.graduationYear}`);
    }
    
    // Final fallback
    if (achievements.length === 0) achievements.push('DSCE Alumni');
    
    return {
      id: parseInt(user.id), // Convert string ID to number to match mock data type
      name: `${user.firstName} ${user.lastName}`,
      graduationYear: user.graduationYear || 2020,
      department: user.department || 'Computer Science',
      location: user.location || 'Bangalore',
      company: currentWork?.company || 'Company',
      position: currentWork?.jobTitle || user.headline || 'Alumni',
      achievements: achievements.slice(0, 3),
      email: user.email,
      linkedin: user.linkedinProfile || '#',
      image: (() => {
        if (user.profilePicture) {
          const fullUrl = `http://localhost:8080/${user.profilePicture}`;
          console.log('Profile picture URL:', fullUrl);
          console.log('Original profilePicture path:', user.profilePicture);
          return fullUrl;
        }
        return null;
      })()
    };
  }) : mockAlumni;

  // Get unique years and departments for filters
  const years = [...new Set(allAlumni.map(a => a.graduationYear))].sort((a, b) => b - a);
  const departments = [...new Set(allAlumni.map(a => a.department))].sort();

  // Filter alumni based on search and filters
  const filteredAlumni = allAlumni.filter(alum => {
    const matchesSearch = alum.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alum.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || alum.graduationYear === parseInt(selectedYear);
    const matchesDepartment = selectedDepartment === 'all' || alum.department === selectedDepartment;
    
    return matchesSearch && matchesYear && matchesDepartment;
  });

  // Group by graduation year
  const alumniByYear = filteredAlumni.reduce((acc, alum) => {
    if (!acc[alum.graduationYear]) {
      acc[alum.graduationYear] = [];
    }
    acc[alum.graduationYear].push(alum);
    return acc;
  }, {} as Record<number, typeof allAlumni>);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedDepartment('all');
  };

  const hasActiveFilters = searchTerm !== '' || selectedYear !== 'all' || selectedDepartment !== 'all';

  return (
    <div className="min-h-screen bg-dsce-bg-light">
      <Helmet>
        <title>Alumni Directory - DSCE Alumni Connect</title>
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
              <GraduationCap className="h-8 w-8 text-dsce-gold" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Alumni <span className="text-dsce-gold">Directory</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              Connect with over 50,000+ distinguished alumni from Dayananda Sagar College of Engineering making an impact worldwide.
            </p>
          </motion.div>
        </div>
      </div>

      <MotionWrapper className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20">
        {/* Search and Filter Bar */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-dsce-blue/5 p-4 mb-12"
        >
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search alumni by name, company, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue transition-all text-gray-800 placeholder-gray-400"
                    />
                </div>
                
                <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 text-gray-700 min-w-[140px] cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">All Batches</option>
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>

                    <select
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                        className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 text-gray-700 min-w-[160px] cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <option value="all">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>

                    <div className="flex bg-gray-50 rounded-xl p-1 border border-gray-200">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-dsce-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Users className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-dsce-blue' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
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
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dsce-blue/10 text-dsce-blue">
                                Search: {searchTerm}
                                <button onClick={() => setSearchTerm('')} className="ml-2 hover:text-dsce-blue/70"><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {selectedYear !== 'all' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dsce-blue/10 text-dsce-blue">
                                Batch: {selectedYear}
                                <button onClick={() => setSelectedYear('all')} className="ml-2 hover:text-dsce-blue/70"><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {selectedDepartment !== 'all' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-dsce-blue/10 text-dsce-blue">
                                Dept: {selectedDepartment}
                                <button onClick={() => setSelectedDepartment('all')} className="ml-2 hover:text-dsce-blue/70"><X className="h-3 w-3" /></button>
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
            <h2 className="text-2xl font-bold text-dsce-text-dark">
                {searchTerm || selectedYear !== 'all' || selectedDepartment !== 'all' ? 'Search Results' : 'All Alumni'}
                <span className="ml-3 text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                    {filteredAlumni.length} found
                </span>
            </h2>
        </div>

        {/* Content Area */}
        {loading ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="animate-spin h-8 w-8 border-2 border-dsce-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Alumni Directory</h3>
                <p className="text-gray-500">Fetching alumni profiles...</p>
            </div>
        ) : filteredAlumni.length > 0 ? (
            <div className="space-y-12">
                {Object.entries(alumniByYear)
                    .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
                    .map(([year, yearAlumni]) => (
                    <motion.div 
                        key={year}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-dsce-blue/20 to-transparent"></div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-dsce-blue/10 shadow-sm">
                                <Calendar className="h-4 w-4 text-dsce-gold" />
                                <span className="font-bold text-dsce-blue">Class of {year}</span>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-l from-dsce-blue/20 to-transparent"></div>
                        </div>
                        
                        <div className={viewMode === 'grid' ? 
                            "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : 
                            "space-y-4"
                        }>
                            {yearAlumni.map((alum) => (
                                <motion.div
                                    key={alum.id}
                                    whileHover={{ y: -5 }}
                                    className={`group bg-white rounded-2xl border border-dsce-blue/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden ${
                                        viewMode === 'list' ? 'flex items-center p-4 gap-6' : 'p-6'
                                    }`}
                                >
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="relative">
                                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        {alum.image ? (
                                                            <img src={alum.image} alt={alum.name} className="h-full w-full object-cover rounded-2xl" />
                                                        ) : (
                                                            <span className="text-2xl font-bold">
                                                                {alum.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-md">
                                                        <div className="bg-green-500 h-3 w-3 rounded-full border-2 border-white"></div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-dsce-blue hover:bg-dsce-blue/5 rounded-full transition-colors">
                                                        <Linkedin className="h-5 w-5" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-dsce-blue hover:bg-dsce-blue/5 rounded-full transition-colors">
                                                        <Mail className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h3 className="text-xl font-bold text-dsce-text-dark group-hover:text-dsce-blue transition-colors mb-1">{alum.name}</h3>
                                                <p className="text-sm text-dsce-blue font-medium mb-3">{alum.department}</p>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center text-gray-600 text-sm">
                                                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                                        {alum.position}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 text-sm">
                                                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                                                        {alum.company}
                                                    </div>
                                                    <div className="flex items-center text-gray-600 text-sm">
                                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                        {alum.location}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-gray-100 mt-4">
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {alum.achievements.slice(0, 2).map((achievement, i) => (
                                                        <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-100">
                                                            <Award className="h-3 w-3 mr-1" />
                                                            {achievement}
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <Button variant="outline" className="w-full border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue/5">
                                                        Profile
                                                    </Button>
                                                    <Button className="w-full bg-dsce-blue text-white hover:bg-dsce-blue/90">
                                                        Connect
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        // List View
                                        <>
                                            <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center text-white shadow-md">
                                                {alum.image ? (
                                                    <img src={alum.image} alt={alum.name} className="h-full w-full object-cover rounded-2xl" />
                                                ) : (
                                                    <span className="text-2xl font-bold">
                                                        {alum.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-dsce-text-dark truncate">{alum.name}</h3>
                                                    <span className="px-2 py-0.5 rounded-full bg-dsce-blue/10 text-dsce-blue text-xs font-medium">
                                                        {alum.department}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                                    <span className="font-medium">{alum.position}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>{alum.company}</span>
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {alum.location}</span>
                                                    <span className="flex items-center"><Award className="h-3 w-3 mr-1 text-dsce-gold" /> {alum.achievements.length} Achievements</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-dsce-blue">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm" className="hidden md:flex">
                                                    View Profile
                                                </Button>
                                                <Button size="sm" className="bg-dsce-blue text-white hover:bg-dsce-blue/90">
                                                    Connect
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))}
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
                <h3 className="text-xl font-bold text-gray-900 mb-2">No alumni found</h3>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    We couldn't find any alumni matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <Button onClick={clearFilters} variant="outline" className="border-dsce-blue text-dsce-blue hover:bg-dsce-blue/5">
                    Clear All Filters
                </Button>
            </motion.div>
        )}
      </MotionWrapper>
    </div>
  );
}
