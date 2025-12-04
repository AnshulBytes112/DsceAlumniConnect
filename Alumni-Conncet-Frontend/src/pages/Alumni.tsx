import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Search, Users, Calendar, MapPin, Award, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';

// Mock alumni data with more details
const mockAlumni = [
  {
    id: 1,
    name: 'Rahul Kumar',
    graduationYear: 2020,
    department: 'Computer Science',
    location: 'Bangalore',
    company: 'Google',
    position: 'Senior Software Engineer',
    achievements: ['Google Excellence Award 2023', 'Published 3 Research Papers'],
    email: 'rahul.kumar@example.com',
    linkedin: '#',
    image: null
  },
  {
    id: 2,
    name: 'Priya Sharma',
    graduationYear: 2019,
    department: 'Electronics',
    location: 'Mumbai',
    company: 'Microsoft',
    position: 'Product Manager',
    achievements: ['Microsoft MVP 2022', 'Led Azure Migration Project'],
    email: 'priya.sharma@example.com',
    linkedin: '#',
    image: null
  },
  {
    id: 3,
    name: 'Amit Patel',
    graduationYear: 2021,
    department: 'Mechanical',
    location: 'Pune',
    company: 'Tesla',
    position: 'Design Engineer',
    achievements: ['Tesla Innovation Award', '2 Patents Filed'],
    email: 'amit.patel@example.com',
    linkedin: '#',
    image: null
  },
  {
    id: 4,
    name: 'Sneha Reddy',
    graduationYear: 2018,
    department: 'Information Science',
    location: 'Hyderabad',
    company: 'Amazon',
    position: 'Senior Data Scientist',
    achievements: ['AWS Certified ML Specialist', 'Published Author'],
    email: 'sneha.reddy@example.com',
    linkedin: '#',
    image: null
  },
  {
    id: 5,
    name: 'Vikram Singh',
    graduationYear: 2022,
    department: 'Civil',
    location: 'Delhi',
    company: 'L&T',
    position: 'Project Manager',
    achievements: ['Young Engineer Award 2023', 'Led Metro Project'],
    email: 'vikram.singh@example.com',
    linkedin: '#',
    image: null
  },
  {
    id: 6,
    name: 'Neha Gupta',
    graduationYear: 2017,
    department: 'Computer Science',
    location: 'San Francisco',
    company: 'Meta',
    position: 'Engineering Manager',
    achievements: ['Meta Leadership Award', 'Women in Tech Speaker'],
    email: 'neha.gupta@example.com',
    linkedin: '#',
    image: null
  }
];

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
      <Navbar />
      <div className="min-h-screen bg-[#F8F8F8]" style={{backgroundColor: '#F8F8F8', minHeight: '100vh'}}>
        <Helmet>
          <title>Alumni Directory - DSCE Alumni Connect</title>
          <style>{`
            body { 
              background-color: #F8F8F8 !important; 
              background: #F8F8F8 !important;
              --background: #F8F8F8 !important;
              --color-background: #F8F8F8 !important;
            }
            #root { 
              background-color: #F8F8F8 !important; 
              background: #F8F8F8 !important;
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
              <GraduationCap className="h-12 w-12 text-[#003366] mr-3" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#003366]">Alumni Directory</h1>
            </div>
            <p className="text-xl text-[#333333] mb-6">Connect with 50,000+ DSCE alumni worldwide</p>
            
            {/* Filters Section */}
            <div className="max-w-2xl mx-auto space-y-4">
              {/* Search Section */}
              <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#003366]" />
                <input
                  type="text"
                  placeholder="Search by name, company, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[#003366]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/50 text-gray-800 placeholder-gray-500"
                  style={{color: '#333333'}}
                />
              </div>
            </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-[#003366]/10 shadow-sm">
                <div className="text-2xl font-bold text-[#003366]">50,000+</div>
                <div className="text-sm text-[#333333]">Total Alumni</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#003366]/10 shadow-sm">
                <div className="text-2xl font-bold text-[#003366]">120+</div>
                <div className="text-sm text-[#333333]">Countries</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#003366]/10 shadow-sm">
                <div className="text-2xl font-bold text-[#003366]">500+</div>
                <div className="text-sm text-[#333333]">Companies</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-[#003366]/10 shadow-sm">
                <div className="text-2xl font-bold text-[#003366]">25+</div>
                <div className="text-sm text-[#333333]">Industries</div>
              </div>
            </div>
          </motion.div>

          {/* Filters Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-xl p-6 border border-[#003366]/10 shadow-sm mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-[#003366] mb-2">Graduation Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full px-4 py-2 border border-[#003366]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/50 text-gray-800"
                  style={{color: '#333333'}}
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
                className="w-full px-4 py-2 border border-[#003366]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/50"
                style={{color: '#333333'}}
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
          <p className="text-[#333333]">
            Found <span className="font-semibold text-[#003366]">{filteredAlumni.length}</span> alumni
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
                  <Calendar className="mr-3 h-6 w-6 text-[#003366]" />
                  <h2 className="text-3xl font-bold text-[#003366]">Batch of {year}</h2>
                  <span className="ml-4 px-4 py-2 bg-[#FFD700] text-[#003366] rounded-full text-sm font-semibold">
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
                        "bg-white border border-[#003366]/10 rounded-xl p-6 hover:shadow-xl transition-all duration-300" :
                        "bg-white border border-[#003366]/10 rounded-xl p-6 hover:shadow-lg transition-all duration-300 flex items-center gap-6"
                      }
                    >
                      {viewMode === 'grid' ? (
                        <>
                          {/* Avatar */}
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-[#003366]">{alum.name}</h3>
                              <p className="text-sm text-[#333333]">{alum.department}</p>
                            </div>
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-[#003366] to-[#00AEEF] flex items-center justify-center">
                              <Users className="h-7 w-7 text-white" />
                            </div>
                          </div>
                          
                          {/* Position */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-[#003366]">{alum.position}</p>
                            <p className="text-sm text-[#333333]">{alum.company}</p>
                          </div>
                          
                          {/* Location */}
                          <div className="flex items-center text-sm text-[#333333] mb-4">
                            <MapPin className="mr-2 h-4 w-4 text-[#003366]" />
                            {alum.location}
                          </div>
                          
                          {/* Achievements */}
                          <div className="mb-4">
                            <div className="flex items-center mb-2">
                              <Award className="mr-2 h-4 w-4 text-[#FFD700]" />
                              <span className="text-sm font-medium text-[#003366]">Achievements</span>
                            </div>
                            <ul className="text-xs text-[#333333] space-y-1">
                              {alum.achievements.slice(0, 2).map((achievement, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-[#FFD700] mr-2">•</span>
                                  {achievement}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white">
                              Connect
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* List View */}
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#003366] to-[#00AEEF] flex items-center justify-center flex-shrink-0">
                            <Users className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl font-semibold text-[#003366]">{alum.name}</h3>
                                <p className="text-sm text-[#333333]">{alum.department} • Class of {alum.graduationYear}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-[#003366]">{alum.position}</p>
                                <p className="text-sm text-[#333333]">{alum.company}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#333333] mb-2">
                              <div className="flex items-center">
                                <MapPin className="mr-1 h-3 w-3 text-[#003366]" />
                                {alum.location}
                              </div>
                              <div className="flex items-center">
                                <Award className="mr-1 h-3 w-3 text-[#FFD700]" />
                                {alum.achievements.length} Achievements
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white">
                                View Profile
                              </Button>
                              <Button variant="outline" size="sm" className="border-[#003366]/20 text-[#003366] hover:bg-[#003366] hover:text-white">
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
            <h3 className="text-xl font-semibold text-[#333333] mb-2">No alumni found</h3>
            <p className="text-[#333333] mb-4">Try adjusting your search or filters</p>
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
