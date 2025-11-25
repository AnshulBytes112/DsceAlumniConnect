import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const heroImages = [
  'https://th.bing.com/th/id/OIP.0rc4Qt3ypiWzdn-zML6DNgHaDy?w=301&h=178&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
  'https://th.bing.com/th/id/OIP.HnLvqOWXKECpIOBndGC-LgHaE8?w=275&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3',
  'https://th.bing.com/th/id/OIP.QMF6GkYQSranOXxAvTdN_QHaFj?w=189&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3'
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative rounded-2xl overflow-hidden h-72 md:h-96 bg-card shadow-lg animate-fade-in">
      {heroImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <img src={img} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
      ))}
      
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="px-3 py-1 bg-primary rounded-full text-xs font-medium text-primary-foreground">Featured</span>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">Welcome to DSCE Alumni Network</h2>
        <p className="text-muted-foreground mt-1">Connecting generations of excellence</p>
        <Button className="mt-4">Explore Network</Button>
      </div>

      <button 
        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)} 
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 hover:bg-card rounded-full transition-all backdrop-blur-sm hover-lift"
      >
        <ChevronLeft size={20} className="text-foreground" />
      </button>
      <button 
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)} 
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-card/80 hover:bg-card rounded-full transition-all backdrop-blur-sm hover-lift"
      >
        <ChevronRight size={20} className="text-foreground" />
      </button>

      <div className="absolute bottom-4 right-4 flex gap-2">
        {heroImages.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentSlide(idx)} 
            className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-primary w-8' : 'bg-muted-foreground'}`} 
          />
        ))}
      </div>
    </div>
  );
}
