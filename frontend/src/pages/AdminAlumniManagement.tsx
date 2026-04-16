import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { 
    Search, 
    Filter, 
    Mail, 
    Phone, 
    TrendingUp,
    Download,
    Eye,
    MessageSquare,
    ChevronDown,
    FileSpreadsheet,
    X,
    Globe,
    Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient, type UserProfile } from '@/lib/api';
import { exportAlumniToExcel } from '@/utils/excelExport';

interface ProfessionalAnalytics {
    totalAlumni: number;
    averageExperience: number;
    topCompanies: Array<{ company: string; count: number }>;
    departments: Array<{ department: string; count: number }>;
    experienceDistribution: Array<{ range: string; count: number }>;
    recentGraduates: number;
    seniorAlumni: number;
}

export default function AdminAlumniManagement() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alumni, setAlumni] = useState<UserProfile[]>([]);
    const [filteredAlumni, setFilteredAlumni] = useState<UserProfile[]>([]);
    const [analytics, setAnalytics] = useState<ProfessionalAnalytics>({
        totalAlumni: 0,
        averageExperience: 0,
        topCompanies: [],
        departments: [],
        experienceDistribution: [],
        recentGraduates: 0,
        seniorAlumni: 0
    });
    const [selectedAlumni, setSelectedAlumni] = useState<UserProfile[]>([]);
    const [selectedAlumniDetail, setSelectedAlumniDetail] = useState<UserProfile | null>(null);
    const [showAlumniDetailModal, setShowAlumniDetailModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [selectedGraduationYear, setSelectedGraduationYear] = useState('all');
    const [selectedExperience, setSelectedExperience] = useState('all');
    const [selectedCurrentCompany, setSelectedCurrentCompany] = useState('all');
    const [selectedPastCompany, setSelectedPastCompany] = useState('all');
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [skillSearchTerm, setSkillSearchTerm] = useState('');
    const [showSkillDropdown, setShowSkillDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactMessage, setContactMessage] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);

    useEffect(() => {
        fetchAlumniAndAnalytics();
    }, []);

    useEffect(() => {
        filterAlumni();
    }, [alumni, searchTerm, selectedDepartment, selectedGraduationYear, selectedExperience, selectedCurrentCompany, selectedPastCompany, selectedSkills]);

    // Close skill dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.skill-filter-container')) {
                setShowSkillDropdown(false);
            }
        };

        if (showSkillDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSkillDropdown]);

    const fetchAlumniAndAnalytics = async () => {
        try {
            setLoading(true);
            const [alumniData, analyticsData] = await Promise.all([
                apiClient.getAllAlumni(),
                apiClient.getAnalytics()
            ]);
            
            setAlumni(alumniData);
            
            // Set analytics from backend
            setAnalytics({
                totalAlumni: analyticsData.totalAlumni,
                averageExperience: analyticsData.averageExperience,
                topCompanies: analyticsData.topCompanies,
                departments: analyticsData.departments,
                experienceDistribution: analyticsData.experienceDistribution,
                recentGraduates: analyticsData.recentGraduates,
                seniorAlumni: analyticsData.seniorAlumni
            });
            
            setError(null);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load alumni data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterAlumni = () => {
        let filtered = alumni;

        // Search filter - comprehensive search through all fields
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(alum => {
                // Basic info search
                const basicMatch = 
                    `${alum.firstName} ${alum.lastName}`.toLowerCase().includes(searchLower) ||
                    alum.email?.toLowerCase().includes(searchLower) ||
                    alum.department?.toLowerCase().includes(searchLower) ||
                    alum.bio?.toLowerCase().includes(searchLower) ||
                    alum.location?.toLowerCase().includes(searchLower);

                // All work experiences search (current and past)
                const workMatch = alum.workExperiences?.some(exp => 
                    exp.company?.toLowerCase().includes(searchLower) ||
                    exp.jobTitle?.toLowerCase().includes(searchLower) ||
                    exp.descriptions?.some(desc => desc.toLowerCase().includes(searchLower))
                );

                // Skills search
                const skillsMatch = 
                    alum.skills?.some(skill => skill.toLowerCase().includes(searchLower)) ||
                    alum.featuredSkills?.some(fs => fs.skill?.toLowerCase().includes(searchLower));

                // Education search
                const educationMatch = alum.educations?.some(edu =>
                    edu.school?.toLowerCase().includes(searchLower) ||
                    edu.degree?.toLowerCase().includes(searchLower)
                );

                // Projects search
                const projectsMatch = alum.projects?.some(proj =>
                    proj.project?.toLowerCase().includes(searchLower) ||
                    proj.descriptions?.some(desc => desc.toLowerCase().includes(searchLower))
                );

                return basicMatch || workMatch || skillsMatch || educationMatch || projectsMatch;
            });
        }

        // Department filter
        if (selectedDepartment !== 'all') {
            filtered = filtered.filter(alum => alum.department === selectedDepartment);
        }

        // Graduation year filter
        if (selectedGraduationYear !== 'all') {
            filtered = filtered.filter(alum => alum.graduationYear?.toString() === selectedGraduationYear);
        }

        // Experience filter
        if (selectedExperience !== 'all') {
            filtered = filtered.filter(alum => {
                if (!alum.workExperiences?.[0]?.date) return false;
                const years = new Date().getFullYear() - parseInt(alum.workExperiences[0].date.split('-')[0]);
                switch (selectedExperience) {
                    case '0-2': return years >= 0 && years <= 2;
                    case '3-5': return years >= 3 && years <= 5;
                    case '6-10': return years >= 6 && years <= 10;
                    case '10+': return years > 10;
                    default: return true;
                }
            });
        }

        // Current Company filter
        if (selectedCurrentCompany !== 'all') {
            filtered = filtered.filter(alum => 
                alum.workExperiences?.some(exp => exp.company === selectedCurrentCompany && exp.currentlyWorking === true)
            );
        }

        // Past Company filter (includes false and null/undefined)
        if (selectedPastCompany !== 'all') {
            console.log('Filtering by past company:', selectedPastCompany);
            filtered = filtered.filter(alum => {
                const hasPastCompany = alum.workExperiences?.some(exp => {
                    const isPast = exp.company === selectedPastCompany && (exp.currentlyWorking === false || exp.currentlyWorking !== true);
                    if (isPast) {
                        console.log('Found past company match:', alum.firstName, exp.company, exp.currentlyWorking);
                    }
                    return isPast;
                });
                return hasPastCompany;
            });
            console.log('Results after past company filter:', filtered.length);
        }

        // Skills filter
        if (selectedSkills.length > 0) {
            filtered = filtered.filter(alum => 
                selectedSkills.every(skill => 
                    alum.skills?.includes(skill) || alum.featuredSkills?.some(fs => fs.skill === skill)
                )
            );
        }

        setFilteredAlumni(filtered);
    };

    const departments = [...new Set(alumni.map(alum => alum.department).filter((dept): dept is string => Boolean(dept)))];
    const graduationYears = [...new Set(alumni.map(alum => alum.graduationYear).filter((year): year is number => Boolean(year)))].sort((a: number, b: number) => b - a);
    
    // Extract current companies (where currentlyWorking is true)
    const currentCompanies = [...new Set(alumni.flatMap(alum => 
        alum.workExperiences?.filter(exp => exp.currentlyWorking === true)
            .map(exp => exp.company).filter((company): company is string => Boolean(company)) || []
    ))].sort();
    
    // Extract past companies (where currentlyWorking is false or null/undefined)
    const pastCompanies = [...new Set(alumni.flatMap(alum => {
        const pastExps = alum.workExperiences?.filter(exp => exp.currentlyWorking === false || exp.currentlyWorking !== true) || [];
        // Debug: Log past work experiences
        if (pastExps.length > 0) {
            console.log('Past work experiences for', alum.firstName, alum.lastName, ':', pastExps);
        }
        return pastExps.map(exp => exp.company).filter((company): company is string => Boolean(company));
    }))].sort();
    
    const allSkills = [...new Set(alumni.flatMap(alum => [...(alum.skills || []), ...(alum.featuredSkills?.map(fs => fs.skill) || [])])
        .filter((skill): skill is string => Boolean(skill)))]
        .sort();

    // Filter skills based on search term
    const filteredSkills = allSkills.filter((skill: string) => 
        skill.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
        !selectedSkills.includes(skill)
    );

    // Skill management functions
    const handleAddSkill = (skill: string) => {
        if (!selectedSkills.includes(skill)) {
            setSelectedSkills([...selectedSkills, skill]);
        }
        setSkillSearchTerm('');
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    const handleSkillSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && skillSearchTerm.trim()) {
            const exactMatch = allSkills.find((skill: string) => 
                skill.toLowerCase() === skillSearchTerm.toLowerCase().trim()
            );
            if (exactMatch) {
                handleAddSkill(exactMatch);
            }
        }
    };

    const handleSelectAlumni = (alum: UserProfile) => {
        if (selectedAlumni.find((a: UserProfile) => a.id === alum.id)) {
            setSelectedAlumni(selectedAlumni.filter((a: UserProfile) => a.id !== alum.id));
        } else {
            setSelectedAlumni([...selectedAlumni, alum]);
        }
    };

    const handleViewAlumniDetails = (alum: UserProfile) => {
        setSelectedAlumniDetail(alum);
        setShowAlumniDetailModal(true);
    };

    const handleSelectAll = () => {
        if (selectedAlumni.length === filteredAlumni.length) {
            setSelectedAlumni([]);
        } else {
            setSelectedAlumni(filteredAlumni);
        }
    };

    const handleContactSelected = async () => {
        if (selectedAlumni.length === 0 || !contactMessage.trim()) return;

        setSendingMessage(true);
        try {
            // Here you would implement the actual contact logic
            console.log('Sending message to alumni:', selectedAlumni.map(a => a.email));
            console.log('Message:', contactMessage);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert(`Message sent to ${selectedAlumni.length} alumni successfully!`);
            setContactMessage('');
            setShowContactModal(false);
            setSelectedAlumni([]);
        } catch (error) {
            console.error('Failed to send message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingMessage(false);
        }
    };

    const downloadResumes = async () => {
        try {
            const resumes = selectedAlumni.length > 0 ? selectedAlumni : filteredAlumni;
            const alumniWithResumes = resumes.filter(alum => alum.resumeUrl);
            
            if (alumniWithResumes.length === 0) {
                alert('No resumes found for selected alumni.');
                return;
            }

            // Download each resume individually
            let successCount = 0;
            let failCount = 0;

            for (const alum of alumniWithResumes) {
                if (alum.resumeUrl) {
                    try {
                        const resumeBlob = await apiClient.downloadResume(alum.id);
                        const fileName = `${alum.firstName}_${alum.lastName}_resume.pdf`;
                        
                        // Create download link for individual resume
                        const url = URL.createObjectURL(resumeBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to download resume for ${alum.firstName} ${alum.lastName}:`, error);
                        failCount++;
                    }
                }
            }

            if (failCount > 0) {
                alert(`Download completed: ${successCount} successful, ${failCount} failed.`);
            } else {
                alert(`Successfully downloaded ${successCount} resumes!`);
            }

        } catch (error) {
            console.error('Failed to download resumes:', error);
            alert('Failed to download resumes. Please try again.');
        }
    };

    const exportToExcel = async () => {
        try {
            const alumniToExport = selectedAlumni.length > 0 ? selectedAlumni : filteredAlumni;
            const message = await exportAlumniToExcel(alumniToExport);
            alert(message);
        } catch (error) {
            console.error('Failed to export Excel:', error);
            alert('Failed to export Excel. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dsce-bg-light flex items-center justify-center">
                <div className="animate-spin h-12 w-12 border-4 border-dsce-blue border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dsce-bg-light pb-12">
            <Helmet>
                <title>Alumni Management - DSCE Alumni Connect</title>
            </Helmet>

            {/* Header */}
            <div className="bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Alumni <span className="text-dsce-gold">Management</span>
                        </h1>
                        <p className="text-xl text-gray-200 max-w-3xl mx-auto font-light">
                            Filter, analyze, and connect with alumni based on professional experience and expertise.
                        </p>
                    </motion.div>
                </div>
            </div>

            <MotionWrapper className="max-w-7xl mx-auto px-4 -mt-10">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                        {error}
                    </div>
                )}

                {/* Analytics Overview */}
                {analytics && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <TrendingUp className="text-dsce-blue" />
                            Professional Analytics
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-6 bg-blue-50 rounded-xl">
                                <div className="text-3xl font-bold text-dsce-blue mb-2">{analytics.totalAlumni}</div>
                                <div className="text-sm text-gray-600">Total Alumni</div>
                            </div>
                            
                            <div className="text-center p-6 bg-green-50 rounded-xl">
                                <div className="text-3xl font-bold text-green-600 mb-2">{analytics.averageExperience}</div>
                                <div className="text-sm text-gray-600">Avg. Experience</div>
                            </div>
                            
                            <div className="text-center p-6 bg-purple-50 rounded-xl">
                                <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.recentGraduates}</div>
                                <div className="text-sm text-gray-600">Recent Graduates</div>
                            </div>
                            
                            <div className="text-center p-6 bg-orange-50 rounded-xl">
                                <div className="text-3xl font-bold text-orange-600 mb-2">{analytics.seniorAlumni}</div>
                                <div className="text-sm text-gray-600">Senior Professionals</div>
                            </div>
                        </div>

                        {/* Top Companies */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Companies</h3>
                            <div className="flex flex-wrap gap-3">
                                {analytics.topCompanies.map((company) => (
                                    <div key={company.company} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                                        {company.company} ({company.count})
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Department Distribution */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h3>
                            <div className="flex flex-wrap gap-3">
                                {analytics.departments.map((dept) => (
                                    <div key={dept.department} className="px-4 py-2 bg-dsce-blue/10 text-dsce-blue rounded-lg text-sm font-medium">
                                        {dept.department} ({dept.count})
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Experience Distribution */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Experience Distribution</h3>
                            <div className="flex flex-wrap gap-3">
                                {analytics.experienceDistribution.map((range) => (
                                    <div key={range.range} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium">
                                        {range.range} years: {range.count}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Filters and Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
                >
                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search alumni by name, email, company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 text-gray-800 placeholder-gray-400"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <Filter className="w-5 h-5 text-gray-600" />
                            <span className="text-gray-700 font-medium">Filters</span>
                            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                onClick={downloadResumes}
                                disabled={filteredAlumni.length === 0}
                                className="bg-dsce-blue text-white hover:bg-dsce-blue/90"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Resumes
                            </Button>
                            
                            <Button
                                onClick={exportToExcel}
                                disabled={filteredAlumni.length === 0}
                                className="bg-green-600 text-white hover:bg-green-700"
                            >
                                <FileSpreadsheet className="w-4 h-4 mr-2" />
                                Export to Excel
                            </Button>
                            
                            {selectedAlumni.length > 0 && (
                                <Button
                                    onClick={() => setShowContactModal(true)}
                                    className="bg-dsce-gold text-dsce-blue hover:bg-dsce-gold/90"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Contact Selected ({selectedAlumni.length})
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-100 overflow-hidden"
                            >
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => setSelectedDepartment(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                >
                                    <option value="all">All Departments</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedGraduationYear}
                                    onChange={(e) => setSelectedGraduationYear(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                >
                                    <option value="all">All Years</option>
                                    {graduationYears.map(year => (
                                        <option key={year} value={year.toString()}>{year}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedExperience}
                                    onChange={(e) => setSelectedExperience(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                >
                                    <option value="all">All Experience</option>
                                    <option value="0-2">0-2 years</option>
                                    <option value="3-5">3-5 years</option>
                                    <option value="6-10">6-10 years</option>
                                    <option value="10+">10+ years</option>
                                </select>

                                <select
                                    value={selectedCurrentCompany}
                                    onChange={(e) => setSelectedCurrentCompany(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                >
                                    <option value="all">All Current Companies</option>
                                    {currentCompanies.map(company => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                </select>

                                <select
                                    value={selectedPastCompany}
                                    onChange={(e) => setSelectedPastCompany(e.target.value)}
                                    className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                >
                                    <option value="all">All Past Companies</option>
                                    {pastCompanies.map(company => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                </select>

                                {/* Enhanced Skills Filter */}
                                <div className="relative min-w-[280px] skill-filter-container">
                                    <div className="space-y-3">
                                        {/* Skill Search Input */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                placeholder="Search skills..."
                                                value={skillSearchTerm}
                                                onChange={(e) => setSkillSearchTerm(e.target.value)}
                                                onKeyDown={handleSkillSearchKeyDown}
                                                onFocus={() => setShowSkillDropdown(true)}
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20"
                                            />
                                        </div>

                                        {/* Selected Skills Display */}
                                        {selectedSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedSkills.map(skill => (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-dsce-blue text-white text-sm rounded-full"
                                                    >
                                                        {skill}
                                                        <button
                                                            onClick={() => handleRemoveSkill(skill)}
                                                            className="hover:bg-dsce-blue/80 rounded-full p-0.5 transition-colors"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Skills Dropdown */}
                                        {showSkillDropdown && (skillSearchTerm || filteredSkills.length > 0) && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                {skillSearchTerm && !filteredSkills.length && (
                                                    <div className="px-4 py-3 text-gray-500 text-sm">
                                                        No skills found matching "{skillSearchTerm}"
                                                    </div>
                                                )}
                                                {filteredSkills.slice(0, 8).map(skill => (
                                                    <button
                                                        key={skill}
                                                        onClick={() => handleAddSkill(skill)}
                                                        className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        {skill}
                                                    </button>
                                                ))}
                                                {filteredSkills.length > 8 && (
                                                    <div className="px-4 py-2 text-gray-500 text-xs text-center">
                                                        ... and {filteredSkills.length - 8} more
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Selection Controls */}
                {filteredAlumni.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between mb-6 p-4 bg-dsce-blue/5 rounded-xl"
                    >
                        <div className="flex items-center gap-4">
                            <input
                                type="checkbox"
                                checked={selectedAlumni.length === filteredAlumni.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-dsce-blue rounded focus:ring-dsce-blue"
                            />
                            <span className="text-gray-700 font-medium">
                                Select all {filteredAlumni.length} alumni
                            </span>
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedAlumni.length} selected
                        </div>
                    </motion.div>
                )}

                {/* Alumni Grid */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedAlumni.length === filteredAlumni.length}
                                            onChange={() => handleSelectAll()}
                                            className="w-4 h-4 text-dsce-blue rounded focus:ring-dsce-blue"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Experience</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Graduation</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAlumni.map((alum: UserProfile) => (
                                    <motion.tr
                                        key={alum.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={`hover:bg-gray-50 ${selectedAlumni.find((a: UserProfile) => a.id === alum.id) ? 'bg-dsce-blue/5' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedAlumni.find((a: UserProfile) => a.id === alum.id)}
                                                onChange={() => handleSelectAlumni(alum)}
                                                className="w-4 h-4 text-dsce-blue rounded focus:ring-dsce-blue"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {alum.profilePicture ? (
                                                    <img 
                                                        src={`http://localhost:8080/${alum.profilePicture}`}
                                                        alt={alum.firstName}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-dsce-blue flex items-center justify-center text-white text-sm font-bold">
                                                        {alum.firstName?.[0]}{alum.lastName?.[0]}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleViewAlumniDetails(alum)}
                                                            className="font-medium text-gray-900 hover:text-dsce-blue hover:underline transition-colors"
                                                        >
                                                            {alum.firstName} {alum.lastName}
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewAlumniDetails(alum)}
                                                            className="text-gray-400 hover:text-dsce-blue transition-colors"
                                                            title="View full profile"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {alum.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {alum.department || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {alum.workExperiences?.[0]?.company || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {alum.workExperiences?.[0]?.year ? (
                                                (() => {
                                                    const startYear = alum.workExperiences[0].year;
                                                    const startMonth = alum.workExperiences[0].month;
                                                    const currentDate = new Date();
                                                    const currentYear = currentDate.getFullYear();
                                                    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
                                                    
                                                    // Debug: Log the data we're working with
                                                    console.log('Experience data:', {
                                                        startYear,
                                                        startMonth,
                                                        currentlyWorking: alum.workExperiences[0].currentlyWorking,
                                                        endYear: alum.workExperiences[0].endYear,
                                                        endMonth: alum.workExperiences[0].endMonth,
                                                        date: alum.workExperiences[0].date
                                                    });
                                                    
                                                    // Convert month name to number
                                                    const monthMap: { [key: string]: number } = {
                                                        'Jan': 1, 'January': 1, 'Feb': 2, 'February': 2, 'Mar': 3, 'March': 3,
                                                        'Apr': 4, 'April': 4, 'May': 5, 'Jun': 6, 'June': 6,
                                                        'Jul': 7, 'July': 7, 'Aug': 8, 'August': 8, 'Sep': 9, 'September': 9,
                                                        'Oct': 10, 'October': 10, 'Nov': 11, 'November': 11, 'Dec': 12, 'December': 12
                                                    };
                                                    
                                                    let startMonthNum = 1; // Default to January
                                                    if (startMonth) {
                                                        startMonthNum = monthMap[startMonth] || 1;
                                                    } else if (alum.workExperiences[0].date) {
                                                        // Fallback: try to extract month from date string like "Feb 2026 – Present"
                                                        const dateMatch = alum.workExperiences[0].date.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
                                                        if (dateMatch) {
                                                            startMonthNum = monthMap[dateMatch[0]] || 1;
                                                        }
                                                    }
                                                    
                                                    if (alum.workExperiences[0].currentlyWorking) {
                                                        const totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonthNum);
                                                        const years = Math.floor(totalMonths / 12);
                                                        const months = totalMonths % 12;
                                                        console.log('Currently working calculation:', { totalMonths, years, months });
                                                        return months > 0 ? `${years} years ${months} months` : `${years} years`;
                                                    } else if (alum.workExperiences[0].endYear && alum.workExperiences[0].endMonth) {
                                                        const endMonthNum = monthMap[alum.workExperiences[0].endMonth] || 1;
                                                        const totalMonths = (alum.workExperiences[0].endYear - startYear) * 12 + (endMonthNum - startMonthNum);
                                                        const years = Math.floor(totalMonths / 12);
                                                        const months = totalMonths % 12;
                                                        console.log('Ended position calculation:', { totalMonths, years, months });
                                                        return months > 0 ? `${years} years ${months} months` : `${years} years`;
                                                    } else {
                                                        const totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonthNum);
                                                        const years = Math.floor(totalMonths / 12);
                                                        const months = totalMonths % 12;
                                                        console.log('Fallback calculation:', { totalMonths, years, months });
                                                        return months > 0 ? `${years} years ${months} months` : `${years} years`;
                                                    }
                                                })()
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {alum.graduationYear || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                {alum.email && (
                                                    <button
                                                        onClick={() => window.open(`mailto:${alum.email}`)}
                                                        className="p-2 text-gray-400 hover:text-dsce-blue hover:bg-dsce-blue/5 rounded-lg transition-colors"
                                                        title="Email"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {alum.contactNumber && (
                                                    <button
                                                        onClick={() => window.open(`tel:${alum.contactNumber}`)}
                                                        className="p-2 text-gray-400 hover:text-dsce-blue hover:bg-dsce-blue/5 rounded-lg transition-colors"
                                                        title="Phone"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {alum.resumeUrl && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const resumeBlob = await apiClient.downloadResume(alum.id);
                                                                const url = URL.createObjectURL(resumeBlob);
                                                                window.open(url, '_blank');
                                                            } catch (error) {
                                                                console.error('Failed to view resume:', error);
                                                                alert('Failed to load resume. Please try again.');
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-dsce-blue hover:bg-dsce-blue/5 rounded-lg transition-colors"
                                                        title="View Resume"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </MotionWrapper>

            {/* Contact Modal */}
            <AnimatePresence>
                {showContactModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                Contact Selected Alumni
                            </h3>
                            
                            <div className="mb-6">
                                <div className="text-sm text-gray-600 mb-2">
                                    Sending message to {selectedAlumni.length} alumni:
                                </div>
                                <div className="max-h-32 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                                    {selectedAlumni.map((alum: UserProfile) => (
                                        <div key={alum.id} className="flex items-center justify-between py-2">
                                            <span className="font-medium text-gray-900">
                                                {alum.firstName} {alum.lastName}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {alum.workExperiences?.[0]?.company || 'No company'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    value={contactMessage}
                                    onChange={(e) => setContactMessage(e.target.value)}
                                    placeholder="Enter your message here..."
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 resize-none"
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowContactModal(false)}
                                    disabled={sendingMessage}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleContactSelected}
                                    disabled={sendingMessage || !contactMessage.trim()}
                                    className="bg-dsce-blue text-white hover:bg-dsce-blue/90"
                                >
                                    {sendingMessage ? 'Sending...' : 'Send Message'}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alumni Detail Modal */}
            <AnimatePresence>
                {showAlumniDetailModal && selectedAlumniDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                        onClick={() => setShowAlumniDetailModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        {selectedAlumniDetail.profilePicture ? (
                                            <img 
                                                src={`http://localhost:8080/${selectedAlumniDetail.profilePicture}`}
                                                alt={selectedAlumniDetail.firstName}
                                                className="w-16 h-16 rounded-full object-cover border-4 border-dsce-blue/20"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-dsce-blue flex items-center justify-center text-white text-2xl font-bold">
                                                {selectedAlumniDetail.firstName?.[0]}{selectedAlumniDetail.lastName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">
                                                {selectedAlumniDetail.firstName} {selectedAlumniDetail.lastName}
                                            </h2>
                                            <p className="text-gray-600">{selectedAlumniDetail.email}</p>
                                            <p className="text-sm text-gray-500">
                                                {selectedAlumniDetail.department} • Class of {selectedAlumniDetail.graduationYear}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setShowAlumniDetailModal(false)}
                                        variant="ghost"
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-6 h-6" />
                                    </Button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-5 h-5 text-gray-400" />
                                                <span>{selectedAlumniDetail.contactNumber || 'Not provided'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                                <a href={`mailto:${selectedAlumniDetail.email}`} 
                                                   className="text-dsce-blue hover:underline">
                                                    {selectedAlumniDetail.email}
                                                </a>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Linkedin className="w-5 h-5 text-gray-400" />
                                                <a href={selectedAlumniDetail.linkedinProfile?.startsWith('http') ? 
                                                    selectedAlumniDetail.linkedinProfile : `https://${selectedAlumniDetail.linkedinProfile}`}
                                                   target="_blank" rel="noopener noreferrer" 
                                                   className="text-dsce-blue hover:underline">
                                                    LinkedIn Profile
                                                </a>
                                            </div>
                                            {selectedAlumniDetail.website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-5 h-5 text-gray-400" />
                                                    <a href={selectedAlumniDetail.website} target="_blank" rel="noopener noreferrer" 
                                                       className="text-dsce-blue hover:underline">
                                                        Personal Website
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                                        <p className="text-gray-700">
                                            {selectedAlumniDetail.bio || 'No bio provided'}
                                        </p>
                                        {selectedAlumniDetail.location && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <span className="font-medium">Location:</span> {selectedAlumniDetail.location}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Work Experience Timeline */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Experience</h3>
                                    {selectedAlumniDetail.workExperiences && selectedAlumniDetail.workExperiences.length > 0 ? (
                                        <div className="relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                            
                                            <div className="space-y-6">
                                                {selectedAlumniDetail.workExperiences
                                                    .sort((a, b) => {
                                                        // Sort by year (most recent first)
                                                        const yearA = a.endYear || a.year || 0;
                                                        const yearB = b.endYear || b.year || 0;
                                                        return yearB - yearA;
                                                    })
                                                    .map((exp, index) => (
                                                        <div key={index} className="relative flex items-start gap-4">
                                                            {/* Timeline Dot */}
                                                            <div className="relative z-10 w-4 h-4 bg-dsce-blue rounded-full border-4 border-white shadow"></div>
                                                            
                                                            {/* Experience Card */}
                                                            <div className="flex-1 bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <h4 className="font-semibold text-gray-900 text-lg">
                                                                            {exp.jobTitle}
                                                                        </h4>
                                                                        <p className="text-dsce-blue font-medium">
                                                                            {exp.company}
                                                                        </p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm text-gray-600">
                                                                            {exp.year && exp.endYear 
                                                                                ? `${exp.year} - ${exp.endYear}`
                                                                                : exp.year 
                                                                                    ? `${exp.year} - Present`
                                                                                    : 'Duration not specified'
                                                                            }
                                                                        </p>
                                                                        {exp.month && exp.endMonth && (
                                                                            <p className="text-xs text-gray-500">
                                                {exp.month} - {exp.endMonth}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                
                                {exp.descriptions && exp.descriptions.length > 0 && (
                                    <ul className="mt-3 space-y-2">
                                        {exp.descriptions.map((desc, descIndex) => (
                                            <li key={descIndex} className="flex items-start gap-2 text-gray-700">
                                                <span className="w-1.5 h-1.5 bg-dsce-blue rounded-full mt-2 flex-shrink-0"></span>
                                                <span>{desc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                
                                {exp.currentlyWorking && (
                                    <div className="mt-3">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Currently Working
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">
                                            No work experience information available
                                        </p>
                                    )}
                                </div>

                                {/* Education */}
                                {selectedAlumniDetail.educations && selectedAlumniDetail.educations.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Education</h3>
                                        <div className="space-y-4">
                                            {selectedAlumniDetail.educations.map((edu, index) => (
                                                <div key={index} className="bg-gray-50 rounded-xl p-6">
                                                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                    <p className="text-dsce-blue font-medium">{edu.school}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {edu.year && edu.endYear 
                                                            ? `${edu.year} - ${edu.endYear}`
                                                            : edu.year 
                                                                ? `${edu.year} - Present`
                                                                : 'Duration not specified'
                                                        }
                                                    </p>
                                                    {edu.gpa && (
                                                        <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Skills */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Skills & Expertise</h3>
                                    <div className="space-y-4">
                                        {selectedAlumniDetail.featuredSkills && selectedAlumniDetail.featuredSkills.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-3">Featured Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedAlumniDetail.featuredSkills.map((skill, index) => (
                                                        <span key={index} 
                                                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-dsce-blue text-white">
                                                            {skill.skill}
                                                            {skill.rating && (
                                                                <span className="ml-1 text-xs">({skill.rating}/5)</span>
                                                            )}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {selectedAlumniDetail.skills && selectedAlumniDetail.skills.length > 0 && (
                                            <div>
                                                <h4 className="font-medium text-gray-700 mb-3">Other Skills</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedAlumniDetail.skills.map((skill, index) => (
                                                        <span key={index} 
                                                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Projects */}
                                {selectedAlumniDetail.projects && selectedAlumniDetail.projects.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Projects</h3>
                                        <div className="space-y-4">
                                            {selectedAlumniDetail.projects.map((project, index) => (
                                                <div key={index} className="bg-gray-50 rounded-xl p-6">
                                                    <h4 className="font-semibold text-gray-900">{project.project}</h4>
                                                    {project.date && (
                                                        <p className="text-sm text-gray-600 mb-2">{project.date}</p>
                                                    )}
                                                    {project.descriptions && project.descriptions.length > 0 && (
                                                        <ul className="space-y-1">
                                                            {project.descriptions.map((desc, descIndex) => (
                                                                <li key={descIndex} className="text-gray-700 text-sm">
                                                                    • {desc}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
