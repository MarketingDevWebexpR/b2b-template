/**
 * Warehouse Factory - Generation d'entrepots et stocks mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem } from './base';
import { mockProducts, type MockProduct } from './product.factory';

export interface MockWarehouse {
  id: string;
  name: string;
  code: string;
  address: {
    address1: string;
    city: string;
    postalCode: string;
    country: string;
    countryCode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  isActive: boolean;
  isPickupPoint: boolean;
  openingHours?: {
    weekdays: string;
    saturday?: string;
    sunday?: string;
  };
  contactPhone?: string;
  contactEmail?: string;
  deliveryZones: string[];
  averageDeliveryDays: number;
}

export interface MockWarehouseStock {
  warehouseId: string;
  productId: string;
  variantId?: string;
  sku: string;
  quantity: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestocked?: string;
}

// Entrepots pre-definis
const warehouseData = [
  {
    name: 'Entrepot Paris Nord',
    code: 'PAR-N',
    city: 'Saint-Denis',
    postalCode: '93200',
    zones: ['75', '77', '78', '91', '92', '93', '94', '95'],
    deliveryDays: 1,
    isPickup: true,
  },
  {
    name: 'Entrepot Lyon',
    code: 'LYO',
    city: 'Venissieux',
    postalCode: '69200',
    zones: ['01', '38', '42', '43', '63', '69', '73', '74'],
    deliveryDays: 2,
    isPickup: true,
  },
  {
    name: 'Entrepot Marseille',
    code: 'MRS',
    city: 'Vitrolles',
    postalCode: '13127',
    zones: ['04', '05', '06', '13', '83', '84'],
    deliveryDays: 2,
    isPickup: true,
  },
  {
    name: 'Entrepot Bordeaux',
    code: 'BDX',
    city: 'Merignac',
    postalCode: '33700',
    zones: ['16', '17', '24', '33', '40', '47', '64'],
    deliveryDays: 2,
    isPickup: false,
  },
  {
    name: 'Entrepot Lille',
    code: 'LIL',
    city: 'Lesquin',
    postalCode: '59810',
    zones: ['02', '59', '60', '62', '80'],
    deliveryDays: 2,
    isPickup: true,
  },
  {
    name: 'Entrepot Nantes',
    code: 'NTS',
    city: 'Saint-Herblain',
    postalCode: '44800',
    zones: ['22', '29', '35', '44', '49', '53', '56', '72', '85'],
    deliveryDays: 2,
    isPickup: false,
  },
];

/**
 * Cree un entrepot mock
 */
export function createMockWarehouse(data: typeof warehouseData[0]): MockWarehouse {
  return {
    id: generateId('wh'),
    name: data.name,
    code: data.code,
    address: {
      address1: faker.location.streetAddress(),
      city: data.city,
      postalCode: data.postalCode,
      country: 'France',
      countryCode: 'FR',
    },
    coordinates: {
      latitude: faker.location.latitude({ min: 43, max: 51 }),
      longitude: faker.location.longitude({ min: -5, max: 8 }),
    },
    isActive: true,
    isPickupPoint: data.isPickup,
    openingHours: data.isPickup
      ? {
          weekdays: '8h00 - 18h00',
          saturday: '9h00 - 12h00',
        }
      : undefined,
    contactPhone: faker.phone.number(),
    contactEmail: faker.internet.email({ provider: 'webexpr.com' }),
    deliveryZones: data.zones,
    averageDeliveryDays: data.deliveryDays,
  };
}

/**
 * Cree les stocks d'un entrepot pour un produit
 */
export function createWarehouseStock(
  warehouseId: string,
  product: MockProduct
): MockWarehouseStock[] {
  const stocks: MockWarehouseStock[] = [];

  // Stock pour chaque variante
  for (const variant of product.variants) {
    const quantity = faker.number.int({ min: 0, max: 200 });
    const reserved = Math.min(faker.number.int({ min: 0, max: 20 }), quantity);

    stocks.push({
      warehouseId,
      productId: product.id,
      variantId: variant.id,
      sku: variant.sku,
      quantity,
      reserved,
      available: quantity - reserved,
      reorderPoint: faker.number.int({ min: 5, max: 20 }),
      reorderQuantity: faker.number.int({ min: 50, max: 200 }),
      lastRestocked: faker.datatype.boolean()
        ? faker.date.recent({ days: 30 }).toISOString()
        : undefined,
    });
  }

  return stocks;
}

/**
 * Obtient le stock disponible pour un produit dans tous les entrepots
 */
export function getProductAvailability(
  productId: string,
  stocks: MockWarehouseStock[],
  warehouses: MockWarehouse[]
): Array<{
  warehouse: MockWarehouse;
  available: number;
  deliveryDays: number;
}> {
  const productStocks = stocks.filter((s) => s.productId === productId);
  const warehouseMap = new Map(warehouses.map((w) => [w.id, w]));

  const availability: Array<{
    warehouse: MockWarehouse;
    available: number;
    deliveryDays: number;
  }> = [];

  const byWarehouse = new Map<string, number>();
  for (const stock of productStocks) {
    const current = byWarehouse.get(stock.warehouseId) || 0;
    byWarehouse.set(stock.warehouseId, current + stock.available);
  }

  for (const [warehouseId, available] of byWarehouse) {
    const warehouse = warehouseMap.get(warehouseId);
    if (warehouse && available > 0) {
      availability.push({
        warehouse,
        available,
        deliveryDays: warehouse.averageDeliveryDays,
      });
    }
  }

  // Trier par delai de livraison
  availability.sort((a, b) => a.deliveryDays - b.deliveryDays);

  return availability;
}

/**
 * Trouve l'entrepot le plus proche pour un code postal
 */
export function findNearestWarehouse(
  postalCode: string,
  warehouses: MockWarehouse[]
): MockWarehouse | null {
  const dept = postalCode.substring(0, 2);

  // Chercher un entrepot qui couvre cette zone
  const covering = warehouses.find(
    (w) => w.isActive && w.deliveryZones.includes(dept)
  );

  if (covering) return covering;

  // Sinon retourner le premier entrepot actif (Paris par defaut)
  return warehouses.find((w) => w.isActive) || null;
}

// Pre-generate warehouses
export const mockWarehouses = warehouseData.map(createMockWarehouse);

// Pre-generate stocks for all products in all warehouses
export const mockWarehouseStocks: MockWarehouseStock[] = [];
for (const warehouse of mockWarehouses) {
  for (const product of mockProducts.slice(0, 50)) {
    // Limit pour performance
    mockWarehouseStocks.push(...createWarehouseStock(warehouse.id, product));
  }
}

// Points de retrait
export const mockPickupPoints = mockWarehouses.filter((w) => w.isPickupPoint);
