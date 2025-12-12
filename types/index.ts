// ============================================
// Types API Sage (données brutes de l'API)
// ============================================

// Statistiques article Sage
export interface SageStatistiqueArticle {
  CodeStatistique: string;
  Intitule: string;
}

// Infos libres article Sage
export interface SageInfoLibre {
  Intitule: string;
  Valeur: string | number | null;
}

// Article brut de l'API Sage
export interface SageArticle {
  __type: 'ArticleStandard' | 'ArticleGamme';
  Reference: string;
  Intitule: string;
  CodeFamille: string;
  TypeArticle: number; // 0=Standard, 1=Gamme, 2=Kit, 4=Composé
  PrixAchat: number;
  PrixUnitaireNet: number;
  PrixVente: number;
  Coefficient: number;
  Garantie: number;
  PoidsNet: number;
  PoidsBrut: number;
  UnitePoids: number; // 3=grammes
  IdUniteVente: number;
  TypeSuiviStock: number;
  Fictif: boolean;
  EstEnSommeil: boolean;
  ExclureReapprovisionnement: boolean;
  Langue1?: string; // Description anglaise
  CodeBarres?: string;
  Photo?: string;
  StatistiqueArticles?: SageStatistiqueArticle[];
  InfosLibres?: SageInfoLibre[];
  DateCreation: string;
  DateModification: string;
  Createur: string;
  UtilisateurCreateur: string;
}

// Famille brute de l'API Sage (= catégorie)
export interface SageFamille {
  CodeFamille: string;
  Intitule: string;
  TypeFamille: number; // 0=feuille, 1=totalisante, 2=intermédiaire
  Createur: string;
  DateModification: string; // Format ASP.NET: "/Date(1741455859000+0100)/"
  DateCreation: string;
  UtilisateurCreateur: string;
}

// ============================================
// Types Front-end (utilisés dans les composants)
// ============================================

// Product Types
export interface Product {
  id: string;
  reference?: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  category?: Category;
  materials: string[];
  weight?: number;
  stock: number;
  featured: boolean;
  isNew: boolean;
  createdAt: string;
}

// Category Types
export interface Category {
  id: string;
  code?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  type?: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: 'user' | 'admin';
}

export interface MockUser extends User {
  password: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  priceRange?: [number, number];
  materials?: string[];
  sortBy?: 'price-asc' | 'price-desc' | 'name' | 'newest';
  search?: string;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
