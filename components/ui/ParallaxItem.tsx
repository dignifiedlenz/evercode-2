"use client";

import React from "react";
import { motion, useTransform } from "framer-motion";
import { useParallaxContext } from "./ParrallaxLayout";

interface ParallaxItemProps {
  speed?: number; // e.g., 1 = background, 5 = faster movement
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function ParallaxItem({
  speed = 1,
  className = "",
  style = {},
  children,
}: ParallaxItemProps) {
  const { mouseX, mouseY } = useParallaxContext();

  // Transform the mouseX and mouseY into parallax offsets
  // This example “drags” elements in the opposite direction to the cursor
  const x = useTransform(mouseX, (val: number) => {
    return (window.innerWidth / 2 - val) * (speed / 100);
  });
  const y = useTransform(mouseY, (val: number) => {
    return (window.innerHeight / 2 - val) * (speed / 100);
  });

  return (
    <motion.div
      className={className}
      style={{ ...style, x, y }} // Framer Motion style props
    >
      {children}
    </motion.div>
  );
}