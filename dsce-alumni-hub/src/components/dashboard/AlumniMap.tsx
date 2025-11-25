import { Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

const cities = [
  { name: 'Bengaluru', count: 4521 },
  { name: 'Hyderabad', count: 2134 },
  { name: 'Chennai', count: 1876 }
];

export function AlumniMap() {
  return (
    <section className="mt-12 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-2xl p-8 shadow-xl animate-fade-in">
      <h3 className="text-xl font-bold text-foreground mb-6 text-center">Top Cities Where Our Alumni Live</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {cities.map((city, idx) => (
          <div key={idx} className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-lg hover-lift">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Building className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{city.count.toLocaleString()}</p>
              <p className="text-muted-foreground">{city.name}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Button size="lg">Explore on Map</Button>
      </div>
    </section>
  );
}
