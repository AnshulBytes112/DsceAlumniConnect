import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, Briefcase, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  upcomingEvents: number;
  pendingVerifications: number;
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Alumni',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: 'Active Jobs',
      value: stats?.activeJobs || 0,
      icon: Briefcase,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      title: 'Upcoming Events',
      value: stats?.upcomingEvents || 0,
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 px-6">
      <Helmet>
        <title>Admin Analytics - DSCE Alumni Connect</title>
      </Helmet>

      <MotionWrapper className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Platform Analytics</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-white rounded-xl animate-pulse shadow-sm"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Future Chart Placeholder */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">System Healthy</h3>
          <p className="text-gray-500 mt-2">All systems operating normally. More charts coming soon.</p>
        </div>
      </MotionWrapper>
    </div>
  );
}
