import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiClient, type EventDTO } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const EventDetails = () => {
  const { eventId } = useParams<{ eventId: string }>();

  const [event, setEvent] = useState<EventDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpModalOpen, setRsvpModalOpen] = useState(false);
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
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light p-6 pt-32">
      <Helmet>
        <title>{event.title} - Event Details</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-dsce-blue/10"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-dsce-blue">{event.title}</h1>
            <p className="text-gray-600 mt-1 capitalize flex items-center gap-2">
              <Tag className="w-4 h-4 text-dsce-blue" />
              {event.category}
            </p>
          </div>

          {event.userRsvpStatus && (
            <span
              className={`px-4 py-2 text-xs font-bold rounded-full shadow-sm uppercase ${
                event.userRsvpStatus === "GOING"
                  ? "bg-green-100 text-green-700"
                  : event.userRsvpStatus === "MAYBE"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {event.userRsvpStatus.replace("_", " ")}
            </span>
          )}
        </div>

        {/* Date Section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-dsce-blue mr-3" />
            <p className="text-lg text-gray-700">
              {event.day} {event.month}
            </p>
          </div>

          <div className="flex items-center">
            <Clock className="w-6 h-6 text-dsce-blue mr-3" />
            <p className="text-lg text-gray-700">{event.time}</p>
          </div>

          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-dsce-blue mr-3" />
            <p className="text-lg text-gray-700">{event.location}</p>
          </div>

          {event.virtualLink && (
            <div className="flex items-center">
              <Globe className="w-6 h-6 text-dsce-blue mr-3" />
              <a
                href={event.virtualLink}
                target="_blank"
                className="text-dsce-blue underline"
              >
                Join Virtual Meeting
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-dsce-text-dark">About the Event</h2>
          <p className="text-gray-600 mt-2 whitespace-pre-line">
            {event.description || "No description provided."}
          </p>
        </div>

        {/* Organizer */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold">Organizer Information</h2>
          <div className="mt-3 space-y-1 text-gray-700">
            <p>
              <span className="font-medium">Organizer:</span>{" "}
              {event.organizerName || "Not specified"}
            </p>
            <p>
              <span className="font-medium">Contact:</span>{" "}
              {event.organizerContact || "Not provided"}
            </p>
          </div>
        </div>

        {/* RSVP Button */}
        <Button
          className="mt-10 w-full text-lg font-semibold rounded-xl bg-dsce-blue hover:bg-dsce-blue/90 text-white py-4"
          onClick={() => setRsvpModalOpen(true)}
        >
          {event.userRsvpStatus ? "Update RSVP" : "RSVP Now"}
        </Button>
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
