import { Product } from '@/types';
import { categories } from './categories';

export const products: Product[] = [
  // BAGUES (categoryId: '1')
  {
    id: '1',
    reference: 'SOL-ETN-001',
    name: 'Solitaire Eternite',
    slug: 'solitaire-eternite',
    description: 'Un solitaire intemporel serti d\'un diamant taille brillant de 1.5 carat. La monture en or blanc 18 carats met en valeur l\'eclat exceptionnel de la pierre. Symbole d\'amour eternel, cette bague incarne l\'elegance a l\'etat pur.',
    shortDescription: 'Solitaire diamant 1.5 carat, or blanc 18K',
    price: 8500,
    compareAtPrice: 9500,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&q=80',
      'https://images.unsplash.com/photo-1586104195538-050b9f74f58e?w=800&q=80',
    ],
    categoryId: '1',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamant'],
    weight: 4.5,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 5,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    reference: 'ALL-ROY-001',
    name: 'Alliance Royale',
    slug: 'alliance-royale',
    description: 'Alliance pavee de diamants, symbole d\'un engagement precieux. Chaque diamant est minutieusement sertis pour creer un cercle de lumiere continu.',
    shortDescription: 'Alliance pavee diamants, or jaune 18K',
    price: 3200,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&q=80',
      'https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=800&q=80',
    ],
    categoryId: '1',
    collection: 'Printemps/été',
    style: 'Classique',
    materials: ['Or jaune 18K', 'Diamants'],
    weight: 3.2,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 8,
    isAvailable: true,
    featured: true,
    isNew: true,
    createdAt: '2024-03-01',
  },
  {
    id: '3',
    reference: 'BAG-SAP-001',
    name: 'Bague Saphir Royal',
    slug: 'bague-saphir-royal',
    description: 'Majestueuse bague ornee d\'un saphir bleu de Ceylan de 3 carats, entoure d\'un halo de diamants. Une piece digne d\'une reine.',
    shortDescription: 'Saphir de Ceylan 3ct, entourage diamants',
    price: 12500,
    compareAtPrice: 14000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=80',
    ],
    categoryId: '1',
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Saphir', 'Diamants'],
    weight: 6.8,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 2,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    reference: 'CHE-HER-001',
    name: 'Chevaliere Heritage',
    slug: 'chevaliere-heritage',
    description: 'Chevaliere masculine en or jaune massif, gravure personnalisable. Un bijou de caractere qui traverse les generations.',
    shortDescription: 'Chevaliere or jaune 18K, gravure sur mesure',
    price: 2800,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    ],
    categoryId: '1',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or jaune 18K'],
    weight: 12.5,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 36,
    stock: 6,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-01-20',
  },
  // COLLIERS (categoryId: '2')
  {
    id: '5',
    reference: 'COL-RIV-001',
    name: 'Collier Riviere de Diamants',
    slug: 'collier-riviere-diamants',
    description: 'Un collier d\'exception compose de 45 diamants taille brillant totalisant 8 carats. La quintessence du luxe et de l\'elegance.',
    shortDescription: 'Riviere 8 carats, 45 diamants, or blanc',
    price: 28000,
    compareAtPrice: 32000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
    ],
    categoryId: '2',
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamants'],
    weight: 28.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 1,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-05',
  },
  {
    id: '6',
    reference: 'PEN-GOU-001',
    name: 'Pendentif Goutte d\'Or',
    slug: 'pendentif-goutte-or',
    description: 'Pendentif en forme de goutte en or rose, sertie d\'un diamant poire de 0.5 carat. Fluide et feminin.',
    shortDescription: 'Pendentif or rose, diamant poire 0.5ct',
    price: 4200,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80',
      'https://images.unsplash.com/photo-1599459183200-59c3f8bcb0d2?w=800&q=80',
    ],
    categoryId: '2',
    collection: 'Printemps/été',
    style: 'Fantaisie',
    materials: ['Or rose 18K', 'Diamant'],
    weight: 3.5,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 4,
    isAvailable: true,
    featured: true,
    isNew: true,
    createdAt: '2024-03-05',
  },
  {
    id: '7',
    reference: 'SAU-PER-001',
    name: 'Sautoir Perles Akoya',
    slug: 'sautoir-perles-akoya',
    description: 'Sautoir compose de 80 perles Akoya du Japon, fermoir en or blanc sertis de diamants. L\'elegance intemporelle.',
    shortDescription: '80 perles Akoya, fermoir diamants',
    price: 6800,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&q=80',
    ],
    categoryId: '2',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Perles Akoya', 'Or blanc 18K', 'Diamants'],
    weight: 45.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'Japon',
    warranty: 24,
    stock: 3,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-02-15',
  },
  {
    id: '8',
    reference: 'COL-EME-001',
    name: 'Collier Emeraude Imperiale',
    slug: 'collier-emeraude-imperiale',
    description: 'Collier orne d\'une emeraude de Colombie de 4 carats, entouree de diamants. Un chef-d\'oeuvre de haute joaillerie.',
    shortDescription: 'Emeraude Colombie 4ct, entourage diamants',
    price: 35000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
    ],
    categoryId: '2',
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Emeraude', 'Diamants'],
    weight: 18.5,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 1,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-25',
  },
  // BRACELETS (categoryId: '3')
  {
    id: '9',
    reference: 'BRA-TEN-001',
    name: 'Bracelet Tennis Diamants',
    slug: 'bracelet-tennis-diamants',
    description: 'Bracelet tennis classique serti de 60 diamants totalisant 5 carats. L\'essence meme de l\'elegance decontractee.',
    shortDescription: 'Tennis 5 carats, 60 diamants, or blanc',
    price: 15000,
    compareAtPrice: 17500,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
      'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&q=80',
    ],
    categoryId: '3',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamants'],
    weight: 22.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 3,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-02-01',
  },
  {
    id: '10',
    reference: 'JON-TOR-001',
    name: 'Jonc Torsade Or Rose',
    slug: 'jonc-torsade-or-rose',
    description: 'Jonc torsade en or rose 18 carats, termine par deux tetes de diamants. Moderne et audacieux.',
    shortDescription: 'Jonc torsade or rose, extremites diamantees',
    price: 3800,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=800&q=80',
    ],
    categoryId: '3',
    collection: 'Printemps/été',
    style: 'Fantaisie',
    materials: ['Or rose 18K', 'Diamants'],
    weight: 15.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 5,
    isAvailable: true,
    featured: false,
    isNew: true,
    createdAt: '2024-03-10',
  },
  {
    id: '11',
    reference: 'MAN-ART-001',
    name: 'Manchette Art Deco',
    slug: 'manchette-art-deco',
    description: 'Manchette large d\'inspiration Art Deco, ornee de motifs geometriques en onyx et diamants. Spectaculaire.',
    shortDescription: 'Manchette Art Deco, onyx et diamants',
    price: 9500,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1600721391689-2564bb8055de?w=800&q=80',
    ],
    categoryId: '3',
    collection: 'Automne/Hiver',
    style: 'Fantaisie',
    materials: ['Or blanc 18K', 'Onyx', 'Diamants'],
    weight: 38.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 2,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-30',
  },
  // BOUCLES D'OREILLES (categoryId: '4')
  {
    id: '12',
    reference: 'CRE-DIA-001',
    name: 'Creoles Diamantees',
    slug: 'creoles-diamantees',
    description: 'Creoles en or jaune entierement pavees de diamants. 3 carats de lumiere qui encadrent le visage avec eclat.',
    shortDescription: 'Creoles or jaune, pavage diamants 3ct',
    price: 7200,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      'https://images.unsplash.com/photo-1588444650733-d0090c4b90e9?w=800&q=80',
    ],
    categoryId: '4',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or jaune 18K', 'Diamants'],
    weight: 8.5,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 4,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-02-05',
  },
  {
    id: '13',
    reference: 'PEN-TAH-001',
    name: 'Pendantes Perles Tahiti',
    slug: 'pendantes-perles-tahiti',
    description: 'Boucles pendantes ornees de perles de Tahiti aux reflets verts, suspendues a un fil de diamants.',
    shortDescription: 'Perles Tahiti, chute de diamants',
    price: 5400,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80',
    ],
    categoryId: '4',
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Perles de Tahiti', 'Diamants'],
    weight: 12.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'Tahiti',
    warranty: 24,
    stock: 3,
    isAvailable: true,
    featured: true,
    isNew: true,
    createdAt: '2024-03-08',
  },
  {
    id: '14',
    reference: 'PUC-DIA-001',
    name: 'Puces Diamants Classiques',
    slug: 'puces-diamants-classiques',
    description: 'Puces serties de deux diamants de 0.5 carat chacun. L\'elegance discrete au quotidien.',
    shortDescription: 'Puces diamants 1ct total, or blanc',
    price: 4800,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80',
    ],
    categoryId: '4',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamants'],
    weight: 2.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 7,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-01-12',
  },
  {
    id: '15',
    reference: 'CHA-RUB-001',
    name: 'Chandeliers Rubis',
    slug: 'chandeliers-rubis',
    description: 'Boucles chandeliers ornees de rubis birmans et diamants. Un bijou de soiree absolument somptueux.',
    shortDescription: 'Chandeliers rubis Birmanie et diamants',
    price: 18000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?w=800&q=80',
    ],
    categoryId: '4',
    collection: 'Automne/Hiver',
    style: 'Fantaisie',
    materials: ['Or blanc 18K', 'Rubis', 'Diamants'],
    weight: 15.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'Birmanie',
    warranty: 36,
    stock: 1,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-02-20',
  },
  // MONTRES (categoryId: '5')
  {
    id: '16',
    reference: 'MON-DIA-001',
    name: 'Montre Diamant Eternel',
    slug: 'montre-diamant-eternel',
    description: 'Montre de haute joaillerie, boitier serti de 120 diamants, mouvement suisse automatique. L\'excellence horlogere.',
    shortDescription: 'Boitier diamants, mouvement automatique suisse',
    price: 42000,
    compareAtPrice: 48000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
      'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
    ],
    categoryId: '5',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamants', 'Mouvement suisse'],
    weight: 85.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'Suisse',
    warranty: 60,
    stock: 2,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-01-08',
  },
  {
    id: '17',
    reference: 'MON-ROS-001',
    name: 'Montre Or Rose Elegance',
    slug: 'montre-or-rose-elegance',
    description: 'Montre feminine en or rose, cadran nacre, bracelet en satin. Mouvement quartz de precision suisse.',
    shortDescription: 'Or rose, cadran nacre, bracelet satin',
    price: 8900,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800&q=80',
    ],
    categoryId: '5',
    collection: 'Printemps/été',
    style: 'Classique',
    materials: ['Or rose 18K', 'Nacre', 'Satin'],
    weight: 42.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'Suisse',
    warranty: 24,
    stock: 4,
    isAvailable: true,
    featured: false,
    isNew: true,
    createdAt: '2024-03-12',
  },
  {
    id: '18',
    reference: 'CHR-PRE-001',
    name: 'Chronographe Prestige',
    slug: 'chronographe-prestige',
    description: 'Chronographe sportif-chic en or jaune, cadran noir, bracelet cuir d\'alligator. Complication flyback.',
    shortDescription: 'Chronographe or jaune, bracelet alligator',
    price: 24000,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    categoryId: '5',
    collection: 'Automne/Hiver',
    style: 'Classique',
    materials: ['Or jaune 18K', 'Cuir d\'alligator'],
    weight: 95.0,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'Suisse',
    warranty: 60,
    stock: 2,
    isAvailable: true,
    featured: true,
    isNew: false,
    createdAt: '2024-02-25',
  },
  // Produits additionnels
  {
    id: '19',
    reference: 'BAG-FLE-001',
    name: 'Bague Fleur de Diamants',
    slug: 'bague-fleur-diamants',
    description: 'Bague cocktail en forme de fleur, petales en diamants, coeur en saphir jaune. Une piece exceptionnelle.',
    shortDescription: 'Bague fleur, diamants et saphir jaune',
    price: 11500,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1608042314453-ae338d80c427?w=800&q=80',
    ],
    categoryId: '1',
    collection: 'Printemps/été',
    style: 'Fantaisie',
    materials: ['Or blanc 18K', 'Diamants', 'Saphir jaune'],
    weight: 7.5,
    weightUnit: 'g',
    brand: 'Eclat d\'Or',
    origin: 'France',
    warranty: 36,
    stock: 1,
    isAvailable: true,
    featured: false,
    isNew: true,
    createdAt: '2024-03-15',
  },
  {
    id: '20',
    reference: 'COL-YDI-001',
    name: 'Collier Y Diamants',
    slug: 'collier-y-diamants',
    description: 'Collier en Y orne de diamants, terminaison pendante avec diamant poire de 1 carat. Modernite et seduction.',
    shortDescription: 'Collier Y, diamant poire 1ct en pendentif',
    price: 9800,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=800&q=80',
    ],
    categoryId: '2',
    collection: 'Printemps/été',
    style: 'Fantaisie',
    materials: ['Or blanc 18K', 'Diamants'],
    weight: 12.5,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 2,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-02-08',
  },
  {
    id: '21',
    reference: 'BRA-CHA-001',
    name: 'Bracelet Chaine Or',
    slug: 'bracelet-chaine-or',
    description: 'Bracelet chaine gourmet en or jaune massif 18 carats. Un classique indispensable, intemporel.',
    shortDescription: 'Chaine gourmet or jaune 18K massif',
    price: 2400,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80',
    ],
    categoryId: '3',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or jaune 18K'],
    weight: 18.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 10,
    isAvailable: true,
    featured: false,
    isNew: false,
    createdAt: '2024-01-18',
  },
  {
    id: '22',
    reference: 'DOR-DIA-001',
    name: 'Dormeuses Diamants',
    slug: 'dormeuses-diamants',
    description: 'Dormeuses en or blanc serties de diamants, fermeture securisee. Elegance discrete pour tous les jours.',
    shortDescription: 'Dormeuses or blanc, diamants 0.8ct',
    price: 3600,
    isPriceTTC: true,
    images: [
      'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?w=800&q=80',
    ],
    categoryId: '4',
    collection: 'Classique',
    style: 'Classique',
    materials: ['Or blanc 18K', 'Diamants'],
    weight: 4.0,
    weightUnit: 'g',
    brand: 'Bijoux d\'Argentières',
    origin: 'France',
    warranty: 24,
    stock: 6,
    isAvailable: true,
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
