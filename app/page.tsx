"use client";

import { motion } from "framer-motion";
import { AuthLogo } from "./_components/_media/authLogo";
import CustomLink from "./_components/CustomLink";

export default function WelcomePage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Background Image with Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/503698ldsdl.jpg')" }}
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 bg-black/65" 
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
        >
          <AuthLogo />
        </motion.div>

        {/* Welcome Text */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          className="text-6xl font-morion text-white font-light tracking-wider"
        >
          Welcome
        </motion.h1>

        {/* Start Learning Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, delay: 1.5, ease: "easeOut" }}
        >
          <CustomLink 
            href="/course"
            fontSize="text-2xl"
            arrowSize={24}
            className="mt-8"
          >
            Start Learning
          </CustomLink>
        </motion.div>
      </div>
    </div>
  );
}