'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
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
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Veuillez entrer une adresse email valide.');
      return;
    }

    setStatus('loading');

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      setEmail('');

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 5000);
    } catch {
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez reessayer.');
    }
  };

  return (
    <section className="relative overflow-hidden bg-neutral-100 py-16 lg:py-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23525252' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-content px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Decorative Element */}
          <motion.div
            className="mx-auto mb-6 flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <span className="h-px w-12 bg-accent" />
            <span className="h-2 w-2 rotate-45 bg-accent" />
            <span className="h-px w-12 bg-accent" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            className="font-sans text-2xl font-semibold text-neutral-900 md:text-3xl"
            variants={itemVariants}
          >
            Restez informe
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            className="mx-auto mt-3 max-w-prose font-sans text-base text-neutral-600"
            variants={itemVariants}
          >
            Inscrivez-vous a notre newsletter pour recevoir nos dernieres
            nouveautes, offres exclusives et actualites du marche.
          </motion.p>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="mx-auto mt-10 max-w-lg"
            variants={itemVariants}
          >
            <div className="relative flex flex-col gap-4 sm:flex-row sm:gap-0">
              {/* Email Input */}
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Votre adresse email"
                  disabled={status === 'loading' || status === 'success'}
                  className={cn(
                    'w-full bg-white px-5 py-3.5 font-sans text-neutral-900 placeholder-neutral-400 outline-none transition-all duration-200',
                    'border border-neutral-300 focus:border-accent rounded-sm sm:rounded-r-none',
                    'disabled:opacity-50',
                    status === 'error' && 'border-red-500'
                  )}
                  aria-label="Email address"
                  aria-describedby={status === 'error' ? 'email-error' : undefined}
                />

                {/* Success Icon in Input */}
                {status === 'success' && (
                  <motion.div
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  >
                    <Check className="h-5 w-5 text-green-600" />
                  </motion.div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  'group relative flex items-center justify-center gap-2 bg-accent px-6 py-3.5 font-sans text-sm font-medium uppercase tracking-wider text-white transition-all duration-200',
                  'hover:bg-accent/90 disabled:opacity-70',
                  'sm:min-w-[140px] rounded-sm sm:rounded-l-none'
                )}
                aria-label="Subscribe to newsletter"
              >
                {status === 'loading' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : status === 'success' ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span className="hidden sm:inline">Inscrit</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">S&apos;inscrire</span>
                    <Send className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <motion.p
                id="email-error"
                className="mt-3 text-left font-sans text-caption text-red-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
              >
                {errorMessage}
              </motion.p>
            )}

            {/* Success Message */}
            {status === 'success' && (
              <motion.p
                className="mt-3 text-left font-sans text-caption text-green-600"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
              >
                Merci pour votre inscription ! Vous recevrez bientot nos nouvelles.
              </motion.p>
            )}
          </motion.form>

          {/* Privacy Text */}
          <motion.p
            className="mt-4 font-sans text-xs text-neutral-500"
            variants={itemVariants}
          >
            En vous inscrivant, vous acceptez notre{' '}
            <a
              href="/privacy"
              className="text-accent underline-offset-2 transition-colors duration-200 hover:text-accent/80 hover:underline"
            >
              politique de confidentialite
            </a>
            . Nous ne partagerons jamais vos informations avec des tiers.
          </motion.p>

          {/* Decorative Element */}
          <motion.div
            className="mx-auto mt-10 flex items-center justify-center gap-4"
            variants={itemVariants}
          >
            <span className="h-px w-12 bg-accent" />
            <span className="h-2 w-2 rotate-45 bg-accent" />
            <span className="h-px w-12 bg-accent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Newsletter;
