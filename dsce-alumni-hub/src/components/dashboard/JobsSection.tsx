import { Briefcase, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const jobs = [
  { title: 'Senior Software Engineer', company: 'Infosys', location: 'Bengaluru', deadline: 'Dec 15th', type: 'Full-time' },
  { title: 'Product Manager', company: 'Wipro', location: 'Hyderabad', deadline: 'Dec 20th', type: 'Full-time' }
];

export function JobsSection() {
  return (
    <section className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Jobs & Internships</h3>
        <button className="text-primary hover:text-primary-glow text-sm transition-colors">View All →</button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job, idx) => (
          <div key={idx} className="bg-card rounded-xl p-5 hover:bg-surface-hover transition-all shadow-lg hover-lift">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{job.title}</h4>
                <p className="text-primary text-sm font-medium">{job.company}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs">{job.type}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted-foreground">Deadline: {job.deadline}</span>
                  <Button size="sm">Apply Now</Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
