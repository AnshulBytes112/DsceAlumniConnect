import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">About</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Alumni Association</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Executive Committee</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">News</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Annual Reports</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Newsletters</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Blog</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Events</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="hover:text-primary cursor-pointer transition-colors">Alumni Homecoming</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Tech Talks</p>
              <p className="hover:text-primary cursor-pointer transition-colors">Mentorship Program</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Mail size={14} /> alumni@dsce.edu.in
            </p>
            <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
              <Phone size={14} /> +91 80 2666 xxxx
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, idx) => (
                <button key={idx} className="p-2 bg-secondary hover:bg-primary hover:text-primary-foreground rounded-lg transition-all hover-lift">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2025 DSCE Alumni Association. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
