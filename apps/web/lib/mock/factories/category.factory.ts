/**
 * Category Factory - Generation de categories mock
 *
 * @packageDocumentation
 */

import { faker, generateId, slugify } from './base';

export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  children?: MockCategory[];
}

// Structure hierarchique des categories bijoux B2B
const categoryTree = [
  {
    name: 'Bagues',
    children: [
      'Bagues de fiancailles',
      'Alliances',
      'Bagues cocktail',
      'Bagues ajustables',
      'Bagues homme',
      'Chevalières',
    ],
  },
  {
    name: 'Colliers',
    children: [
      'Colliers ras de cou',
      'Sautoirs',
      'Chaines',
      'Pendentifs',
      'Colliers perles',
      'Colliers multi-rangs',
    ],
  },
  {
    name: 'Boucles d\'oreilles',
    children: [
      'Puces',
      'Dormeuses',
      'Creoles',
      'Pendantes',
      'Ear cuffs',
      'Clips',
    ],
  },
  {
    name: 'Bracelets',
    children: [
      'Bracelets chaine',
      'Joncs',
      'Manchettes',
      'Bracelets tennis',
      'Bracelets charme',
      'Bracelets homme',
    ],
  },
  {
    name: 'Montres',
    children: [
      'Montres femme',
      'Montres homme',
      'Montres unisexe',
      'Montres vintage',
      'Montres connectees',
    ],
  },
  {
    name: 'Bijoux homme',
    children: [
      'Boutons de manchette',
      'Pinces a cravate',
      'Chaines homme',
      'Bracelets cuir',
    ],
  },
  {
    name: 'Accessoires',
    children: [
      'Boites a bijoux',
      'Pochettes',
      'Presentoirs',
      'Outils entretien',
    ],
  },
  {
    name: 'Collections',
    children: [
      'Nouveautes',
      'Best-sellers',
      'Edition limitee',
      'Promotions',
    ],
  },
];

/**
 * Cree une categorie mock
 */
export function createMockCategory(
  name: string,
  parentId?: string,
  order: number = 0,
  overrides: Partial<MockCategory> = {}
): MockCategory {
  return {
    id: generateId('cat'),
    name,
    slug: slugify(name),
    description: faker.commerce.productDescription(),
    image: `https://images.unsplash.com/photo-${faker.string.numeric(10)}?w=400&h=400&fit=crop`,
    parentId,
    order,
    isActive: true,
    productCount: faker.number.int({ min: 10, max: 150 }),
    ...overrides,
  };
}

/**
 * Cree l'arbre complet des categories
 */
export function createCategoryTree(): MockCategory[] {
  const categories: MockCategory[] = [];

  categoryTree.forEach((parent, parentIndex) => {
    const parentCategory = createMockCategory(parent.name, undefined, parentIndex);
    parentCategory.children = [];

    parent.children.forEach((childName, childIndex) => {
      const childCategory = createMockCategory(childName, parentCategory.id, childIndex);
      parentCategory.children!.push(childCategory);
      categories.push(childCategory);
    });

    categories.push(parentCategory);
  });

  return categories;
}

/**
 * Obtient toutes les categories a plat
 */
export function getFlatCategories(categories: MockCategory[]): MockCategory[] {
  const flat: MockCategory[] = [];

  function flatten(cats: MockCategory[]) {
    for (const cat of cats) {
      flat.push(cat);
      if (cat.children) {
        flatten(cat.children);
      }
    }
  }

  flatten(categories);
  return flat;
}

// Pre-generated categories
export const mockCategoryTree = createCategoryTree();
export const mockCategories = getFlatCategories(mockCategoryTree);

// Get only parent categories
export const mockParentCategories = mockCategoryTree.filter(cat => !cat.parentId);

// Get only child categories
export const mockChildCategories = mockCategories.filter(cat => cat.parentId);
