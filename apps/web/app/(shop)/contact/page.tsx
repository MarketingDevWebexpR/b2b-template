'use client';

import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { B2BHeaderEcomSpacer } from '@/components/layout/B2BHeaderEcom';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Send,
  Check,
} from 'lucide-react';

/**
 * Animation variants for staggered animations
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
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

const fadeInUp = {
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

/**
 * Contact form field interface
 */
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Form field errors interface
 */
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * FAQ item interface
 */
interface FAQItem {
  question: string;
  answer: string;
}

/**
 * FAQ data
 */
const faqItems: FAQItem[] = [
  {
    question: 'Quels sont les délais de livraison ?',
    answer:
      'Pour la France métropolitaine, comptez 2 à 5 jours ouvrables. Les expéditions internationales peuvent prendre entre 5 et 10 jours selon la destination. Toutes nos pièces sont livrées dans un écrin luxe avec service de suivi.',
  },
  {
    question: 'Proposez-vous des services de personnalisation ?',
    answer:
      'Oui, notre atelier réalise des gravures personnalisées et des créations sur-mesure. Prenez rendez-vous en boutique ou contactez-nous pour discuter de votre projet avec nos maîtres joailliers.',
  },
  {
    question: 'Comment entretenir mes bijoux ?',
    answer:
      'Nous recommandons de nettoyer vos bijoux avec un chiffon doux après chaque utilisation. Évitez le contact avec les parfums et produits chimiques. Un entretien professionnel annuel en boutique est offert pour toute création WebexpR Pro.',
  },
  {
    question: 'Quelle est votre politique de retour ?',
    answer:
      'Vous disposez de 30 jours pour retourner un article dans son état d\'origine. Les pièces sur-mesure et gravées ne sont pas échangeables. Contactez notre service client pour initier un retour.',
  },
];

/**
 * Contact information data
 */
const contactInfo = {
  address: {
    street: '24 Place Vendome',
    city: '75001 Paris, France',
  },
  phone: '+33 1 42 60 76 00',
  email: 'contact@webexprpro.fr',
  hours: [
    { days: 'Lundi - Vendredi', time: '10h00 - 19h00' },
    { days: 'Samedi', time: '10h00 - 18h00' },
    { days: 'Dimanche', time: 'Fermé' },
  ],
};

/**
 * Subject options for the contact form
 */
const subjectOptions = [
  'Renseignement produit',
  'Commande en cours',
  'Service après-vente',
  'Rendez-vous en boutique',
  'Création sur-mesure',
  'Autre demande',
];

/**
 * FAQ Accordion Item Component
 */
function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-stroke last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-6 text-left transition-colors duration-300 hover:text-primary"
        aria-expanded={isOpen}
      >
        <span className="pr-8 font-sans text-heading-5 text-content-primary">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            'h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300',
            isOpen && 'rotate-180'
          )}
          strokeWidth={1.5}
        />
      </button>
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="overflow-hidden"
      >
        <p className="pb-6 font-sans text-body leading-elegant text-content-muted">
          {item.answer}
        </p>
      </motion.div>
    </div>
  );
}

/**
 * Contact Page Component
 *
 * A luxury-styled contact page featuring:
 * - Hero section with elegant title
 * - Contact form with validation
 * - Contact information and opening hours
 * - FAQ accordion
 * - Map placeholder
 */
export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Veuillez entrer votre nom';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Veuillez entrer votre email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Veuillez entrer un email valide';
    }

    if (!formData.subject) {
      newErrors.subject = 'Veuillez sélectionner un sujet';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Veuillez entrer votre message';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Votre message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  /**
   * Handle input change
   */
  const handleInputChange = (
    field: keyof FormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <B2BHeaderEcomSpacer />
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-vignette" />
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

        <Container size="lg" className="py-16 lg:py-20">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Label */}
            <motion.span
              className="mb-4 inline-block font-sans text-overline uppercase  text-primary"
              variants={itemVariants}
            >
              Service Client
            </motion.span>

            {/* Title */}
            <motion.h1
              className="font-sans text-display-1 text-content-primary md:text-display-hero"
              variants={itemVariants}
            >
              Contactez-nous
            </motion.h1>

            {/* Decorative Line */}
            <motion.div
              className="mx-auto mt-8 h-px w-24 bg-primary"
              variants={itemVariants}
            />

            {/* Subtitle */}
            <motion.p
              className="mx-auto mt-8 max-w-prose-narrow font-sans text-body-lg leading-elegant text-content-muted"
              variants={itemVariants}
            >
              Notre équipe est à votre disposition pour répondre à toutes vos
              questions et vous accompagner dans vos choix.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="py-20 lg:py-28">
        <Container size="xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
            {/* Contact Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              <motion.div variants={itemVariants}>
                <h2 className="font-sans text-heading-2 text-content-primary">
                  Envoyez-nous un message
                </h2>
                <div className="mt-4 h-px w-16 bg-primary" />
              </motion.div>

              {isSubmitted ? (
                <motion.div
                  className="mt-10 rounded-lg border border-primary/20 bg-primary-50 p-10 text-center"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
                    <Check className="h-8 w-8 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-sans text-heading-4 text-content-primary">
                    Message envoyé
                  </h3>
                  <p className="mt-3 font-sans text-body text-content-muted">
                    Merci pour votre message. Notre équipe vous répondra dans
                    les plus brefs délais.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 font-sans text-caption uppercase  text-primary transition-colors hover:text-primary-600"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={handleSubmit}
                  className="mt-10 space-y-6"
                  variants={itemVariants}
                >
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block font-sans text-caption uppercase  text-content-primary"
                    >
                      Nom complet
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={cn(
                        'w-full border bg-white px-5 py-4 font-sans text-body text-content-primary',
                        'placeholder:text-content-muted',
                        'transition-all duration-300 duration-200',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
                        errors.name
                          ? 'border-red-400'
                          : 'border-stroke hover:border-stroke-medium'
                      )}
                      placeholder="Votre nom"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <p
                        id="name-error"
                        role="alert"
                        className="mt-2 font-sans text-caption text-red-500"
                      >
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block font-sans text-caption uppercase  text-content-primary"
                    >
                      Adresse email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={cn(
                        'w-full border bg-white px-5 py-4 font-sans text-body text-content-primary',
                        'placeholder:text-content-muted',
                        'transition-all duration-300 duration-200',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
                        errors.email
                          ? 'border-red-400'
                          : 'border-stroke hover:border-stroke-medium'
                      )}
                      placeholder="votre@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="mt-2 font-sans text-caption text-red-500"
                      >
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="mb-2 block font-sans text-caption uppercase  text-content-primary"
                    >
                      Sujet
                    </label>
                    <div className="relative">
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange('subject', e.target.value)
                        }
                        className={cn(
                          'w-full appearance-none border bg-white px-5 py-4 font-sans text-body text-content-primary',
                          'transition-all duration-300 duration-200',
                          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
                          !formData.subject && 'text-content-muted',
                          errors.subject
                            ? 'border-red-400'
                            : 'border-stroke hover:border-stroke-medium'
                        )}
                        aria-invalid={!!errors.subject}
                        aria-describedby={
                          errors.subject ? 'subject-error' : undefined
                        }
                      >
                        <option value="" disabled>
                          Sélectionnez un sujet
                        </option>
                        {subjectOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-content-muted"
                        strokeWidth={1.5}
                      />
                    </div>
                    {errors.subject && (
                      <p
                        id="subject-error"
                        role="alert"
                        className="mt-2 font-sans text-caption text-red-500"
                      >
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="mb-2 block font-sans text-caption uppercase  text-content-primary"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        handleInputChange('message', e.target.value)
                      }
                      className={cn(
                        'w-full resize-none border bg-white px-5 py-4 font-sans text-body text-content-primary',
                        'placeholder:text-content-muted',
                        'transition-all duration-300 duration-200',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
                        errors.message
                          ? 'border-red-400'
                          : 'border-stroke hover:border-stroke-medium'
                      )}
                      placeholder="Comment pouvons-nous vous aider ?"
                      aria-invalid={!!errors.message}
                      aria-describedby={
                        errors.message ? 'message-error' : undefined
                      }
                    />
                    {errors.message && (
                      <p
                        id="message-error"
                        role="alert"
                        className="mt-2 font-sans text-caption text-red-500"
                      >
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'group inline-flex w-full items-center justify-center gap-3',
                      'bg-primary px-8 py-4',
                      'font-sans text-overline font-medium uppercase  text-white',
                      'transition-all duration-400',
                      'hover:bg-primary-600 hover:shadow-button-hover',
                      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      'disabled:cursor-not-allowed disabled:opacity-70'
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="h-5 w-5 animate-spin"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer le message</span>
                        <Send
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          strokeWidth={1.5}
                        />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </motion.div>

            {/* Contact Information */}
            <motion.div
              className="space-y-12"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {/* Contact Details Card */}
              <motion.div
                className="rounded-lg border border-stroke bg-white p-8 shadow-elegant lg:p-10"
                variants={itemVariants}
              >
                <h2 className="font-sans text-heading-2 text-content-primary">
                  Informations
                </h2>
                <div className="mt-4 h-px w-16 bg-primary" />

                <div className="mt-8 space-y-8">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <MapPin
                        className="h-5 w-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h3 className="font-sans text-caption uppercase  text-content-muted">
                        Adresse
                      </h3>
                      <p className="mt-1 font-sans text-body text-content-primary">
                        {contactInfo.address.street}
                      </p>
                      <p className="font-sans text-body text-content-primary">
                        {contactInfo.address.city}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Phone
                        className="h-5 w-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h3 className="font-sans text-caption uppercase  text-content-muted">
                        Téléphone
                      </h3>
                      <a
                        href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                        className="mt-1 block font-sans text-body text-content-primary transition-colors hover:text-primary"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-50">
                      <Mail
                        className="h-5 w-5 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <h3 className="font-sans text-caption uppercase  text-content-muted">
                        Email
                      </h3>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="mt-1 block font-sans text-body text-content-primary transition-colors hover:text-primary"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Opening Hours Card */}
              <motion.div
                className="rounded-lg border border-stroke bg-white p-8 shadow-elegant lg:p-10"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3">
                  <Clock
                    className="h-5 w-5 text-primary"
                    strokeWidth={1.5}
                  />
                  <h2 className="font-sans text-heading-4 text-content-primary">
                    Horaires d&apos;ouverture
                  </h2>
                </div>
                <div className="mt-4 h-px w-16 bg-primary" />

                <div className="mt-6 space-y-4">
                  {contactInfo.hours.map((schedule, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between border-b border-stroke-light pb-4 last:border-b-0 last:pb-0"
                    >
                      <span className="font-sans text-body text-content-primary">
                        {schedule.days}
                      </span>
                      <span
                        className={cn(
                          'font-sans text-body',
                          schedule.time === 'Fermé'
                            ? 'text-content-muted'
                            : 'text-content-muted'
                        )}
                      >
                        {schedule.time}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Map Placeholder */}
              <motion.div
                className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stroke bg-background-beige"
                variants={itemVariants}
              >
                {/* Decorative Map Illustration */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
                    <MapPin
                      className="h-8 w-8 text-primary"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-sans text-heading-5 text-content-primary">
                    Place Vendome, Paris
                  </h3>
                  <p className="mt-2 max-w-xs font-sans text-body-sm text-content-muted">
                    Au coeur du prestigieux quartier de la haute joaillerie
                    parisienne
                  </p>
                  <a
                    href="https://maps.google.com/?q=24+Place+Vendome+Paris"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 font-sans text-caption uppercase  text-primary transition-colors hover:text-primary-600"
                  >
                    <span>Voir sur Google Maps</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>

                {/* Decorative grid pattern */}
                <div className="absolute inset-0 opacity-30">
                  <svg
                    className="h-full w-full"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="grid"
                        width="40"
                        height="40"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 40 0 L 0 0 0 40"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          className="text-border"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-stroke bg-white py-20 lg:py-28">
        <Container size="md">
          <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.span
              className="mb-4 inline-block font-sans text-overline uppercase  text-primary"
              variants={fadeInUp}
            >
              Aide
            </motion.span>

            <motion.h2
              className="font-sans text-heading-1 text-content-primary"
              variants={fadeInUp}
            >
              Questions fréquentes
            </motion.h2>

            <motion.div
              className="mx-auto mt-6 h-px w-24 bg-primary"
              variants={fadeInUp}
            />
          </motion.div>

          <motion.div
            className="mt-12 lg:mt-16"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {faqItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <FAQAccordionItem
                  item={item}
                  isOpen={openFAQ === index}
                  onToggle={() =>
                    setOpenFAQ(openFAQ === index ? null : index)
                  }
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Help CTA */}
          <motion.div
            className="mt-12 text-center lg:mt-16"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="font-sans text-body text-content-muted">
              Vous n&apos;avez pas trouvé la réponse à votre question ?
            </p>
            <a
              href={`mailto:${contactInfo.email}`}
              className="mt-4 inline-flex items-center gap-2 font-sans text-caption uppercase  text-primary transition-colors hover:text-primary-600"
            >
              <Mail className="h-4 w-4" strokeWidth={1.5} />
              <span>Contactez notre équipe</span>
            </a>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
