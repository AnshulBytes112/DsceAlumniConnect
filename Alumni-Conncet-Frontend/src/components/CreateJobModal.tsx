import React, { useState } from 'react';
import { X, Loader2, Briefcase, Building, MapPin, AlignLeft, List, Mail, Globe } from 'lucide-react';
import { apiClient } from '../lib/api';
import { Button } from '@/components/ui/Button';

interface CreateJobModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJobCreated: () => void;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onJobCreated }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        type: 'Full-time',
        description: '',
        requirements: '',
        contactEmail: '',
        applicationLink: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await apiClient.createJob(formData);
            onJobCreated();
            onClose();
            setFormData({
                title: '',
                company: '',
                location: '',
                type: 'Full-time',
                description: '',
                requirements: '',
                contactEmail: '',
                applicationLink: ''
            });
        } catch (err: any) {
            setError(err.message || 'Failed to create job posting');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dsce-blue/20 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-dsce-text-dark">
                            Post a New Job
                        </h2>
                        <p className="text-sm text-gray-500">Share a career opportunity with the alumni network</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-dsce-blue transition-colors p-2 hover:bg-dsce-blue/5 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Briefcase size={16} className="text-dsce-gold" /> Job Title
                            </label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Building size={16} className="text-dsce-gold" /> Company
                            </label>
                            <input
                                required
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                placeholder="e.g. Tech Corp"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <MapPin size={16} className="text-dsce-gold" /> Location
                            </label>
                            <input
                                required
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="e.g. Remote, Bangalore"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <List size={16} className="text-dsce-gold" /> Type
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white cursor-pointer"
                            >
                                <option value="Full-time">Full-time</option>
                                <option value="Part-time">Part-time</option>
                                <option value="Contract">Contract</option>
                                <option value="Internship">Internship</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <AlignLeft size={16} className="text-dsce-gold" /> Description
                        </label>
                        <textarea
                            required
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe the role and responsibilities..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white resize-y min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <List size={16} className="text-dsce-gold" /> Requirements
                        </label>
                        <textarea
                            name="requirements"
                            value={formData.requirements}
                            onChange={handleChange}
                            rows={3}
                            placeholder="List key qualifications and skills..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white resize-y min-h-[80px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Mail size={16} className="text-dsce-gold" /> Contact Email
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                placeholder="recruiter@example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Globe size={16} className="text-dsce-gold" /> Application Link
                            </label>
                            <input
                                type="url"
                                name="applicationLink"
                                value={formData.applicationLink}
                                onChange={handleChange}
                                placeholder="https://careers.company.com/..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue outline-none transition-all hover:bg-white"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200"
                        >
                            Cancel
                        </button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-dsce-blue hover:bg-dsce-blue/90 text-white shadow-lg shadow-dsce-blue/20"
                        >
                            {loading && <Loader2 size={18} className="animate-spin mr-2" />}
                            Post Job
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobModal;
