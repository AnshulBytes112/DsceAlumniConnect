import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FileUploader } from '@/components/ui/FileUploader';
import { GraduationCap, ArrowRight } from 'lucide-react';
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
  resume: z.any().optional(), // In a real app, we'd validate the file type/size here too
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
        department: 'CSE', // Defaulting to CSE for now as per form
        contactNumber: data.phoneNumber,
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
              <div className="space-y-2">
                 <label className="text-sm font-medium text-brand-accent-light/80 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Department
                  </label>
                  <select className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-accent/50 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="cse" className="bg-brand-bg">CSE</option>
                    <option value="ece" className="bg-brand-bg">ECE</option>
                    <option value="me" className="bg-brand-bg">ME</option>
                  </select>
              </div>
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
              name="resume"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormControl>
                    <FileUploader
                      label="Upload Resume (Optional)"
                      accept=".pdf,.doc,.docx"
                      onChange={onChange}
                      error={errors.resume?.message as string}
                      {...field}
                    />
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
