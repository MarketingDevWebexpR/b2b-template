/**
 * Product Factory - Generation de produits mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomPrice, randomItem, slugify } from './base';
import { mockChildCategories } from './category.factory';

// Types
export interface MockProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  options: Record<string, string>;
  image?: string;
  isDefault: boolean;
}

export interface MockProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  categoryId: string;
  categorySlug: string;
  images: string[];
  thumbnail: string;
  variants: MockProductVariant[];
  options: Array<{
    name: string;
    values: string[];
  }>;
  stockQuantity: number;
  minOrderQuantity: number;
  stepQuantity: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  material: string;
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  isOnSale: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

// Donnees de reference pour les bijoux
const materials = [
  'Or 18 carats',
  'Or 14 carats',
  'Or rose',
  'Or blanc',
  'Argent 925',
  'Platine',
  'Vermeil',
  'Acier inoxydable',
  'Titane',
  'Plaque or',
];

const gemstones = [
  'Diamant',
  'Saphir',
  'Rubis',
  'Emeraude',
  'Amethyste',
  'Topaze',
  'Grenat',
  'Perle',
  'Turquoise',
  'Opale',
  'Zircone',
  'Cristal Swarovski',
];

const sizes = {
  ring: ['48', '50', '52', '54', '56', '58', '60', '62', '64'],
  bracelet: ['16cm', '17cm', '18cm', '19cm', '20cm', '21cm'],
  necklace: ['40cm', '45cm', '50cm', '55cm', '60cm', '70cm', '80cm'],
  earring: ['Petite', 'Moyenne', 'Grande'],
  watch: ['Petit', 'Moyen', 'Grand'],
};

const colors = ['Or', 'Argent', 'Rose', 'Noir', 'Blanc', 'Bleu', 'Vert', 'Rouge'];

const productNames = {
  ring: ['Alliance', 'Solitaire', 'Bague', 'Chevaliere', 'Bague Cocktail', 'Bague Eternite'],
  necklace: ['Collier', 'Sautoir', 'Pendentif', 'Chaine', 'Ras de cou'],
  bracelet: ['Bracelet', 'Jonc', 'Manchette', 'Bracelet Tennis', 'Bracelet Chaine'],
  earring: ['Boucles', 'Puces', 'Dormeuses', 'Creoles', 'Pendantes'],
  watch: ['Montre', 'Montre Automatique', 'Montre Quartz', 'Montre Vintage'],
};

const adjectives = [
  'Elegante',
  'Classique',
  'Moderne',
  'Vintage',
  'Luxe',
  'Delicate',
  'Bold',
  'Intemporelle',
  'Raffinee',
  'Precieuse',
  'Royale',
  'Divine',
  'Celeste',
  'Aurora',
  'Luna',
  'Stella',
  'Aria',
  'Mia',
  'Zoe',
  'Ava',
];

const tags = [
  'nouveaute',
  'best-seller',
  'exclusif',
  'edition-limitee',
  'mariage',
  'fiancailles',
  'cadeau',
  'luxe',
  'argent',
  'or',
  'diamant',
  'perle',
  'personnalisable',
  'eco-responsable',
];

// Images Unsplash pour les bijoux
const jewelryImages = [
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=800&h=800&fit=crop',
];

/**
 * Determine le type de produit en fonction de la categorie
 */
function getProductType(categorySlug: string): keyof typeof productNames {
  if (categorySlug.includes('bague') || categorySlug.includes('alliance')) return 'ring';
  if (categorySlug.includes('collier') || categorySlug.includes('pendentif') || categorySlug.includes('chaine')) return 'necklace';
  if (categorySlug.includes('bracelet') || categorySlug.includes('jonc') || categorySlug.includes('manchette')) return 'bracelet';
  if (categorySlug.includes('boucle') || categorySlug.includes('puce') || categorySlug.includes('creole')) return 'earring';
  if (categorySlug.includes('montre')) return 'watch';
  return faker.helpers.arrayElement(['ring', 'necklace', 'bracelet', 'earring'] as const);
}

/**
 * Genere un nom de produit unique
 */
function generateProductName(type: keyof typeof productNames): string {
  const baseName = randomItem(productNames[type]);
  const adjective = randomItem(adjectives);
  const gemstone = faker.datatype.boolean() ? randomItem(gemstones) : null;

  if (gemstone) {
    return `${baseName} ${adjective} ${gemstone}`;
  }
  return `${baseName} ${adjective}`;
}

/**
 * Cree les variantes d'un produit
 */
function createVariants(
  productId: string,
  basePrice: number,
  type: keyof typeof productNames
): { variants: MockProductVariant[]; options: MockProduct['options'] } {
  const sizeOptions = sizes[type] || sizes.ring;
  const colorOptions = faker.helpers.arrayElements(colors, faker.number.int({ min: 2, max: 4 }));

  const options: MockProduct['options'] = [
    { name: 'Taille', values: sizeOptions },
    { name: 'Couleur', values: colorOptions },
  ];

  const variants: MockProductVariant[] = [];
  let isFirst = true;

  for (const size of faker.helpers.arrayElements(sizeOptions, faker.number.int({ min: 3, max: sizeOptions.length }))) {
    for (const color of colorOptions) {
      const priceVariation = faker.number.float({ min: 0.9, max: 1.2 });
      const variantPrice = Math.round(basePrice * priceVariation * 100) / 100;

      variants.push({
        id: generateId('var'),
        sku: `${productId.split('_')[1]}-${size}-${color.substring(0, 2).toUpperCase()}`,
        name: `${size} / ${color}`,
        price: variantPrice,
        compareAtPrice: faker.datatype.boolean({ probability: 0.3 })
          ? Math.round(variantPrice * 1.2 * 100) / 100
          : undefined,
        stockQuantity: faker.number.int({ min: 0, max: 100 }),
        options: { Taille: size, Couleur: color },
        isDefault: isFirst,
      });
      isFirst = false;
    }
  }

  return { variants, options };
}

/**
 * Cree un produit mock complet
 */
export function createMockProduct(overrides: Partial<MockProduct> = {}): MockProduct {
  const category = randomItem(mockChildCategories);
  const type = getProductType(category.slug);
  const name = generateProductName(type);
  const id = generateId('prod');
  const basePrice = randomPrice(50, 5000);
  const { variants, options } = createVariants(id, basePrice, type);

  const images = faker.helpers.arrayElements(jewelryImages, faker.number.int({ min: 3, max: 6 }));

  const now = new Date();
  const createdAt = faker.date.between({ from: new Date(now.getFullYear() - 2, 0, 1), to: now });

  return {
    id,
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    name,
    slug: slugify(name) + '-' + id.split('_')[1],
    description: faker.commerce.productDescription() + ' ' + faker.lorem.paragraphs(2),
    shortDescription: faker.commerce.productDescription(),
    price: basePrice,
    compareAtPrice: faker.datatype.boolean({ probability: 0.3 })
      ? Math.round(basePrice * 1.25 * 100) / 100
      : undefined,
    currency: 'EUR',
    categoryId: category.id,
    categorySlug: category.slug,
    images,
    thumbnail: images[0],
    variants,
    options,
    stockQuantity: variants.reduce((sum, v) => sum + v.stockQuantity, 0),
    minOrderQuantity: faker.helpers.arrayElement([1, 2, 5, 10]),
    stepQuantity: faker.helpers.arrayElement([1, 1, 1, 2, 5]),
    weight: faker.number.float({ min: 1, max: 50 }),
    dimensions: {
      length: faker.number.float({ min: 1, max: 10 }),
      width: faker.number.float({ min: 1, max: 10 }),
      height: faker.number.float({ min: 0.5, max: 5 }),
    },
    material: randomItem(materials),
    tags: faker.helpers.arrayElements(tags, faker.number.int({ min: 2, max: 5 })),
    isNew: faker.datatype.boolean({ probability: 0.2 }),
    isBestSeller: faker.datatype.boolean({ probability: 0.15 }),
    isOnSale: faker.datatype.boolean({ probability: 0.25 }),
    rating: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
    reviewCount: faker.number.int({ min: 0, max: 250 }),
    createdAt: createdAt.toISOString(),
    updatedAt: faker.date.between({ from: createdAt, to: now }).toISOString(),
    ...overrides,
  };
}

/**
 * Cree plusieurs produits mock
 */
export function createMockProducts(count: number = 200): MockProduct[] {
  return Array.from({ length: count }, () => createMockProduct());
}

/**
 * Recherche des produits par criteres
 */
export function searchProducts(
  products: MockProduct[],
  query?: string,
  categoryId?: string,
  priceRange?: { min?: number; max?: number },
  inStock?: boolean
): MockProduct[] {
  let results = [...products];

  if (query) {
    const lowerQuery = query.toLowerCase();
    results = results.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.tags.some(t => t.includes(lowerQuery))
    );
  }

  if (categoryId) {
    results = results.filter(p => p.categoryId === categoryId);
  }

  if (priceRange) {
    if (priceRange.min !== undefined) {
      results = results.filter(p => p.price >= priceRange.min!);
    }
    if (priceRange.max !== undefined) {
      results = results.filter(p => p.price <= priceRange.max!);
    }
  }

  if (inStock) {
    results = results.filter(p => p.stockQuantity > 0);
  }

  return results;
}

// Pre-generate 220 products for consistency
export const mockProducts = createMockProducts(220);

// Filtered collections
export const newProducts = mockProducts.filter(p => p.isNew);
export const bestSellers = mockProducts.filter(p => p.isBestSeller);
export const onSaleProducts = mockProducts.filter(p => p.isOnSale);
