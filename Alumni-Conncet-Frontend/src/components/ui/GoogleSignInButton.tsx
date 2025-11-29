import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
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

  const handleGoogleSignIn = async () => {
    try {
      // In a real app, this would trigger the Google OAuth flow
      // For now, we'll simulate a successful Google login with a mock token
      // The backend would verify this token
      const response = await apiClient.googleSignIn({ idToken: 'mock-google-token' });
      login(response);
      
      toast({
        title: 'Google Sign In successful',
        description: `Welcome, ${response.firstname}!`,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An error occurred');
      
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
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={`w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white ${className}`}
      onClick={handleGoogleSignIn}
    >
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
      </svg>
      {text}
    </Button>
  );
}
