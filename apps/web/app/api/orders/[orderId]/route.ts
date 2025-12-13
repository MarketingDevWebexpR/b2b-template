import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrderByIdForUser } from '@/data/orders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/orders/[orderId]
 * Get a specific order by ID for the authenticated user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      );
    }

    // Get order for the authenticated user
    const order = getOrderByIdForUser(orderId, session.user.id);

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvee' },
        { status: 404 }
      );
    }

    // Return order data (formatted for the confirmation page)
    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
      status: order.status,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
      })),
      totalPrice: order.totals.total,
      shipping: {
        firstName: order.shippingAddress.firstName,
        lastName: order.shippingAddress.lastName,
        address: order.shippingAddress.address,
        city: order.shippingAddress.city,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation de la commande' },
      { status: 500 }
    );
  }
}
