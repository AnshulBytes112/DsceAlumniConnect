import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Search, Users, Calendar, MapPin, Award, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
// import Navbar from '@/components/layout/Navbar';

// Mock alumni data with more details
import { mockAlumni } from '@/data/mockData';

export default function Alumni() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique years and departments for filters
  const years = [...new Set(mockAlumni.map(a => a.graduationYear))].sort((a, b) => b - a);
  const departments = [...new Set(mockAlumni.map(a => a.department))].sort();

  // Filter alumni based on search and filters
  const filteredAlumni = mockAlumni.filter(alum => {
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
  }, {} as Record<number, typeof mockAlumni>);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-dsce-bg-light" style={{backgroundColor: 'var(--color-dsce-bg-light)', minHeight: '100vh'}}>
        <Helmet>
          <title>Alumni Directory - DSCE Alumni Connect</title>
          <style>{`
            body { 
              background-color: var(--color-dsce-bg-light) !important; 
              background: var(--color-dsce-bg-light) !important;
              --background: var(--color-dsce-bg-light) !important;
              --color-background: var(--color-dsce-bg-light) !important;
            }
            #root { 
              background-color: var(--color-dsce-bg-light) !important; 
              background: var(--color-dsce-bg-light) !important;
            }
          `}</style>
        </Helmet>
        
        <MotionWrapper className="p-6 pt-24 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-dsce-blue mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-dsce-blue">Alumni Directory</h1>
            </div>
            <p className="text-xl text-dsce-text-dark mb-6">Connect with 50,000+ DSCE alumni worldwide</p>
            
            {/* Filters Section */}
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Search Section */}
              <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dsce-blue" />
                <input
                  type="text"
                  placeholder="Search by name, company, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-dsce-blue/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/50 text-gray-800 placeholder-gray-500"
                  style={{color: 'var(--color-dsce-text-dark)'}}
                />
              </div>
            </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-dsce-blue/10 shadow-sm">
                <div className="text-2xl font-bold text-dsce-blue">50,000+</div>
                <div className="text-sm text-dsce-text-dark">Total Alumni</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-dsce-blue/10 shadow-sm">
                <div className="text-2xl font-bold text-dsce-blue">120+</div>
                <div className="text-sm text-dsce-text-dark">Countries</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-dsce-blue/10 shadow-sm">
                <div className="text-2xl font-bold text-dsce-blue">500+</div>
                <div className="text-sm text-dsce-text-dark">Companies</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-dsce-blue/10 shadow-sm">
                <div className="text-2xl font-bold text-dsce-blue">25+</div>
                <div className="text-sm text-dsce-text-dark">Industries</div>
              </div>
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-dsce-blue/10 shadow-sm mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-dsce-blue mb-2">Graduation Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 border border-dsce-blue/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/50 text-gray-800"
                  style={{color: 'var(--color-dsce-text-dark)'}}
                >
                  <option value="all">All Years</option>
                {years.map(year => (
                  <option key={year} value={year}>Batch of {year}</option>
                ))}
              </select>
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-dsce-blue/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/50"
                style={{color: 'var(--color-dsce-text-dark)'}}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex-1"
              >
                List
              </Button>
            </div>
            </div>
         
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-dsce-text-dark">
            Found <span className="font-semibold text-dsce-blue">{filteredAlumni.length}</span> alumni
          </p>
        </motion.div>

        {/* Alumni by Year */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {Object.entries(alumniByYear)
            .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
            .map(([year, yearAlumni]) => (
              <motion.div key={year} variants={itemVariants}>
                <div className="flex items-center mb-6">
                  <Calendar className="mr-3 h-6 w-6 text-dsce-blue" />
                  <h2 className="text-3xl font-bold text-dsce-blue">Batch of {year}</h2>
                  <span className="ml-4 px-4 py-2 bg-dsce-gold text-dsce-blue rounded-full text-sm font-semibold">
                    {yearAlumni.length} Alumni
                  </span>
                </div>
                
                <div className={viewMode === 'grid' ? 
                  "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : 
                  "space-y-4"
                }>
                  {yearAlumni.map((alum) => (
                    <motion.div
                      key={alum.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className={viewMode === 'grid' ? 
                        "bg-white border border-dsce-blue/10 rounded-xl p-6 hover:shadow-xl transition-all duration-300" :
                        "bg-white border border-dsce-blue/10 rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex items-center gap-6"
                      }
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Avatar */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-dsce-blue">{alum.name}</h3>
                              <p className="text-sm text-dsce-text-dark">{alum.department}</p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                              <Users className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          
                          {/* Position */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-dsce-blue">{alum.position}</p>
                            <p className="text-sm text-dsce-text-dark">{alum.company}</p>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center text-sm text-dsce-text-dark mb-4">
                            <MapPin className="mr-2 h-4 w-4 text-dsce-blue" />
                            {alum.location}
                          </div>
                          
                          {/* Achievements */}
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <Award className="mr-2 h-4 w-4 text-dsce-gold" />
                              <span className="text-sm font-medium text-dsce-blue">Achievements</span>
                            </div>
                            <ul className="text-xs text-dsce-text-dark space-y-1">
                              {alum.achievements.slice(0, 2).map((achievement, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-dsce-gold mr-2">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue hover:text-white">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm" className="border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue hover:text-white">
                              Connect
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View */}
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-dsce-blue to-dsce-light-blue flex items-center justify-center flex-shrink-0">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-dsce-blue">{alum.name}</h3>
                                <p className="text-sm text-dsce-text-dark">{alum.department} • Class of {alum.graduationYear}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-dsce-blue">{alum.position}</p>
                                <p className="text-sm text-dsce-text-dark">{alum.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-dsce-text-dark mb-2">
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3 w-3 text-dsce-blue" />
                                {alum.location}
                              </div>
                              <div className="flex items-center">
                                <Award className="mr-1 h-3 w-3 text-dsce-gold" />
                                {alum.achievements.length} Achievements
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue hover:text-white">
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm" className="border-dsce-blue/20 text-dsce-blue hover:bg-dsce-blue hover:text-white">
                                Connect
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
        </motion.div>

        {/* No Results */}
        {filteredAlumni.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-dsce-text-dark mb-2">No alumni found</h3>
            <p className="text-dsce-text-dark mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedYear('all');
              setSelectedDepartment('all');
              setViewMode('grid');
            }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </MotionWrapper>
    </div>
    </>
  );
}
