'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Diamond, Gem, Award, Users, Sparkles, Heart } from 'lucide-react';
import { Container } from '@/components/ui/Container';

// ============================================================================
// Animation Variants
// ============================================================================

const fadeInUp = {
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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ============================================================================
// Data
// ============================================================================

const timelineEvents = [
  {
    year: '1987',
    title: 'La Fondation',
    description:
      'Maison Bijoux voit le jour dans le quartier historique du Marais, fondee par Pierre-Alexandre Beaumont, maitre joaillier forme aupres des plus grandes maisons parisiennes.',
  },
  {
    year: '1995',
    title: 'L\'Atelier Historique',
    description:
      'Ouverture de notre atelier Place Vendome, symbole de notre engagement envers l\'excellence. Une equipe de douze artisans perpetue les gestes ancestraux de la haute joaillerie.',
  },
  {
    year: '2005',
    title: 'Reconnaissance Internationale',
    description:
      'Notre maison recoit le label "Entreprise du Patrimoine Vivant", recompensant notre savoir-faire d\'exception et notre contribution a l\'heritage artisanal francais.',
  },
  {
    year: '2015',
    title: 'L\'Innovation Responsable',
    description:
      'Engagement pionnier dans la joaillerie ethique : certification RJC et approvisionnement exclusif en or certifie Fairmined et diamants traces de la mine au bijou.',
  },
  {
    year: '2024',
    title: 'Une Nouvelle Ere',
    description:
      'Sophie Beaumont, petite-fille du fondateur, prend la direction artistique. Une vision contemporaine qui preserve l\'ADN de la maison tout en l\'ouvrant aux nouvelles generations.',
  },
];

const craftValues = [
  {
    icon: Diamond,
    title: 'Expertise Seculaire',
    description:
      'Trois generations de maitres joailliers transmettent un savoir-faire unique, perpétuant les techniques traditionnelles tout en embrassant l\'innovation.',
  },
  {
    icon: Gem,
    title: 'Materiaux d\'Exception',
    description:
      'Chaque pierre est selectionnee a la main par nos gemmologues. Nous travaillons uniquement avec les metaux les plus purs et les gemmes les plus rares.',
  },
  {
    icon: Award,
    title: 'Excellence Artisanale',
    description:
      'Chaque creation necessite entre 100 et 500 heures de travail. Un souci du detail qui fait de chaque piece une oeuvre unique et intemporelle.',
  },
  {
    icon: Heart,
    title: 'Passion Authentique',
    description:
      'La passion guide chaque geste de nos artisans. C\'est cette emotion sincere qui confere a nos bijoux leur ame et leur caractere unique.',
  },
];

const materials = [
  {
    name: 'Or 18 Carats',
    description: 'Or jaune, rose et blanc de la plus haute purete, certifie Fairmined pour une tracabilite totale.',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&q=80',
  },
  {
    name: 'Diamants Naturels',
    description: 'Diamants certifies GIA, selectionnes pour leur eclat exceptionnel et leur provenance ethique.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
  },
  {
    name: 'Pierres Precieuses',
    description: 'Rubis de Birmanie, saphirs du Cachemire, emeraudes de Colombie - les gemmes les plus convoitees.',
    image: 'https://images.unsplash.com/photo-1551122087-f99a4f8a8b4a?w=600&q=80',
  },
  {
    name: 'Perles Fines',
    description: 'Perles des mers du Sud et d\'Akoya, selectionnees pour leur lustre parfait et leur nacre immaculee.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
  },
];

const teamMembers = [
  {
    name: 'Sophie Beaumont',
    role: 'Directrice Artistique',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
  {
    name: 'Jean-Marc Lefebvre',
    role: 'Maitre Joaillier',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Claire Dumont',
    role: 'Gemmologue en Chef',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80',
  },
  {
    name: 'Antoine Mercier',
    role: 'Artisan Sertisseur',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
  },
];

// ============================================================================
// Components
// ============================================================================

/**
 * Hero Section - Full viewport height with elegant typography
 */
function HeroSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1920&q=80"
          alt="L'art de la joaillerie"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-luxe-charcoal/40 via-luxe-charcoal/20 to-luxe-charcoal/60" />
      <div className="absolute inset-0 bg-gradient-to-r from-luxe-charcoal/30 via-transparent to-luxe-charcoal/30" />

      {/* Content */}
      <motion.div
        className="relative z-10 px-4 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative Line */}
        <motion.div
          className="mx-auto mb-8 h-px w-24 bg-hermes-500"
          variants={fadeIn}
        />

        {/* Overline */}
        <motion.span
          className="mb-6 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-400"
          variants={fadeInUp}
        >
          Depuis 1987
        </motion.span>

        {/* Main Title */}
        <motion.h1
          className="font-serif text-display-hero text-white drop-shadow-lg md:text-[5.5rem] lg:text-[6.5rem]"
          variants={fadeInUp}
        >
          Notre Histoire
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mt-6 max-w-2xl font-sans text-body-lg font-light tracking-elegant text-white/90 md:text-xl"
          variants={fadeInUp}
        >
          Trois generations d'excellence artisanale au service de la beaute.
          <br className="hidden md:block" />
          Une passion transmise, un heritage preserve.
        </motion.p>

        {/* Decorative Line */}
        <motion.div
          className="mx-auto mt-12 h-px w-24 bg-hermes-500"
          variants={fadeIn}
        />
      </motion.div>

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
            Decouvrir
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

/**
 * Timeline Section - History milestones
 */
function TimelineSection() {
  return (
    <section className="bg-background-cream py-24 lg:py-32">
      <Container size="lg">
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
            variants={fadeInUp}
          >
            Une Saga Familiale
          </motion.span>
          <motion.h2
            className="font-serif text-heading-1 text-text-primary md:text-display-2"
            variants={fadeInUp}
          >
            Les Grandes Etapes
          </motion.h2>
          <motion.div
            className="mx-auto mt-6 h-px w-24 bg-hermes-500"
            variants={fadeIn}
          />
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 hidden h-full w-px bg-border-medium md:left-1/2 md:block md:-translate-x-1/2" />

          {/* Timeline Events */}
          <div className="space-y-12 md:space-y-0">
            {timelineEvents.map((event, index) => (
              <motion.div
                key={event.year}
                className={`relative md:flex md:items-center md:justify-between ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
              >
                {/* Content */}
                <div
                  className={`md:w-5/12 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:text-left'
                  }`}
                >
                  <div className="rounded-elegant border border-border-light bg-white p-8 shadow-soft transition-shadow duration-400 hover:shadow-elegant">
                    <span className="font-serif text-heading-2 text-hermes-500">
                      {event.year}
                    </span>
                    <h3 className="mt-2 font-serif text-heading-4 text-text-primary">
                      {event.title}
                    </h3>
                    <p className="mt-4 font-sans text-body leading-elegant text-text-muted">
                      {event.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="absolute left-4 top-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-hermes-500 bg-white md:left-1/2 md:block" />

                {/* Spacer */}
                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Craftsmanship Section - Our values and expertise
 */
function CraftsmanshipSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Image Column */}
          <motion.div
            className="relative order-2 lg:order-1"
            variants={scaleIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-soft">
              <Image
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80"
                alt="Artisan joaillier au travail"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-luxe-charcoal/20 to-transparent" />
            </div>

            {/* Decorative Frame */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-soft border border-hermes-500/20 lg:-bottom-6 lg:-right-6" />

            {/* Floating Accent */}
            <motion.div
              className="absolute -top-8 right-8 rounded-soft border-4 border-white bg-hermes-500 px-6 py-4 shadow-elegant-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="font-serif text-heading-3 text-white">37</span>
              <p className="font-sans text-caption text-white/90">
                annees d'excellence
              </p>
            </motion.div>
          </motion.div>

          {/* Content Column */}
          <motion.div
            className="order-1 lg:order-2 lg:pl-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <motion.span
              className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
              variants={fadeInUp}
            >
              L'Art du Geste
            </motion.span>

            <motion.h2
              className="font-serif text-heading-1 text-text-primary md:text-display-2"
              variants={fadeInUp}
            >
              Le Savoir-Faire
            </motion.h2>

            <motion.div
              className="my-8 h-px w-24 bg-hermes-500"
              variants={fadeIn}
            />

            <motion.p
              className="mb-12 font-sans text-body-lg leading-elegant text-text-muted"
              variants={fadeInUp}
            >
              Dans nos ateliers, chaque bijou nait de la rencontre entre
              l'excellence artisanale et la vision creatrice de nos maitres
              joailliers. Une tradition d'excellence transmise depuis trois
              generations.
            </motion.p>

            {/* Values Grid */}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {craftValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="group"
                  variants={fadeInUp}
                  custom={index}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-hermes-50 transition-colors duration-350 group-hover:bg-hermes-100">
                    <value.icon
                      className="h-6 w-6 text-hermes-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-serif text-heading-5 text-text-primary">
                    {value.title}
                  </h3>
                  <p className="mt-2 font-sans text-body-sm leading-relaxed text-text-muted">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

/**
 * Materials Section - Premium materials showcase
 */
function MaterialsSection() {
  return (
    <section className="bg-background-beige py-24 lg:py-32">
      <Container>
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
            variants={fadeInUp}
          >
            La Quete de l'Excellence
          </motion.span>
          <motion.h2
            className="font-serif text-heading-1 text-text-primary md:text-display-2"
            variants={fadeInUp}
          >
            Matieres Nobles
          </motion.h2>
          <motion.p
            className="mx-auto mt-6 max-w-2xl font-sans text-body-lg leading-elegant text-text-muted"
            variants={fadeInUp}
          >
            Nous selectionnons avec une exigence absolue les materiaux les plus
            precieux, issus des sources les plus ethiques au monde.
          </motion.p>
          <motion.div
            className="mx-auto mt-8 h-px w-24 bg-hermes-500"
            variants={fadeIn}
          />
        </motion.div>

        {/* Materials Grid */}
        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {materials.map((material) => (
            <motion.div
              key={material.name}
              className="group cursor-pointer"
              variants={fadeInUp}
            >
              <div className="relative mb-6 aspect-square overflow-hidden rounded-soft">
                <Image
                  src={material.image}
                  alt={material.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-600 ease-luxe group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxe-charcoal/40 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100" />
              </div>
              <h3 className="font-serif text-heading-5 text-text-primary transition-colors duration-350 group-hover:text-hermes-500">
                {material.name}
              </h3>
              <p className="mt-2 font-sans text-body-sm leading-relaxed text-text-muted">
                {material.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

/**
 * Team Section - Meet our artisans
 */
function TeamSection() {
  return (
    <section className="bg-white py-24 lg:py-32">
      <Container>
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <motion.span
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-500"
            variants={fadeInUp}
          >
            Les Visages de la Maison
          </motion.span>
          <motion.h2
            className="font-serif text-heading-1 text-text-primary md:text-display-2"
            variants={fadeInUp}
          >
            Notre Equipe
          </motion.h2>
          <motion.p
            className="mx-auto mt-6 max-w-2xl font-sans text-body-lg leading-elegant text-text-muted"
            variants={fadeInUp}
          >
            Derriere chaque creation, des artisans passionnes qui consacrent leur
            vie a l'excellence. Rencontrez les gardiens de notre savoir-faire.
          </motion.p>
          <motion.div
            className="mx-auto mt-8 h-px w-24 bg-hermes-500"
            variants={fadeIn}
          />
        </motion.div>

        {/* Team Grid */}
        <motion.div
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.name}
              className="group text-center"
              variants={fadeInUp}
            >
              <div className="relative mx-auto mb-6 h-64 w-64 overflow-hidden rounded-full">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-600 ease-luxe group-hover:scale-105"
                />
                <div className="absolute inset-0 rounded-full border-4 border-transparent transition-colors duration-400 group-hover:border-hermes-500/30" />
              </div>
              <h3 className="font-serif text-heading-5 text-text-primary">
                {member.name}
              </h3>
              <p className="mt-1 font-sans text-overline uppercase tracking-luxe text-hermes-500">
                {member.role}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Workshop Image */}
        <motion.div
          className="mt-20"
          variants={scaleIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <div className="relative aspect-[21/9] overflow-hidden rounded-elegant">
            <Image
              src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=1600&q=80"
              alt="Notre atelier Place Vendome"
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-luxe-charcoal/50 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white md:bottom-12 md:left-12">
              <p className="font-sans text-overline uppercase tracking-luxe text-hermes-400">
                Notre Atelier
              </p>
              <h3 className="mt-2 font-serif text-heading-3 md:text-heading-2">
                Place Vendome, Paris
              </h3>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

/**
 * CTA Section - Call to action towards collections
 */
function CTASection() {
  return (
    <section className="relative overflow-hidden bg-luxe-charcoal py-24 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2Mmgxem0tMTIgMTB2Mmg0di0yaC00em0yMC0xMHYyaDR2LTJoLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
      </div>

      <Container>
        <motion.div
          className="relative text-center"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Decorative Icon */}
          <motion.div
            className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-full border border-hermes-500/30 bg-hermes-500/10"
            variants={scaleIn}
          >
            <Sparkles className="h-10 w-10 text-hermes-500" strokeWidth={1} />
          </motion.div>

          <motion.span
            className="mb-4 inline-block font-sans text-overline uppercase tracking-luxe text-hermes-400"
            variants={fadeInUp}
          >
            Explorez Notre Univers
          </motion.span>

          <motion.h2
            className="font-serif text-heading-1 text-white md:text-display-2"
            variants={fadeInUp}
          >
            Decouvrez Nos Collections
          </motion.h2>

          <motion.p
            className="mx-auto mt-6 max-w-2xl font-sans text-body-lg leading-elegant text-white/80"
            variants={fadeInUp}
          >
            Chaque piece de notre collection incarne des decennies de savoir-faire
            et une passion inalterable pour la beaute. Laissez-vous seduire par
            l'elegance intemporelle de nos creations.
          </motion.p>

          <motion.div
            className="mx-auto mt-8 h-px w-24 bg-hermes-500"
            variants={fadeIn}
          />

          <motion.div
            className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
            variants={fadeInUp}
          >
            {/* Primary CTA */}
            <Link
              href="/products"
              className="group inline-flex min-w-[220px] items-center justify-center gap-3 bg-hermes-500 px-10 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-white transition-all duration-400 hover:bg-hermes-600 hover:shadow-button-hover"
            >
              <span>Voir les Collections</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-350 group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </Link>

            {/* Secondary CTA */}
            <Link
              href="/contact"
              className="group inline-flex min-w-[220px] items-center justify-center gap-3 border border-white/40 bg-transparent px-10 py-4 font-sans text-overline font-medium uppercase tracking-luxe text-white transition-all duration-400 hover:border-white hover:bg-white/10"
            >
              <span>Nous Contacter</span>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

// ============================================================================
// Page Component
// ============================================================================

/**
 * Notre Histoire Page
 *
 * A luxury brand story page featuring:
 * - Full-screen hero with elegant typography
 * - Timeline of company milestones
 * - Craftsmanship values and expertise
 * - Premium materials showcase
 * - Team/workshop presentation
 * - Call-to-action to collections
 *
 * Design inspired by Hermes aesthetic with:
 * - Generous white space
 * - Serif typography for headings
 * - Orange accent color (hermes-500)
 * - Subtle framer-motion animations
 */
export default function NotreHistoirePage() {
  return (
    <>
      <HeroSection />
      <TimelineSection />
      <CraftsmanshipSection />
      <MaterialsSection />
      <TeamSection />
      <CTASection />
    </>
  );
}
