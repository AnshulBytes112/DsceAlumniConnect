import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        title: 'Invalid link',
        description: 'Reset token is missing. Please request a new link.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(
        '/api/auth/reset-password',
        { token, newPassword: data.password }
      );

      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated. Please log in.',
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to reset password. The link may have expired.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F8F8] via-[#FFF9E6] to-[#F8F8F8] p-4">
      <Helmet>
        <title>Reset Password - DSCE Alumni Connect</title>
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#003366] mb-6 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#003366]">Set New Password</h2>
          <p className="mt-2 text-[#333333]">Enter your new password below</p>
        </div>

        <div className="rounded-xl border border-[#003366]/10 bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#333333]">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="border-[#003366]/10 bg-[#F8F8F8] text-[#333333] placeholder:text-gray-500 focus-visible:ring-[#003366]/50 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((p) => !p)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#003366]"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
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
                    <FormLabel className="text-[#333333]">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="border-[#003366]/10 bg-[#F8F8F8] text-[#333333] placeholder:text-gray-500 focus-visible:ring-[#003366]/50 pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((p) => !p)}
                          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#003366]"
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="inline-flex items-center font-semibold text-[#003366] hover:text-[#00AEEF] transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
}
