import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Guard to prevent build-time execution
function isRuntimeEnvironment(): boolean {
  return process.env.STRIPE_SECRET_KEY !== undefined;
}

async function getStripe() {
  if (!isRuntimeEnvironment()) {
    throw new Error('Stripe is not available during build');
  }

  const Stripe = (await import('stripe')).default;
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(key, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const stripe = await getStripe();
    const { amount, currency = 'eur' } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Le montant minimum est de 0.50 EUR' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: { integration: 'bijoux-next' },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);

    // Generic error handling - no Stripe type import needed
    const errorMessage =
      error instanceof Error ? error.message : 'Une erreur est survenue';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
