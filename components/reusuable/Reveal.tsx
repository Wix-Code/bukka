"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

const easing = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-reveal wrapper that matches the landing page animations, so
 * server-rendered sections (like FeaturedVendors) can animate in too.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ delay, duration: 0.6, ease: easing }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
