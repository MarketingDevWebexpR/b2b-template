/**
 * B2B Product Detail Page
 *
 * Complete product page with gallery, pricing, variants, and all B2B features.
 * Supports dynamic routing via slug parameter.
 *
 * @packageDocumentation
 */

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductPageContent } from './ProductPageContent';
import { ProductPageSkeleton } from './ProductPageSkeleton';

// ============================================================================
// Types
// ============================================================================

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    variant?: string;
  }>;
}

// ============================================================================
// Mock Data Fetch (Replace with actual API call)
// ============================================================================

async function getProduct(slug: string) {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock product data
  const mockProduct = {
    id: `prod_${slug}`,
    reference: 'BIJ-2024-001',
    name: 'Collier Perle de Culture - Collection Elegance',
    nameEn: 'Cultured Pearl Necklace - Elegance Collection',
    slug,
    ean: '3760123456789',
    description: `<p>Decouvrez notre magnifique collier de perles de culture, piece maitresse de notre collection Elegance. Ce bijou d'exception est compose de perles d'eau douce selectionnees pour leur lustre incomparable et leur forme parfaitement spherique.</p>
    <p><strong>Caracteristiques exceptionnelles:</strong></p>
    <ul>
      <li>Perles de culture d'eau douce de premiere qualite</li>
      <li>Diametre des perles: 7-8mm</li>
      <li>Fermoir en or blanc 18 carats</li>
      <li>Longueur ajustable: 42-45cm</li>
      <li>Certifie par notre laboratoire de gemmologie</li>
    </ul>
    <p>Chaque collier est livre dans son ecrin de luxe, accompagne de son certificat d'authenticite.</p>`,
    shortDescription: 'Collier de perles de culture d\'eau douce avec fermoir or blanc 18 carats. Un classique indemodable pour toutes les occasions.',
    price: 285.00,
    compareAtPrice: 340.00,
    isPriceTTC: false,
    images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
      'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    ],
    categoryId: 'cat_colliers',
    category: {
      id: 'cat_colliers',
      name: 'Colliers',
      slug: 'colliers',
      description: 'Collection de colliers de luxe',
      image: '',
      productCount: 45,
    },
    collection: 'Automne/Hiver 2024',
    style: 'Classique',
    materials: ['Perles de culture', 'Or blanc 18 carats'],
    weight: 32,
    weightUnit: 'g' as const,
    brand: 'WebexpR Pro',
    origin: 'France',
    warranty: 24,
    stock: 15,
    isAvailable: true,
    featured: true,
    isNew: true,
    createdAt: '2024-10-15T00:00:00Z',
  };

  // Return null if slug doesn't exist (for 404)
  if (slug === 'not-found') {
    return null;
  }

  return mockProduct;
}

async function getRelatedProducts(productId: string) {
  // Mock related products
  return {
    similar: [
      {
        id: 'prod_similar_1',
        name: 'Collier Perle Tahiti',
        slug: 'collier-perle-tahiti',
        reference: 'BIJ-2024-002',
        price: 450,
        images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: true,
      },
      {
        id: 'prod_similar_2',
        name: 'Collier Perle Baroque',
        slug: 'collier-perle-baroque',
        reference: 'BIJ-2024-003',
        price: 320,
        compareAtPrice: 380,
        images: ['https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=400'],
        isAvailable: true,
        isNew: true,
        brand: 'WebexpR Pro',
        inStock: true,
      },
      {
        id: 'prod_similar_3',
        name: 'Sautoir Perles Fines',
        slug: 'sautoir-perles-fines',
        reference: 'BIJ-2024-004',
        price: 520,
        images: ['https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: false,
      },
      {
        id: 'prod_similar_4',
        name: 'Collier Multi-rangs',
        slug: 'collier-multi-rangs',
        reference: 'BIJ-2024-005',
        price: 680,
        images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: true,
      },
    ],
    complementary: [
      {
        id: 'prod_comp_1',
        name: 'Boucles d\'oreilles Perles Assorties',
        slug: 'boucles-oreilles-perles',
        reference: 'BIJ-2024-010',
        price: 185,
        images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: true,
      },
      {
        id: 'prod_comp_2',
        name: 'Bracelet Perles',
        slug: 'bracelet-perles',
        reference: 'BIJ-2024-011',
        price: 145,
        images: ['https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: true,
      },
      {
        id: 'prod_comp_3',
        name: 'Ecrin de Luxe',
        slug: 'ecrin-luxe',
        reference: 'ACC-2024-001',
        price: 35,
        images: ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400'],
        isAvailable: true,
        isNew: false,
        brand: 'WebexpR Pro',
        inStock: true,
      },
    ],
  };
}

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    return {
      title: 'Produit non trouve | WebexpR Pro',
    };
  }

  return {
    title: `${product.name} | WebexpR Pro B2B`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.images.slice(0, 4),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.shortDescription,
      images: product.images[0],
    },
  };
}

// ============================================================================
// Page Component
// ============================================================================

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  const product = await getProduct(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id);

  // Mock specifications
  const specifications = [
    { id: '1', label: 'Reference', value: product.reference, group: 'Identification' },
    { id: '2', label: 'Code EAN', value: product.ean || 'N/A', group: 'Identification' },
    { id: '3', label: 'Matiere principale', value: 'Perles de culture d\'eau douce', group: 'Composition' },
    { id: '4', label: 'Metal', value: 'Or blanc 18 carats (750/1000)', group: 'Composition' },
    { id: '5', label: 'Diametre perles', value: '7-8', unit: 'mm', group: 'Dimensions' },
    { id: '6', label: 'Longueur', value: '42-45', unit: 'cm', group: 'Dimensions' },
    { id: '7', label: 'Poids total', value: '32', unit: 'g', group: 'Dimensions' },
    { id: '8', label: 'Origine perles', value: 'Chine', group: 'Provenance' },
    { id: '9', label: 'Lieu de fabrication', value: 'France', group: 'Provenance' },
    { id: '10', label: 'Garantie', value: '2 ans', group: 'Services' },
    { id: '11', label: 'Entretien', value: 'Nettoyage professionnel recommande', group: 'Services' },
  ];

  // Mock documents
  const documents = [
    {
      id: 'doc_1',
      name: 'Fiche produit technique',
      type: 'pdf' as const,
      url: '/documents/fiche-technique-collier.pdf',
      size: '245 Ko',
      description: 'Specifications techniques completes',
    },
    {
      id: 'doc_2',
      name: 'Certificat d\'authenticite',
      type: 'pdf' as const,
      url: '/documents/certificat-authenticite.pdf',
      size: '128 Ko',
      description: 'Certificat de gemmologie',
    },
    {
      id: 'doc_3',
      name: 'Guide d\'entretien',
      type: 'pdf' as const,
      url: '/documents/guide-entretien-perles.pdf',
      size: '512 Ko',
      description: 'Conseils pour preserver vos perles',
    },
  ];

  // Mock reviews
  const reviews = [
    {
      id: 'rev_1',
      author: 'Marie L.',
      authorCompany: 'Bijouterie du Centre',
      rating: 5,
      date: '2024-11-15T00:00:00Z',
      title: 'Qualite exceptionnelle',
      content: 'Ce collier est absolument magnifique. Les perles sont parfaitement calibrees et le lustre est remarquable. Mes clientes sont enchantees. Je recommande vivement ce produit pour sa qualite et son rapport qualite-prix.',
      helpful: 12,
      verified: true,
    },
    {
      id: 'rev_2',
      author: 'Pierre D.',
      authorCompany: 'Joaillerie Modern',
      rating: 4,
      date: '2024-10-28T00:00:00Z',
      content: 'Tres beau produit, conforme a la description. Le fermoir en or blanc est elegant et solide. Seul bemol: le delai de livraison un peu long (5 jours).',
      helpful: 8,
      verified: true,
    },
  ];

  // Mock questions
  const questions = [
    {
      id: 'q_1',
      author: 'Client B2B',
      date: '2024-11-01T00:00:00Z',
      question: 'Quelle est la duree de vie moyenne des perles de culture?',
      answer: {
        content: 'Les perles de culture, lorsqu\'elles sont correctement entretenues, peuvent conserver leur beaute pendant plusieurs decades. Nous recommandons un nettoyage doux apres chaque utilisation et un rangement a l\'abri de la lumiere directe.',
        author: 'Equipe WebexpR Pro',
        date: '2024-11-02T00:00:00Z',
      },
    },
    {
      id: 'q_2',
      author: 'Bijouterie Express',
      date: '2024-10-20T00:00:00Z',
      question: 'Proposez-vous des tarifs degressifs pour les commandes importantes?',
      answer: {
        content: 'Oui, nous proposons des paliers de remise quantite automatiques. Contactez votre commercial pour les tarifs sur mesure pour les volumes tres importants.',
        author: 'Service Commercial',
        date: '2024-10-21T00:00:00Z',
      },
    },
  ];

  // Mock variants
  const variants = [
    {
      id: 'var_1',
      sku: 'BIJ-2024-001-42',
      name: 'Longueur 42cm',
      attributes: { size: '42 cm', color: 'Blanc' },
      price: 285,
      stockStatus: 'in_stock' as const,
      stockQuantity: 8,
      isDefault: true,
    },
    {
      id: 'var_2',
      sku: 'BIJ-2024-001-45',
      name: 'Longueur 45cm',
      attributes: { size: '45 cm', color: 'Blanc' },
      price: 295,
      stockStatus: 'low_stock' as const,
      stockQuantity: 3,
    },
    {
      id: 'var_3',
      sku: 'BIJ-2024-001-50',
      name: 'Longueur 50cm',
      attributes: { size: '50 cm', color: 'Blanc' },
      price: 310,
      stockStatus: 'out_of_stock' as const,
      stockQuantity: 0,
    },
    {
      id: 'var_4',
      sku: 'BIJ-2024-001-42-P',
      name: 'Longueur 42cm - Perles roses',
      attributes: { size: '42 cm', color: 'Rose' },
      price: 295,
      colorHex: '#FFC0CB',
      stockStatus: 'in_stock' as const,
      stockQuantity: 5,
    },
    {
      id: 'var_5',
      sku: 'BIJ-2024-001-42-G',
      name: 'Longueur 42cm - Perles grises',
      attributes: { size: '42 cm', color: 'Gris' },
      price: 320,
      colorHex: '#808080',
      stockStatus: 'in_stock' as const,
      stockQuantity: 6,
    },
  ];

  const variantAttributes = [
    {
      name: 'size',
      label: 'Longueur',
      type: 'size' as const,
      values: ['42 cm', '45 cm', '50 cm'],
    },
    {
      name: 'color',
      label: 'Couleur des perles',
      type: 'color' as const,
      values: ['Blanc', 'Rose', 'Gris'],
    },
  ];

  // Mock stock
  const productStock = {
    productId: product.id,
    sku: product.reference,
    globalStatus: 'in_stock' as const,
    totalAvailable: 22,
    warehouseStock: [
      {
        warehouseId: 'wh_001',
        warehouseName: 'Paris Est',
        warehouseCode: 'PARIS-EST',
        availableQuantity: 12,
        reservedQuantity: 2,
        physicalQuantity: 14,
        status: 'in_stock' as const,
        lowStockThreshold: 5,
        pickupAvailable: true,
        pickupDelay: '2h',
        deliveryAvailable: true,
        deliveryDelay: '24h',
        updatedAt: new Date().toISOString(),
      },
      {
        warehouseId: 'wh_002',
        warehouseName: 'Lyon Sud',
        warehouseCode: 'LYON-SUD',
        availableQuantity: 10,
        reservedQuantity: 0,
        physicalQuantity: 10,
        status: 'in_stock' as const,
        lowStockThreshold: 5,
        pickupAvailable: true,
        pickupDelay: '1h',
        deliveryAvailable: true,
        deliveryDelay: '48h',
        updatedAt: new Date().toISOString(),
      },
    ],
    isAvailable: true,
    bestPickupWarehouseId: 'wh_002',
    bestDeliveryWarehouseId: 'wh_001',
    updatedAt: new Date().toISOString(),
  };

  // Gallery media
  const galleryMedia = product.images.map((src, index) => ({
    id: `img_${index}`,
    type: 'image' as const,
    src,
    alt: `${product.name} - Vue ${index + 1}`,
  }));

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageContent
        product={product}
        galleryMedia={galleryMedia}
        variants={variants}
        variantAttributes={variantAttributes}
        productStock={productStock}
        specifications={specifications}
        documents={documents}
        reviews={reviews}
        questions={questions}
        relatedProducts={relatedProducts}
        initialVariantId={resolvedSearchParams?.variant}
      />
    </Suspense>
  );
}
