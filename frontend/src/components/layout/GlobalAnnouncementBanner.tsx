import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient, type AnnouncementDTO, type EventDTO, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type BannerItem = {
  id: string;
  type: 'announcement' | 'event';
  title: string;
  description: string;
  time: string;
  imageUrl?: string;
  originalData: any;
};

export default function GlobalAnnouncementBanner() {
  const [items, setItems] = useState<BannerItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [announcements, featuredEvents] = await Promise.all([
          apiClient.getAnnouncements().catch(() => []),
          apiClient.getFeaturedEvents().catch(() => [])
        ]);

        const bannerItems: BannerItem[] = [];

        // Add featured announcements
        announcements.forEach((a: AnnouncementDTO) => {
          if (a.featured) {
            bannerItems.push({
              id: `ann-${a.id}`,
              type: 'announcement',
              title: a.title,
              description: a.description,
              time: a.time,
              imageUrl: a.imageUrl,
              originalData: a
            });
          }
        });

        // Add featured events that have posters
        featuredEvents.forEach((e: EventDTO) => {
          if (e.imageUrl) {
            bannerItems.push({
              id: `evt-${e.id}`,
              type: 'event',
              title: e.title,
              description: e.description || 'Join us for this featured event!',
              time: `${e.day} ${e.month} | ${e.time}`,
              imageUrl: e.imageUrl,
              originalData: e
            });
          }
        });

        if (bannerItems.length > 0) {
          setItems(bannerItems);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to fetch banner content', error);
      }
    };
    
    // Trigger on initial load, OR every time they explicitly visit the landing page
    if (location.pathname === '/' || location.pathname === '/landing') {
      fetchContent();
    } else if (items.length === 0) {
      // Still fetch on first load if they enter through a different route (e.g. /dashboard)
      fetchContent();
    }
  }, [location.pathname]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  if (!isVisible || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const hasImage = !!currentItem.imageUrl;
  const imageSrc = hasImage ? getImageUrl(currentItem.imageUrl) : null;

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

          {items.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 backdrop-blur-md text-white rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {hasImage ? (
                  <div className="relative w-full h-auto max-h-[60vh] bg-black flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={imageSrc!} 
                      alt="Banner Poster" 
                      className="w-full h-full object-contain max-h-[60vh]"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-dsce-blue via-[#002244] to-dsce-blue flex flex-col items-center justify-center p-8 text-center flex-shrink-0">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_0%,transparent_100%)]"></div>
                    </div>
                    <Megaphone className="w-16 h-16 text-dsce-gold mb-6 animate-pulse" />
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 uppercase tracking-wide">
                      {currentItem.type === 'event' ? 'Featured Event' : 'Important Update'}
                    </h2>
                    <div className="w-24 h-1 bg-dsce-gold rounded-full mb-4"></div>
                  </div>
                )}

                <div className="p-6 sm:p-8 bg-white flex flex-col flex-1 overflow-y-auto">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-dsce-blue/10 text-dsce-blue text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {currentItem.type}
                    </span>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {currentItem.time}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-dsce-blue mb-3">
                    {currentItem.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line mb-6">
                    {currentItem.description}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {items.length > 1 && items.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-dsce-blue w-6' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                    <Button 
                      onClick={handleDismiss}
                      className="bg-dsce-gold text-dsce-blue hover:bg-dsce-gold/90 font-bold px-6"
                    >
                      Got it
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
