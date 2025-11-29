import { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue,
  useVelocity,
  useAnimationFrame
} from "framer-motion";
import { wrap } from "@motionone/utils";

interface NotableAlumniProps {
  alumni: {
    name: string;
    batch: string;
    role: string;
    image: string;
  }[];
  baseVelocity?: number;
}

export default function NotableAlumni({ alumni, baseVelocity = 100 }: NotableAlumniProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false
  });

  /**
   * This is a magic wrapping for the length of the text - you
   * have to replace for wrapping that works for you or dynamically
   * calculate
   */
  const x = useTransform(baseX, (v) => `${wrap(-20, -45, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    /**
     * This is what changes the direction of the scroll once we
     * switch scrolling directions.
     */
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="overflow-hidden m-0 whitespace-nowrap flex flex-nowrap py-8">
      <motion.div className="flex flex-nowrap gap-8" style={{ x }}>
        {[...alumni, ...alumni, ...alumni, ...alumni].map((alum, i) => (
          <motion.div
            key={i}
            className="inline-block w-64 h-80 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden relative flex-shrink-0 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-brand-accent/80"
          >
            <img 
                src={alum.image} 
                alt={alum.name} 
                className="w-full h-full object-cover opacity-60 transition-opacity duration-500 hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-6 pointer-events-none">
                <h3 className="text-xl font-bold text-white">{alum.name}</h3>
                <p className="text-brand-accent text-sm font-medium">{alum.role}</p>
                <p className="text-gray-400 text-xs mt-1">Batch of {alum.batch}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
