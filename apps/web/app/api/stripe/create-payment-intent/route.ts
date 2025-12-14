import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(key, {
    apiVersion: '2025-11-17.clover',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    const { amount, currency = 'eur' } = await request.json();

    if (!amount || amount < 50) {
      return NextResponse.json(
        { error: 'Le montant minimum est de 0.50 EUR' },
        { status: 400 }
      );
    }

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // amount in cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        integration: 'bijoux-next',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe PaymentIntent error:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la creation du paiement' },
      { status: 500 }
    );
  }
}
