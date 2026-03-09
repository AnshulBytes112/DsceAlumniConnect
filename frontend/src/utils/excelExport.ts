import * as XLSX from 'xlsx';
import type { UserProfile } from '@/lib/api';

export interface AlumniExportData {
    'S.No': number;
    'First Name': string;
    'Last Name': string;
    'Email': string;
    'Phone': string;
    'Department': string;
    'Graduation Year': number;
    'Bio': string;
    'Location': string;
    'LinkedIn Profile': string;
    'Website': string;
    'Current Company': string;
    'Job Title': string;
    'Experience': string;
    'Skills': string;
    'Featured Skills': string;
    'Projects': string;
}

export const exportAlumniToExcel = async (alumni: UserProfile[]) => {
    try {
        if (alumni.length === 0) {
            alert('No alumni data to export.');
            return;
        }

        // Prepare data for Excel export
        const excelData: AlumniExportData[] = alumni.map((alum, index) => ({
            'S.No': index + 1,
            'First Name': alum.firstName || '',
            'Last Name': alum.lastName || '',
            'Email': alum.email || '',
            'Phone': alum.contactNumber || '',
            'Department': alum.department || '',
            'Graduation Year': alum.graduationYear || 0,
            'Bio': alum.bio || '',
            'Location': alum.location || '',
            'LinkedIn Profile': alum.linkedinProfile || '',
            'Website': alum.website || '',
            'Current Company': alum.workExperiences?.[0]?.company || '',
            'Job Title': alum.workExperiences?.[0]?.jobTitle || '',
            'Experience': alum.workExperiences?.map(exp => `${exp.company} - ${exp.jobTitle}`).join('; ') || '',
            'Skills': alum.skills?.join(', ') || '',
            'Featured Skills': alum.featuredSkills?.map(fs => fs.skill).join(', ') || '',
            'Projects': alum.projects?.map(proj => proj.project || '').filter(p => p).join('; ') || ''
        }));

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Alumni Data');

        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        
        // Create download link
        const blob = new Blob([excelBuffer], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `DSCE_Alumni_Data_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return `Successfully exported ${alumni.length} alumni records to Excel!`;
    } catch (error) {
        console.error('Failed to export Excel:', error);
        throw new Error('Failed to export Excel. Please try again.');
    }
};
