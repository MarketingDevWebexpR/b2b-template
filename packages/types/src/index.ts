// ============================================
// Types API Sage (données brutes de l'API)
// ============================================

// Statistiques article Sage (Collection, Style, etc.)
export interface SageStatistiqueArticle {
  Intitule: string;       // Ex: "Collection", "Style"
  IdStatistique: number;  // 1=Collection, 2=Style
  Valeur: string;         // Ex: "Automne/Hiver", "Classique"
}

// Infos libres article Sage
export interface SageInfoLibre {
  Name: string;           // Ex: "Marque commerciale", "1ère commercialisation"
  Type: number;           // 0=texte, 1=date, 3=nombre
  Size: number;
  EstCalculee: boolean;
  Value: string | number | null;
}

// Article brut de l'API Sage
export interface SageArticle {
  __type: 'ArticleStandard:http://www.proconsult.lu/WebServices100' | 'ArticleGamme:http://www.proconsult.lu/WebServices100';
  Reference: string;
  Intitule: string;
  CodeFamille: string;
  TypeArticle: number;    // 0=Standard, 1=Gamme, 2=Kit, 4=Composé

  // Prix (données sensibles à ne PAS exposer au client: PrixAchat, PrixUnitaireNet, Coefficient)
  PrixAchat: number;      // CONFIDENTIEL - Ne pas exposer
  PrixUnitaireNet: number; // CONFIDENTIEL - Ne pas exposer
  PrixVente: number;      // Prix public
  Coefficient: number;    // CONFIDENTIEL - Ne pas exposer
  EstEnPrixTTTC: boolean; // Indique si le prix est TTC

  // Caractéristiques physiques
  PoidsNet: number;
  PoidsBrut: number;
  UnitePoids: number;     // 3=grammes
  Garantie: number;       // En mois
  Pays: string;           // Pays d'origine

  // Gestion
  IdUniteVente: number;
  TypeSuiviStock: number;
  Fictif: boolean;
  EstEnSommeil: boolean;
  Publie: boolean;
  InterdireCommande: boolean;
  ExclureReapprovisionnement: boolean;

  // Descriptions
  Langue1?: string;       // Description en anglais
  Langue2?: string;

  // Identifiants
  CodeBarres?: string;    // Code EAN
  Photo?: string;         // Chemin de l'image

  // Catégories/Catalogues
  IdCatalogue1: number;
  IdCatalogue2: number;
  IdCatalogue3: number;
  IdCatalogue4: number;

  // Statistiques (Collection, Style)
  Statistique1: string;   // Valeur directe de la collection
  Statistique2: string;   // Valeur directe du style
  Statistique3: string;
  Statistique4: string;
  Statistique5: string;
  StatistiqueArticles?: SageStatistiqueArticle[];

  // Infos libres (Marque commerciale, etc.)
  InfosLibres?: SageInfoLibre[];

  // Dates
  DateCreation: string;
  DateModification: string;

  // Données internes (ne pas exposer)
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

// Product Types - Données utiles pour le client
export interface Product {
  // Identification
  id: string;
  reference: string;
  name: string;
  nameEn?: string;          // Nom en anglais (Langue1)
  slug: string;
  ean?: string;             // Code-barres EAN

  // Descriptions
  description: string;
  shortDescription: string;

  // Prix
  price: number;
  compareAtPrice?: number;
  isPriceTTC: boolean;      // Indique si le prix est TTC

  // Média
  images: string[];

  // Catégorisation
  categoryId: string;
  category?: Category;
  collection?: string;      // Ex: "Automne/Hiver", "Printemps/été"
  style?: string;           // Ex: "Classique", "Fantaisie"

  // Caractéristiques physiques
  materials: string[];
  weight?: number;          // Poids en grammes
  weightUnit: 'g' | 'kg';

  // Informations marque et origine
  brand?: string;           // Marque commerciale
  origin?: string;          // Pays d'origine
  warranty?: number;        // Garantie en mois

  // Disponibilité
  stock: number;
  isAvailable: boolean;     // Calculé: Publie && !EstEnSommeil && !InterdireCommande

  // Flags
  featured: boolean;
  isNew: boolean;

  // Métadonnées
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

// ============================================
// E-commerce Types: Shipping & Address
// ============================================

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email?: string;
}

export interface BillingAddress extends ShippingAddress {
  companyName?: string;
  vatNumber?: string;
}

// ============================================
// E-commerce Types: Payment
// ============================================

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  lastFourDigits?: string;
  cardBrand?: CardBrand;
  paidAt?: string;
}

export type PaymentMethod = 'card' | 'paypal' | 'bank_transfer' | 'apple_pay' | 'google_pay';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'cb';

// ============================================
// E-commerce Types: Orders
// ============================================

export type OrderStatus =
  | 'pending'        // Order created, awaiting payment
  | 'confirmed'      // Payment received, order confirmed
  | 'processing'     // Being prepared for shipment
  | 'shipped'        // Handed to carrier
  | 'delivered'      // Successfully delivered
  | 'cancelled'      // Order cancelled
  | 'refunded';      // Order refunded

export interface OrderItem {
  productId: string;
  productReference?: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totals: OrderTotals;
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentInfo: PaymentInfo;
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// ============================================
// E-commerce Types: Checkout Flow
// ============================================

export type CheckoutStep =
  | 'cart'           // Review cart items
  | 'shipping'       // Enter shipping address
  | 'billing'        // Enter billing (if different)
  | 'payment'        // Select payment method
  | 'review'         // Final review before purchase
  | 'confirmation';  // Order confirmation

export interface CheckoutState {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  shippingAddress: ShippingAddress | null;
  billingAddress: BillingAddress | null;
  sameAsShipping: boolean;
  paymentMethod: PaymentMethod | null;
  orderNotes: string;
  isProcessing: boolean;
  error: string | null;
}

// ============================================
// E-commerce Types: Cart (Enhanced)
// ============================================

export interface CartItemWithDetails {
  productId: string;
  productReference?: string;
  productName: string;
  productSlug: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number; // Based on stock
  totalPrice: number;
}

export interface CartState {
  items: CartItemWithDetails[];
  itemCount: number;
  subtotal: number;
  lastUpdated: string;
}

// ============================================
// E-commerce Types: Stock Management
// ============================================

export interface StockInfo {
  productId: string;
  available: number;
  reserved: number;
  showExactStock: boolean; // True for logged-in users
}

export type StockStatus =
  | 'in_stock'       // Available immediately
  | 'low_stock'      // Limited quantity
  | 'out_of_stock'   // Not available
  | 'backorder'      // Can be ordered, waiting for supply
  | 'preorder'       // Future availability
  | 'discontinued';  // No longer available

// ============================================
// E-commerce API Types
// ============================================

export interface CreateOrderRequest {
  items: CartItemWithDetails[];
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order?: Order;
  error?: string;
  paymentIntent?: string; // For Stripe integration
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================
// Session Types (NextAuth Extension)
// ============================================

export interface ExtendedUser extends User {
  addresses?: ShippingAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

// ============================================
// Wishlist Types
// ============================================

/**
 * A single item in the user's wishlist.
 * Stores the full product for offline access and display.
 */
export interface WishlistItem {
  /** The product saved to wishlist */
  product: Product;
  /** ISO timestamp when item was added */
  addedAt: string;
}

/**
 * The complete wishlist state.
 */
export interface Wishlist {
  /** Array of wishlist items */
  items: WishlistItem[];
  /** Total count of items */
  totalItems: number;
}

// ============================================
// B2B Types - Re-exports
// ============================================

/**
 * B2B (Business-to-Business) types for enterprise e-commerce.
 * Includes: Companies, Employees, Quotes, Approvals, Spending Limits.
 */
export * from './b2b';

// ============================================
// Feature Flags Types - Re-exports
// ============================================

/**
 * Feature flags system for modular white-label platform.
 * Enables/disables features per client configuration.
 */
export * from './features';
