import { Users, BookOpen, Heart, Award, MapPin, Calendar } from 'lucide-react';

const news = [
  { date: 'Nov 15', title: 'Distinguished Alumnus Awards 2025 - Nominations Open' },
  { date: 'Oct 28', title: 'DSCE Alumni Annual Meet 2025 Announced' },
  { date: 'Oct 10', title: 'New Research Center Inaugurated by Alumni' }
];

const events = [
  { day: '15', month: 'Dec 2025', name: 'Alumni Homecoming 2025', time: '10 AM IST', venue: 'DSCE Campus' },
  { day: '22', month: 'Nov 2025', name: 'Tech Talk Series', time: '6 PM IST', venue: 'Virtual Event' },
  { day: '05', month: 'Jan 2026', name: 'Career Mentorship Program', time: '2 PM IST', venue: 'Main Auditorium' }
];

export function Sidebar() {
  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="bg-card rounded-xl p-5 shadow-lg animate-slide-in">
        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Users, label: 'My Batch' },
            { icon: BookOpen, label: 'Gallery' },
            { icon: Heart, label: 'Donate' },
            { icon: Award, label: 'Needs' }
          ].map((item, idx) => (
            <button key={idx} className="flex flex-col items-center gap-2 p-3 bg-secondary hover:bg-primary/20 rounded-lg transition-all group hover-lift">
              <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* News */}
      <div className="bg-card rounded-xl p-5 shadow-lg">
        <h3 className="font-semibold text-foreground mb-4">Latest News</h3>
        <div className="space-y-4">
          {news.map((item, idx) => (
            <div key={idx} className="group cursor-pointer">
              <span className="text-xs text-primary font-medium">{item.date}</span>
              <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors mt-1">{item.title}</p>
              {idx < news.length - 1 && <div className="border-b border-border mt-3" />}
            </div>
          ))}
        </div>
        <button className="mt-4 text-primary hover:text-primary-glow text-sm transition-colors">View All →</button>
      </div>

      {/* Events */}
      <div className="bg-card rounded-xl p-5 shadow-lg">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Upcoming Events
        </h3>
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-3 group cursor-pointer hover-lift">
              <div className="text-center px-3 py-2 bg-primary/20 rounded-lg min-w-fit">
                <div className="text-lg font-bold text-primary">{event.day}</div>
                <div className="text-xs text-muted-foreground">{event.month}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{event.name}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin size={12} /> {event.venue}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-4 text-primary hover:text-primary-glow text-sm transition-colors">View All →</button>
      </div>
    </div>
  );
}
