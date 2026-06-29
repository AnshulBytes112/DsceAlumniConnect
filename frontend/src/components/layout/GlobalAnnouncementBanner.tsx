import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { apiClient, type AnnouncementDTO, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';

export default function GlobalAnnouncementBanner() {
  const [latestAnnouncement, setLatestAnnouncement] = useState<AnnouncementDTO | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await apiClient.getAnnouncements();
        if (data && data.length > 0) {
          setLatestAnnouncement(data[0]);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to fetch announcements for banner', error);
      }
    };
    
    // Only show the banner if they haven't dismissed it in this session
    const hasDismissed = sessionStorage.getItem('announcement_dismissed');
    if (!hasDismissed) {
      fetchAnnouncements();
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('announcement_dismissed', 'true');
  };

  if (!isVisible || !latestAnnouncement) return null;

  const hasImage = !!latestAnnouncement.imageUrl;
  const imageSrc = hasImage ? getImageUrl(latestAnnouncement.imageUrl) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleDismiss}
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {hasImage ? (
            <div className="relative w-full h-auto max-h-[60vh] bg-gray-100 flex-shrink-0">
              <img 
                src={imageSrc!} 
                alt="Announcement Poster" 
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue flex flex-col items-center justify-center p-8 text-center flex-shrink-0">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)]"></div>
              </div>
              <Megaphone className="w-16 h-16 text-dsce-gold mb-6 animate-pulse" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
                Important Update
              </h2>
              <div className="w-24 h-1 bg-dsce-gold rounded-full mb-4"></div>
            </div>
          )}

          <div className="p-6 sm:p-8 bg-white flex flex-col flex-1 overflow-y-auto">
            <h3 className="text-2xl font-bold text-dsce-blue mb-3">
              {latestAnnouncement.title}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-6">
              {latestAnnouncement.description}
            </p>
            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                {latestAnnouncement.time}
              </span>
              <Button 
                onClick={handleDismiss}
                className="bg-dsce-gold text-dsce-blue hover:bg-dsce-gold/90 font-bold px-6"
              >
                Got it
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
