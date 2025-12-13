import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createOrder } from '@/data/orders';
import { CartItemWithDetails, ShippingAddress, PaymentMethod } from '@/types';
import { z } from 'zod';

// Validation schema for shipping address
const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'Prenom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  address: z.string().min(1, 'Adresse requise'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'Ville requise'),
  postalCode: z.string().min(1, 'Code postal requis'),
  country: z.string().min(1, 'Pays requis'),
  phone: z.string().min(1, 'Telephone requis'),
  email: z.string().email().optional(),
});

// Validation schema for cart items
const cartItemSchema = z.object({
  productId: z.string().min(1),
  productReference: z.string().optional(),
  productName: z.string().min(1),
  productSlug: z.string().min(1),
  productImage: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().int().positive(),
  maxQuantity: z.number().int().positive(),
  totalPrice: z.number().positive(),
});

// Validation schema for order creation request
const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Le panier ne peut pas etre vide'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['card', 'paypal', 'bank_transfer', 'apple_pay', 'google_pay']).optional(),
  notes: z.string().optional(),
});

export const dynamic = 'force-dynamic';

/**
 * POST /api/orders
 * Create a new order
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Donnees invalides',
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod = 'card' } = validation.data;

    // Create the order using the authenticated user's ID
    const order = createOrder(
      session.user.id,
      items as CartItemWithDetails[],
      shippingAddress as ShippingAddress,
      paymentMethod as PaymentMethod
    );

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        totals: order.totals,
        message: 'Commande creee avec succes',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la creation de la commande' },
      { status: 500 }
    );
  }
}
