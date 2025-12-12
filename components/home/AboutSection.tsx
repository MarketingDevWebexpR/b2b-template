'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const textVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function AboutSection() {
  return (
    <section className="overflow-hidden bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-content-wide px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Image Column */}
          <motion.div className="relative" variants={imageVariants}>
            {/* Main Image */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-soft lg:aspect-[3/4]">
              <Image
                src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
                alt="Jewelry workshop craftsmanship"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Subtle overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-luxe-charcoal/15 to-transparent" />
            </div>

            {/* Decorative Frame - Hermes Orange */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-soft border border-hermes-500/20 lg:-bottom-6 lg:-right-6" />

            {/* Floating Accent Image */}
            <motion.div
              className="absolute -bottom-8 -right-8 h-32 w-32 overflow-hidden rounded-soft border-4 border-white shadow-elegant-lg sm:h-40 sm:w-40 lg:-bottom-12 lg:-right-12 lg:h-48 lg:w-48"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <Image
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&q=80"
                alt="Jewelry detail"
                fill
                sizes="200px"
                className="object-cover"
              />
            </motion.div>

            {/* Orange accent corner */}
            <div className="absolute left-0 top-0 h-20 w-20 border-l-2 border-t-2 border-hermes-500 lg:h-32 lg:w-32" />
          </motion.div>

          {/* Text Column */}
          <motion.div className="lg:pl-8" variants={textVariants}>
            {/* Label */}
            <motion.span
              className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
              variants={itemVariants}
            >
              Depuis 1987
            </motion.span>

            {/* Title */}
            <motion.h2
              className="font-serif text-heading-1 text-text-primary md:text-display-2"
              variants={itemVariants}
            >
              Notre Savoir-Faire
            </motion.h2>

            {/* Hermes Orange Decorative Line */}
            <motion.div
              className="my-8 h-px w-24 bg-hermes-500"
              variants={itemVariants}
            />

            {/* Description Paragraphs */}
            <motion.div
              className="space-y-6 font-sans text-body leading-elegant text-text-muted"
              variants={itemVariants}
            >
              <p>
                Dans nos ateliers, chaque bijou nait de la rencontre entre
                l&apos;excellence artisanale et la vision creatrice de nos maitres
                joailliers. Une tradition d&apos;excellence transmise depuis trois
                generations.
              </p>

              <p>
                Nous selectionnons les pierres les plus rares et les metaux les plus
                precieux pour creer des pieces uniques qui traversent le temps.
                Chaque creation est le fruit de centaines d&apos;heures de travail
                minutieux.
              </p>

              <p>
                De l&apos;esquisse initiale a la derniere touche de polissage, nous
                cultivons l&apos;art de la perfection pour vous offrir des bijoux
                d&apos;exception qui racontent votre histoire.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="mt-10 grid grid-cols-3 gap-8 border-t border-border pt-10"
              variants={itemVariants}
            >
              <div>
                <span className="font-serif text-heading-2 text-hermes-500">
                  37
                </span>
                <p className="mt-1 font-sans text-caption text-text-muted">
                  Annees d&apos;excellence
                </p>
              </div>
              <div>
                <span className="font-serif text-heading-2 text-hermes-500">
                  12k+
                </span>
                <p className="mt-1 font-sans text-caption text-text-muted">
                  Creations uniques
                </p>
              </div>
              <div>
                <span className="font-serif text-heading-2 text-hermes-500">
                  24
                </span>
                <p className="mt-1 font-sans text-caption text-text-muted">
                  Maitres joailliers
                </p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div className="mt-10" variants={itemVariants}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-3 border border-hermes-500 bg-transparent px-8 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-hermes-500 transition-all duration-400 hover:bg-hermes-500 hover:text-white"
              >
                <span>Decouvrir notre histoire</span>
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1"
                  strokeWidth={1.5}
                />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default AboutSection;
