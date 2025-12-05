import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Calendar, Loader2 } from 'lucide-react';
import { apiClient, type AnnouncementDTO } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiClient.getAnnouncements();
        setAnnouncements(data);
      } catch (error) {
        console.error('Failed to fetch announcements', error);
        toast({
          title: "Error",
          description: "Failed to load announcements.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Announcements - DSCE Alumni Connect</title>
      </Helmet>

      <div className="max-w-[1600px] mx-auto p-6 pt-32">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-dsce-blue">Announcements</h1>
          <p className="text-dsce-text-dark mt-2">Stay updated with the latest news and updates from the university.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-dsce-blue" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white/50 rounded-3xl border border-dsce-blue/10">
            <Bell className="w-12 h-12 mx-auto mb-4 text-dsce-blue/30" />
            <p className="text-lg font-medium">No announcements yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-dsce-blue/5 rounded-2xl text-dsce-blue group-hover:bg-dsce-blue group-hover:text-white transition-colors duration-300">
                    <Bell className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {announcement.time}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-dsce-text-dark mb-3 group-hover:text-dsce-blue transition-colors">
                  {announcement.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed flex-grow">
                  {announcement.description}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
