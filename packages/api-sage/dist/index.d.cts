import * as _maison_api_core from '@maison/api-core';
import { ApiClientConfig, BaseApiClient, ApiAdapter, PaginatedResponse, ApiResponse } from '@maison/api-core';
import { ICommerceClient, ApiProvider, CommerceClientConfig, IProductService, ICategoryService, ICartService, IOrderService, ICustomerService, IB2BServices, ListProductsOptions, GetProductOptions, ProductWithRelated, ProductSearchResult, ProductInventory } from '@maison/api-client';
import { Product } from '@maison/types';

/**
 * Sage-specific types
 *
 * Includes types from Proconsult WebServices and simplified Sage API responses.
 */

/**
 * Sage API client configuration
 */
interface SageConfig extends ApiClientConfig {
    /** Sage company ID */
    readonly companyId: string;
    /** Sage API version */
    readonly apiVersion?: string;
    /** Currency code (default: EUR) */
    readonly currency?: string;
}
/**
 * Sage statistique article (Collection, Style, etc.)
 */
interface SageStatistiqueArticle {
    Intitule: string;
    IdStatistique: number;
    Valeur: string;
}
/**
 * Sage infos libres article
 */
interface SageInfoLibre {
    Name: string;
    Type: number;
    Size: number;
    EstCalculee: boolean;
    Value: string | number | null;
}
/**
 * Raw article from Sage/Proconsult API
 */
interface SageRawArticle {
    __type: string;
    Reference: string;
    Intitule: string;
    CodeFamille: string;
    TypeArticle: number;
    PrixAchat: number;
    PrixUnitaireNet: number;
    PrixVente: number;
    Coefficient: number;
    EstEnPrixTTTC: boolean;
    PoidsNet: number;
    PoidsBrut: number;
    UnitePoids: number;
    Garantie: number;
    Pays: string;
    IdUniteVente: number;
    TypeSuiviStock: number;
    Fictif: boolean;
    EstEnSommeil: boolean;
    Publie: boolean;
    InterdireCommande: boolean;
    ExclureReapprovisionnement: boolean;
    Langue1?: string;
    Langue2?: string;
    CodeBarres?: string;
    Photo?: string;
    IdCatalogue1: number;
    IdCatalogue2: number;
    IdCatalogue3: number;
    IdCatalogue4: number;
    Statistique1: string;
    Statistique2: string;
    Statistique3: string;
    Statistique4: string;
    Statistique5: string;
    StatistiqueArticles?: SageStatistiqueArticle[];
    InfosLibres?: SageInfoLibre[];
    DateCreation: string;
    DateModification: string;
    Createur: string;
    UtilisateurCreateur: string;
}
/**
 * Raw family/category from Sage API
 */
interface SageRawFamille {
    CodeFamille: string;
    Intitule: string;
    TypeFamille: number;
    Createur: string;
    DateModification: string;
    DateCreation: string;
    UtilisateurCreateur: string;
}
/**
 * Sage product representation (simplified)
 */
interface SageProduct {
    readonly id: string;
    readonly sku: string;
    readonly name: string;
    readonly description?: string;
    readonly price: number;
    readonly currency: string;
    readonly category?: string;
    readonly active: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
}
/**
 * Sage inventory item
 */
interface SageInventory {
    readonly productId: string;
    readonly sku: string;
    readonly quantity: number;
    readonly reservedQuantity: number;
    readonly availableQuantity: number;
    readonly warehouseId: string;
    readonly lastUpdated: string;
}
/**
 * Sage API response for products list
 */
interface SageProductsResponse {
    readonly products: readonly SageProduct[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
}
/**
 * Sage API response for articles list (Proconsult format)
 */
interface SageArticlesResponse {
    readonly articles: readonly SageRawArticle[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
}
/**
 * Sage API response for inventory
 */
interface SageInventoryResponse {
    readonly inventory: readonly SageInventory[];
    readonly lastSyncedAt: string;
}
/**
 * Sage sync result
 */
interface SageSyncResult {
    readonly synced: number;
    readonly errors: readonly string[];
    readonly timestamp: string;
}

/**
 * Sage Commerce Client configuration
 */
interface SageCommerceClientConfig extends CommerceClientConfig {
    /** Sage company ID (required) */
    companyId: string;
    /** Sage API version */
    apiVersion?: string;
    /** Default currency */
    currency?: string;
}
/**
 * Sage Commerce Client
 *
 * Implements ICommerceClient for Sage ERP integration.
 *
 * @example
 * ```typescript
 * import { SageCommerceClient } from "@maison/api-sage";
 *
 * const client = new SageCommerceClient({
 *   baseUrl: "https://sage-proxy.example.com",
 *   companyId: "COMPANY_001",
 *   authToken: "your-api-token"
 * });
 *
 * // Fetch products from Sage
 * const products = await client.products.list();
 *
 * // Get inventory for specific products
 * const inventory = await client.products.getInventoryBulk(["SKU1", "SKU2"]);
 * ```
 */
declare class SageCommerceClient implements ICommerceClient {
    readonly name = "sage";
    readonly version = "1.0.0";
    readonly provider: ApiProvider;
    readonly config: CommerceClientConfig;
    private readonly sageClient;
    private authToken;
    private b2bContext;
    readonly products: IProductService;
    readonly categories: ICategoryService;
    readonly cart: ICartService;
    readonly orders: IOrderService;
    readonly customers: ICustomerService;
    readonly b2b: IB2BServices | null;
    constructor(config: SageCommerceClientConfig);
    /**
     * Initialize the client (verify connection)
     */
    initialize(): Promise<void>;
    /**
     * Check if client is configured
     */
    isConfigured(): boolean;
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
    /**
     * Set authentication token
     */
    setAuthToken(token: string): void;
    /**
     * Clear authentication
     */
    clearAuth(): void;
    /**
     * Get current auth token
     */
    getAuthToken(): string | null;
    /**
     * Set B2B context
     *
     * @remarks
     * Sage doesn't have native B2B workflow, but we track context
     * for potential filtering/reporting purposes.
     */
    setB2BContext(companyId: string, employeeId?: string): void;
    /**
     * Clear B2B context
     */
    clearB2BContext(): void;
    /**
     * Get current B2B context
     */
    getB2BContext(): {
        companyId?: string;
        employeeId?: string;
    } | null;
    /**
     * Check if B2B is enabled
     *
     * @remarks
     * Always returns false for Sage as it doesn't support B2B workflow.
     */
    isB2BEnabled(): boolean;
    /**
     * Get underlying HTTP client
     */
    getHttpClient(): {
        get<T>(path: string, options?: Record<string, unknown>): Promise<T>;
        post<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        put<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        patch<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        delete<T>(path: string, options?: Record<string, unknown>): Promise<T>;
    };
    /**
     * Sync products from Sage (convenience method)
     *
     * @remarks
     * Triggers a full product sync from Sage ERP.
     */
    syncProducts(): Promise<{
        synced: number;
        errors: readonly string[];
    }>;
    /**
     * Update inventory (convenience method)
     *
     * @remarks
     * Updates inventory quantity in Sage for a specific product/warehouse.
     */
    updateInventory(productId: string, warehouseId: string, quantity: number): Promise<_maison_api_core.ApiResponse<SageInventory>>;
}

/**
 * Sage API client implementation
 */

/**
 * Sage API client for interacting with Sage ERP
 */
declare class SageApiClient extends BaseApiClient implements ApiAdapter {
    readonly name = "sage";
    readonly version = "1.0.0";
    private readonly companyId;
    private readonly apiVersion;
    private initialized;
    constructor(config: SageConfig);
    /**
     * Initialize the Sage client
     */
    initialize(): Promise<void>;
    /**
     * Check if the client is properly configured
     */
    isConfigured(): boolean;
    /**
     * Perform health check on Sage API
     */
    healthCheck(): Promise<boolean>;
    /**
     * Get a list of products from Sage
     */
    getProducts(options?: {
        page?: number;
        pageSize?: number;
        category?: string;
        active?: boolean;
    }): Promise<PaginatedResponse<SageProduct>>;
    /**
     * Get a single product by ID
     */
    getProduct(productId: string): Promise<ApiResponse<SageProduct>>;
    /**
     * Get inventory for all products or a specific product
     */
    getInventory(productId?: string): Promise<readonly SageInventory[]>;
    /**
     * Update inventory quantity for a product
     */
    updateInventory(productId: string, warehouseId: string, quantity: number): Promise<ApiResponse<SageInventory>>;
    /**
     * Sync products from Sage (full sync)
     */
    syncProducts(): Promise<{
        synced: number;
        errors: readonly string[];
    }>;
}

/**
 * Product mappers for Sage ERP API responses
 *
 * Maps Sage API product format to domain Product type.
 */

/**
 * Map Sage raw article (from Proconsult WebServices) to domain Product
 *
 * @param raw - Raw article from Sage API
 * @returns Domain Product object
 */
declare function mapSageArticle(raw: SageRawArticle): Product;
/**
 * Map simplified Sage product to domain Product
 */
declare function mapSageProduct(raw: SageProduct): Product;
/**
 * Map array of Sage products to domain Products
 */
declare function mapSageProducts(rawProducts: SageProduct[]): Product[];
/**
 * Map array of Sage articles to domain Products
 */
declare function mapSageArticles(rawArticles: SageRawArticle[]): Product[];

/**
 * Sage Product Service
 *
 * Implements IProductService for Sage ERP integration.
 * Provides product sync and inventory management from Sage.
 */

/**
 * Product service for Sage ERP
 *
 * @remarks
 * Sage is primarily used for:
 * - Product catalog sync from ERP
 * - Real-time inventory levels
 * - Product pricing from ERP
 *
 * Some features like search and related products are limited
 * as Sage is not a full e-commerce platform.
 */
declare class SageProductService implements IProductService {
    private readonly client;
    constructor(client: SageApiClient);
    /**
     * List products from Sage
     */
    list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>>;
    /**
     * Get a single product by ID (reference in Sage)
     */
    get(id: string, _options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get product by slug
     *
     * @remarks
     * Sage doesn't use slugs natively, so we search by reference.
     */
    getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get product by SKU (reference in Sage)
     */
    getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Search products
     *
     * @remarks
     * Sage has limited search capabilities. This implementation
     * fetches all products and filters client-side.
     */
    search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult>;
    /**
     * Get multiple products by IDs
     */
    getMany(ids: string[]): Promise<Product[]>;
    /**
     * Get featured products
     *
     * @remarks
     * Sage doesn't have a concept of featured products.
     * Returns first N products instead.
     */
    getFeatured(limit?: number): Promise<Product[]>;
    /**
     * Get new products
     *
     * @remarks
     * Returns products created within the specified days.
     */
    getNew(limit?: number, daysBack?: number): Promise<Product[]>;
    /**
     * Get products by category
     */
    getByCategory(categoryId: string, options?: Omit<ListProductsOptions, "categoryId">): Promise<PaginatedResponse<Product>>;
    /**
     * Get inventory for a product
     */
    getInventory(productId: string): Promise<ProductInventory>;
    /**
     * Get inventory for multiple products
     */
    getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>>;
}

export { SageApiClient, type SageArticlesResponse, SageCommerceClient, type SageCommerceClientConfig, type SageConfig, type SageInfoLibre, type SageInventory, type SageInventoryResponse, type SageProduct, SageProductService, type SageProductsResponse, type SageRawArticle, type SageRawFamille, type SageStatistiqueArticle, type SageSyncResult, mapSageArticle, mapSageArticles, mapSageProduct, mapSageProducts };
