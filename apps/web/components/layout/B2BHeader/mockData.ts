/**
 * Mock Data for B2B Header
 *
 * Temporary mock data for categories, products, and menu items.
 * Will be replaced by API data when backend is ready.
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  items?: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

export interface FeaturedProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  badge?: 'new' | 'promo' | 'bestseller';
  stock: number;
}

export interface NavLink {
  id: string;
  label: string;
  href: string;
  highlight?: boolean;
}

// Main navigation categories with 3-level hierarchy
export const mockCategories: Category[] = [
  {
    id: 'cat_bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    subcategories: [
      {
        id: 'sub_bracelets_or',
        name: 'Bracelets Or',
        slug: 'bracelets-or',
        items: [
          { id: 'item_1', name: 'Or 18 carats', slug: 'or-18-carats', productCount: 45 },
          { id: 'item_2', name: 'Or 14 carats', slug: 'or-14-carats', productCount: 32 },
          { id: 'item_3', name: 'Or blanc', slug: 'or-blanc', productCount: 28 },
          { id: 'item_4', name: 'Or rose', slug: 'or-rose', productCount: 24 },
        ],
      },
      {
        id: 'sub_bracelets_argent',
        name: 'Bracelets Argent',
        slug: 'bracelets-argent',
        items: [
          { id: 'item_5', name: 'Argent 925', slug: 'argent-925', productCount: 67 },
          { id: 'item_6', name: 'Argent rhodie', slug: 'argent-rhodie', productCount: 23 },
          { id: 'item_7', name: 'Argent oxyde', slug: 'argent-oxyde', productCount: 18 },
        ],
      },
      {
        id: 'sub_bracelets_style',
        name: 'Par style',
        slug: 'bracelets-style',
        items: [
          { id: 'item_8', name: 'Maille figaro', slug: 'maille-figaro', productCount: 34 },
          { id: 'item_9', name: 'Maille gourmette', slug: 'maille-gourmette', productCount: 29 },
          { id: 'item_10', name: 'Maille venitienne', slug: 'maille-venitienne', productCount: 21 },
          { id: 'item_11', name: 'Joncs', slug: 'joncs', productCount: 45 },
          { id: 'item_12', name: 'Manchettes', slug: 'manchettes', productCount: 19 },
        ],
      },
    ],
  },
  {
    id: 'cat_colliers',
    name: 'Colliers',
    slug: 'colliers',
    subcategories: [
      {
        id: 'sub_colliers_or',
        name: 'Colliers Or',
        slug: 'colliers-or',
        items: [
          { id: 'item_13', name: 'Chaines or', slug: 'chaines-or', productCount: 56 },
          { id: 'item_14', name: 'Pendentifs or', slug: 'pendentifs-or', productCount: 78 },
          { id: 'item_15', name: 'Sautoirs or', slug: 'sautoirs-or', productCount: 23 },
        ],
      },
      {
        id: 'sub_colliers_argent',
        name: 'Colliers Argent',
        slug: 'colliers-argent',
        items: [
          { id: 'item_16', name: 'Chaines argent', slug: 'chaines-argent', productCount: 89 },
          { id: 'item_17', name: 'Pendentifs argent', slug: 'pendentifs-argent', productCount: 112 },
          { id: 'item_18', name: 'Ras de cou', slug: 'ras-de-cou', productCount: 34 },
        ],
      },
      {
        id: 'sub_colliers_perles',
        name: 'Perles',
        slug: 'colliers-perles',
        items: [
          { id: 'item_19', name: 'Perles eau douce', slug: 'perles-eau-douce', productCount: 45 },
          { id: 'item_20', name: 'Perles de culture', slug: 'perles-culture', productCount: 28 },
          { id: 'item_21', name: 'Perles Tahiti', slug: 'perles-tahiti', productCount: 12 },
        ],
      },
    ],
  },
  {
    id: 'cat_bagues',
    name: 'Bagues',
    slug: 'bagues',
    subcategories: [
      {
        id: 'sub_bagues_alliance',
        name: 'Alliances',
        slug: 'alliances',
        items: [
          { id: 'item_22', name: 'Alliances or jaune', slug: 'alliances-or-jaune', productCount: 67 },
          { id: 'item_23', name: 'Alliances or blanc', slug: 'alliances-or-blanc', productCount: 54 },
          { id: 'item_24', name: 'Alliances bicolores', slug: 'alliances-bicolores', productCount: 23 },
          { id: 'item_25', name: 'Alliances diamants', slug: 'alliances-diamants', productCount: 45 },
        ],
      },
      {
        id: 'sub_bagues_solitaires',
        name: 'Solitaires',
        slug: 'solitaires',
        items: [
          { id: 'item_26', name: 'Solitaires diamant', slug: 'solitaires-diamant', productCount: 89 },
          { id: 'item_27', name: 'Solitaires zirconium', slug: 'solitaires-zirconium', productCount: 56 },
          { id: 'item_28', name: 'Pierres precieuses', slug: 'pierres-precieuses', productCount: 34 },
        ],
      },
      {
        id: 'sub_bagues_mode',
        name: 'Bagues Mode',
        slug: 'bagues-mode',
        items: [
          { id: 'item_29', name: 'Bagues cocktail', slug: 'bagues-cocktail', productCount: 45 },
          { id: 'item_30', name: 'Bagues empilables', slug: 'bagues-empilables', productCount: 67 },
          { id: 'item_31', name: 'Chevaliers', slug: 'chevalieres', productCount: 23 },
        ],
      },
    ],
  },
  {
    id: 'cat_boucles',
    name: "Boucles d'oreilles",
    slug: 'boucles-oreilles',
    subcategories: [
      {
        id: 'sub_boucles_puces',
        name: 'Puces & Clous',
        slug: 'puces-clous',
        items: [
          { id: 'item_32', name: 'Puces diamant', slug: 'puces-diamant', productCount: 78 },
          { id: 'item_33', name: 'Puces perles', slug: 'puces-perles', productCount: 45 },
          { id: 'item_34', name: 'Puces zirconium', slug: 'puces-zirconium', productCount: 89 },
        ],
      },
      {
        id: 'sub_boucles_creoles',
        name: 'Creoles',
        slug: 'creoles',
        items: [
          { id: 'item_35', name: 'Creoles or', slug: 'creoles-or', productCount: 56 },
          { id: 'item_36', name: 'Creoles argent', slug: 'creoles-argent', productCount: 67 },
          { id: 'item_37', name: 'Creoles fantaisie', slug: 'creoles-fantaisie', productCount: 34 },
        ],
      },
      {
        id: 'sub_boucles_pendantes',
        name: 'Pendantes',
        slug: 'pendantes',
        items: [
          { id: 'item_38', name: 'Dormeuses', slug: 'dormeuses', productCount: 45 },
          { id: 'item_39', name: 'Chandelier', slug: 'chandelier', productCount: 23 },
          { id: 'item_40', name: 'Longues', slug: 'longues', productCount: 34 },
        ],
      },
    ],
  },
  {
    id: 'cat_montres',
    name: 'Montres',
    slug: 'montres',
    subcategories: [
      {
        id: 'sub_montres_femme',
        name: 'Montres Femme',
        slug: 'montres-femme',
        items: [
          { id: 'item_41', name: 'Classiques', slug: 'montres-classiques-femme', productCount: 34 },
          { id: 'item_42', name: 'Tendance', slug: 'montres-tendance-femme', productCount: 45 },
          { id: 'item_43', name: 'Luxe', slug: 'montres-luxe-femme', productCount: 18 },
        ],
      },
      {
        id: 'sub_montres_homme',
        name: 'Montres Homme',
        slug: 'montres-homme',
        items: [
          { id: 'item_44', name: 'Classiques', slug: 'montres-classiques-homme', productCount: 28 },
          { id: 'item_45', name: 'Sport', slug: 'montres-sport-homme', productCount: 32 },
          { id: 'item_46', name: 'Chronographes', slug: 'montres-chronographes', productCount: 21 },
        ],
      },
    ],
  },
];

// Featured products for MegaMenu
export const mockFeaturedProducts: FeaturedProduct[] = [
  {
    id: 'feat_1',
    name: 'Bracelet Or 18K Maille Figaro',
    sku: 'BRA-001',
    price: 450,
    imageUrl: '/images/products/bracelet-or-figaro.jpg',
    badge: 'bestseller',
    stock: 25,
  },
  {
    id: 'feat_2',
    name: 'Collier Perles Eau Douce',
    sku: 'COL-002',
    price: 220,
    originalPrice: 280,
    imageUrl: '/images/products/collier-perles.jpg',
    badge: 'promo',
    stock: 30,
  },
  {
    id: 'feat_3',
    name: 'Bague Solitaire Diamant 0.5ct',
    sku: 'BAG-001',
    price: 1200,
    imageUrl: '/images/products/bague-solitaire.jpg',
    badge: 'new',
    stock: 8,
  },
  {
    id: 'feat_4',
    name: 'Creoles Or Rose Petites',
    sku: 'BOU-001',
    price: 280,
    imageUrl: '/images/products/creoles-or-rose.jpg',
    stock: 35,
  },
];

// Navigation links
export const mockNavLinks: NavLink[] = [
  { id: 'nav_marques', label: 'Marques', href: '/marques' },
  { id: 'nav_promos', label: 'Promotions', href: '/promotions', highlight: true },
  { id: 'nav_services', label: 'Services', href: '/services' },
];
