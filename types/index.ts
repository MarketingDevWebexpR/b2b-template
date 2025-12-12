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

/**
 * Mock payment info for development
 * In production, use Stripe/PayPal payment intents
 */
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

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

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
