import React from 'react';
import { motion } from 'framer-motion';
import { Building, Calendar, Trash2 } from 'lucide-react';
import { type JobApplicationDTO, apiClient } from '../lib/api';
import { ApplicationStatus } from './ApplicationStatus';
import { Button } from './ui/Button';

interface ApplicationCardProps {
    application: JobApplicationDTO;
    onWithdraw: (id: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onWithdraw }) => {
    const handleWithdraw = async () => {
        if (confirm('Are you sure you want to withdraw this application?')) {
            try {
                await apiClient.withdrawJobApplication(application.id);
                onWithdraw(application.id);
            } catch (error) {
                console.error("Failed to withdraw application", error);
                alert("Failed to withdraw application.");
            }
        }
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between h-full"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-dsce-blue transition-colors">
                        {application.role}
                    </h3>
                    <ApplicationStatus status={application.status} />
                </div>

                <div className="flex flex-col gap-1 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-400" />
                        {application.company}
                    </div>
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        Applied on {application.date}
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                <Button
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 h-8 px-3 py-1 text-sm"
                    onClick={handleWithdraw}
                >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Withdraw
                </Button>
            </div>
        </motion.div>
    );
};
