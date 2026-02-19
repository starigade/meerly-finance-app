"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring, motion } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  className?: string;
  /** Spring stiffness — higher = snappier. Default 80 */
  stiffness?: number;
  /** Spring damping — higher = less bounce. Default 20 */
  damping?: number;
}

export function AnimatedNumber({
  value,
  format = (v) => v.toLocaleString(),
  className,
  stiffness = 80,
  damping = 20,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness, damping });

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = format(Math.round(latest));
      }
    });
    return unsubscribe;
  }, [springValue, format]);

  return (
    <motion.span ref={ref} className={className}>
      {format(0)}
    </motion.span>
  );
}
