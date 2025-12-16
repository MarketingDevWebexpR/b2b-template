import { ICommerceClient, ApiProvider, CommerceClientConfig, IProductService, ICategoryService, ICartService, IOrderService, ICustomerService, IB2BServices, ListProductsOptions, GetProductOptions, ProductWithRelated, ProductSearchResult, ProductInventory, Cart, AddToCartInput, UpdateCartItemInput, BulkAddToCartInput, BulkAddResult, CartShippingOption, CartLineItem, CartDiscount, CartTotals } from '@maison/api-client';
import { Product, Category } from '@maison/types';
import { BaseApiClient, PaginatedResponse } from '@maison/api-core';

/**
 * Medusa Commerce Client
 *
 * Full implementation of ICommerceClient for Medusa V2 backend.
 */

/**
 * Medusa-specific configuration options
 */
interface MedusaConfig extends CommerceClientConfig {
    /** Publishable API key for store operations */
    publishableKey?: string;
}
/**
 * Medusa Commerce Client implementation.
 *
 * Provides full ICommerceClient interface for Medusa V2 backend.
 *
 * @example
 * ```typescript
 * const client = new MedusaCommerceClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx",
 *   enableB2B: true
 * });
 *
 * const products = await client.products.list({ pageSize: 20 });
 * const cart = await client.cart.create();
 * ```
 */
declare class MedusaCommerceClient implements ICommerceClient {
    readonly name = "medusa";
    readonly version = "2.0";
    readonly provider: ApiProvider;
    readonly config: CommerceClientConfig;
    private readonly httpClient;
    private authToken;
    private b2bContext;
    private initialized;
    private _products;
    private _categories;
    private _cart;
    private _orders;
    private _customers;
    private _b2b;
    constructor(config: MedusaConfig);
    initialize(): Promise<void>;
    isConfigured(): boolean;
    healthCheck(): Promise<boolean>;
    get products(): IProductService;
    get categories(): ICategoryService;
    get cart(): ICartService;
    get orders(): IOrderService;
    get customers(): ICustomerService;
    get b2b(): IB2BServices | null;
    setAuthToken(token: string): void;
    clearAuth(): void;
    getAuthToken(): string | null;
    setB2BContext(companyId: string, employeeId?: string): void;
    clearB2BContext(): void;
    getB2BContext(): {
        companyId?: string;
        employeeId?: string;
    } | null;
    isB2BEnabled(): boolean;
    getHttpClient(): {
        get: <T>(path: string, options?: Record<string, unknown>) => Promise<T>;
        post: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        put: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        patch: <T>(path: string, body?: unknown, options?: Record<string, unknown>) => Promise<T>;
        delete: <T>(path: string, options?: Record<string, unknown>) => Promise<T>;
    };
    private createStubCategoryService;
    private createStubOrderService;
    private createStubCustomerService;
    private createStubB2BServices;
}
/**
 * Create a Medusa commerce client.
 *
 * @param config - Client configuration
 * @returns Medusa commerce client
 *
 * @example
 * ```typescript
 * const client = createMedusaClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx"
 * });
 * ```
 */
declare function createMedusaClient(config: MedusaConfig): ICommerceClient;

/**
 * Medusa Product Service
 *
 * Implements IProductService for Medusa V2 backend.
 */

/**
 * Medusa Product Service implementation.
 *
 * @example
 * ```typescript
 * const productService = new MedusaProductService(httpClient, "reg_123");
 * const products = await productService.list({ pageSize: 20 });
 * ```
 */
declare class MedusaProductService implements IProductService {
    private readonly client;
    private readonly regionId?;
    private readonly currencyCode;
    constructor(client: BaseApiClient, regionId?: string | undefined, currencyCode?: string);
    /**
     * List products with filtering, sorting, and pagination.
     */
    list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>>;
    /**
     * Get a single product by ID with optional related products.
     */
    get(id: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by slug/handle.
     */
    getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by SKU/reference.
     */
    getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Search products by query.
     */
    search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult>;
    /**
     * Get multiple products by IDs.
     */
    getMany(ids: string[]): Promise<Product[]>;
    /**
     * Get featured products.
     */
    getFeatured(limit?: number): Promise<Product[]>;
    /**
     * Get new products.
     */
    getNew(limit?: number, daysBack?: number): Promise<Product[]>;
    /**
     * Get products by category.
     */
    getByCategory(categoryId: string, options?: Omit<ListProductsOptions, "categoryId">): Promise<PaginatedResponse<Product>>;
    /**
     * Get product inventory/stock information.
     */
    getInventory(productId: string): Promise<ProductInventory>;
    /**
     * Get inventory for multiple products.
     */
    getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>>;
    /**
     * Fetch a single product without related products (internal helper).
     */
    private fetchProduct;
    /**
     * Extract facets from product list.
     */
    private getFacetsFromProducts;
}

/**
 * Medusa Cart Service
 *
 * Implements ICartService for Medusa V2 backend.
 */

/**
 * Medusa Cart Service implementation.
 *
 * @example
 * ```typescript
 * const cartService = new MedusaCartService(httpClient, "reg_123");
 * const cart = await cartService.create();
 * await cartService.addItem(cart.id, { productId: "prod_123", quantity: 2 });
 * ```
 */
declare class MedusaCartService implements ICartService {
    private readonly client;
    private readonly regionId;
    constructor(client: BaseApiClient, regionId: string);
    /**
     * Get or create a cart.
     */
    get(cartId?: string): Promise<Cart>;
    /**
     * Create a new cart.
     */
    create(regionId?: string, customerId?: string): Promise<Cart>;
    /**
     * Add item to cart.
     */
    addItem(cartId: string, input: AddToCartInput): Promise<Cart>;
    /**
     * Update cart item quantity.
     */
    updateItem(cartId: string, itemId: string, input: UpdateCartItemInput): Promise<Cart>;
    /**
     * Remove item from cart.
     */
    removeItem(cartId: string, itemId: string): Promise<Cart>;
    /**
     * Add multiple items to cart (bulk operation).
     */
    addItemsBulk(cartId: string, input: BulkAddToCartInput): Promise<BulkAddResult>;
    /**
     * Clear all items from cart.
     */
    clear(cartId: string): Promise<Cart>;
    /**
     * Apply discount code to cart.
     */
    applyDiscount(cartId: string, code: string): Promise<Cart>;
    /**
     * Remove discount from cart.
     */
    removeDiscount(cartId: string, discountId: string): Promise<Cart>;
    /**
     * Set shipping option.
     */
    setShippingOption(cartId: string, optionId: string): Promise<Cart>;
    /**
     * Get available shipping options.
     */
    getShippingOptions(cartId: string): Promise<CartShippingOption[]>;
    /**
     * Associate cart with customer.
     */
    setCustomer(cartId: string, customerId: string): Promise<Cart>;
    /**
     * Set addresses for cart.
     */
    setAddresses(cartId: string, shippingAddressId: string, billingAddressId?: string): Promise<Cart>;
    /**
     * Update cart metadata.
     */
    updateMetadata(cartId: string, metadata: Record<string, unknown>): Promise<Cart>;
    /**
     * Delete a cart.
     */
    delete(cartId: string): Promise<void>;
    /**
     * Merge guest cart into customer cart.
     */
    merge(guestCartId: string, customerCartId: string): Promise<Cart>;
}

/**
 * Product Mappers
 *
 * Transform Medusa product data to domain types.
 */

/**
 * Medusa product response type
 */
interface MedusaProduct {
    id: string;
    title: string;
    handle: string;
    description: string | null;
    subtitle: string | null;
    thumbnail: string | null;
    images?: Array<{
        url: string;
        id: string;
    }>;
    variants?: MedusaVariant[];
    collection?: MedusaCollection | null;
    collection_id: string | null;
    categories?: MedusaCategory[];
    status: "draft" | "proposed" | "published" | "rejected";
    weight: number | null;
    origin_country: string | null;
    metadata?: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}
interface MedusaVariant {
    id: string;
    title: string;
    sku: string | null;
    barcode: string | null;
    prices?: MedusaPrice[];
    inventory_quantity?: number;
    manage_inventory: boolean;
}
interface MedusaPrice {
    id: string;
    amount: number;
    currency_code: string;
    region_id?: string;
}
interface MedusaCollection {
    id: string;
    title: string;
    handle: string;
}
interface MedusaCategory {
    id: string;
    name: string;
    handle: string;
    parent_category_id: string | null;
    category_children?: MedusaCategory[];
}
/**
 * Map Medusa product to domain Product type.
 *
 * @param medusaProduct - Medusa product response
 * @param regionId - Region ID for price selection
 * @param currencyCode - Currency code for price selection
 * @returns Mapped Product
 *
 * @example
 * ```typescript
 * const product = mapMedusaProduct(medusaProduct, "reg_123", "EUR");
 * ```
 */
declare function mapMedusaProduct(medusaProduct: MedusaProduct, regionId?: string, currencyCode?: string): Product;
/**
 * Map Medusa category to domain Category type.
 */
declare function mapMedusaCategory(medusaCategory: MedusaCategory): Category;

/**
 * Cart Mappers
 *
 * Transform Medusa cart data to domain types.
 */

/**
 * Medusa cart response type
 */
interface MedusaCart {
    id: string;
    email: string | null;
    customer_id: string | null;
    region_id: string;
    currency_code: string;
    items: MedusaLineItem[];
    shipping_methods?: MedusaShippingMethod[];
    shipping_address?: MedusaAddress | null;
    billing_address?: MedusaAddress | null;
    discounts?: MedusaDiscount[];
    subtotal: number;
    shipping_total: number;
    tax_total: number;
    discount_total: number;
    total: number;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
interface MedusaLineItem {
    id: string;
    cart_id: string;
    variant_id: string;
    product_id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    quantity: number;
    unit_price: number;
    original_price?: number;
    subtotal: number;
    total: number;
    variant?: {
        id: string;
        sku: string | null;
        inventory_quantity?: number;
        product?: {
            id: string;
            title: string;
            handle: string;
        };
    };
    metadata?: Record<string, string>;
}
interface MedusaShippingMethod {
    id: string;
    shipping_option_id: string;
    price: number;
    shipping_option?: {
        id: string;
        name: string;
        amount: number;
        provider_id?: string;
    };
}
interface MedusaAddress {
    id: string;
    first_name: string | null;
    last_name: string | null;
    address_1: string | null;
    address_2: string | null;
    city: string | null;
    postal_code: string | null;
    country_code: string | null;
    phone: string | null;
}
interface MedusaDiscount {
    id: string;
    code: string;
    rule: {
        type: "fixed" | "percentage" | "free_shipping";
        value: number;
        description?: string;
    };
}
interface MedusaShippingOption {
    id: string;
    name: string;
    amount: number;
    price_type: "flat_rate" | "calculated";
    provider_id?: string;
}
/**
 * Map Medusa cart to domain Cart type.
 *
 * @param medusaCart - Medusa cart response
 * @returns Mapped Cart
 *
 * @example
 * ```typescript
 * const cart = mapMedusaCart(medusaCart);
 * ```
 */
declare function mapMedusaCart(medusaCart: MedusaCart): Cart;
/**
 * Map Medusa line item to domain CartLineItem.
 */
declare function mapMedusaLineItem(item: MedusaLineItem): CartLineItem;
/**
 * Map Medusa discount to domain CartDiscount.
 */
declare function mapMedusaDiscount(discount: MedusaDiscount): CartDiscount;
/**
 * Map Medusa cart totals to domain CartTotals.
 */
declare function mapMedusaTotals(cart: MedusaCart, items: CartLineItem[]): CartTotals;
/**
 * Map Medusa shipping options to domain CartShippingOption array.
 */
declare function mapMedusaShippingOptions(options: MedusaShippingOption[]): CartShippingOption[];

/**
 * @maison/api-medusa
 *
 * Medusa V2 adapter for the unified commerce API client.
 *
 * This package provides ICommerceClient implementation for Medusa V2 backend,
 * including support for B2B features through custom Medusa plugins.
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { createMedusaClient, registerMedusaProvider } from "@maison/api-medusa";
 * import { createApiClient, registerProvider } from "@maison/api-client";
 *
 * // Option 1: Direct creation
 * const medusaClient = createMedusaClient({
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx",
 *   enableB2B: true
 * });
 *
 * // Option 2: Register with api-client factory
 * registerMedusaProvider();
 * const client = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   publishableKey: "pk_xxx"
 * });
 *
 * // Use the client
 * const products = await client.products.list({ pageSize: 20 });
 * const cart = await client.cart.create();
 * ```
 */

/**
 * Register Medusa provider with the api-client factory.
 *
 * After calling this, you can use `createApiClient({ provider: "medusa", ... })`
 * to create Medusa clients through the unified factory.
 *
 * @example
 * ```typescript
 * import { registerMedusaProvider } from "@maison/api-medusa";
 * import { createApiClient } from "@maison/api-client";
 *
 * // Register once at app startup
 * registerMedusaProvider();
 *
 * // Now create clients using the factory
 * const client = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123"
 * });
 * ```
 */
declare function registerMedusaProvider(): void;

export { type MedusaAddress, type MedusaCart, MedusaCartService, type MedusaCategory, type MedusaCollection, MedusaCommerceClient, type MedusaConfig, type MedusaDiscount, type MedusaLineItem, type MedusaPrice, type MedusaProduct, MedusaProductService, type MedusaShippingMethod, type MedusaShippingOption, type MedusaVariant, createMedusaClient, mapMedusaCart, mapMedusaCategory, mapMedusaDiscount, mapMedusaLineItem, mapMedusaProduct, mapMedusaShippingOptions, mapMedusaTotals, registerMedusaProvider };
