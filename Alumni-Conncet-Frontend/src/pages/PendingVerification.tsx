import { Helmet } from 'react-helmet-async';
import { Clock, Mail, CheckCircle, User, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingVerification() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-[#FFF9E6] to-[#F8F8F8] flex items-center justify-center p-4">
      <Helmet>
        <title>Verification Pending - DSCE Alumni Connect</title>
      </Helmet>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#003366] mb-2">
            Verification Pending
          </h1>
          <p className="text-gray-600 mb-6">
            Your account is currently under review. Our admin team will verify your details shortly.
          </p>

          {/* User Info Card */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>Email: {user.email}</span>
                </div>
                {user.graduationYear && (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Batch: {user.graduationYear}</span>
                  </div>
                )}
                {user.department && (
                  <div className="flex items-center text-gray-600">
                    <span className="w-4 h-4 mr-2">🎓</span>
                    <span>Department: {user.department}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center text-yellow-800">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-medium">Your verification request has been submitted</span>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              You will receive an email notification once your account is approved.
            </p>
          </div>

          {/* Timeline */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-yellow-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Admin Review</p>
                  <p className="text-sm text-gray-500">Our team reviews your application</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-gray-400">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Verification Complete</p>
                  <p className="text-sm text-gray-400">Get notified via email</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-bold text-gray-400">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-500">Access Dashboard</p>
                  <p className="text-sm text-gray-400">Access all alumni features</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-[#003366] text-white rounded-lg font-semibold hover:bg-[#002244] transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Check Status
            </button>

            <Link
              to="/logout"
              className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Logout
            </Link>
          </div>

          {/* Help */}
          <p className="text-xs text-gray-500 mt-6">
            Need help? Contact us at{' '}
            <a href="mailto:support@dsce.edu.in" className="text-blue-600 hover:underline">
              support@dsce.edu.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

