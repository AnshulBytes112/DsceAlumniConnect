
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { ArrowRight, GraduationCap, Users, Calendar, BookOpen, Briefcase, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import TextReveal from '@/components/ui/TextReveal';
import ParallaxSection from '@/components/ui/ParallaxSection';
import { motion } from 'framer-motion';
import ColorBends from '@/components/ui/ColorBends';
import StaggeredMenu from '@/components/ui/StaggeredMenu';
import PhotoStack from '@/components/ui/PhotoStack';
import NotableAlumni from '@/components/ui/NotableAlumni';
import { menuItems, fundraisingProjects, latestNews, upcomingEvents, features, notableAlumni } from '@/data/mockData';

// Placeholder images for PhotoStack
const legacyImages = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?q=80&w=1000&auto=format&fit=crop',
];

const calculateProgress = (raised: string, goal: string) => {
  const raisedAmount = parseInt(raised.replace(/[^0-9]/g, ''));
  const goalAmount = parseInt(goal.replace(/[^0-9]/g, ''));
  return `${Math.min((raisedAmount / goalAmount) * 100, 100)}%`;
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Helmet>
        <title>DSCE Alumni Connect - Reconnect, Mentor, Grow</title>
        <meta name="description" content="Join the DSCE Alumni network. Connect with fellow graduates, find mentors, and stay updated with college events and news." />
        <meta name="keywords" content="DSCE, Alumni, Dayananda Sagar College of Engineering, Network, Mentorship, Jobs" />
      </Helmet>
      <StaggeredMenu 
        items={[
          ...menuItems
        ]} 
        isFixed={true} 
        position="right"
        colors={["var(--color-brand-accent)", "var(--color-secondary)"]}
        accentColor="var(--color-brand-accent)"
        menuButtonColor="var(--color-brand-text)"
        openMenuButtonColor='var(--color-brand-text)'
        logoUrl="" 
        currentPage="Home"
      />

      {/* Navbar - Simplified */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent">
            <GraduationCap className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-bold tracking-tight">DSCE Alumni</span>
        </div>
        {/* Old nav links removed in favor of StaggeredMenu */}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center px-4 pt-20">
        <div className="absolute inset-0">
          <ColorBends
            colors={["var(--color-brand-accent)"]}
            rotation={0}
            speed={0.3}
            scale={0.5}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0}
            parallax={0.5}
            noise={0.1}
            transparent={false}
            skipFrames={1}
          />
        </div>
        
        <div className="relative z-10 text-center space-y-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-4">
              DSCE ALUMNI
              <span className="block text-brand-accent">CONNECT</span>
            </h1>
          </motion.div>
          
          <TextReveal 
            text="Reconnect. Mentor. Grow. The legacy continues with you." 
            className="text-xl md:text-2xl text-brand-light justify-center font-light max-w-2xl mx-auto"
            delay={0.5}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="pt-8"
          >
            <Link to="/register">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-brand-accent hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(74,112,169,0.6)] hover:scale-105 active:scale-95 z-index: 1">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Notable Alumni Section (Replaces Scrolling Text) */}
      <div className="py-20 bg-black border-y border-white/10">
        <h2 className="text-center text-3xl font-bold mb-12 tracking-tight">NOTABLE <span className="text-brand-accent">ALUMNI</span></h2>
        <NotableAlumni alumni={notableAlumni} baseVelocity={-1} />
      </div>

      {/* The Legacy Section */}
      <ParallaxSection id="legacy" className="py-32 px-6 md:px-12 bg-zinc-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
              THE <span className="text-brand-accent">LEGACY</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Since 1979, DSCE has been a beacon of excellence. Our alumni network spans the globe, leading industries, innovating technologies, and shaping the future.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <h3 className="text-4xl font-bold text-white">50k+</h3>
                <p className="text-brand-accent-light">Global Alumni</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white">40+</h3>
                <p className="text-brand-accent-light">Years of Excellence</p>
              </div>
            </div>
          </div>
          <div className="h-[500px] w-full flex items-center justify-center">
             <PhotoStack images={legacyImages} />
          </div>
        </div>
      </ParallaxSection>

      {/* Fundraising Projects Section */}
      <section id="fundraising" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            FUNDRAISING <span className="text-brand-accent">PROJECTS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {fundraisingProjects.map((project, i) => (
              <motion.div 
                key={i} 
                className="p-8 rounded-2xl bg-white/5 border border-white/10 transition-all duration-300 hover:scale-102 hover:border-brand-accent/80 hover:bg-white/10 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-48 bg-brand-accent/20 rounded-xl mb-6 flex items-center justify-center">
                   <Briefcase className="w-12 h-12 text-brand-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-4">{project.desc}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                  <div 
                    className="bg-brand-accent h-2 rounded-full" 
                    style={{ width: calculateProgress(project.raised, project.goal) }}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-accent">{project.raised} raised</span>
                  <span className="text-gray-500">Goal: {project.goal}</span>
                </div>
                <Button className="w-full mt-6 hover:bg-brand-accent hover:text-white active:scale-95" variant="outline">Donate Now</Button>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button variant="outline" className="hover:bg-brand-accent hover:text-white active:scale-95 transition-all duration-300">
              View All Projects <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section id="news" className="py-32 px-6 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            LATEST <span className="text-brand-accent">NEWS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {latestNews.map((news, i) => (
              <motion.div 
                key={i} 
                className="flex gap-6 items-start group cursor-pointer p-4 rounded-xl transition-all duration-300 hover:scale-103 hover:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-24 h-24 bg-white/5 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
                  <BookOpen className="w-8 h-8 text-gray-400 group-hover:text-brand-accent" />
                </div>
                <div>
                  <span className="text-brand-accent text-sm font-medium">{news.date}</span>
                  <h3 className="text-xl font-bold mt-1 mb-2 group-hover:text-brand-accent transition-colors">{news.title}</h3>
                  <p className="text-gray-400 text-sm">{news.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button variant="outline" className="hover:bg-brand-accent hover:text-white active:scale-95 transition-all duration-300">
              View All News <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            UPCOMING <span className="text-brand-accent">EVENTS</span>
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, i) => (
              <motion.div 
                key={i} 
                className="flex items-center p-6 rounded-2xl bg-white/5 border border-white/10 group cursor-pointer transition-all duration-300 hover:scale-103 hover:border-brand-accent/80 hover:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex flex-col items-center justify-center w-20 h-20 bg-brand-accent/10 rounded-xl mr-6 group-hover:bg-brand-accent group-hover:text-black transition-colors">
                  <span className="text-2xl font-bold">{event.day}</span>
                  <span className="text-xs font-medium uppercase">{event.month}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{event.title}</h3>
                  <div className="flex items-center text-gray-400 text-sm gap-4">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {event.time}</span>
                    <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {event.location}</span>
                  </div>
                </div>
                <Button variant="ghost" className="hidden md:flex hover:scale-105 active:scale-95">Register <ArrowRight className="ml-2 w-4 h-4" /></Button>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-center mt-12">
            <Button variant="outline" className="hover:bg-brand-accent hover:text-white active:scale-95 transition-all duration-300">
              View All Events <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 px-6 bg-zinc-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                className="p-8 rounded-2xl bg-white/5 border border-white/10 group cursor-pointer transition-all duration-300 hover:scale-105 hover:border-brand-accent/80 hover:bg-white/10"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-brand-accent mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer id="quick-links" className="py-16 border-t border-white/10 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">About</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Alumni Association</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Executive Committee</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* News */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">News</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Annual Reports</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Newsletters</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Events */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Events</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Alumni Homecoming</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Tech Talks</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Mentorship Program</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Connect</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center"><Mail className="w-4 h-4 mr-2" /> alumni@dsce.edu.in</li>
              <li className="flex items-center"><Phone className="w-4 h-4 mr-2" /> +91 80 2666 xxxx</li>
            </ul>
            <div className="flex space-x-4 mt-6 text-gray-400">
              <a href="#" className="hover:text-brand-accent transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="hover:text-brand-accent transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-gray-500">
          <p>© 2025 DSCE Alumni Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

