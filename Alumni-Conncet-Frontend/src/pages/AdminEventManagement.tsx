import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { apiClient, type EventDTO } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { 
  Star, 
  StarOff, 
  Trash2, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Loader2,
  Crown,
  Search,
  Filter
} from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';

const AdminEventManagement = () => {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'featured' | 'non-featured'>('all');
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const fetchEvents = async () => {
    if (!isAdmin) {
      return;
    }
    
    setLoading(true);
    try {
      const allEvents = await apiClient.getAllEventsForAdmin();
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast({
        title: "Error",
        description: "Failed to load events for admin management.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [isAdmin]);

  const handleFeatureEvent = async (eventId: string) => {
    try {
      await apiClient.featureEvent(eventId);
      toast({ title: "Success", description: "Event featured successfully!" });
      fetchEvents();
    } catch (error) {
      console.error('Failed to feature event', error);
      toast({ title: "Error", description: "Failed to feature event.", variant: "destructive" });
    }
  };

  const handleUnfeatureEvent = async (eventId: string) => {
    try {
      await apiClient.unfeatureEvent(eventId);
      toast({ title: "Success", description: "Event unfeatured successfully!" });
      fetchEvents();
    } catch (error) {
      console.error('Failed to unfeature event', error);
      toast({ title: "Error", description: "Failed to unfeature event.", variant: "destructive" });
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await apiClient.deleteEvent(eventId);
      toast({ title: "Success", description: "Event deleted successfully!" });
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event', error);
      toast({ title: "Error", description: "Failed to delete event.", variant: "destructive" });
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizerName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'featured' && event.featured) ||
                         (filter === 'non-featured' && !event.featured);
    
    return matchesSearch && matchesFilter;
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-16 h-16 mx-auto mb-4 text-dsce-blue/30" />
          <h1 className="text-2xl font-bold text-dsce-blue mb-2">Access Restricted</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light">
      <Helmet>
        <title>Event Management - Admin - DSCE Alumni Connect</title>
      </Helmet>

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-dsce-gold rounded-full mix-blend-overlay filter blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20 shadow-xl">
              <Crown className="h-8 w-8 text-dsce-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Admin <span className="text-dsce-gold">Event Management</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              Manage and feature events for the DSCE Alumni community.
            </p>
          </motion.div>
        </div>
      </div>

      <MotionWrapper className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20">
        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-dsce-blue/5 p-4 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events by title, location, or organizer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue transition-all text-gray-800 placeholder-gray-400"
              />
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 text-gray-700 min-w-[160px] cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">All Events</option>
                <option value="featured">Featured Only</option>
                <option value="non-featured">Not Featured</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-dsce-blue/5 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-dsce-blue/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-dsce-blue" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-dsce-blue/5 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Featured Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.filter(e => e.featured).length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-dsce-gold/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-dsce-gold" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-dsce-blue/5 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Regular Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.filter(e => !e.featured).length}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Events Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-dsce-blue/5 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-dsce-blue" />
              Event Management
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-dsce-blue" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No events found</p>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-700">Event</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Organizer</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">{event.title}</div>
                          {event.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dsce-gold/10 text-dsce-gold border border-dsce-gold/20">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {event.day} {event.month}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {event.location}
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {event.organizerName || 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        {event.featured ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                            Featured
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {event.featured ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfeatureEvent(event.id)}
                              className="border-gray-200 text-gray-600 hover:bg-gray-50"
                              title="Unfeature event"
                            >
                              <StarOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFeatureEvent(event.id)}
                              className="border-dsce-blue text-dsce-blue hover:bg-dsce-blue/5"
                              title="Feature event"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id, event.title)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete event"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </MotionWrapper>
    </div>
  );
};

export default AdminEventManagement;
