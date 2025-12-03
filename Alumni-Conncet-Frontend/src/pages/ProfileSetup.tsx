import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import React, { useState, useRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, Upload, FileText, Loader2, CheckCircle2, Plus, X, Briefcase, GraduationCap as GradCap, FolderKanban, Code } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const workExperienceSchema = z.object({
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  date: z.string().optional(),
  descriptions: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  school: z.string().optional(),
  degree: z.string().optional(),
  date: z.string().optional(),
  gpa: z.string().optional(),
  descriptions: z.array(z.string()).optional(),
});

const projectSchema = z.object({
  project: z.string().optional(),
  date: z.string().optional(),
  descriptions: z.array(z.string()).optional(),
});

const featuredSkillSchema = z.object({
  skill: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

// Helper function to normalize URLs - adds https:// if missing
const normalizeUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  const trimmed = url.trim();
  // If it already starts with http:// or https://, return as is
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  // If it starts with linkedin.com or www.linkedin.com, add https://
  if (trimmed.startsWith('linkedin.com/') || trimmed.startsWith('www.linkedin.com/')) {
    return `https://${trimmed}`;
  }
  // For other URLs, add https:// if it looks like a domain
  if (trimmed.includes('.') && !trimmed.includes(' ')) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// Custom URL validation that accepts URLs with or without protocol
const urlSchema = z.string()
  .optional()
  .or(z.literal(''))
  .refine(
    (val) => {
      if (!val || val === '') return true;
      const normalized = normalizeUrl(val);
      return z.string().url().safeParse(normalized).success;
    },
    { message: 'Please enter a valid URL' }
  );

const profileSetupSchema = z.object({
  graduationYear: z.string().regex(/^\d{4}$/, 'Please enter a valid year').optional(),
  department: z.string().min(1, 'Please select a department').optional(),
  contactNumber: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  linkedinProfile: urlSchema,
  website: urlSchema,
  workExperiences: z.array(workExperienceSchema).optional(),
  educations: z.array(educationSchema).optional(),
  projects: z.array(projectSchema).optional(),
  skills: z.array(z.string()).optional(),
  featuredSkills: z.array(featuredSkillSchema).optional(),
  profilePicture: z.any().optional(),
  resume: z.any().optional(),
});

type ProfileSetupFormValues = z.infer<typeof profileSetupSchema>;

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [resumeDragActive, setResumeDragActive] = useState(false);
  const [profileDragActive, setProfileDragActive] = useState(false);

  const form = useForm<ProfileSetupFormValues>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      graduationYear: '',
      department: '',
      contactNumber: '',
      bio: '',
      location: '',
      linkedinProfile: '',
      website: '',
      workExperiences: [],
      educations: [],
      projects: [],
      skills: [],
      featuredSkills: [],
    },
  });

  const resumeWatched = useWatch({ control: form.control, name: 'resume' });
  const profileWatched = useWatch({ control: form.control, name: 'profilePicture' });
  const previewUrl = profileWatched instanceof File ? URL.createObjectURL(profileWatched) : null;

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Load existing profile data if available
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        if (profile) {
          form.reset({
            graduationYear: profile.graduationYear?.toString() || '',
            department: profile.department || '',
            contactNumber: profile.contactNumber || '',
            bio: profile.bio || '',
            location: profile.location || '',
            linkedinProfile: profile.linkedinProfile || '',
            website: profile.website || '',
            workExperiences: profile.workExperiences || [],
            educations: profile.educations || [],
            projects: profile.projects || [],
            skills: profile.skills || [],
            featuredSkills: profile.featuredSkills || [],
          });
        }
      } catch (error) {
        // Profile might not exist yet, that's okay
        console.log('No existing profile found');
      }
    };
    loadProfile();
  }, [form]);

  const handleResumeUpload = async (file: File) => {
    setIsParsingResume(true);
    try {
      const result = await apiClient.uploadResume(file, false);
      setParsedData(result);

      // Wait a bit for backend to process and save the data
      // Increased wait time to ensure backend has processed the resume
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Auto-fill form with parsed data from user profile
      // The resume parsing happens on backend and updates the user profile
      // We'll fetch the updated profile to get parsed data
      const updatedProfile = await apiClient.getProfile();

      console.log('Updated profile after resume upload:', updatedProfile);

      if (updatedProfile) {
        // Build form data object with all fields
        const formData: Partial<ProfileSetupFormValues> = {
          ...form.getValues(), // Keep existing values
        };

        // Basic fields - always update if backend has the value (user just uploaded resume, so fill it in)
        if (updatedProfile.contactNumber) {
          formData.contactNumber = updatedProfile.contactNumber;
        }
        if (updatedProfile.bio) {
          formData.bio = updatedProfile.bio;
        }
        if (updatedProfile.location) {
          formData.location = updatedProfile.location;
        }
        if (updatedProfile.linkedinProfile) {
          formData.linkedinProfile = updatedProfile.linkedinProfile;
        }
        if (updatedProfile.website) {
          formData.website = updatedProfile.website;
        }
        if (updatedProfile.graduationYear) {
          formData.graduationYear = updatedProfile.graduationYear.toString();
        }
        if (updatedProfile.department) {
          formData.department = updatedProfile.department;
        }

        // Resume data fields - always update if backend has the data (flexible filling)
        if (updatedProfile.workExperiences && updatedProfile.workExperiences.length > 0) {
          console.log('Setting work experiences:', updatedProfile.workExperiences);
          formData.workExperiences = updatedProfile.workExperiences.map((we: any) => ({
            company: we.company || '',
            jobTitle: we.jobTitle || '',
            date: we.date || '',
            descriptions: Array.isArray(we.descriptions) ? we.descriptions : (we.description ? [we.description] : []),
          })).filter((we: any) => we.company || we.jobTitle || we.date || (we.descriptions && we.descriptions.length > 0)); // Only include if at least one field has data
        }
        if (updatedProfile.educations && updatedProfile.educations.length > 0) {
          console.log('Setting educations:', updatedProfile.educations);
          formData.educations = updatedProfile.educations.map((ed: any) => ({
            school: ed.school || '',
            degree: ed.degree || '',
            date: ed.date || '',
            gpa: ed.gpa || '',
            descriptions: Array.isArray(ed.descriptions) ? ed.descriptions : (ed.description ? [ed.description] : []),
          })).filter((ed: any) => ed.school || ed.degree || ed.date || (ed.descriptions && ed.descriptions.length > 0)); // Only include if at least one field has data
        }
        if (updatedProfile.projects && updatedProfile.projects.length > 0) {
          console.log('Setting projects:', updatedProfile.projects);
          formData.projects = updatedProfile.projects.map((proj: any) => ({
            project: proj.project || proj.name || '', // Support both 'project' and 'name' fields
            date: proj.date || '',
            descriptions: Array.isArray(proj.descriptions) ? proj.descriptions : (proj.description ? [proj.description] : []), // Support both 'descriptions' array and 'description' string
          })).filter((proj: any) => proj.project || proj.date || (proj.descriptions && proj.descriptions.length > 0)); // Only include projects with at least one field
        }
        if (updatedProfile.skills && updatedProfile.skills.length > 0) {
          console.log('Setting skills:', updatedProfile.skills);
          // Clean skills: filter out empty strings, null, undefined, and strings that are just commas/whitespace
          formData.skills = updatedProfile.skills
            .filter((skill: any) => skill && typeof skill === 'string' && skill.trim().length > 0)
            .map((skill: any) => skill.trim())
            .filter((skill: string) => skill !== ',' && skill !== '');
        }
        if (updatedProfile.featuredSkills && updatedProfile.featuredSkills.length > 0) {
          console.log('Setting featured skills:', updatedProfile.featuredSkills);
          formData.featuredSkills = updatedProfile.featuredSkills.map((fs: any) => ({
            skill: fs.skill || '',
            rating: fs.rating || 1,
          }));
        }

        // Update form with all data at once using reset to trigger re-render
        form.reset(formData);

        // Force form validation
        await form.trigger();
      }

      toast({
        title: 'Resume parsed successfully',
        description: 'Your profile has been auto-filled from your resume. You can review and edit the information.',
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      toast({
        title: 'Resume parsing failed',
        description: error instanceof Error ? error.message : 'Could not parse resume. Please fill the form manually.',
        variant: 'destructive',
      });
    } finally {
      setIsParsingResume(false);
    }
  };

  const resumeHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type === 'application/pdf') {
      form.setValue('resume', file);
      handleResumeUpload(file);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a PDF file',
        variant: 'destructive',
      });
    }
    e.target.value = '';
  };

  const resumeHandleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResumeDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      form.setValue('resume', file);
      handleResumeUpload(file);
    }
  };

  const profileHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      form.setValue('profilePicture', file);
    }
    e.target.value = '';
  };

  const onSubmit = async (data: ProfileSetupFormValues) => {
    setIsSubmitting(true);
    try {
      // Build profile data object - exclude resume and profilePicture (they're sent separately)
      const profileData: any = {};

      // Note: firstName and lastName are not in the form, they come from the user object
      // Only include fields that are actually in the form
      if (data.graduationYear) profileData.graduationYear = parseInt(data.graduationYear);
      if (data.department) profileData.department = data.department;
      if (data.contactNumber) profileData.contactNumber = data.contactNumber;
      if (data.bio) profileData.bio = data.bio;
      if (data.location) profileData.location = data.location;
      if (data.linkedinProfile) profileData.linkedinProfile = normalizeUrl(data.linkedinProfile);
      if (data.website) profileData.website = normalizeUrl(data.website);
      if (data.workExperiences && data.workExperiences.length > 0) profileData.workExperiences = data.workExperiences;
      if (data.educations && data.educations.length > 0) profileData.educations = data.educations;
      if (data.projects && data.projects.length > 0) profileData.projects = data.projects;
      if (data.skills && data.skills.length > 0) profileData.skills = data.skills;
      if (data.featuredSkills && data.featuredSkills.length > 0) profileData.featuredSkills = data.featuredSkills;

      await apiClient.setupProfile({
        profileData: Object.keys(profileData).length > 0 ? profileData : undefined,
        profilePicture: data.profilePicture instanceof File ? data.profilePicture : undefined,
        resume: data.resume instanceof File ? data.resume : undefined,
      });

      // Refresh user data
      const updatedProfile = await apiClient.getProfile();
      if (user) {
        const updatedUser = {
          ...user,
          profileComplete: updatedProfile.profileComplete || false,
          firstName: updatedProfile.firstName || user.firstName,
          lastName: updatedProfile.lastName || user.lastName,
          profilePicture: updatedProfile.profilePicture || user.profilePicture,
          resumeUrl: updatedProfile.resumeUrl || user.resumeUrl,
        };
        login(updatedUser);
      }

      toast({
        title: 'Profile setup complete!',
        description: 'Your profile has been saved successfully.',
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Profile setup failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MotionWrapper className="min-h-screen bg-brand-bg p-4 py-12">
      <Helmet>
        <title>Complete Your Profile - DSCE Alumni Connect</title>
        <meta name="description" content="Complete your profile to start connecting with alumni." />
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-accent mb-6">
            <GraduationCap className="h-10 w-10 text-brand-bg" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-brand-accent-light">
            Add your details or upload your resume to auto-fill your profile
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Resume Upload Section */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-brand-accent" />
                  Upload Resume (Optional)
                </h3>
                <p className="text-sm text-brand-accent-light mb-4">
                  Upload your resume PDF and we'll automatically fill in your profile details
                </p>

                <div
                  className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-colors ${resumeDragActive
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  onClick={() => resumeInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setResumeDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setResumeDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setResumeDragActive(false); }}
                  onDrop={resumeHandleDrop}
                >
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={resumeHandleChange}
                    className="hidden"
                  />
                  <div className="text-center">
                    {isParsingResume ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-accent mb-2" />
                        <p className="text-sm text-brand-accent-light">Parsing resume...</p>
                      </div>
                    ) : parsedData ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                        <p className="text-sm text-white">Resume parsed successfully!</p>
                        <p className="text-xs text-brand-accent-light mt-1">Review and edit the auto-filled information below</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                        <p className="text-sm text-brand-accent-light mb-2">Click or drag & drop your resume PDF here</p>
                        <p className="text-xs text-white/60">PDF files up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>
                {resumeWatched && (
                  <p className="text-sm text-white/70 mt-2">
                    {resumeWatched.name} - {((resumeWatched.size || 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>

              {/* Profile Picture */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Profile Picture (Optional)</h3>
                <div
                  className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-colors ${profileDragActive
                    ? 'border-brand-accent bg-brand-accent/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  onClick={() => profileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setProfileDragActive(true); }}
                  onDragEnter={(e) => { e.preventDefault(); setProfileDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setProfileDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setProfileDragActive(false);
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      form.setValue('profilePicture', file);
                    }
                  }}
                >
                  <input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={profileHandleChange}
                    className="hidden"
                  />
                  {previewUrl ? (
                    <div className="flex items-center space-x-4">
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
                      />
                      <div>
                        <p className="text-sm text-white">Profile picture selected</p>
                        <p className="text-xs text-brand-accent-light">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-brand-accent mx-auto mb-2" />
                      <p className="text-sm text-brand-accent-light">Click or drag & drop to upload</p>
                      <p className="text-xs text-white/60">JPG, PNG, GIF up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Manual Entry Fields */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="graduationYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-accent-light/80">Graduation Year</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2023"
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-accent-light/80">Department</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                            {...field}
                          >
                            <option value="" className="bg-brand-bg">Select Department</option>
                            <option value="CSE" className="bg-brand-bg">CSE</option>
                            <option value="ECE" className="bg-brand-bg">ECE</option>
                            <option value="ME" className="bg-brand-bg">ME</option>
                            <option value="CE" className="bg-brand-bg">CE</option>
                            <option value="EEE" className="bg-brand-bg">EEE</option>
                            <option value="ISE" className="bg-brand-bg">ISE</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-accent-light/80">Contact Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+1234567890"
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-accent-light/80">Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, Country"
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-accent-light/80">Bio</FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Tell us about yourself..."
                          rows={4}
                          className="flex w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="linkedinProfile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-accent-light/80">LinkedIn Profile</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="linkedin.com/in/yourprofile or https://linkedin.com/in/yourprofile"
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                            {...field}
                            onBlur={(e) => {
                              // Normalize URL on blur
                              const normalized = normalizeUrl(e.target.value);
                              if (normalized !== e.target.value) {
                                field.onChange(normalized);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-brand-accent-light/80">Website</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="yourwebsite.com or https://yourwebsite.com"
                            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                            {...field}
                            onBlur={(e) => {
                              // Normalize URL on blur
                              const normalized = normalizeUrl(e.target.value);
                              if (normalized !== e.target.value) {
                                field.onChange(normalized);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Work Experiences Section */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Briefcase className="mr-2 h-5 w-5 text-brand-accent" />
                    Work Experience
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.getValues('workExperiences') || [];
                      form.setValue('workExperiences', [...current, { company: '', jobTitle: '', date: '', descriptions: [] }]);
                    }}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="workExperiences"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          {(field.value || []).map((exp, index) => (
                            <div key={index} className="p-4 border border-white/10 rounded-lg bg-white/5">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-white font-medium">Experience {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues('workExperiences') || [];
                                    form.setValue('workExperiences', current.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Company"
                                    value={exp.company || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('workExperiences') || [];
                                      current[index].company = e.target.value;
                                      form.setValue('workExperiences', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="Job Title"
                                    value={exp.jobTitle || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('workExperiences') || [];
                                      current[index].jobTitle = e.target.value;
                                      form.setValue('workExperiences', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="Date (e.g., Jan 2020 - Dec 2022)"
                                    value={exp.date || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('workExperiences') || [];
                                      current[index].date = e.target.value;
                                      form.setValue('workExperiences', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white md:col-span-2"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-white/70 mb-1 block">Job Description / Responsibilities</label>
                                  <textarea
                                    placeholder="Describe your responsibilities, achievements, and key contributions..."
                                    value={Array.isArray(exp.descriptions) ? exp.descriptions.join('\n') : (exp.descriptions || '')}
                                    onChange={(e) => {
                                      const current = form.getValues('workExperiences') || [];
                                      // Split by newlines and filter empty strings
                                      current[index].descriptions = e.target.value.split('\n').filter(line => line.trim().length > 0);
                                      form.setValue('workExperiences', [...current]);
                                    }}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 resize-none"
                                  />
                                  <p className="text-xs text-white/50 mt-1">Enter each bullet point on a new line</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!field.value || field.value.length === 0) && (
                            <p className="text-sm text-white/60 text-center py-4">No work experience added yet. Upload resume to auto-fill or add manually.</p>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Education Section */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <GradCap className="mr-2 h-5 w-5 text-brand-accent" />
                    Education
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.getValues('educations') || [];
                      form.setValue('educations', [...current, { school: '', degree: '', date: '', gpa: '', descriptions: [] }]);
                    }}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="educations"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          {(field.value || []).map((edu, index) => (
                            <div key={index} className="p-4 border border-white/10 rounded-lg bg-white/5">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-white font-medium">Education {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues('educations') || [];
                                    form.setValue('educations', current.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="School/University"
                                    value={edu.school || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('educations') || [];
                                      current[index].school = e.target.value;
                                      form.setValue('educations', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="Degree"
                                    value={edu.degree || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('educations') || [];
                                      current[index].degree = e.target.value;
                                      form.setValue('educations', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="Date (e.g., 2019 - 2023)"
                                    value={edu.date || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('educations') || [];
                                      current[index].date = e.target.value;
                                      form.setValue('educations', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="GPA (optional)"
                                    value={edu.gpa || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('educations') || [];
                                      current[index].gpa = e.target.value;
                                      form.setValue('educations', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-white/70 mb-1 block">Additional Details / Achievements</label>
                                  <textarea
                                    placeholder="Describe relevant coursework, achievements, honors, or activities..."
                                    value={Array.isArray(edu.descriptions) ? edu.descriptions.join('\n') : (edu.descriptions || '')}
                                    onChange={(e) => {
                                      const current = form.getValues('educations') || [];
                                      // Split by newlines and filter empty strings
                                      current[index].descriptions = e.target.value.split('\n').filter(line => line.trim().length > 0);
                                      form.setValue('educations', [...current]);
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 resize-none"
                                  />
                                  <p className="text-xs text-white/50 mt-1">Enter each bullet point on a new line</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!field.value || field.value.length === 0) && (
                            <p className="text-sm text-white/60 text-center py-4">No education added yet. Upload resume to auto-fill or add manually.</p>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Projects Section */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <FolderKanban className="mr-2 h-5 w-5 text-brand-accent" />
                    Projects
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.getValues('projects') || [];
                      form.setValue('projects', [...current, { project: '', date: '', descriptions: [] }]);
                    }}
                    className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="projects"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          {(field.value || []).map((proj, index) => (
                            <div key={index} className="p-4 border border-white/10 rounded-lg bg-white/5">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-white font-medium">Project {index + 1}</h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const current = form.getValues('projects') || [];
                                    form.setValue('projects', current.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Project Name"
                                    value={proj.project || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('projects') || [];
                                      current[index].project = e.target.value;
                                      form.setValue('projects', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                  <Input
                                    placeholder="Date (e.g., Jan 2023)"
                                    value={proj.date || ''}
                                    onChange={(e) => {
                                      const current = form.getValues('projects') || [];
                                      current[index].date = e.target.value;
                                      form.setValue('projects', [...current]);
                                    }}
                                    className="border-white/10 bg-white/5 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm text-white/70 mb-1 block">Description</label>
                                  <textarea
                                    placeholder="Describe the project, technologies used, and your contributions..."
                                    value={Array.isArray(proj.descriptions) ? proj.descriptions.join('\n') : (proj.descriptions || '')}
                                    onChange={(e) => {
                                      const current = form.getValues('projects') || [];
                                      // Split by newlines and filter empty strings
                                      current[index].descriptions = e.target.value.split('\n').filter(line => line.trim().length > 0);
                                      form.setValue('projects', [...current]);
                                    }}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-white/10 rounded-md bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 resize-none"
                                  />
                                  <p className="text-xs text-white/50 mt-1">Enter each bullet point on a new line</p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!field.value || field.value.length === 0) && (
                            <p className="text-sm text-white/60 text-center py-4">No projects added yet. Upload resume to auto-fill or add manually.</p>
                          )}
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills Section */}
              <div className="border-b border-white/10 pb-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Code className="mr-2 h-5 w-5 text-brand-accent" />
                  Skills
                </h3>
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-brand-accent-light/80">Skills (comma-separated)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Java, Spring Boot, React, MongoDB"
                          value={(field.value || []).filter(s => s && s.trim().length > 0).join(', ')}
                          onChange={(e) => {
                            // Split by comma, trim each skill, filter out empty strings and commas
                            const skills = e.target.value
                              .split(',')
                              .map(s => s.trim())
                              .filter(s => s.length > 0 && s !== ',');
                            form.setValue('skills', skills);
                          }}
                          className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </MotionWrapper>
  );
}

