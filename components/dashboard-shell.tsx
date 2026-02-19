"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] as const },
  },
};

export function DashboardShell({ children }: { children: ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children];

  return (
    <motion.div
      className="flex flex-col gap-4"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {childArray.map((child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
