import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { ArrowRight, GraduationCap, Users, BookOpen, Briefcase, Award, Calendar, Star, Trophy, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Landing() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F8F8] via-[#FFF9E6] to-[#F8F8F8] text-gray-800">
      <Helmet>
        <title>DSCE Alumni Connect - Reconnect, Mentor, Grow</title>
        <meta name="description" content="Join the DSCE Alumni network. Connect with fellow graduates, find mentors, and stay updated with college events and news." />
        <meta name="keywords" content="DSCE, Alumni, Dayananda Sagar College of Engineering, Network, Mentorship, Jobs" />
      </Helmet>

      {/* Navigation with DSCE colors */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#003366] shadow-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFD700]">
            <GraduationCap className="h-5 w-5 text-[#003366]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">DSCE Alumni</span>
        </div>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-white">Welcome back!</span>
              <div className="flex items-center gap-2">
                <Link to="/dashboard/profile">
                  <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                    Profile
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                    Alumni
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="text-white hover:text-red-400 text-sm"
                >
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-[#00AEEF]">
                  Login
                </Button>
              </Link>
              <Link to="/alumni">
                <Button variant="ghost" className="text-white hover:text-[#FFD700] text-sm">
                  Alumni
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] font-semibold">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section with clean background */}
      <section className="relative h-screen flex flex-col justify-center items-center px-4 pt-20">
        <div className="text-center space-y-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none mb-4">
              DSCE ALUMNI
              <span className="block text-[#003366]">CONNECT</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-[#333333] justify-center font-light max-w-2xl mx-auto"
          >
            Dayananda Sagar College of Engineering - Building Legends Since 1979
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="pt-8 flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold">
                    Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-300">
                    My Profile
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-300">
                    Alumni Directory
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold">
                    Join Alumni Network <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-300">
                    View Alumni
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* About DSCE Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ABOUT <span className="text-[#003366]">DSCE</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-xl text-[#333333] leading-relaxed">
                Dayananda Sagar College of Engineering (DSCE) is a premier engineering institution established in 1979 in Bangalore, India. For over four decades, we have been at the forefront of technical education, innovation, and research excellence.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#003366] mb-2">1979</div>
                  <div className="text-gray-600">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#003366] mb-2">50+</div>
                  <div className="text-gray-600">Engineering Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#003366] mb-2">15+</div>
                  <div className="text-gray-600">Research Centers</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-[#003366] mb-2">50000+</div>
                  <div className="text-gray-600">Alumni Worldwide</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-[#003366]/5 to-[#00AEEF]/5 p-6 rounded-xl border border-[#003366]/10">
                <BookOpen className="w-12 h-12 text-[#003366] mb-4" />
                <h3 className="text-xl font-bold text-[#003366] mb-2">Academic Excellence</h3>
                <p className="text-[#333333]">NBA Accredited Programs, Expert Faculty, Industry-Relevant Curriculum</p>
              </div>
              <div className="bg-gradient-to-br from-[#003366]/5 to-[#00AEEF]/5 p-6 rounded-xl border border-[#003366]/10">
                <Users className="w-12 h-12 text-[#003366] mb-4" />
                <h3 className="text-xl font-bold text-[#003366] mb-2">Research Excellence</h3>
                <p className="text-[#333333]">15+ Research Centers, 500+ Publications Annually, Industry Collaborations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-32 px-6 bg-[#FFF9E6]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-[#003366]">SUCCESS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold text-[#003366] mb-4">1000+</div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Global Leaders</h3>
              <p className="text-gray-600">Alumni in leadership positions across Fortune 500 companies</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-[#003366] mb-4">500+</div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Entrepreneurs</h3>
              <p className="text-gray-600">Successful startup founders and business owners worldwide</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-[#003366] mb-4">35+</div>
              <h3 className="text-xl font-bold text-[#333333] mb-2">Countries</h3>
              <p className="text-gray-600">DSCE alumni making impact across the globe</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            DSCE <span className="text-[#003366]">TIMELINE</span>
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-[#003366] to-[#00AEEF]"></div>
            
            {/* Timeline Events */}
            <div className="space-y-12">
              {[
                { year: "1979", title: "Foundation", desc: "DSCE established with vision of excellence in engineering education", side: "left" },
                { year: "1985", title: "First Graduation", desc: "First batch of engineers graduate, marking the beginning of our legacy", side: "right" },
                { year: "1995", title: "NBA Accreditation", desc: "First NBA accreditation, recognizing our quality standards", side: "left" },
                { year: "2005", title: "Research Excellence", desc: "Establishment of multiple research centers and labs", side: "right" },
                { year: "2015", title: "Autonomous Status", desc: "Granted autonomous status for curriculum innovation", side: "left" },
                { year: "2025", title: "Global Network", desc: "50,000+ alumni making impact across 35+ countries", side: "right" }
              ].map((event, i) => (
                <motion.div
                  key={i}
                  className={`relative flex items-center ${event.side === 'left' ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, x: event.side === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className={`w-5/12 ${event.side === 'left' ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-gradient-to-r from-[#003366]/5 to-[#00AEEF]/5 p-6 rounded-2xl border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-3xl font-bold text-[#003366] mb-2">{event.year}</div>
                      <h3 className="text-xl font-bold text-[#333333] mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.desc}</p>
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-[#003366] to-[#00AEEF] rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Testimonials */}
      <section className="py-32 px-6 bg-[#FFF9E6]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-[#003366]">TESTIMONIALS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "DSCE provided me not just with technical knowledge, but with the confidence to dream big and achieve even bigger. The foundation I got here took me to NASA.",
                name: "Priya Sharma",
                batch: "2010 ECE",
                role: "NASA Research Scientist",
                rating: 5
              },
              {
                quote: "The network I built at DSCE has been invaluable. From batchmates to seniors, everyone helped me grow my startup from idea to IPO.",
                name: "Amit Patel",
                batch: "2008 MECH",
                role: "Founder, GreenTech",
                rating: 5
              },
              {
                quote: "DSCE taught me to think differently, to challenge conventions. That mindset helped me lead innovation at one of the world's biggest tech companies.",
                name: "Sarah Johnson",
                batch: "2012 ISE",
                role: "VP, Google",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-full bg-white p-8 rounded-2xl border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 text-[#FFD700]/20">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 text-[#FFD700] fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-lg text-[#333333] mb-6 italic">"{testimonial.quote}"</p>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#003366] to-[#00AEEF] flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#333333]">{testimonial.name}</h4>
                      <p className="text-sm text-[#003366]">{testimonial.batch}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Gallery & Achievements */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-[#003366]">GALLERY</span>
          </h2>
          
          {/* Notable Alumni Showcase */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold mb-12 text-center">NOTABLE <span className="text-[#003366]">ACHIEVERS</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  name: "Rajesh Kumar",
                  batch: "2005 CSE",
                  achievement: "CEO at TechCorp",
                  image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                  icon: Trophy
                },
                {
                  name: "Priya Sharma",
                  batch: "2010 ECE",
                  achievement: "NASA Research Scientist",
                  image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
                  icon: Star
                },
                {
                  name: "Amit Patel",
                  batch: "2008 MECH",
                  achievement: "Founder of GreenTech",
                  image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                  icon: Award
                },
                {
                  name: "Sarah Johnson",
                  batch: "2012 ISE",
                  achievement: "VP at Google",
                  image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
                  icon: Heart
                }
              ].map((alumni, i) => (
                <motion.div
                  key={i}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-[#003366]/10 hover:border-[#00AEEF]/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="aspect-square relative">
                      <img 
                        src={alumni.image} 
                        alt={alumni.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* Achievement Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 rounded-full bg-[#FFD700] flex items-center justify-center shadow-lg">
                          <alumni.icon className="h-6 w-6 text-[#003366]" />
                        </div>
                      </div>
                      
                      {/* Alumni Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-xl font-bold mb-1 text-white">{alumni.name}</h4>
                        <p className="text-sm text-[#FFD700] mb-2">{alumni.batch}</p>
                        <p className="text-sm text-gray-200">{alumni.achievement}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* College Photo Gallery */}
          <div>
            <h3 className="text-2xl font-bold mb-12 text-center">CAMPUS <span className="text-[#003366]">MEMORIES</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1581078426770-6d336e5de7bf?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1569068348-f0b2e3a6482a?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1554469384-e58e5b4ce0e8?w=500&h=400&fit=crop",
                "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&h=400&fit=crop"
              ].map((image, i) => (
                <motion.div
                  key={i}
                  className="relative overflow-hidden rounded-xl group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <img 
                    src={image} 
                    alt={`DSCE Campus ${i + 1}`}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#003366] font-semibold">
                    DSCE Campus
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* View Gallery Button */}
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-full px-8 py-4 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white transition-all">
              View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-[#FFF9E6]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            WHY JOIN <span className="text-[#003366]">DSCE ALUMNI</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl group cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#00AEEF]/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Users className="w-12 h-12 text-[#003366] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Networking</h3>
              <p className="text-gray-600">Connect with 50,000+ alumni worldwide, build meaningful relationships, and expand your professional network.</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl group cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#00AEEF]/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <BookOpen className="w-12 h-12 text-[#003366] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Mentorship</h3>
              <p className="text-gray-600">Share your experience with current students and guide the next generation of DSCE engineers.</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-[#003366]/10 shadow-lg hover:shadow-xl group cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#00AEEF]/80"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Briefcase className="w-12 h-12 text-[#003366] mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-bold text-[#333333] mb-4">Careers</h3>
              <p className="text-gray-600">Access exclusive job opportunities, career guidance, and professional development resources.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Events & Activities */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-[#003366]">ACTIVITIES</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="p-8 rounded-2xl bg-gradient-to-br from-[#003366]/5 to-[#00AEEF]/5 border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="h-8 w-8 text-[#003366]" />
                <h3 className="text-2xl font-bold text-[#333333]">Annual Alumni Meet</h3>
              </div>
              <p className="text-gray-600 mb-4">Join us for the biggest alumni gathering of the year. Reconnect with batchmates, faculty, and relive cherished memories.</p>
              <div className="text-[#003366] font-semibold">Every December - DSCE Campus</div>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-gradient-to-br from-[#003366]/5 to-[#00AEEF]/5 border border-[#003366]/10 shadow-lg hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-[#003366]" />
                <h3 className="text-2xl font-bold text-[#333333]">Mentorship Program</h3>
              </div>
              <p className="text-gray-600 mb-4">Share your expertise with current students and help shape the next generation of DSCE engineers.</p>
              <div className="text-[#003366] font-semibold">Year-round Program - Virtual & In-person</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-[#003366] text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            BE PART OF <span className="text-[#FFD700]">LEGACY</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join the prestigious DSCE Alumni Network and contribute to our tradition of excellence. Connect, collaborate, and celebrate the DSCE spirit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] transition-all font-semibold">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-[#003366] transition-all">
                    View Alumni Directory
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-[#FFD700] text-[#003366] hover:bg-[#FFC700] transition-all font-semibold">
                    Join Alumni Network <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/landing">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-[#003366] transition-all">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[#003366]/20 bg-[#F8F8F8] text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003366]">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#333333]">DSCE Alumni Association</span>
          </div>
          <p className="text-gray-600 mb-2">Dayananda Sagar College of Engineering</p>
          <p className="text-gray-600 mb-2">Kumaraswamy Layout, Bangalore - 560078</p>
          <p className="text-gray-600">© 2025 DSCE Alumni Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
