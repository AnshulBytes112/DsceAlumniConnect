import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  Activity,
  BarChart3,
  RefreshCw,
  Zap,
  Crown,
  Star
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  upcomingEvents: number;
  pendingVerifications: number;
  latency: number;
  growth: number;
  newAlumni: number;
  healthStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const calculateStats = (alumni: any[], verifications: any[], jobs: any[], events: any[], latency: number, fetchErrors: boolean): DashboardStats => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentUsers = alumni.filter(u => u.createdAt && new Date(u.createdAt) > thirtyDaysAgo);
    const previousPeriodUsers = alumni.filter(u => {
      if (!u.createdAt) return false;
      const date = new Date(u.createdAt);
      return date <= thirtyDaysAgo && date > sixtyDaysAgo;
    });

    let growth = 0;
    if (previousPeriodUsers.length > 0) {
      growth = Math.round(((recentUsers.length - previousPeriodUsers.length) / previousPeriodUsers.length) * 100);
    } else if (recentUsers.length > 0) {
      growth = 100; // First month growth
    }

    return {
      totalUsers: alumni.length,
      pendingVerifications: verifications.filter(u => u.verificationStatus === 'PENDING').length,
      activeJobs: jobs.filter(j => j.active).length,
      upcomingEvents: events.length,
      latency: Math.round(latency),
      growth,
      newAlumni: recentUsers.length,
      healthStatus: fetchErrors ? 'DEGRADED' : 'HEALTHY'
    };
  };

  const fetchStats = async () => {
    setRefreshing(true);
    const startTime = performance.now();
    let hasErrors = false;

    try {
      const [alumni, verifications, jobs, events] = await Promise.all([
        apiClient.getAllAlumni().catch(() => { hasErrors = true; return []; }),
        apiClient.getVerifications().catch(() => { hasErrors = true; return []; }),
        apiClient.getAllJobs().catch(() => { hasErrors = true; return []; }),
        apiClient.getAllEvents().catch(() => { hasErrors = true; return []; })
      ]);

      const endTime = performance.now();
      const latency = endTime - startTime;

      setStats(calculateStats(alumni, verifications, jobs, events, latency, hasErrors));
      setError('');
    } catch (err) {
      console.error('Failed to load analytics', err);
      setError('Failed to load real-time analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Alumni',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/alumni',
      actionText: 'View Directory'
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/admin/verification',
      actionText: 'Review Requests'
    },
    {
      title: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/jobs',
      actionText: 'Manage Postings'
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/dashboard/events',
      actionText: 'Event Planner'
    },
    {
      title: 'Event Management',
      value: 'Manage',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      link: '/admin/events',
      actionText: 'Control Events'
    },
  ];

  return (
    <div className="min-h-screen bg-dsce-bg-light pb-12">
      <Helmet>
        <title>Admin Analytics - DSCE Alumni Connect</title>
      </Helmet>

      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue pt-32 pb-24 px-4 overflow-hidden shadow-2xl">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dsce-gold rounded-full mix-blend-screen filter blur-[120px] transform translate-x-1/3 -translate-y-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 rounded-full mix-blend-screen filter blur-[100px] transform -translate-x-1/4 translate-y-1/4" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-dsce-gold text-xs font-semibold mb-4">
                  <Activity size={12} className="animate-pulse" />
                  REAL-TIME INSIGHTS
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Admin <span className="text-dsce-gold">Command Center</span>
                </h1>
                <p className="text-gray-300 text-lg max-w-2xl font-light">
                  Monitoring platform health and community growth through live data synchronization.
                </p>
              </div>

              <Button
                onClick={fetchStats}
                disabled={refreshing}
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md h-12 px-6 rounded-xl hidden sm:flex items-center gap-2"
              >
                <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                Sync Updates
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <MotionWrapper className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-8 flex items-center shadow-lg"
          >
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-white/80 backdrop-blur-sm rounded-2xl animate-pulse shadow-sm border border-gray-100" />
            ))
          ) : (
            <AnimatePresence>
              {statCards.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full group border-none bg-white rounded-2xl p-0 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-colors duration-300`}>
                        <stat.icon size={24} />
                      </div>
                      <div className="text-3xl font-black text-gray-900 tracking-tighter">
                        {stat.value}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <CardTitle className="text-lg font-bold text-gray-800 mb-6">
                        {stat.title}
                      </CardTitle>
                      <Link to={stat.link}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-between px-4 py-6 rounded-xl border border-gray-100 group-hover:border-transparent group-hover:bg-dsce-blue group-hover:text-white transition-all duration-300 font-semibold text-gray-600`}
                        >
                          {stat.actionText}
                          <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* System Status Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 bg-white border-none rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-dsce-blue/5 rounded-lg text-dsce-blue">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Health Overview</h3>
                  <p className="text-sm text-gray-500">Live platform operational status</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${stats?.healthStatus === 'HEALTHY' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                }`}>
                <div className={`h-2 w-2 rounded-full ${stats?.healthStatus === 'HEALTHY' ? 'bg-green-500' : 'bg-yellow-500'} animate-ping`} />
                {stats?.healthStatus === 'HEALTHY' ? 'ALL SYSTEMS ACTIVE' : 'DEGRADED PERFORMANCE'}
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-dsce-blue flex items-center justify-center text-white shadow-lg shadow-dsce-blue/20">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">API Response Latency</h4>
                    <p className="text-sm text-gray-500">Real-time round-trip: {stats?.latency || 0}ms</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black px-2 py-1 rounded ${(stats?.latency || 0) < 200 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'
                    }`}>
                    {(stats?.latency || 0) < 200 ? 'EXCELLENT' : 'STABLE'}
                  </span>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-dsce-gold flex items-center justify-center text-dsce-blue shadow-lg shadow-dsce-gold/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Platform Gateway</h4>
                    <p className="text-sm text-gray-500">Cross-origin sync status: Active</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">CONNECTED</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-dsce-blue to-[#002244] border-none rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
            <BarChart3 className="w-16 h-16 text-white/10 absolute bottom-4 right-4" />

            <h3 className="text-2xl font-black mb-4 leading-tight">Platform<br />Insights</h3>
            <p className="text-blue-100 text-sm mb-8 leading-relaxed">
              The platform has seen a <span className="text-dsce-gold font-bold">{stats?.growth || 0}%</span> increase in alumni registrations over the last 30 days.
            </p>

            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 mb-6">
              <div className="text-dsce-gold text-2xl font-black mb-1">+{stats?.newAlumni || 0}</div>
              <div className="text-xs text-dsce-gold/80 font-bold uppercase tracking-widest">New Connections (30d)</div>
            </div>

            <Button className="w-full bg-dsce-gold text-dsce-blue hover:bg-dsce-gold/90 border-none font-bold rounded-xl py-6">
              Download Insights
            </Button>
          </Card>
        </div>

      </MotionWrapper>
    </div>
  );
}
