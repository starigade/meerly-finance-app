"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView, type Variant } from "framer-motion";

interface InViewProps {
  children: ReactNode;
  className?: string;
  /** Extra variants for hidden/visible states */
  variants?: { hidden: Variant; visible: Variant };
  /** Trigger only once. Default true */
  once?: boolean;
  /** IntersectionObserver margin. Default "-60px" */
  margin?: string;
  /** Stagger delay index (0-based) — multiplied by 0.1s */
  index?: number;
}

const defaultVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function InView({
  children,
  className,
  variants = defaultVariants,
  once = true,
  margin = "-60px",
  index = 0,
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: margin as `${number}px` });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.4, 0.25, 1] as const,
        delay: index * 0.1,
      }}
    >
      {children}
    </motion.div>
  );
}
