import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const projects = [
  { title: 'Faculty Excellence Award', desc: 'Support outstanding faculty members', progress: 65 },
  { title: 'Student Scholarship Fund', desc: 'Help deserving students achieve their dreams', progress: 82 }
];

export function FundraisingSection() {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Fundraising Projects</h3>
        <button className="text-primary hover:text-primary-glow text-sm transition-colors">View All →</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {projects.map((project, idx) => (
          <div key={idx} className="bg-card rounded-xl overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all group cursor-pointer hover-lift shadow-lg">
            <div className="h-40 bg-gradient-to-br from-primary/20 to-primary-glow/20 flex items-center justify-center">
              <Heart className="w-12 h-12 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-foreground">{project.title}</h4>
              <p className="text-muted-foreground text-sm mt-1">{project.desc}</p>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>{project.progress}% funded</span>
                  <span>₹{(project.progress * 1000).toLocaleString()} raised</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500" 
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">Donate Now</Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
