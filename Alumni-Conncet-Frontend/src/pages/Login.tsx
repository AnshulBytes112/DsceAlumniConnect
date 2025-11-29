import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { GoogleSignInButton } from '@/components/ui/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login({
        email: data.email,
        password: data.password,
      });
      login(response);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${response.firstname}!`,
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <Helmet>
        <title>Login - DSCE Alumni Connect</title>
        <meta name="description" content="Sign in to your DSCE Alumni Connect account to access your dashboard and network." />
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-accent mb-6">
            <GraduationCap className="h-10 w-10 text-brand-bg" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-brand-light">
            Sign in to your Alumni Connect account
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm shadow-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-brand-accent-light/80">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="john@example.com" 
                        {...field} 
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        {...field} 
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-accent hover:text-brand-hover-1 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
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

              <GoogleSignInButton />
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-brand-light">Don't have an account? </span>
            <Link
              to="/register"
              className="font-semibold text-brand-accent hover:text-green-400 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
}
