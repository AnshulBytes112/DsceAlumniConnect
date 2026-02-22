import React, { useEffect, useState } from 'react';
import { apiClient, type JobApplicationDTO } from '../lib/api';
import { ApplicationCard } from './ApplicationCard';
import { Loader2, Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export const ApplicationTracker: React.FC = () => {
    const [applications, setApplications] = useState<JobApplicationDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await apiClient.getJobApplications();
                setApplications(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load applications');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleWithdraw = (id: string) => {
        setApplications(prev => prev.filter(app => app.id !== id));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 text-dsce-blue animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500 bg-red-50 rounded-xl">
                {error}
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <Inbox className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No applications yet</h3>
                <p className="text-gray-500 mt-1">When you apply for jobs, they will appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {applications.map((app, index) => (
                <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <ApplicationCard application={app} onWithdraw={handleWithdraw} />
                </motion.div>
            ))}
        </div>
    );
};
