import {
  SageArticle,
  SageFamille,
  Product,
  Category,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_SAGE_API_URL || 'https://sage-portal.webexpr.dev/api';

// ============================================
// Helpers
// ============================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function parseAspNetDate(dateString: string): Date {
  const match = dateString.match(/\/Date\((\d+)([+-]\d{4})?\)\//);
  if (match) {
    return new Date(parseInt(match[1], 10));
  }
  return new Date(dateString);
}

// ============================================
// Helpers: Extraction des données Sage
// ============================================

/**
 * Extrait la valeur d'un champ InfoLibre par son nom
 */
function getInfoLibreValue(infosLibres: SageArticle['InfosLibres'], name: string): string | number | null {
  if (!infosLibres) return null;
  const info = infosLibres.find(i => i.Name === name);
  return info?.Value ?? null;
}

/**
 * Extrait la marque commerciale depuis les InfosLibres
 */
function extractBrand(article: SageArticle): string | undefined {
  const value = getInfoLibreValue(article.InfosLibres, 'Marque commerciale');
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Extrait la collection depuis StatistiqueArticles ou Statistique1
 */
function extractCollection(article: SageArticle): string | undefined {
  // Priorité aux StatistiqueArticles structurées
  const stat = article.StatistiqueArticles?.find(s => s.Intitule === 'Collection');
  if (stat?.Valeur) return stat.Valeur;
  // Fallback sur Statistique1
  return article.Statistique1 || undefined;
}

/**
 * Extrait le style depuis StatistiqueArticles ou Statistique2
 */
function extractStyle(article: SageArticle): string | undefined {
  // Priorité aux StatistiqueArticles structurées
  const stat = article.StatistiqueArticles?.find(s => s.Intitule === 'Style');
  if (stat?.Valeur) return stat.Valeur;
  // Fallback sur Statistique2
  return article.Statistique2 || undefined;
}

/**
 * Détermine l'unité de poids à partir de UnitePoids Sage
 * 3 = grammes (le plus courant pour les bijoux)
 */
function getWeightUnit(unitePoids: number): 'g' | 'kg' {
  // 3 = grammes dans Sage
  return unitePoids === 3 ? 'g' : 'kg';
}

// ============================================
// Mappers: API Sage -> Front-end
// ============================================

export function mapSageArticleToProduct(article: SageArticle, categories?: Category[]): Product {
  const category = categories?.find(c => c.code === article.CodeFamille);

  // Construire l'URL de l'image
  const imageUrl = article.Photo
    ? `${API_BASE_URL}/sage/articles/${encodeURIComponent(article.Reference)}/image`
    : '/images/placeholder-product.svg';

  // Calculer la disponibilité
  const isAvailable = article.Publie && !article.EstEnSommeil && !article.InterdireCommande;

  return {
    // Identification
    id: article.Reference,
    reference: article.Reference,
    name: article.Intitule,
    nameEn: article.Langue1 || undefined,
    slug: slugify(article.Intitule) + '-' + article.Reference.toLowerCase(),
    ean: article.CodeBarres || undefined,

    // Descriptions
    description: article.Langue1 || article.Intitule,
    shortDescription: article.Intitule,

    // Prix (on n'expose PAS PrixAchat, PrixUnitaireNet, Coefficient)
    price: article.PrixVente,
    isPriceTTC: article.EstEnPrixTTTC || false,
    // Note: compareAtPrice ne doit PAS utiliser PrixUnitaireNet (c'est le prix d'achat net)
    compareAtPrice: undefined,

    // Média
    images: [imageUrl],

    // Catégorisation
    categoryId: article.CodeFamille,
    category,
    collection: extractCollection(article),
    style: extractStyle(article),

    // Caractéristiques physiques
    materials: [], // À implémenter si disponible dans InfosLibres
    weight: article.PoidsNet,
    weightUnit: getWeightUnit(article.UnitePoids),

    // Informations marque et origine
    brand: extractBrand(article),
    origin: article.Pays || undefined,
    warranty: article.Garantie > 0 ? article.Garantie : undefined,

    // Disponibilité
    stock: isAvailable ? 100 : 0, // Simplifié, à adapter selon la logique métier
    isAvailable,

    // Flags
    featured: false,
    isNew: isRecentlyCreated(article.DateCreation),

    // Métadonnées
    createdAt: article.DateCreation,
  };
}

export function mapSageFamilleToCategory(famille: SageFamille, productCount = 0): Category {
  return {
    id: famille.CodeFamille,
    code: famille.CodeFamille,
    name: famille.Intitule,
    slug: slugify(famille.Intitule),
    description: famille.Intitule,
    image: '/images/placeholder-category.svg',
    productCount,
    type: famille.TypeFamille,
  };
}

function isRecentlyCreated(dateString: string, daysThreshold = 30): boolean {
  const createdDate = parseAspNetDate(dateString);
  const now = new Date();
  const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}

// ============================================
// API Calls
// ============================================

export async function fetchSageArticles(): Promise<SageArticle[]> {
  const response = await fetch(`${API_BASE_URL}/sage/articles`, {
    next: { revalidate: 300 }, // Cache 5 minutes
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.status}`);
  }

  return response.json();
}

export async function fetchSageFamilies(): Promise<SageFamille[]> {
  const response = await fetch(`${API_BASE_URL}/sage/families`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch families: ${response.status}`);
  }

  return response.json();
}

export async function fetchArticleImage(reference: string): Promise<string> {
  return `${API_BASE_URL}/sage/articles/${encodeURIComponent(reference)}/image`;
}

// ============================================
// Fonctions combinées (avec mapping)
// ============================================

export async function getProducts(): Promise<Product[]> {
  const [articles, families] = await Promise.all([
    fetchSageArticles(),
    fetchSageFamilies(),
  ]);

  const categories = families
    .filter(f => f.TypeFamille === 0) // Seulement les catégories feuilles
    .map(f => mapSageFamilleToCategory(f));

  return articles
    .filter(a => !a.EstEnSommeil && !a.Fictif) // Exclure articles en sommeil ou fictifs
    .map(a => mapSageArticleToProduct(a, categories));
}

export async function getCategories(): Promise<Category[]> {
  const [families, articles] = await Promise.all([
    fetchSageFamilies(),
    fetchSageArticles(),
  ]);

  // Compter les articles par famille
  const productCounts = articles.reduce((acc, article) => {
    if (!article.EstEnSommeil && !article.Fictif) {
      acc[article.CodeFamille] = (acc[article.CodeFamille] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return families
    .filter(f => f.TypeFamille === 0) // Seulement les catégories feuilles
    .map(f => mapSageFamilleToCategory(f, productCounts[f.CodeFamille] || 0))
    .filter(c => c.productCount > 0); // Seulement les catégories avec des produits
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.slug === slug) || null;
}

export async function getProductByReference(reference: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.reference === reference) || null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find(c => c.slug === slug) || null;
}

export async function getProductsByCategory(categoryCode: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter(p => p.categoryId === categoryCode);
}

// ============================================
// Fonctions pour les pages Collections
// ============================================

/**
 * Récupère les produits d'une catégorie par son slug
 * Trouve d'abord la catégorie par son slug, puis filtre les produits par code catégorie
 * @param slug - Le slug de la catégorie (ex: "bagues", "colliers")
 * @returns Les produits de la catégorie ou un tableau vide si la catégorie n'existe pas
 */
export async function getProductsByCategorySlug(slug: string): Promise<Product[]> {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const category = categories.find(c => c.slug === slug);
  if (!category) {
    return [];
  }

  return products.filter(p => p.categoryId === category.code);
}

/**
 * Options de filtrage pour les produits
 */
export interface FilterProductsOptions {
  /** Slug de la catégorie (ex: "bagues", "colliers") */
  categorySlug?: string;
  /** Prix minimum */
  minPrice?: number;
  /** Prix maximum */
  maxPrice?: number;
  /** Liste des matériaux à filtrer */
  materials?: string[];
  /** Critère de tri */
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
  /** Terme de recherche */
  search?: string;
  /** Limite de résultats */
  limit?: number;
}

/**
 * Filtre et trie les produits selon les options fournies
 * @param options - Options de filtrage et tri
 * @returns Les produits filtrés et triés
 */
export async function filterProductsFromAPI(options: FilterProductsOptions): Promise<Product[]> {
  const {
    categorySlug,
    minPrice,
    maxPrice,
    materials,
    sortBy,
    search,
    limit,
  } = options;

  // Récupérer les produits de base (tous ou par catégorie)
  let products: Product[];

  if (categorySlug) {
    products = await getProductsByCategorySlug(categorySlug);
  } else {
    products = await getProducts();
  }

  // Filtrer par prix minimum
  if (minPrice !== undefined) {
    products = products.filter(p => p.price >= minPrice);
  }

  // Filtrer par prix maximum
  if (maxPrice !== undefined) {
    products = products.filter(p => p.price <= maxPrice);
  }

  // Filtrer par matériaux (si le produit contient au moins un des matériaux demandés)
  if (materials && materials.length > 0) {
    products = products.filter(p =>
      p.materials.some(m => materials.includes(m))
    );
  }

  // Filtrer par recherche textuelle (nom, description ou référence)
  if (search && search.trim() !== '') {
    const searchLower = search.toLowerCase().trim();
    products = products.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.shortDescription.toLowerCase().includes(searchLower) ||
      (p.reference && p.reference.toLowerCase().includes(searchLower))
    );
  }

  // Trier les produits
  if (sortBy) {
    products = sortProducts(products, sortBy);
  }

  // Limiter le nombre de résultats
  if (limit !== undefined && limit > 0) {
    products = products.slice(0, limit);
  }

  return products;
}

/**
 * Trie les produits selon le critère spécifié
 * @param products - Liste des produits à trier
 * @param sortBy - Critère de tri
 * @returns Les produits triés (nouveau tableau)
 */
function sortProducts(
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'name' | 'newest'
): Product[] {
  // Créer une copie pour ne pas muter l'original
  const sorted = [...products];

  switch (sortBy) {
    case 'price-asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
      break;
    case 'newest':
      sorted.sort((a, b) => {
        // Utiliser parseAspNetDate pour gérer le format ASP.NET
        const dateA = parseAspNetDate(a.createdAt).getTime();
        const dateB = parseAspNetDate(b.createdAt).getTime();
        return dateB - dateA; // Plus récent en premier
      });
      break;
  }

  return sorted;
}

/**
 * Récupère les produits "featured" (mis en avant)
 * Un produit est considéré "featured" s'il a un compareAtPrice (prix barré)
 * ou s'il fait partie des produits les plus chers
 * @param limit - Nombre maximum de produits à retourner (défaut: 8)
 * @returns Les produits mis en avant
 */
export async function getFeaturedProductsFromAPI(limit: number = 8): Promise<Product[]> {
  const products = await getProducts();

  // Séparer les produits avec promotion (compareAtPrice > prix actuel)
  const productsWithPromo = products.filter(
    p => p.compareAtPrice !== undefined && p.compareAtPrice > p.price
  );

  // Trier les produits sans promo par prix décroissant (les plus chers = premium)
  const productsWithoutPromo = products
    .filter(p => p.compareAtPrice === undefined || p.compareAtPrice <= p.price)
    .sort((a, b) => b.price - a.price);

  // Combiner: d'abord les promos, puis les plus chers
  const featured = [...productsWithPromo, ...productsWithoutPromo];

  // Retourner avec le flag featured activé
  return featured.slice(0, limit).map(p => ({
    ...p,
    featured: true,
  }));
}

/**
 * Récupère les nouveaux produits (créés récemment)
 * @param limit - Nombre maximum de produits à retourner (défaut: 8)
 * @param daysThreshold - Nombre de jours pour considérer un produit comme nouveau (défaut: 30)
 * @returns Les nouveaux produits triés par date de création décroissante
 */
export async function getNewProductsFromAPI(
  limit: number = 8,
  daysThreshold: number = 30
): Promise<Product[]> {
  const products = await getProducts();

  // Filtrer les produits créés dans les X derniers jours
  const now = new Date();
  const newProducts = products.filter(p => {
    const createdDate = parseAspNetDate(p.createdAt);
    const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= daysThreshold;
  });

  // Trier par date de création décroissante
  const sorted = sortProducts(newProducts, 'newest');

  return sorted.slice(0, limit);
}

/**
 * Récupère les plages de prix disponibles pour les filtres
 * Utile pour afficher les sliders de prix dans l'UI
 * @param categorySlug - Optionnel: limiter à une catégorie
 * @returns Les prix min et max disponibles
 */
export async function getPriceRangeFromAPI(
  categorySlug?: string
): Promise<{ min: number; max: number }> {
  let products: Product[];

  if (categorySlug) {
    products = await getProductsByCategorySlug(categorySlug);
  } else {
    products = await getProducts();
  }

  if (products.length === 0) {
    return { min: 0, max: 0 };
  }

  const prices = products.map(p => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Récupère les matériaux disponibles pour les filtres
 * @param categorySlug - Optionnel: limiter à une catégorie
 * @returns Liste des matériaux uniques triés alphabétiquement
 */
export async function getAvailableMaterialsFromAPI(
  categorySlug?: string
): Promise<string[]> {
  let products: Product[];

  if (categorySlug) {
    products = await getProductsByCategorySlug(categorySlug);
  } else {
    products = await getProducts();
  }

  // Extraire tous les matériaux uniques
  const materialsSet = new Set<string>();
  products.forEach(p => {
    p.materials.forEach(m => materialsSet.add(m));
  });

  // Retourner triés par ordre alphabétique français
  return Array.from(materialsSet).sort((a, b) => a.localeCompare(b, 'fr'));
}

/**
 * Récupère le nombre total de produits (optionnellement par catégorie)
 * Utile pour la pagination
 * @param categorySlug - Optionnel: limiter à une catégorie
 * @returns Le nombre total de produits
 */
export async function getProductsCountFromAPI(categorySlug?: string): Promise<number> {
  if (categorySlug) {
    const products = await getProductsByCategorySlug(categorySlug);
    return products.length;
  }

  const products = await getProducts();
  return products.length;
}
