/**
 * Quote Factory - Generation de devis mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem, randomItems, randomDate } from './base';
import { mockProducts, type MockProduct } from './product.factory';
import { createCartItem, type MockCartItem } from './cart.factory';
import { mockAddresses, type MockAddress } from './address.factory';

export type QuoteStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'negotiation'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'converted';

export interface MockQuoteItem extends MockCartItem {
  originalPrice: number;
  requestedPrice?: number;
  finalPrice: number;
  discount: number;
}

export interface MockQuoteMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'sales';
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface MockQuote {
  id: string;
  quoteNumber: string;
  status: QuoteStatus;
  items: MockQuoteItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  originalTotal: number;
  savingsAmount: number;
  savingsPercentage: number;
  itemCount: number;
  currency: string;
  billingAddress?: MockAddress;
  shippingAddress?: MockAddress;
  messages: MockQuoteMessage[];
  notes?: string;
  validUntil: string;
  companyId: string;
  userId: string;
  assignedTo?: string;
  convertedOrderId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

const quoteStatuses: QuoteStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'negotiation',
  'approved',
  'rejected',
  'expired',
  'converted',
];

const salesReps = [
  'Sophie Martin',
  'Pierre Durand',
  'Marie Lefebvre',
  'Jean Moreau',
  'Claire Bernard',
];

const messageTemplates = {
  customer: [
    'Bonjour, je souhaiterais obtenir une remise sur cette commande importante.',
    'Est-il possible d\'avoir une meilleure offre pour cette quantite ?',
    'Nous sommes interesses par ce devis, pouvez-vous faire un effort commercial ?',
    'Merci pour votre proposition. Voici notre contre-offre.',
    'Nous commandons regulierement, une remise supplementaire serait appreciee.',
  ],
  sales: [
    'Bonjour, merci pour votre demande. Voici notre meilleure offre.',
    'Suite a votre demande, nous pouvons vous proposer une remise de 10%.',
    'Apres etude de votre dossier, voici notre proposition revisee.',
    'Nous sommes heureux de vous accorder cette remise exceptionnelle.',
    'Compte tenu du volume, nous pouvons faire un effort sur le prix.',
  ],
};

/**
 * Genere un numero de devis
 */
function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const sequence = faker.string.numeric(6);
  return `DEV-${year}${month}-${sequence}`;
}

/**
 * Cree un item de devis avec prix negocie
 */
function createQuoteItem(product: MockProduct): MockQuoteItem {
  const baseItem = createCartItem(product);
  const discountPercent = faker.number.float({ min: 0, max: 0.3 });
  const finalPrice = Math.round(baseItem.price * (1 - discountPercent) * 100) / 100;

  return {
    ...baseItem,
    originalPrice: baseItem.price,
    requestedPrice: faker.datatype.boolean({ probability: 0.5 })
      ? Math.round(baseItem.price * 0.8 * 100) / 100
      : undefined,
    finalPrice,
    discount: discountPercent,
    total: Math.round(finalPrice * baseItem.quantity * 100) / 100,
  };
}

/**
 * Cree les messages d'un devis
 */
function createQuoteMessages(
  userId: string,
  status: QuoteStatus,
  createdAt: Date
): MockQuoteMessage[] {
  const messages: MockQuoteMessage[] = [];

  if (status === 'draft') return messages;

  // Message initial du client
  messages.push({
    id: generateId('msg'),
    authorId: userId,
    authorName: 'Client',
    authorRole: 'customer',
    message: randomItem(messageTemplates.customer),
    createdAt: createdAt.toISOString(),
  });

  // Reponses selon le statut
  if (['under_review', 'negotiation', 'approved', 'rejected', 'converted'].includes(status)) {
    messages.push({
      id: generateId('msg'),
      authorId: generateId('user'),
      authorName: randomItem(salesReps),
      authorRole: 'sales',
      message: randomItem(messageTemplates.sales),
      createdAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    });
  }

  if (status === 'negotiation') {
    // Echanges supplementaires
    const extraMessages = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < extraMessages; i++) {
      const isCustomer = i % 2 === 0;
      messages.push({
        id: generateId('msg'),
        authorId: isCustomer ? userId : generateId('user'),
        authorName: isCustomer ? 'Client' : randomItem(salesReps),
        authorRole: isCustomer ? 'customer' : 'sales',
        message: randomItem(messageTemplates[isCustomer ? 'customer' : 'sales']),
        createdAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
      });
    }
  }

  // Trier par date
  messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return messages;
}

/**
 * Cree un devis mock
 */
export function createMockQuote(
  companyId: string,
  userId: string,
  overrides: Partial<MockQuote> = {}
): MockQuote {
  const status = overrides.status || randomItem(quoteStatuses);
  const itemCount = faker.number.int({ min: 2, max: 20 });
  const products = randomItems(mockProducts, itemCount);

  const items = products.map((p) => createQuoteItem(p));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const originalSubtotal = items.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );

  const additionalDiscount = faker.datatype.boolean({ probability: 0.3 })
    ? Math.round(subtotal * 0.05 * 100) / 100
    : 0;

  const shippingCost = subtotal > 500 ? 0 : faker.helpers.arrayElement([9.9, 14.9, 19.9]);
  const taxableAmount = subtotal - additionalDiscount + shippingCost;
  const tax = Math.round(taxableAmount * 0.2 * 100) / 100;
  const total = Math.round((taxableAmount + tax) * 100) / 100;
  const originalTotal = Math.round((originalSubtotal * 1.2 + shippingCost) * 100) / 100;

  const savingsAmount = Math.round((originalTotal - total) * 100) / 100;
  const savingsPercentage = Math.round((savingsAmount / originalTotal) * 100);

  const createdAt = randomDate(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date());
  const validUntil = new Date(createdAt);
  validUntil.setDate(validUntil.getDate() + 30);

  const billingAddress = randomItem(mockAddresses);
  const shippingAddress = randomItem(mockAddresses);

  return {
    id: generateId('quote'),
    quoteNumber: generateQuoteNumber(),
    status,
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: additionalDiscount,
    shippingCost,
    tax,
    total,
    originalTotal,
    savingsAmount,
    savingsPercentage,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    currency: 'EUR',
    billingAddress,
    shippingAddress,
    messages: createQuoteMessages(userId, status, createdAt),
    notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentence() : undefined,
    validUntil: validUntil.toISOString(),
    companyId,
    userId,
    assignedTo: ['under_review', 'negotiation', 'approved'].includes(status)
      ? generateId('user')
      : undefined,
    convertedOrderId: status === 'converted' ? generateId('order') : undefined,
    rejectionReason:
      status === 'rejected'
        ? faker.helpers.arrayElement([
            'Prix non competitif',
            'Delai de livraison trop long',
            'Changement de projet',
            'Budget insuffisant',
          ])
        : undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }).toISOString(),
    ...overrides,
  };
}

/**
 * Cree plusieurs devis mock
 */
export function createMockQuotes(
  companyId: string,
  userId: string,
  count: number = 15
): MockQuote[] {
  return Array.from({ length: count }, () => createMockQuote(companyId, userId));
}

/**
 * Obtient les statistiques des devis
 */
export function getQuoteStats(quotes: MockQuote[]) {
  return {
    total: quotes.length,
    draft: quotes.filter((q) => q.status === 'draft').length,
    pending: quotes.filter((q) =>
      ['submitted', 'under_review', 'negotiation'].includes(q.status)
    ).length,
    approved: quotes.filter((q) => q.status === 'approved').length,
    converted: quotes.filter((q) => q.status === 'converted').length,
    rejected: quotes.filter((q) => q.status === 'rejected').length,
    expired: quotes.filter((q) => q.status === 'expired').length,
    totalValue: quotes.reduce((sum, q) => sum + q.total, 0),
    averageDiscount:
      quotes.reduce((sum, q) => sum + q.savingsPercentage, 0) / quotes.length || 0,
  };
}
