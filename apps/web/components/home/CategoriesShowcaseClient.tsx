'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.svg';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// Animated header wrapper
interface AnimatedHeaderProps {
  children: ReactNode;
}

export function AnimatedHeader({ children }: AnimatedHeaderProps) {
  return (
    <motion.div
      className="mb-16 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={headerVariants}
    >
      {children}
    </motion.div>
  );
}

// Animated grid container
interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className = '' }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
}

// Animated card wrapper
interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = '' }: AnimatedCardProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

// Animated section wrapper for standalone items
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className = '' }: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {children}
    </motion.div>
  );
}

// Category card image with error handling and loading state
interface CategoryCardImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function CategoryCardImage({ src, alt, priority = false }: CategoryCardImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(src || PLACEHOLDER_IMAGE);

  return (
    <>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition-all duration-600 ease-luxe group-hover:scale-105 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        onLoad={() => setImageLoaded(true)}
        onError={() => {
          setImageSrc(PLACEHOLDER_IMAGE);
          setImageLoaded(true);
        }}
      />
      {/* Loading Skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-luxe-champagne/50" />
      )}
    </>
  );
}
