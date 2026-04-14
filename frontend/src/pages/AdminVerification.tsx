import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  CheckCircle,
  XCircle,
  Clock,
  Linkedin,
  Mail,
  Calendar,
  Search,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserX,
  Filter
} from 'lucide-react';
import { apiClient, type UserProfile } from '@/lib/api';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Button } from '@/components/ui/Button';
import { useToast } from "@/hooks/use-toast";
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

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
  }, [toast]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  useEffect(() => {
    let filtered = allRequests;
    filtered = filtered.filter(item =>
      (item.verificationStatus?.toLowerCase() || 'pending') === activeTab
    );
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
      const user = allRequests.find(u => u.id === id);
      if (user?.verificationStatus === 'REJECTED') {
        if (!window.confirm("This user was previously REJECTED. Are you sure you want to Re-Approve them?")) return;
      }
    } else if (action === 'reject') {
      const user = allRequests.find(u => u.id === id);
      if (user?.verificationStatus === 'APPROVED') {
        if (!window.confirm("This user is currently APPROVED. Are you sure you want to Reject (Revoke Access) for them?")) return;
      }
    }
    setActionLoading(id);
    try {
      await apiClient.verifyUser(id, action);
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

  const counts = {
    pending: allRequests.filter(i => (i.verificationStatus || 'PENDING') === 'PENDING').length,
    approved: allRequests.filter(i => i.verificationStatus === 'APPROVED').length,
    rejected: allRequests.filter(i => i.verificationStatus === 'REJECTED').length
  };

  const tabs = [
    { id: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', count: counts.pending },
    { id: 'approved', label: 'Accepted', icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', count: counts.approved },
    { id: 'rejected', label: 'Rejected', icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50', count: counts.rejected },
  ] as const;

  return (
    <div className="min-h-screen bg-dsce-bg-light pb-20">
      <Helmet>
        <title>Verification Command - DSCE Alumni Connect</title>
      </Helmet>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-[#003366] via-[#002244] to-[#001122] pt-32 pb-24 px-4 overflow-hidden shadow-2xl mb-8">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dsce-gold rounded-full mix-blend-screen filter blur-[120px] transform translate-x-1/3 -translate-y-1/3 animate-pulse" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-dsce-gold text-xs font-semibold mb-4">
                  <ShieldCheck size={12} className="animate-pulse" />
                  IDENTITY VERIFICATION
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Request <span className="text-dsce-gold">Portal</span>
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl font-light">
                  Manage alumni identity verification with precision. Approve community members and maintain platform integrity.
                </p>
              </div>

              <Button onClick={loadPendingRequests} disabled={loading} variant="outline" className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 px-6 rounded-xl flex items-center gap-2">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh Portal
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <MotionWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Stat Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative group h-full text-left transition-all duration-300 transform hover:-translate-y-1`}
            >
              <Card className={`h-full border-none rounded-2xl p-6 transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-white shadow-xl ring-2 ring-dsce-blue ring-offset-4 ring-offset-dsce-bg-light'
                  : 'bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md'
                }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${tab.bg} ${tab.color}`}>
                    <tab.icon size={24} />
                  </div>
                  <div className="text-3xl font-black text-gray-900 tracking-tighter">
                    {tab.count}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-lg font-bold ${activeTab === tab.id ? 'text-dsce-blue' : 'text-gray-600'}`}>
                    {tab.label}
                  </span>
                  {activeTab === tab.id && <div className="h-2 w-2 rounded-full bg-dsce-blue animate-pulse" />}
                </div>
              </Card>
            </button>
          ))}
        </div>

        {/* Global Filter & Search */}
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-white p-4 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-transparent rounded-xl focus:ring-2 focus:ring-dsce-blue focus:bg-white outline-none transition-all shadow-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-2 px-4 border-l border-gray-200 text-gray-500 font-semibold text-sm">
            <Filter size={16} />
            {filteredList.length} Results
          </div>
        </div>

        {/* Request List */}
        <AnimatePresence mode="wait">
          {loading && allRequests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24">
              <RefreshCw className="animate-spin h-12 w-12 text-dsce-blue mb-4" />
              <p className="font-bold text-dsce-blue animate-pulse">Synchronizing Identities...</p>
            </motion.div>
          ) : filteredList.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Workspace Clear</h3>
              <p className="text-gray-500 max-w-sm mx-auto">All alumni in this category have been processed. No pending actions required.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredList.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group border-none bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gradient-to-br from-dsce-blue to-[#002244] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-dsce-blue/20">
                            {request.firstName?.[0]}{request.lastName?.[0]}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-dsce-blue transition-colors">
                              {request.firstName} {request.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-bold text-dsce-blue">{request.department || 'General'}</span>
                              <span className="h-1 w-1 rounded-full bg-gray-300" />
                              <span className="text-sm font-medium text-gray-500">Class of {request.graduationYear || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        {request.linkedinProfile && (
                          <a href={request.linkedinProfile} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Linkedin size={20} />
                          </a>
                        )}
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center text-gray-600 text-sm font-medium">
                          <Mail className="w-4 h-4 mr-3 text-dsce-gold" />
                          {request.email}
                        </div>
                        <div className="flex items-center text-gray-600 text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-3 text-dsce-gold" />
                          Applied: {new Date(request.createdAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {request.verificationStatus === 'REJECTED' || (request.verificationStatus || 'PENDING') === 'PENDING' ? (
                          <Button
                            onClick={() => handleVerify(request.id, 'approve')}
                            disabled={!!actionLoading}
                            className="flex-1 bg-dsce-blue text-white hover:bg-[#002244] rounded-xl h-12 font-bold shadow-lg shadow-dsce-blue/10 gap-2"
                          >
                            <CheckCircle size={18} />
                            {request.verificationStatus === 'REJECTED' ? 'Re-Approve' : 'Accept Member'}
                          </Button>
                        ) : null}

                        {(request.verificationStatus || 'PENDING') !== 'REJECTED' ? (
                          <Button
                            variant={(request.verificationStatus === 'APPROVED') ? 'default' : 'outline'}
                            onClick={() => handleVerify(request.id, 'reject')}
                            disabled={!!actionLoading}
                            className={`h-12 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                              (request.verificationStatus || 'PENDING') === 'PENDING' 
                                ? 'flex-1 border-rose-200 text-rose-600 hover:bg-rose-50' 
                                : 'w-full bg-rose-600 text-white hover:bg-rose-700 border-none'
                              }`}
                          >
                            <XCircle size={18} />
                            {request.verificationStatus === 'APPROVED' ? 'Revoke Access' : 'Reject'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </MotionWrapper>
    </div>
  );
}
