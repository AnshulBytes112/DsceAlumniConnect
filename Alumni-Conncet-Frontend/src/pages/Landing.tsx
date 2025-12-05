import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/Button';
import { ArrowRight, GraduationCap, Users, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  landingTimelineEvents, 
  landingTestimonials, 
  landingNotableAchievers, 
  campusMemories, 
  landingFeatures, 
  alumniActivities 
} from '@/data/mockData';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dsce-bg-light via-dsce-bg-cream to-dsce-bg-light text-gray-800">
      <Helmet>
        <title>DSCE Alumni Connect - Reconnect, Mentor, Grow</title>
        <meta name="description" content="Join the DSCE Alumni network. Connect with fellow graduates, find mentors, and stay updated with college events and news." />
        <meta name="keywords" content="DSCE, Alumni, Dayananda Sagar College of Engineering, Network, Mentorship, Jobs" />
      </Helmet>

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
              <span className="block text-dsce-blue">CONNECT</span>
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-dsce-text-dark justify-center font-light max-w-2xl mx-auto"
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
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold">
                    Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard/profile">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-dsce-blue text-dsce-blue hover:bg-dsce-blue hover:text-white transition-all duration-300">
                    My Profile
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-dsce-blue text-dsce-blue hover:bg-dsce-blue hover:text-white transition-all duration-300">
                    Alumni Directory
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 font-semibold">
                    Join Alumni Network <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-dsce-blue text-dsce-blue hover:bg-dsce-blue hover:text-white transition-all duration-300">
                    View Alumni
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-dsce-blue text-dsce-blue hover:bg-dsce-blue hover:text-white transition-all duration-300">
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
            ABOUT <span className="text-dsce-blue">DSCE</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <p className="text-xl text-dsce-text-dark leading-relaxed">
                Dayananda Sagar College of Engineering (DSCE) is a premier engineering institution established in 1979 in Bangalore, India. For over four decades, we have been at the forefront of technical education, innovation, and research excellence.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-5xl font-bold text-dsce-blue mb-2">1979</div>
                  <div className="text-gray-600">Founded</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-dsce-blue mb-2">50+</div>
                  <div className="text-gray-600">Engineering Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-dsce-blue mb-2">15+</div>
                  <div className="text-gray-600">Research Centers</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-dsce-blue mb-2">50000+</div>
                  <div className="text-gray-600">Alumni Worldwide</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 p-6 rounded-xl border border-dsce-blue/10">
                <BookOpen className="w-12 h-12 text-dsce-blue mb-4" />
                <h3 className="text-xl font-bold text-dsce-blue mb-2">Academic Excellence</h3>
                <p className="text-dsce-text-dark">NBA Accredited Programs, Expert Faculty, Industry-Relevant Curriculum</p>
              </div>
              <div className="bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 p-6 rounded-xl border border-dsce-blue/10">
                <Users className="w-12 h-12 text-dsce-blue mb-4" />
                <h3 className="text-xl font-bold text-dsce-blue mb-2">Research Excellence</h3>
                <p className="text-dsce-text-dark">15+ Research Centers, 500+ Publications Annually, Industry Collaborations</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Success Stories */}
      <section className="py-32 px-6 bg-dsce-bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-dsce-blue">SUCCESS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-4xl font-bold text-dsce-blue mb-4">1000+</div>
              <h3 className="text-xl font-bold text-dsce-text-dark mb-2">Global Leaders</h3>
              <p className="text-gray-600">Alumni in leadership positions across Fortune 500 companies</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-4xl font-bold text-dsce-blue mb-4">500+</div>
              <h3 className="text-xl font-bold text-dsce-text-dark mb-2">Entrepreneurs</h3>
              <p className="text-gray-600">Successful startup founders and business owners worldwide</p>
            </motion.div>
            
            <motion.div 
              className="p-8 rounded-2xl bg-white border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-4xl font-bold text-dsce-blue mb-4">35+</div>
              <h3 className="text-xl font-bold text-dsce-text-dark mb-2">Countries</h3>
              <p className="text-gray-600">DSCE alumni making impact across the globe</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            DSCE <span className="text-dsce-blue">TIMELINE</span>
          </h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-dsce-blue to-dsce-light-blue"></div>
            
            {/* Timeline Events */}
            <div className="space-y-12">
              {landingTimelineEvents.map((event, i) => (
                <motion.div
                  key={i}
                  className={`relative flex items-center ${event.side === 'left' ? 'justify-start' : 'justify-end'}`}
                  initial={{ opacity: 0, x: event.side === 'left' ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className={`w-5/12 ${event.side === 'left' ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <div className="bg-gradient-to-r from-dsce-blue/5 to-dsce-light-blue/5 p-6 rounded-2xl border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="text-3xl font-bold text-dsce-blue mb-2">{event.year}</div>
                      <h3 className="text-xl font-bold text-dsce-text-dark mb-2">{event.title}</h3>
                      <p className="text-gray-600">{event.desc}</p>
                    </div>
                  </div>
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-r from-dsce-blue to-dsce-light-blue rounded-full border-4 border-white shadow-lg"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alumni Testimonials */}
      <section className="py-32 px-6 bg-dsce-bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-dsce-blue">TESTIMONIALS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingTestimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-full bg-white p-8 rounded-2xl border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Quote Icon */}
                  <div className="absolute top-4 right-4 text-dsce-gold/20">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  
                  {/* Rating */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-5 w-5 text-dsce-gold fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-lg text-dsce-text-dark mb-6 italic">"{testimonial.quote}"</p>
                  
                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-dsce-blue to-dsce-light-blue flex items-center justify-center">
                      <span className="text-white font-bold">{testimonial.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-dsce-text-dark">{testimonial.name}</h4>
                      <p className="text-sm text-dsce-blue">{testimonial.batch}</p>
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
            ALUMNI <span className="text-dsce-blue">GALLERY</span>
          </h2>
          
          {/* Notable Alumni Showcase */}
          <div className="mb-20">
            <h3 className="text-2xl font-bold mb-12 text-center">NOTABLE <span className="text-dsce-blue">ACHIEVERS</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {landingNotableAchievers.map((alumni, i) => (
                <motion.div
                  key={i}
                  className="group relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white border border-dsce-blue/10 hover:border-dsce-light-blue/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="aspect-square relative">
                      <img 
                        src={alumni.image} 
                        alt={alumni.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* Achievement Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="w-12 h-12 rounded-full bg-dsce-gold flex items-center justify-center shadow-lg">
                          <alumni.icon className="h-6 w-6 text-dsce-blue" />
                        </div>
                      </div>
                      
                      {/* Alumni Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="text-xl font-bold mb-1 text-white">{alumni.name}</h4>
                        <p className="text-sm text-dsce-gold mb-2">{alumni.batch}</p>
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
            <h3 className="text-2xl font-bold mb-12 text-center">CAMPUS <span className="text-dsce-blue">MEMORIES</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {campusMemories.map((image, i) => (
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
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-dsce-blue font-semibold">
                    DSCE Campus
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* View Gallery Button */}
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-full px-8 py-4 border-dsce-blue text-dsce-blue hover:bg-dsce-blue hover:text-white transition-all">
              View Full Gallery <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 bg-dsce-bg-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            WHY JOIN <span className="text-dsce-blue">DSCE ALUMNI</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingFeatures.map((feature, i) => (
              <motion.div 
                key={i}
                className="p-8 rounded-2xl bg-white border border-dsce-blue/10 shadow-lg hover:shadow-xl group cursor-pointer transition-all duration-300 hover:scale-105 hover:border-dsce-light-blue/80"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <feature.icon className="w-12 h-12 text-dsce-blue mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-dsce-text-dark mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Activities */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-16 text-center">
            ALUMNI <span className="text-dsce-blue">ACTIVITIES</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {alumniActivities.map((activity, i) => (
              <motion.div 
                key={i}
                className="p-8 rounded-2xl bg-gradient-to-br from-dsce-blue/5 to-dsce-light-blue/5 border border-dsce-blue/10 shadow-lg hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <activity.icon className="h-8 w-8 text-dsce-blue" />
                  <h3 className="text-2xl font-bold text-dsce-text-dark">{activity.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{activity.desc}</p>
                <div className="text-dsce-blue font-semibold">{activity.time}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-dsce-blue text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
            BE PART OF <span className="text-dsce-gold">LEGACY</span>
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join the prestigious DSCE Alumni Network and contribute to our tradition of excellence. Connect, collaborate, and celebrate the DSCE spirit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all font-semibold">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/alumni">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-dsce-blue transition-all">
                    View Alumni Directory
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="rounded-full px-8 py-4 text-lg bg-dsce-gold text-dsce-blue hover:bg-dsce-gold-hover transition-all font-semibold">
                    Join Alumni Network <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/landing">
                  <Button variant="outline" size="lg" className="rounded-full px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-dsce-blue transition-all">
                    Learn More
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-dsce-blue/20 bg-dsce-bg-light text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-dsce-blue">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-dsce-text-dark">DSCE Alumni Association</span>
          </div>
          <p className="text-gray-600 mb-2">Dayananda Sagar College of Engineering</p>
          <p className="text-gray-600 mb-2">Kumaraswamy Layout, Bangalore - 560078</p>
          <p className="text-gray-600">© 2025 DSCE Alumni Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
