import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  Check,
  X,
  HelpCircle,
  Loader2,
  Globe,
  Users,
  Share2,
  Heart,
  MessageCircle,
  Eye,
  ArrowLeft,
  User,
  Mail,
  ExternalLink,
  Bell,
  Download,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiClient, type EventDTO } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const { toast } = useToast();

  const fetchEvent = async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      console.log("Fetching event with ID:", eventId);
      const data = await apiClient.getEventById(eventId);
      setEvent(data);
      
      // Simulate engagement metrics
      setViewCount(Math.floor(Math.random() * 500) + 100);
      setLikeCount(Math.floor(Math.random() * 100) + 20);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Error",
        description: "Failed to load event details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: string) => {
    try {
      await apiClient.rsvpEvent(eventId!, status);
      toast({
        title: "RSVP Updated",
        description: `You are now ${status.replace("_", " ").toLowerCase()}.`,
      });
      setRsvpModalOpen(false);
      fetchEvent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update RSVP.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Event link copied to clipboard!",
      });
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    toast({
      title: isLiked ? "Removed from Likes" : "Added to Likes",
      description: isLiked ? "Event removed from your likes." : "Event added to your likes!",
    });
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from Bookmarks" : "Added to Bookmarks",
      description: isBookmarked ? "Event removed from your bookmarks." : "Event saved to your bookmarks!",
    });
  };

  const handleExportCalendar = () => {
    // Create a simple calendar event file (ICS format)
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event?.title}
DESCRIPTION:${event?.description}
LOCATION:${event?.location}
DTSTART:${event?.day} ${event?.starttime}
DTEND:${event?.day} ${event?.endtime}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Calendar Event Created",
      description: "Event has been added to your calendar!",
    });
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dsce-bg-light">
        <Loader2 className="w-10 h-10 animate-spin text-dsce-blue" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Event not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light">
      <Helmet>
        <title>{event?.title} - Event Details</title>
      </Helmet>

      {/* Back Button */}
      <div className="max-w-6xl mx-auto p-6 pt-32">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-dsce-blue hover:text-dsce-blue/80 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto px-6 pb-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-xl border border-dsce-blue/10 overflow-hidden"
            >
              {/* Hero Section */}
              <div className="bg-gradient-to-r from-dsce-blue via-dsce-blue/90 to-dsce-light-blue p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {event?.category || 'Event'}
                      </span>
                      {event?.userRsvpStatus && (
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {event.userRsvpStatus.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold mb-4">{event?.title}</h1>
                    <div className="flex flex-wrap gap-4 text-white/90">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        <span>{event?.day} {event?.month}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        <span>{event?.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{event?.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[100px]">
                    <div className="text-xs font-bold uppercase tracking-wide mb-1">{event?.month}</div>
                    <div className="text-3xl font-bold">{event?.day}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    className="bg-white text-dsce-blue hover:bg-white/90 font-semibold rounded-xl"
                    onClick={() => setRsvpModalOpen(true)}
                  >
                    {event?.userRsvpStatus ? "Update RSVP" : "RSVP Now"}
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl"
                    onClick={handleExportCalendar}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Add to Calendar
                  </Button>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="p-6 border-b border-dsce-blue/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={handleLike}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      <span className="font-medium">{likeCount}</span>
                    </button>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-medium">{Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Eye className="w-5 h-5" />
                      <span className="font-medium">{viewCount}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleBookmark}
                    className="text-gray-600 hover:text-dsce-blue transition-colors"
                  >
                    <Star className={`w-5 h-5 ${isBookmarked ? 'fill-dsce-blue text-dsce-blue' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-dsce-text-dark mb-4">About the Event</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {event?.description || "No description provided."}
                  </p>
                </div>
                
                {event?.maxParticipants && (
                  <div className="mt-6 p-4 bg-dsce-blue/5 rounded-xl border border-dsce-blue/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-dsce-blue" />
                        <span className="font-medium text-dsce-text-dark">Available Seats</span>
                      </div>
                      <span className="text-2xl font-bold text-dsce-blue">{event.maxParticipants}</span>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-dsce-blue h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(75, Math.random() * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{Math.floor(Math.random() * 50) + 10} people already registered</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-xl border border-dsce-blue/10 p-8"
            >
              <h2 className="text-xl font-bold text-dsce-text-dark mb-6">Event Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-dsce-text-dark mb-2 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-dsce-blue" />
                      Date & Time
                    </h3>
                    <p className="text-gray-600">{event?.day} {event?.month}</p>
                    <p className="text-gray-600">{event?.time}</p>
                    {event?.starttime && event?.endtime && (
                      <p className="text-sm text-gray-500">Start: {event.starttime} - End: {event.endtime}</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-dsce-text-dark mb-2 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-dsce-blue" />
                      Location
                    </h3>
                    <p className="text-gray-600">{event?.location}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {event?.virtualLink && (
                    <div>
                      <h3 className="font-semibold text-dsce-text-dark mb-2 flex items-center">
                        <Globe className="w-5 h-5 mr-2 text-dsce-blue" />
                        Virtual Meeting
                      </h3>
                      <a
                        href={event.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-dsce-blue hover:text-dsce-blue/80 underline"
                      >
                        Join Virtual Meeting
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  
                  {event?.registrationDeadline && (
                    <div>
                      <h3 className="font-semibold text-dsce-text-dark mb-2 flex items-center">
                        <Bell className="w-5 h-5 mr-2 text-dsce-blue" />
                        Registration Deadline
                      </h3>
                      <p className="text-gray-600">{event.registrationDeadline}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Organizer Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl shadow-xl border border-dsce-blue/10 p-8"
            >
              <h2 className="text-xl font-bold text-dsce-text-dark mb-6 flex items-center">
                <User className="w-6 h-6 mr-2 text-dsce-blue" />
                Organizer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-dsce-text-dark">{event?.organizerName || "DSCE Alumni Association"}</p>
                  <p className="text-sm text-gray-500">Event Organizer</p>
                </div>
                
                {event?.organizerContact && (
                  <div className="space-y-3">
                    <a
                      href={`mailto:${event.organizerContact}`}
                      className="flex items-center gap-3 text-dsce-blue hover:text-dsce-blue/80 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{event.organizerContact}</span>
                    </a>
                  </div>
                )}
                
                <div className="pt-4 border-t border-dsce-blue/10">
                  <Button className="w-full bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-xl font-semibold">
                    Contact Organizer
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl border border-dsce-blue/10 p-8"
            >
              <h2 className="text-xl font-bold text-dsce-text-dark mb-6">Quick Actions</h2>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-dsce-blue/20 hover:bg-dsce-blue/5 font-medium"
                  onClick={() => setRsvpModalOpen(true)}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  {event?.userRsvpStatus ? "Update RSVP" : "RSVP to Event"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start border-dsce-blue/20 hover:bg-dsce-blue/5 font-medium"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-3" />
                  Share Event
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start border-dsce-blue/20 hover:bg-dsce-blue/5 font-medium"
                  onClick={handleExportCalendar}
                >
                  <Download className="w-4 h-4 mr-3" />
                  Add to Calendar
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start border-dsce-blue/20 hover:bg-dsce-blue/5 font-medium"
                  onClick={handleBookmark}
                >
                  <Star className={`w-4 h-4 mr-3 ${isBookmarked ? 'fill-dsce-blue text-dsce-blue' : ''}`} />
                  {isBookmarked ? "Bookmarked" : "Bookmark Event"}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* RSVP Modal */}
      <AnimatePresence>
        {rsvpModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center"
            >
              <Calendar className="w-12 h-12 text-dsce-blue mx-auto mb-4" />
              <h2 className="text-xl font-bold text-dsce-text-dark mb-2">Your RSVP</h2>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => handleRsvp("GOING")}
                  className="w-full p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 font-semibold flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-3" /> Going
                </button>

                <button
                  onClick={() => handleRsvp("MAYBE")}
                  className="w-full p-4 rounded-xl bg-yellow-50 text-yellow-700 border border-yellow-200 font-semibold flex items-center justify-center"
                >
                  <HelpCircle className="w-5 h-5 mr-3" /> Maybe
                </button>

                <button
                  onClick={() => handleRsvp("NOT_GOING")}
                  className="w-full p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 font-semibold flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-3" /> Not Going
                </button>
              </div>

              <button
                className="mt-6 text-gray-400 hover:text-gray-600 font-medium"
                onClick={() => setRsvpModalOpen(false)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetails;
