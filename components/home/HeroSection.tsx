'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Next/Image for optimization */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&q=80"
          alt="Luxury jewelry collection"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Light Overlay - Elegant Hermes style */}
      <div className="absolute inset-0 bg-gradient-to-b from-background-cream/30 via-transparent to-luxe-charcoal/50" />

      {/* Additional gradient for elegant depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-background-cream/20 via-transparent to-background-cream/20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Decorative Line - Hermes Orange */}
          <motion.div
            className="mx-auto mb-8 h-px w-24 bg-hermes-500"
            variants={itemVariants}
          />

          {/* Main Headline */}
          <motion.h1
            className="font-serif text-display-hero text-white drop-shadow-lg md:text-[5.5rem] lg:text-[6.5rem]"
            variants={itemVariants}
          >
            L&apos;Art de la Joaillerie
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-6 font-sans text-body-lg font-light tracking-elegant text-white/90 drop-shadow-md md:text-xl"
            variants={itemVariants}
          >
            Pieces uniques. Elegance eternelle.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            variants={buttonVariants}
          >
            {/* Primary Button - Hermes Orange */}
            <Link
              href="/products"
              className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden bg-hermes-500 px-10 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-white transition-all duration-400 hover:bg-hermes-600 hover:shadow-button-hover"
            >
              <span className="relative z-10">Decouvrir</span>
            </Link>

            {/* Secondary Button - White Outline */}
            <Link
              href="/categories"
              className="group relative inline-flex min-w-[200px] items-center justify-center overflow-hidden border border-white/80 bg-white/10 px-10 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-white backdrop-blur-sm transition-all duration-400 hover:bg-white hover:text-luxe-charcoal"
            >
              <span className="relative z-10">Collections</span>
            </Link>
          </motion.div>

          {/* Decorative Line */}
          <motion.div
            className="mx-auto mt-16 h-px w-24 bg-hermes-500"
            variants={itemVariants}
          />
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2 text-white/80"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-sans text-overline uppercase tracking-luxe">
            Scroll
          </span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default HeroSection;
