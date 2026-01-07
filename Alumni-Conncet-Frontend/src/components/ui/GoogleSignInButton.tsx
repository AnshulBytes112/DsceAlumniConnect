import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/use-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
  onSuccess?: (response: any) => void;
  onError?: (error: Error) => void;
  text?: string;
  className?: string;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  text = "Sign in with Google",
  className
}: GoogleSignInButtonProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const loginFn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // ... existing success logic
      try {
        // console.log('Google login success, token:', tokenResponse);
        // Send access token to backend
        const response = await apiClient.googleSignIn({
          accessToken: tokenResponse.access_token
        });

        // Update auth context
        login(response);

        toast({
          title: 'Google Sign In successful',
          description: `Welcome, ${response.firstName}!`,
        });

        if (onSuccess) {
          onSuccess(response);
        } else {
          // Default navigation if no callback provided
          if (!response.profileComplete) {
            navigate('/profile-setup');
          } else {
            navigate('/dashboard');
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('An error occurred');
        console.error('Google backend auth error:', err);
        if (onError) {
          onError(err);
        } else {
          toast({
            title: 'Google Sign In failed',
            description: err.message,
            variant: 'destructive',
          });
        }
      }
    },
    onError: (errorResponse) => {
       console.error('Google login error:', errorResponse);
       toast({
         title: 'Google Sign In failed',
         description: 'Could not connect to Google.',
         variant: 'destructive',
       });
    }
  });

  const handleGoogleSignIn = () => {
    if (!clientId || clientId === 'mock_client_id') {
      toast({
        title: 'Configuration Missing',
        description: 'Google Client ID is missing. Sign-in is disabled.',
        variant: 'destructive',
      });
      return;
    }
    loginFn();
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full border-[#003366]/10 bg-white text-[#333333] hover:bg-[#F8F8F8] hover:border-[#00AEEF]/50 ${className}`}
      onClick={() => handleGoogleSignIn()}
    >
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
      </svg>
      {text}
    </Button>
  );
}
