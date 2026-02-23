import { Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export default function VerificationPending() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-dsce-bg-light flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-dsce-bg-cream rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-dsce-blue" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-dsce-text-dark">Verification Pending</h1>
                    <p className="text-gray-600">
                        Thanks for signing up! Your account is currently under review by the alumni administration team.
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 text-left">
                    <p className="font-semibold mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 opacity-90">
                        <li>We'll verify your graduation details</li>
                        <li>This usually takes 24-48 hours</li>
                        <li>You'll receive an email once approved</li>
                    </ul>
                </div>

                <div className="pt-4">
                    <Button
                        variant="outline"
                        className="w-full border-dsce-blue text-dsce-blue hover:bg-dsce-blue/10"
                        onClick={logout}
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
