import React, { useState } from 'react';
import { apiClient, type JobPostDTO } from '../lib/api';
import { Calendar, MapPin, Building, Trash2, Mail, ExternalLink, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import ConfirmDialog from './ConfirmDialog';

interface JobCardProps {
    job: JobPostDTO;
    onDelete: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onDelete }) => {
    const { user } = useAuth();
    const isOwner = user?.id === job.postedById || user?.role === 'ADMIN';
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await apiClient.deleteJob(job.id);
            onDelete(job.id);
        } catch (error) {
            console.error("Failed to delete job:", error);
            alert("Failed to delete job.");
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteDialog = () => {
        setShowDeleteDialog(true);
    };

    return (
        <>
            <motion.div
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl border border-dsce-blue/5 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
            <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-dsce-blue/5 flex items-center justify-center text-dsce-blue shadow-sm group-hover:scale-105 transition-transform duration-300">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-dsce-text-dark group-hover:text-dsce-blue transition-colors leading-tight mb-1">
                                {job.title}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm font-medium">
                                <Building className="h-3.5 w-3.5 mr-1" />
                                {job.company}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-medium border border-green-100">
                        {job.type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-50 text-gray-600 text-xs font-medium border border-gray-100">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(job.createdAt)}
                    </span>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {job.description}
                </p>
            </div>

            <div className="p-4 bg-gray-50/50 border-t border-gray-100 mt-auto">
                <div className="flex gap-3">
                    {job.applicationLink ? (
                        <Button
                            className="flex-1 bg-dsce-blue text-white hover:bg-dsce-blue/90 h-9 text-sm"
                            onClick={() => window.open(job.applicationLink, '_blank')}
                        >
                            <ExternalLink size={14} className="mr-2" />
                            Apply Now
                        </Button>
                    ) : (
                        <Button
                            className="flex-1 bg-dsce-blue text-white hover:bg-dsce-blue/90 h-9 text-sm"
                            onClick={() => job.contactEmail && (window.location.href = `mailto:${job.contactEmail}`)}
                        >
                            <Mail size={14} className="mr-2" />
                            Email
                        </Button>
                    )}

                    {isOwner && (
                        <button
                            onClick={openDeleteDialog}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 bg-white"
                            title="Delete Job"
                            disabled={isDeleting}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
                <div className="mt-3 text-xs text-center text-gray-400">
                    Posted by {job.postedByName}
                </div>
            </div>
        </motion.div>
        
        <ConfirmDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDelete}
            title="Delete Job Posting"
            message={`Are you sure you want to delete the job posting for "${job.title}" at ${job.company}? This action cannot be undone.`}
            confirmText="Delete Job"
            cancelText="Cancel"
            type="danger"
        />
        </>
    );
};

export default JobCard;
