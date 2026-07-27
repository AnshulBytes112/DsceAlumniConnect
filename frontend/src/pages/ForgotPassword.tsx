import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight, ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      // ponytail: goes via Vite proxy → localhost:8081; always 200 so UI just shows success
      await axios.post('/api/auth/forgot-password', { email: data.email });
      setEmailSent(true);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F8F8] via-[#FFF9E6] to-[#F8F8F8] p-4">
      <Helmet>
        <title>Forgot Password - DSCE Alumni Connect</title>
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#003366] mb-6 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#003366]">
            Forgot Password?
          </h2>
          <p className="mt-2 text-[#333333]">
            Enter your email to receive reset instructions
          </p>
        </div>

        <div className="rounded-xl border border-[#003366]/10 bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          {emailSent ? (
            <div className="text-center space-y-4">
              <MailCheck className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold text-[#003366]">Check your inbox</h3>
              <p className="text-sm text-[#333333]">
                If an account exists for that email, a password reset link has been sent. Check your spam folder too.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#333333]">Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          className="border-[#003366]/10 bg-[#F8F8F8] text-[#333333] placeholder:text-gray-500 focus-visible:ring-[#003366]/50"
                          {...field}
                        />
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
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</>
                  ) : (
                    <>Send Reset Link <ArrowRight className="ml-2 h-4 w-4" /></>
                  )}
                </Button>
              </form>
            </Form>
          )}

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
