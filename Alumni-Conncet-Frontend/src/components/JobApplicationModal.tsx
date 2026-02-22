import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient, type JobPostDTO } from '../lib/api';
import { Button } from './ui/Button';

interface JobApplicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    job: JobPostDTO | null;
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
    isOpen,
    onClose,
    job
}) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!job) return null;

    const handleApply = async () => {
        setLoading(true);
        setError(null);
        try {
            await apiClient.applyForJob(job.id);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSuccess(false);
        setError(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative z-10"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Apply for Job</h2>
                            <button
                                onClick={handleClose}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6">
                            {success ? (
                                <div className="text-center py-8">
                                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
                                    <p className="text-gray-600">
                                        You have successfully applied for the <span className="font-semibold">{job.title}</span> position at <span className="font-semibold">{job.company}</span>.
                                    </p>
                                    <Button
                                        className="mt-6 w-full bg-dsce-blue text-white"
                                        onClick={handleClose}
                                    >
                                        Done
                                    </Button>
                                </div>
                            ) : (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                        <p className="text-gray-600 font-medium">{job.company}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            By confirming, your profile will be securely submitted to the job poster.
                                        </p>
                                    </div>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handleClose}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1 bg-dsce-blue text-white"
                                            onClick={handleApply}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Application'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
