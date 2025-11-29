

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  bgImage?: string;
  speed?: number;
  id?: string;
}

export default function ParallaxSection({
  children,
  className = '',
  bgImage,
  id,
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);

  return (
    <div ref={ref} id={id} className={`relative overflow-hidden ${className}`}>
      {bgImage && (
        <motion.div
          style={{ y }}
          className="absolute inset-0 z-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
          />
          <div className="absolute inset-0 bg-black/60" /> {/* Overlay */}
        </motion.div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
