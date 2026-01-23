import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, XCircle, Clock, Linkedin, Mail, Calendar, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Button } from '@/components/ui/Button'; // Assuming Button component availability
import { useToast } from "@/hooks/use-toast";

export default function AdminVerification() {
  const { toast } = useToast();
  const [allRequests, setAllRequests] = useState<UserProfile[]>([]);
  const [filteredList, setFilteredList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const loadPendingRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getVerifications();
      setAllRequests(data);
    } catch (error) {
      console.error("Failed to load verifications", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pending verifications",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  // Filter requests
  useEffect(() => {
    let filtered = allRequests;

    // Filter by active tab
    filtered = filtered.filter(item =>
      (item.verificationStatus?.toLowerCase() || 'pending') === activeTab
    );

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.firstName.toLowerCase().includes(term) ||
        item.lastName.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        (item.department || '').toLowerCase().includes(term)
      );
    }

    setFilteredList(filtered);
  }, [allRequests, searchTerm, activeTab]);

  async function handleVerify(id: string, action: 'approve' | 'reject') {
    if (action === 'approve') {
      // Check if user is currently rejected to show specific confirmation
      const user = allRequests.find(u => u.id === id);
      if (user?.verificationStatus === 'REJECTED') {
        if (!window.confirm("This user was previously REJECTED. Are you sure you want to Re-Approve them?")) {
          return;
        }
      }
    } else if (action === 'reject') {
      // Check if user is currently approved to show specific confirmation
      const user = allRequests.find(u => u.id === id);
      if (user?.verificationStatus === 'APPROVED') {
        if (!window.confirm("This user is currently APPROVED. Are you sure you want to Reject (Revoke Access) for them?")) {
          return;
        }
      }
    }
    setActionLoading(id);
    try {
      await apiClient.verifyUser(id, action);

      // Optimistic update
      setAllRequests(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, verificationStatus: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : item
        )
      );
      toast({
        title: "Success",
        description: `User ${action}d successfully`,
      });
    } catch (error) {
      console.error(`Failed to ${action} user`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to ${action} user`,
      });
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getStatusBadge(status?: string) {
    const s = (status || 'PENDING').toLowerCase();
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };

    const icons = {
      pending: <Clock className="w-4 h-4 mr-1" />,
      approved: <CheckCircle className="w-4 h-4 mr-1" />,
      rejected: <XCircle className="w-4 h-4 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[s as keyof typeof styles] || styles.pending}`}>
        {icons[s as keyof typeof icons] || icons.pending}
        {s.charAt(0).toUpperCase() + s.slice(1)}
      </span>
    );
  }

  const counts = {
    pending: allRequests.filter(i => (i.verificationStatus || 'PENDING') === 'PENDING').length,
    approved: allRequests.filter(i => i.verificationStatus === 'APPROVED').length,
    rejected: allRequests.filter(i => i.verificationStatus === 'REJECTED').length
  };

  const tabs = [
    { id: 'pending', label: 'Pending Requests', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', count: counts.pending },
    { id: 'approved', label: 'Accepted Requests', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', count: counts.approved },
    { id: 'rejected', label: 'Rejected Requests', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', count: counts.rejected },
  ] as const;

  return (
    <MotionWrapper className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light py-8 mt-12">
      <Helmet>
        <title>Verification Requests - Admin Dashboard</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dsce-blue">Verification Requests</h1>
          <p className="mt-2 text-gray-600">Review and verify alumni identities.</p>
        </div>

        {/* Tabbed Stats Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  relative flex items-center p-6 rounded-lg border text-left transition-all duration-200
                  ${isActive
                    ? 'bg-white ring-2 ring-dsce-blue border-transparent shadow-md'
                    : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }
                `}
              >
                <div className={`p-3 rounded-lg ${tab.bg}`}>
                  <tab.icon className={`w-6 h-6 ${tab.color}`} />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isActive ? 'text-dsce-blue' : 'text-gray-500'}`}>
                    {tab.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 mb-6 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dsce-blue focus:border-transparent outline-none"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={loadPendingRequests}
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading && allRequests.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-dsce-blue" />
          </div>
        ) : filteredList.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">All caught up! No pending verification requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredList.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Request Info */}
                    <div className="flex-1">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-dsce-blue rounded-full flex items-center justify-center mr-4 text-white font-bold text-lg">
                          {request.firstName?.[0]}{request.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {request.firstName} {request.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                              {request.department || 'No Dept'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span>Batch {request.graduationYear || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="truncate">{request.email}</span>
                        </div>
                        {request.linkedinProfile && (
                          <div className="flex items-center">
                            <Linkedin className="w-4 h-4 mr-2 text-blue-600" />
                            <a
                              href={request.linkedinProfile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Joined: {formatDate(request.createdAt || new Date().toISOString())}</span>
                          {/* Assuming createdAt is relevant date */}
                        </div>
                        <div className="flex items-center mt-1">
                          {getStatusBadge(request.verificationStatus)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {(request.verificationStatus || 'PENDING') === 'PENDING' && (
                      <div className="flex flex-row gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => handleVerify(request.id, 'reject')}
                          disabled={!!actionLoading}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                        >
                          {actionLoading === request.id ? '...' : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => handleVerify(request.id, 'approve')}
                          disabled={!!actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white border-transparent"
                        >
                          {actionLoading === request.id ? 'Processing...' : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {request.verificationStatus === 'REJECTED' && (
                      <div className="flex flex-row gap-3">
                        <Button
                          onClick={() => handleVerify(request.id, 'approve')}
                          disabled={!!actionLoading}
                          className="bg-green-600 hover:bg-green-700 text-white border-transparent"
                        >
                          {actionLoading === request.id ? 'Processing...' : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Re-Approve
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {request.verificationStatus === 'APPROVED' && (
                      <div className="flex flex-row gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => handleVerify(request.id, 'reject')}
                          disabled={!!actionLoading}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200"
                        >
                          {actionLoading === request.id ? 'Processing...' : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Revoke
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MotionWrapper>
  );
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={`animate-spin ${className}`} />;
}


