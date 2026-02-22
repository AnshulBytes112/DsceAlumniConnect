import React from 'react';

interface ApplicationStatusProps {
    status: string;
}

export const ApplicationStatus: React.FC<ApplicationStatusProps> = ({ status }) => {
    let bgColor = 'bg-gray-100';
    let textColor = 'text-gray-800';

    switch (status.toLowerCase()) {
        case 'applied':
        case 'pending':
            bgColor = 'bg-blue-50';
            textColor = 'text-blue-700';
            break;
        case 'interview':
        case 'shortlisted':
            bgColor = 'bg-yellow-50';
            textColor = 'text-yellow-700';
            break;
        case 'rejected':
            bgColor = 'bg-red-50';
            textColor = 'text-red-700';
            break;
        case 'accepted':
        case 'hired':
            bgColor = 'bg-green-50';
            textColor = 'text-green-700';
            break;
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
            {status}
        </span>
    );
};
