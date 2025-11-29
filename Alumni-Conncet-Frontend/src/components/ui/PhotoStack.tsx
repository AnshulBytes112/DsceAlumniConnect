import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PhotoStackProps {
  images: string[];
  className?: string;
}

export default function PhotoStack({ images, className = '' }: PhotoStackProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`}>
      <div className="relative w-64 h-80 md:w-80 md:h-96 perspective-1000">
        <AnimatePresence mode="popLayout">
          {images.map((img, i) => {
            const offset = (i - index + images.length) % images.length;
            // Only render the top 3 cards
            if (offset > 2) return null;

            return (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.9, z: -100 }}
                animate={{
                  opacity: 1,
                  scale: 1 - offset * 0.05,
                  y: offset * 15,
                  z: -offset * 50, // Add depth
                  zIndex: images.length - offset,
                  rotate: offset % 2 === 0 ? offset * 2 : offset * -2,
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: -50,
                  transition: { duration: 0.4 } 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.16, 1, 0.3, 1], // Custom bezier for smooth "apple-like" motion
                  opacity: { duration: 0.5 }
                }}
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 bg-zinc-800 will-change-transform"
                style={{
                  transformOrigin: 'bottom center',
                }}
              >
                <img
                  src={img}
                  alt={`Legacy ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
