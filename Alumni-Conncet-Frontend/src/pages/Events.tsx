import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Clock, MapPin, Users, Loader2, MoreHorizontal, X, Check, HelpCircle, FileText, Globe, Tag } from 'lucide-react';
import MotionWrapper from '@/components/ui/MotionWrapper';
import { apiClient, type EventDTO } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

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
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    category: 'networking',
    maxAttendees: '',
    registrationDeadline: '',
    virtualLink: '',
    organizerName: '',
    organizerContact: ''
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
      // Create enhanced event object for API
      const eventData = {
        title: newEvent.title,
        day: newEvent.day,
        month: newEvent.month,
        starttime: newEvent.startTime,
        endtime: newEvent.endTime,
        time: `${newEvent.startTime} - ${newEvent.endTime}`,
        location: newEvent.location,
        description: newEvent.description,
        category: newEvent.category,
        maxParticipants: newEvent.maxAttendees ? parseInt(newEvent.maxAttendees) : undefined,
        registrationDeadline: newEvent.registrationDeadline || undefined,
        virtualLink: newEvent.virtualLink || undefined,
        organizerName: newEvent.organizerName || undefined,
        organizerContact: newEvent.organizerContact || undefined
      };
      
      await apiClient.createEvent(eventData);
      toast({ title: "Success", description: "Event created successfully!" });
      setIsAddModalOpen(false);
      setNewEvent({
        title: '',
        day: '',
        month: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        category: 'networking',
        maxAttendees: '',
        registrationDeadline: '',
        virtualLink: '',
        organizerName: '',
        organizerContact: ''
      });
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
                className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl border border-dsce-blue/10 max-h-[90vh] overflow-y-auto"
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
                <form onSubmit={handleCreateEvent} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-dsce-text-dark flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-dsce-blue" />
                      Basic Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Event Title *</Label>
                      <Input 
                        value={newEvent.title} 
                        onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                        placeholder="e.g. Annual Alumni Gala 2025"
                        className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Description</Label>
                      <textarea
                        value={newEvent.description}
                        onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                        placeholder="Provide details about the event, agenda, speakers, etc."
                        className="w-full rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 p-3 h-24 resize-none text-black bg-white placeholder:text-gray-500"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Category</Label>
                        <select
                          value={newEvent.category}
                          onChange={e => setNewEvent({...newEvent, category: e.target.value})}
                          className="w-full rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 p-3 text-black bg-white"
                        >
                          <option value="networking">Networking</option>
                          <option value="workshop">Workshop</option>
                          <option value="seminar">Seminar</option>
                          <option value="social">Social</option>
                          <option value="career">Career</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Max Attendees</Label>
                        <Input 
                          type="number"
                          value={newEvent.maxAttendees} 
                          onChange={e => setNewEvent({...newEvent, maxAttendees: e.target.value})}
                          placeholder="e.g. 100"
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Registration Deadline</Label>
                        <Input 
                          type="date"
                          value={newEvent.registrationDeadline} 
                          onChange={e => setNewEvent({...newEvent, registrationDeadline: e.target.value})}
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-dsce-text-dark flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-dsce-blue" />
                      Date & Time
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Day *</Label>
                        <Input 
                          value={newEvent.day} 
                          onChange={e => setNewEvent({...newEvent, day: e.target.value})}
                          placeholder="e.g. 15"
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Month *</Label>
                        <select
                          value={newEvent.month}
                          onChange={e => setNewEvent({...newEvent, month: e.target.value})}
                          className="h-12 w-full rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 p-3 text-black bg-white"
                          required
                        >
                          <option value="">Select Month</option>
                          <option value="JAN">January</option>
                          <option value="FEB">February</option>
                          <option value="MAR">March</option>
                          <option value="APR">April</option>
                          <option value="MAY">May</option>
                          <option value="JUN">June</option>
                          <option value="JUL">July</option>
                          <option value="AUG">August</option>
                          <option value="SEP">September</option>
                          <option value="OCT">October</option>
                          <option value="NOV">November</option>
                          <option value="DEC">December</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Start Time *</Label>
                        <Input 
                          type="time"
                          value={newEvent.startTime} 
                          onChange={e => setNewEvent({...newEvent, startTime: e.target.value})}
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">End Time *</Label>
                        <Input 
                          type="time"
                          value={newEvent.endTime} 
                          onChange={e => setNewEvent({...newEvent, endTime: e.target.value})}
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-dsce-text-dark flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-dsce-blue" />
                      Location
                    </h3>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Physical Location *</Label>
                      <Input 
                        value={newEvent.location} 
                        onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                        placeholder="e.g. Main Auditorium, DSCE"
                        className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-700">Virtual Meeting Link</Label>
                      <Input 
                        value={newEvent.virtualLink} 
                        onChange={e => setNewEvent({...newEvent, virtualLink: e.target.value})}
                        placeholder="e.g. https://zoom.us/j/123456789"
                        className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Organizer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-dsce-text-dark flex items-center">
                      <Users className="w-5 h-5 mr-2 text-dsce-blue" />
                      Organizer Information
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Organizer Name</Label>
                        <Input 
                          value={newEvent.organizerName} 
                          onChange={e => setNewEvent({...newEvent, organizerName: e.target.value})}
                          placeholder="e.g. DSCE Alumni Association"
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Contact Email/Phone</Label>
                        <Input 
                          value={newEvent.organizerContact} 
                          onChange={e => setNewEvent({...newEvent, organizerContact: e.target.value})}
                          placeholder="e.g. alumni@dsce.edu"
                          className="h-12 rounded-xl border-2 border-black focus:border-dsce-blue focus:ring-dsce-blue/20 text-black placeholder:text-gray-500 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-dsce-blue hover:bg-dsce-blue/90 text-white rounded-xl py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
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
