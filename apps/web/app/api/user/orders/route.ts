import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrdersByUserId, getOrderCountByUserId, getTotalSpentByUserId } from '@/data/orders';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/orders
 * Get all orders for the authenticated user
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's orders
    const orders = getOrdersByUserId(userId);
    const orderCount = getOrderCountByUserId(userId);
    const totalSpent = getTotalSpentByUserId(userId);

    return NextResponse.json({
      success: true,
      orders,
      total: orderCount,
      totalSpent,
      page: 1,
      pageSize: orders.length,
    });
  } catch (error) {
    console.error('User orders API error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recuperation des commandes' },
      { status: 500 }
    );
  }
}
