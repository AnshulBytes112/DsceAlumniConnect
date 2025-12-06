import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Plus, Check, X, HelpCircle, Loader2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { apiClient, type EventDTO } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet-async';

const Events = () => {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [rsvpModalEventId, setRsvpModalEventId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newEvent, setNewEvent] = useState({
    title: '',
    day: '',
    month: '',
    time: '',
    location: ''
  });

  const fetchEvents = async () => {
    try {
      const data = await apiClient.getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events', error);
      toast({
        title: "Error",
        description: "Failed to load events.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.createEvent(newEvent);
      toast({ title: "Success", description: "Event created successfully!" });
      setIsAddModalOpen(false);
      setNewEvent({ title: '', day: '', month: '', time: '', location: '' });
      fetchEvents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create event.", variant: "destructive" });
    }
  };

  const handleRsvp = async (status: string) => {
    if (!rsvpModalEventId) return;
    try {
      await apiClient.rsvpEvent(rsvpModalEventId, status);
      toast({ title: "RSVP Updated", description: `You are now ${status.toLowerCase().replace('_', ' ')}.` });
      setRsvpModalEventId(null);
      fetchEvents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update RSVP.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>Events - DSCE Alumni Connect</title>
      </Helmet>

      <div className="max-w-[1600px] mx-auto p-6 pt-32"> {/* Increased top padding */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-dsce-blue">Upcoming Events</h1>
            <p className="text-dsce-text-dark mt-2">Discover networking opportunities, reunions, and workshops.</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-dsce-blue" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white/50 rounded-3xl border border-dsce-blue/10">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-dsce-blue/30" />
            <p className="text-lg font-medium">No events found.</p>
            <p className="text-sm">Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-4 right-4 z-10">
                   {event.userRsvpStatus && (
                     <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm ${
                       event.userRsvpStatus === 'GOING' ? 'bg-green-100 text-green-700 border border-green-200' :
                       event.userRsvpStatus === 'MAYBE' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                       'bg-red-100 text-red-700 border border-red-200'
                     }`}>
                       {event.userRsvpStatus.replace('_', ' ')}
                     </span>
                   )}
                </div>

                <div className="flex items-start mb-6">
                  <div className="w-16 text-center bg-white rounded-2xl p-2 mr-4 shadow-sm border border-dsce-blue/5">
                    <div className="text-xs font-bold text-dsce-blue uppercase tracking-wide">{event.month}</div>
                    <div className="text-2xl font-bold text-dsce-text-dark">{event.day}</div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-dsce-text-dark line-clamp-2 group-hover:text-dsce-blue transition-colors leading-tight">
                      {event.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-3 text-dsce-blue shrink-0" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-3 text-dsce-blue shrink-0" />
                    {event.location}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className={`w-full rounded-xl border-dsce-blue/20 transition-all font-semibold ${
                    event.userRsvpStatus 
                      ? 'bg-dsce-blue/5 text-dsce-blue hover:bg-dsce-blue/10' 
                      : 'bg-white text-dsce-blue hover:bg-dsce-blue hover:text-white shadow-sm'
                  }`}
                  onClick={() => setRsvpModalEventId(event.id)}
                >
                  {event.userRsvpStatus ? 'Update RSVP' : 'RSVP Now'}
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Add Event Modal */}
        <AnimatePresence>
          {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-dsce-blue/10"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-dsce-text-dark">Create Event</h2>
                    <p className="text-sm text-gray-500">Share a new event with the community.</p>
                  </div>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateEvent} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Event Title</Label>
                    <Input 
                      value={newEvent.title} 
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="e.g. Annual Alumni Gala 2025"
                      className="rounded-xl border-gray-200 focus:border-dsce-blue focus:ring-dsce-blue/20"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Day</Label>
                      <Input 
                        value={newEvent.day} 
                        onChange={e => setNewEvent({...newEvent, day: e.target.value})}
                        placeholder="e.g. 15"
                        className="rounded-xl border-gray-200 focus:border-dsce-blue focus:ring-dsce-blue/20"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Month</Label>
                      <Input 
                        value={newEvent.month} 
                        onChange={e => setNewEvent({...newEvent, month: e.target.value})}
                        placeholder="e.g. DEC"
                        className="rounded-xl border-gray-200 focus:border-dsce-blue focus:ring-dsce-blue/20"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Time</Label>
                    <Input 
                      value={newEvent.time} 
                      onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                      placeholder="e.g. 10:00 AM - 2:00 PM"
                      className="rounded-xl border-gray-200 focus:border-dsce-blue focus:ring-dsce-blue/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700">Location</Label>
                    <Input 
                      value={newEvent.location} 
                      onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="e.g. Main Auditorium, DSCE"
                      className="rounded-xl border-gray-200 focus:border-dsce-blue focus:ring-dsce-blue/20"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-xl py-6 mt-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                    Create Event
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* RSVP Modal */}
        <AnimatePresence>
          {rsvpModalEventId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-dsce-blue/10 text-center"
              >
                <div className="w-16 h-16 bg-dsce-blue/10 rounded-full flex items-center justify-center mx-auto mb-6 text-dsce-blue">
                  <Calendar className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-dsce-text-dark mb-2">Will you be attending?</h2>
                <p className="text-gray-500 mb-8 text-sm">Let the organizers know if you can make it.</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => handleRsvp('GOING')}
                    className="w-full flex items-center justify-center p-4 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 hover:border-green-200 transition-all font-semibold group"
                  >
                    <Check className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Going
                  </button>
                  <button 
                    onClick={() => handleRsvp('MAYBE')}
                    className="w-full flex items-center justify-center p-4 rounded-xl bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-100 hover:border-yellow-200 transition-all font-semibold group"
                  >
                    <HelpCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Maybe
                  </button>
                  <button 
                    onClick={() => handleRsvp('NOT_GOING')}
                    className="w-full flex items-center justify-center p-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-all font-semibold group"
                  >
                    <X className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Not Going
                  </button>
                </div>
                <button 
                  onClick={() => setRsvpModalEventId(null)}
                  className="mt-8 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Events;
