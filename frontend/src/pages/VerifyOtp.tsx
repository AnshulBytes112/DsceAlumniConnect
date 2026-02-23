import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { GraduationCap, ArrowRight } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  const onSubmit = async (data: OtpFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('OTP submitted:', data);
    navigate('/dashboard');
  };

  return (
    <MotionWrapper className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F8F8] via-[#FFF9E6] to-[#F8F8F8] p-4">
      <Helmet>
        <title>Verify OTP - DSCE Alumni Connect</title>
      </Helmet>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#003366] mb-6 shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#003366]">
            Verify Your Email
          </h2>
          <p className="mt-2 text-[#333333]">
            We've sent a 6-digit code to your email
          </p>
        </div>

        <div className="rounded-xl border border-[#003366]/10 bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#333333]">Enter OTP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123456"
                        className="text-center text-2xl tracking-widest border-[#003366]/10 bg-[#F8F8F8] text-[#333333] placeholder:text-gray-500 focus-visible:ring-[#003366]/50"
                        maxLength={6}
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Verifying...' : 'Verify Email'}
                {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Didn't receive the code? </span>
            <button
              className="font-semibold text-[#003366] hover:text-[#00AEEF] transition-colors"
              onClick={() => alert('Resending OTP...')}
            >
              Resend
            </button>
          </div>
        </div>
      </div>
    </MotionWrapper>
  );
}
