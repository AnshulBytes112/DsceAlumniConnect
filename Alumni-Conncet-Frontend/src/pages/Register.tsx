import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import React, { useRef, useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight, X } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';

import { apiClient, type SignUpRequest } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  graduationYear: z.string().regex(/^\d{4}$/, 'Please enter a valid year'),
  department: z.string().min(1, 'Please select a department'),
  profilePicture: z.any().optional().refine(
    (file) => {
      if (!file) return true; // Optional field
      return file instanceof File;
    },
    'Profile picture must be a file'
  ).refine(
    (file) => {
      if (!file) return true;
      return ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
    },
    'Profile picture must be JPG, PNG, or GIF'
  ).refine(
    (file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB
    },
    'Profile picture must be less than 5MB'
  ),
  resume: z.any().optional().refine(
    (file) => {
      if (!file) return true; // Optional field
      return file instanceof File;
    },
    'Resume must be a file'
  ).refine(
    (file) => {
      if (!file) return true;
      return file.type === 'application/pdf';
    },
    'Resume must be a PDF file'
  ).refine(
    (file) => {
      if (!file) return true;
      return file.size <= 5 * 1024 * 1024; // 5MB
    },
    'Resume must be less than 5MB'
  ),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { formState } = form;
  const { errors, isSubmitting } = formState;

  // Hoisted state and refs for upload fields
  const profileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [profileDragActive, setProfileDragActive] = useState(false);
  const [resumeDragActive, setResumeDragActive] = useState(false);

  const profileWatched = useWatch({ control: form.control, name: 'profilePicture' });
  const resumeWatched = useWatch({ control: form.control, name: 'resume' });

  const previewUrl = profileWatched instanceof File ? URL.createObjectURL(profileWatched) : null;

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateFile = (file: File, accept: string, maxSize: number): boolean => {
    const acceptRegex = new RegExp(accept.replace(/\./g, '').split(',').join('|') + '$', 'i');
    const isValidType = acceptRegex.test(file.name);
    const isValidSize = file.size <= maxSize * 1024 * 1024;
    if (!isValidType) {
      alert(`Invalid file type. Accepted: ${accept}`);
      return false;
    }
    if (!isValidSize) {
      alert(`File too large. Max: ${maxSize}MB`);
      return false;
    }
    return true;
  };

  const removeProfilePicture = () => {
    form.setValue('profilePicture', null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const profileHandleClick = () => {
    profileInputRef.current?.click();
  };

  const profileHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file, '.jpg,.jpeg,.png,.gif', 5)) {
      form.setValue('profilePicture', file);
    } else {
      form.setValue('profilePicture', null);
    }
    e.target.value = '';
  };

  const profileHandleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setProfileDragActive(true);
  };

  const profileHandleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setProfileDragActive(true);
  };

  const profileHandleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setProfileDragActive(false);
  };

  const profileHandleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setProfileDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file, '.jpg,.jpeg,.png,.gif', 5)) {
      form.setValue('profilePicture', file);
      if (profileInputRef.current) profileInputRef.current.value = '';
      setTimeout(() => window.focus(), 0);
    } else {
      form.setValue('profilePicture', null);
    }
  };

  const resumeHandleClick = () => {
    resumeInputRef.current?.click();
  };

  const resumeHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file, '.pdf', 5)) {
      form.setValue('resume', file);
    } else {
      form.setValue('resume', null);
    }
    e.target.value = '';
  };

  const resumeHandleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResumeDragActive(true);
  };

  const resumeHandleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResumeDragActive(true);
  };

  const resumeHandleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResumeDragActive(false);
  };

  const resumeHandleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setResumeDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file, '.pdf', 5)) {
      form.setValue('resume', file);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
      setTimeout(() => window.focus(), 0);
    } else {
      form.setValue('resume', null);
    }
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const nameParts = data.fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';

      const signupData: SignUpRequest = {
        firstName,
        lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        graduationYear: parseInt(data.graduationYear),
        department: data.department,
        contactNumber: data.phoneNumber,
        resume: data.resume instanceof File ? data.resume : undefined,
        profilePicture: data.profilePicture instanceof File ? data.profilePicture : undefined,
      };

      const response = await apiClient.signup(signupData);
      login(response);
      toast({
        title: 'Account created successfully',
        description: `Welcome, ${response.firstname}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Sign up failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <Helmet>
        <title>Join Us - DSCE Alumni Connect</title>
        <meta name="description" content="Create your account to join the DSCE Alumni network and start connecting." />
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-accent mb-6">
            <GraduationCap className="h-10 w-10 text-brand-bg" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Join DSCE Alumni Connect
          </h2>
          <p className="mt-2 text-brand-accent-light">
            Create your account to stay connected
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
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
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1234567890"
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <div className="grid grid-cols-2 gap-4">
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
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="" className="bg-brand-bg">Select Department</option>
                        <option value="CSE" className="bg-brand-bg">CSE</option>
                        <option value="ECE" className="bg-brand-bg">ECE</option>
                        <option value="ME" className="bg-brand-bg">ME</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
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
              name="profilePicture"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <div
                        className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-colors ${
                          profileDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : errors.profilePicture
                            ? 'border-red-400 bg-red-50'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        onClick={profileHandleClick}
                        onDragOver={profileHandleDragOver}
                        onDragEnter={profileHandleDragEnter}
                        onDragLeave={profileHandleDragLeave}
                        onDrop={profileHandleDrop}
                      >
                        <input
                          ref={profileInputRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.gif"
                          onChange={profileHandleChange}
                          className="hidden"
                        />
                        <p className="text-sm text-brand-accent-light mb-2">Upload Profile Picture (Optional)</p>
                        <p className="text-xs text-white/60">Click or drag & drop (JPG, PNG, GIF up to 5MB)</p>
                      </div>
                      {previewUrl && (
                        <div className="flex items-center space-x-2">
                          <img
                            src={previewUrl}
                            alt="Profile picture preview"
                            className="h-24 w-24 rounded-full object-cover border-2 border-white/20"
                          />
                          <button
                            type="button"
                            onClick={removeProfilePicture}
                            className="text-sm text-red-600 hover:underline flex items-center"
                          >
                            <X className="h-4 w-4 mr-1" /> Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resume"
              render={({ field: { onChange, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <div className="space-y-2">
                      <div
                        className={`border-2 border-dashed p-6 rounded-lg cursor-pointer transition-colors ${
                          resumeDragActive
                            ? 'border-blue-400 bg-blue-50'
                            : errors.resume
                            ? 'border-red-400 bg-red-50'
                            : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                        onClick={resumeHandleClick}
                        onDragOver={resumeHandleDragOver}
                        onDragEnter={resumeHandleDragEnter}
                        onDragLeave={resumeHandleDragLeave}
                        onDrop={resumeHandleDrop}
                      >
                        <input
                          ref={resumeInputRef}
                          type="file"
                          accept=".pdf"
                          onChange={resumeHandleChange}
                          className="hidden"
                        />
                        <p className="text-sm text-brand-accent-light mb-2">Upload Resume - PDF (Optional)</p>
                        <p className="text-xs text-white/60">Click or drag & drop (PDF up to 5MB)</p>
                      </div>
                      {resumeWatched && (
                        <p className="text-sm text-white/70 mt-1">
                          {resumeWatched.name} - {((resumeWatched.size || 0) / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-brand-bg px-2 text-brand-light/60">
                  Or continue with
                </span>
              </div>
            </div>

            <GoogleSignInButton text="Sign up with Google" />
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-brand-light">Already have an account? </span>
            <Link
              to="/login"
              className="font-semibold text-brand-accent hover:text-green-300 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
}