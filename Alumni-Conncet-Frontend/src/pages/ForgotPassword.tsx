import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const { formState } = form;
  const { isSubmitting } = formState;

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Forgot password submitted:', data);
    alert('Password reset link sent to your email');
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-brand-bg p-4">
      <Helmet>
        <title>Forgot Password - DSCE Alumni Connect</title>
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-accent mb-6">
            <GraduationCap className="h-10 w-10 text-brand-accent-light" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Forgot Password?
          </h2>
          <p className="mt-2 text-brand-light">
            Enter your email to receive reset instructions
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
                        className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-brand-accent/50"
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
              {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link
              to="/login"
              className="inline-flex items-center font-semibold text-brand-accent hover:text-brand-hover-1 transition-colors"
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
