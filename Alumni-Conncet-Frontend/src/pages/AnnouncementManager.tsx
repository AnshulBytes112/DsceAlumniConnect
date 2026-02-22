import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Megaphone, Plus, Search, Edit, Trash2,
  Clock, AlertCircle, CheckCircle2, MoreVertical,
  Calendar, RefreshCw, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiClient, type AnnouncementDTO } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import MotionWrapper from '@/components/ui/MotionWrapper';

export default function AnnouncementManager() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    time: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      toast({
        title: "Error",
        description: "Could not load announcements from the server.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await apiClient.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Deleted",
        description: "Announcement removed successfully."
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "An error occurred while trying to delete.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (announcement: AnnouncementDTO) => {
    setEditingId(announcement.id);
    setFormData({
      title: announcement.title,
      description: announcement.description,
      time: announcement.time
    });
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      time: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await apiClient.updateAnnouncement(editingId, formData);
        setAnnouncements(prev => prev.map(a => a.id === editingId ? updated : a));
        toast({ title: "Updated", description: "Announcement updated successfully." });
      } else {
        const created = await apiClient.createAnnouncement(formData);
        setAnnouncements(prev => [created, ...prev]);
        toast({ title: "Created", description: "New announcement broadcasted." });
      }
      setIsModalOpen(false);
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "An error occurred while saving the announcement.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAnnouncements = announcements.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dsce-bg-light">
      <Helmet>
        <title>Manage Announcements - Admin</title>
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
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-2xl mb-6 border border-white/20 shadow-xl">
              <Megaphone className="h-8 w-8 text-dsce-gold" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Manage <span className="text-dsce-gold">Announcements</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              Broadcast critical updates, event news, and official notices to the entire DSCE community.
            </p>
          </motion.div>
        </div>
      </div>

      <MotionWrapper className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 pb-20">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-12">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-dsce-blue/20 transition-all"
            />
          </div>

          <Button
            onClick={handleOpenCreate}
            className="bg-dsce-gold text-dsce-blue hover:bg-white hover:text-dsce-blue font-bold px-8 py-6 rounded-xl shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Broadcast
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <RefreshCw className="animate-spin h-8 w-8 text-dsce-blue mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">Syncing with Server</h3>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAnnouncements.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-dsce-blue/5 shadow-md overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-dsce-blue/5 rounded-lg">
                      <Clock className="h-4 w-4 text-dsce-blue" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.time}</span>
                  </div>
                  <h3 className="text-xl font-bold text-dsce-blue mb-3 leading-tight">{item.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">{item.description}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-2">
                  <Button variant="ghost" className="flex-1 text-dsce-blue hover:bg-dsce-blue/5" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900">No active broadcasts</h3>
            <p className="text-gray-500">Create your first announcement to reach the community.</p>
          </div>
        )}
      </MotionWrapper>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-dsce-blue/5 to-transparent">
                <h2 className="text-2xl font-bold text-dsce-blue">
                  {editingId ? 'Update Broadcast' : 'Create Broadcast'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Headline</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g. Alumni Meet 2024 Schedule"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Content</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter the full announcement details..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-dsce-blue/20 focus:border-dsce-blue focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 border border-gray-200 rounded-xl font-bold"
                  >
                    Discard
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 bg-dsce-blue text-white hover:bg-dsce-blue/90 rounded-xl font-bold shadow-lg shadow-dsce-blue/20"
                  >
                    {submitting ? (
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      editingId ? 'Save Changes' : 'Broadcast Now'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

