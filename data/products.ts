import { Product } from '@/types';
import { categories } from './categories';

export const products: Product[] = [
  // BAGUES (categoryId: '1')
  {
    id: '1',
    name: 'Solitaire Eternite',
    slug: 'solitaire-eternite',
    description: 'Un solitaire intemporel serti d\'un diamant taille brillant de 1.5 carat. La monture en or blanc 18 carats met en valeur l\'eclat exceptionnel de la pierre. Symbole d\'amour eternel, cette bague incarne l\'elegance a l\'etat pur.',
    shortDescription: 'Solitaire diamant 1.5 carat, or blanc 18K',
    price: 8500,
    compareAtPrice: 9500,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
      'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=800&q=80',
    ],
    categoryId: '1',
    materials: ['Or blanc 18K', 'Diamant'],
    stock: 5,
    featured: true,
    isNew: false,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Alliance Royale',
    slug: 'alliance-royale',
    description: 'Alliance pavee de diamants, symbole d\'un engagement precieux. Chaque diamant est minutieusement sertis pour creer un cercle de lumiere continu.',
    shortDescription: 'Alliance pavee diamants, or jaune 18K',
    price: 3200,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=800&q=80',
    ],
    categoryId: '1',
    materials: ['Or jaune 18K', 'Diamants'],
    stock: 8,
    featured: true,
    isNew: true,
    createdAt: '2024-03-01',
  },
  {
    id: '3',
    name: 'Bague Saphir Royal',
    slug: 'bague-saphir-royal',
    description: 'Majestueuse bague ornee d\'un saphir bleu de Ceylan de 3 carats, entoure d\'un halo de diamants. Une piece digne d\'une reine.',
    shortDescription: 'Saphir de Ceylan 3ct, entourage diamants',
    price: 12500,
    compareAtPrice: 14000,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80',
    ],
    categoryId: '1',
    materials: ['Or blanc 18K', 'Saphir', 'Diamants'],
    stock: 2,
    featured: true,
    isNew: false,
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Chevaliere Heritage',
    slug: 'chevaliere-heritage',
    description: 'Chevaliere masculine en or jaune massif, gravure personnalisable. Un bijou de caractere qui traverse les generations.',
    shortDescription: 'Chevaliere or jaune 18K, gravure sur mesure',
    price: 2800,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    ],
    categoryId: '1',
    materials: ['Or jaune 18K'],
    stock: 6,
    featured: false,
    isNew: false,
    createdAt: '2024-01-20',
  },
  // COLLIERS (categoryId: '2')
  {
    id: '5',
    name: 'Collier Riviere de Diamants',
    slug: 'collier-riviere-diamants',
    description: 'Un collier d\'exception compose de 45 diamants taille brillant totalisant 8 carats. La quintessence du luxe et de l\'elegance.',
    shortDescription: 'Riviere 8 carats, 45 diamants, or blanc',
    price: 28000,
    compareAtPrice: 32000,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    ],
    categoryId: '2',
    materials: ['Or blanc 18K', 'Diamants'],
    stock: 1,
    featured: true,
    isNew: false,
    createdAt: '2024-01-05',
  },
  {
    id: '6',
    name: 'Pendentif Goutte d\'Or',
    slug: 'pendentif-goutte-or',
    description: 'Pendentif en forme de goutte en or rose, sertie d\'un diamant poire de 0.5 carat. Fluide et feminin.',
    shortDescription: 'Pendentif or rose, diamant poire 0.5ct',
    price: 4200,
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
      'https://images.unsplash.com/photo-1599459183200-59c3f8bcb0d2?w=800&q=80',
    ],
    categoryId: '2',
    materials: ['Or rose 18K', 'Diamant'],
    stock: 4,
    featured: true,
    isNew: true,
    createdAt: '2024-03-05',
  },
  {
    id: '7',
    name: 'Sautoir Perles Akoya',
    slug: 'sautoir-perles-akoya',
    description: 'Sautoir compose de 80 perles Akoya du Japon, fermoir en or blanc sertis de diamants. L\'elegance intemporelle.',
    shortDescription: '80 perles Akoya, fermoir diamants',
    price: 6800,
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80',
    ],
    categoryId: '2',
    materials: ['Perles Akoya', 'Or blanc 18K', 'Diamants'],
    stock: 3,
    featured: false,
    isNew: false,
    createdAt: '2024-02-15',
  },
  {
    id: '8',
    name: 'Collier Emeraude Imperiale',
    slug: 'collier-emeraude-imperiale',
    description: 'Collier orne d\'une emeraude de Colombie de 4 carats, entouree de diamants. Un chef-d\'oeuvre de haute joaillerie.',
    shortDescription: 'Emeraude Colombie 4ct, entourage diamants',
    price: 35000,
    images: [
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
    ],
    categoryId: '2',
    materials: ['Or blanc 18K', 'Emeraude', 'Diamants'],
    stock: 1,
    featured: true,
    isNew: false,
    createdAt: '2024-01-25',
  },
  // BRACELETS (categoryId: '3')
  {
    id: '9',
    name: 'Bracelet Tennis Diamants',
    slug: 'bracelet-tennis-diamants',
    description: 'Bracelet tennis classique serti de 60 diamants totalisant 5 carats. L\'essence meme de l\'elegance decontractee.',
    shortDescription: 'Tennis 5 carats, 60 diamants, or blanc',
    price: 15000,
    compareAtPrice: 17500,
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    ],
    categoryId: '3',
    materials: ['Or blanc 18K', 'Diamants'],
    stock: 3,
    featured: true,
    isNew: false,
    createdAt: '2024-02-01',
  },
  {
    id: '10',
    name: 'Jonc Torsade Or Rose',
    slug: 'jonc-torsade-or-rose',
    description: 'Jonc torsade en or rose 18 carats, termine par deux tetes de diamants. Moderne et audacieux.',
    shortDescription: 'Jonc torsade or rose, extremites diamantees',
    price: 3800,
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80',
    ],
    categoryId: '3',
    materials: ['Or rose 18K', 'Diamants'],
    stock: 5,
    featured: false,
    isNew: true,
    createdAt: '2024-03-10',
  },
  {
    id: '11',
    name: 'Manchette Art Deco',
    slug: 'manchette-art-deco',
    description: 'Manchette large d\'inspiration Art Deco, ornee de motifs geometriques en onyx et diamants. Spectaculaire.',
    shortDescription: 'Manchette Art Deco, onyx et diamants',
    price: 9500,
    images: [
      'https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=800&q=80',
    ],
    categoryId: '3',
    materials: ['Or blanc 18K', 'Onyx', 'Diamants'],
    stock: 2,
    featured: true,
    isNew: false,
    createdAt: '2024-01-30',
  },
  // BOUCLES D'OREILLES (categoryId: '4')
  {
    id: '12',
    name: 'Creoles Diamantees',
    slug: 'creoles-diamantees',
    description: 'Creoles en or jaune entierement pavees de diamants. 3 carats de lumiere qui encadrent le visage avec eclat.',
    shortDescription: 'Creoles or jaune, pavage diamants 3ct',
    price: 7200,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1588444650733-d0090c4b90e9?w=800&q=80',
    ],
    categoryId: '4',
    materials: ['Or jaune 18K', 'Diamants'],
    stock: 4,
    featured: true,
    isNew: false,
    createdAt: '2024-02-05',
  },
  {
    id: '13',
    name: 'Pendantes Perles Tahiti',
    slug: 'pendantes-perles-tahiti',
    description: 'Boucles pendantes ornees de perles de Tahiti aux reflets verts, suspendues a un fil de diamants.',
    shortDescription: 'Perles Tahiti, chute de diamants',
    price: 5400,
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
    ],
    categoryId: '4',
    materials: ['Or blanc 18K', 'Perles de Tahiti', 'Diamants'],
    stock: 3,
    featured: true,
    isNew: true,
    createdAt: '2024-03-08',
  },
  {
    id: '14',
    name: 'Puces Diamants Classiques',
    slug: 'puces-diamants-classiques',
    description: 'Puces serties de deux diamants de 0.5 carat chacun. L\'elegance discrete au quotidien.',
    shortDescription: 'Puces diamants 1ct total, or blanc',
    price: 4800,
    images: [
      'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80',
    ],
    categoryId: '4',
    materials: ['Or blanc 18K', 'Diamants'],
    stock: 7,
    featured: false,
    isNew: false,
    createdAt: '2024-01-12',
  },
  {
    id: '15',
    name: 'Chandeliers Rubis',
    slug: 'chandeliers-rubis',
    description: 'Boucles chandeliers ornees de rubis birmans et diamants. Un bijou de soiree absolument somptueux.',
    shortDescription: 'Chandeliers rubis Birmanie et diamants',
    price: 18000,
    images: [
      'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=800&q=80',
    ],
    categoryId: '4',
    materials: ['Or blanc 18K', 'Rubis', 'Diamants'],
    stock: 1,
    featured: true,
    isNew: false,
    createdAt: '2024-02-20',
  },
  // MONTRES (categoryId: '5')
  {
    id: '16',
    name: 'Montre Diamant Eternel',
    slug: 'montre-diamant-eternel',
    description: 'Montre de haute joaillerie, boitier serti de 120 diamants, mouvement suisse automatique. L\'excellence horlogere.',
    shortDescription: 'Boitier diamants, mouvement automatique suisse',
    price: 42000,
    compareAtPrice: 48000,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
    ],
    categoryId: '5',
    materials: ['Or blanc 18K', 'Diamants', 'Mouvement suisse'],
    stock: 2,
    featured: true,
    isNew: false,
    createdAt: '2024-01-08',
  },
  {
    id: '17',
    name: 'Montre Or Rose Elegance',
    slug: 'montre-or-rose-elegance',
    description: 'Montre feminine en or rose, cadran nacre, bracelet en satin. Mouvement quartz de precision suisse.',
    shortDescription: 'Or rose, cadran nacre, bracelet satin',
    price: 8900,
    images: [
      'https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800&q=80',
    ],
    categoryId: '5',
    materials: ['Or rose 18K', 'Nacre', 'Satin'],
    stock: 4,
    featured: false,
    isNew: true,
    createdAt: '2024-03-12',
  },
  {
    id: '18',
    name: 'Chronographe Prestige',
    slug: 'chronographe-prestige',
    description: 'Chronographe sportif-chic en or jaune, cadran noir, bracelet cuir d\'alligator. Complication flyback.',
    shortDescription: 'Chronographe or jaune, bracelet alligator',
    price: 24000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    categoryId: '5',
    materials: ['Or jaune 18K', 'Cuir d\'alligator'],
    stock: 2,
    featured: true,
    isNew: false,
    createdAt: '2024-02-25',
  },
  // Produits additionnels
  {
    id: '19',
    name: 'Bague Fleur de Diamants',
    slug: 'bague-fleur-diamants',
    description: 'Bague cocktail en forme de fleur, petales en diamants, coeur en saphir jaune. Une piece exceptionnelle.',
    shortDescription: 'Bague fleur, diamants et saphir jaune',
    price: 11500,
    images: [
      'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&q=80',
    ],
    categoryId: '1',
    materials: ['Or blanc 18K', 'Diamants', 'Saphir jaune'],
    stock: 1,
    featured: false,
    isNew: true,
    createdAt: '2024-03-15',
  },
  {
    id: '20',
    name: 'Collier Y Diamants',
    slug: 'collier-y-diamants',
    description: 'Collier en Y orne de diamants, terminaison pendante avec diamant poire de 1 carat. Modernite et seduction.',
    shortDescription: 'Collier Y, diamant poire 1ct en pendentif',
    price: 9800,
    images: [
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&q=80',
    ],
    categoryId: '2',
    materials: ['Or blanc 18K', 'Diamants'],
    stock: 2,
    featured: false,
    isNew: false,
    createdAt: '2024-02-08',
  },
  {
    id: '21',
    name: 'Bracelet Chaine Or',
    slug: 'bracelet-chaine-or',
    description: 'Bracelet chaine gourmet en or jaune massif 18 carats. Un classique indispensable, intemporel.',
    shortDescription: 'Chaine gourmet or jaune 18K massif',
    price: 2400,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    ],
    categoryId: '3',
    materials: ['Or jaune 18K'],
    stock: 10,
    featured: false,
    isNew: false,
    createdAt: '2024-01-18',
  },
  {
    id: '22',
    name: 'Dormeuses Diamants',
    slug: 'dormeuses-diamants',
    description: 'Dormeuses en or blanc serties de diamants, fermeture securisee. Elegance discrete pour tous les jours.',
    shortDescription: 'Dormeuses or blanc, diamants 0.8ct',
    price: 3600,
    images: [
      'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=800&q=80',
    ],
    categoryId: '4',
    materials: ['Or blanc 18K', 'Diamants'],
    stock: 6,
    featured: false,
    isNew: false,
    createdAt: '2024-02-12',
  },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  const product = products.find((p) => p.id === id);
  if (product) {
    product.category = categories.find((c) => c.id === product.categoryId);
  }
  return product;
}

export function getProductBySlug(slug: string): Product | undefined {
  const product = products.find((p) => p.slug === slug);
  if (product) {
    product.category = categories.find((c) => c.id === product.categoryId);
  }
  return product;
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getProductsByCategorySlug(slug: string): Product[] {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return [];
  return products.filter((p) => p.categoryId === category.id);
}

export function getFeaturedProducts(limit?: number): Product[] {
  const featured = products.filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

export function getNewProducts(limit?: number): Product[] {
  const newProducts = products.filter((p) => p.isNew);
  return limit ? newProducts.slice(0, limit) : newProducts;
}

export function getRelatedProducts(productId: string, limit: number = 4): Product[] {
  const product = products.find((p) => p.id === productId);
  if (!product) return [];

  return products
    .filter((p) => p.categoryId === product.categoryId && p.id !== productId)
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.materials.some((m) => m.toLowerCase().includes(lowercaseQuery))
  );
}

export function filterProducts(filters: {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
}): Product[] {
  let result = [...products];

  if (filters.categoryId) {
    result = result.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.minPrice !== undefined) {
    result = result.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.materials && filters.materials.length > 0) {
    result = result.filter((p) =>
      filters.materials!.some((m) =>
        p.materials.some((pm) => pm.toLowerCase().includes(m.toLowerCase()))
      )
    );
  }

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
  }

  return result;
}
