import { PaginatedResponse, ApiAdapter } from '@maison/api-core';
import { ProductFilters, Product, Category, OrderStatus, Order, ShippingAddress, BillingAddress, PaymentMethod, CompanyStatus, CompanyTier, CompanySummary, Company, CreateCompanyInput, UpdateCompanyInput, CompanyAddress, EmployeeStatus, EmployeeRole, EmployeeSummary, Employee, InviteEmployeeInput, EmployeeInvitation, EmployeePermission, UpdateEmployeeInput, EmployeeActivity, Department, QuoteFilters, QuoteSummary, Quote, CreateQuoteInput, UpdateQuoteInput, QuoteMessage, QuoteAttachment, ApprovalFilters, ApprovalSummary, ApprovalRequest, ApprovalActionInput, ApprovalWorkflow, CreateApprovalWorkflowInput, UpdateApprovalWorkflowInput, ApprovalDelegation, SpendingLimitEntityType, SpendingPeriod, SpendingLimit, CreateSpendingLimitInput, UpdateSpendingLimitInput, SpendingRule, CreateSpendingRuleInput, SpendingFilters, SpendingTransaction, SpendingAdjustmentInput, SpendingReport } from '@maison/types';

/**
 * Product Service Interface
 * Defines the contract for product-related operations.
 */

/**
 * Options for listing products
 */
interface ListProductsOptions {
    /** Page number (1-indexed) */
    page?: number;
    /** Number of items per page */
    pageSize?: number;
    /** Category ID to filter by */
    categoryId?: string;
    /** Collection to filter by */
    collection?: string;
    /** Search query */
    search?: string;
    /** Minimum price filter */
    minPrice?: number;
    /** Maximum price filter */
    maxPrice?: number;
    /** Materials to filter by */
    materials?: string[];
    /** Sort field */
    sortBy?: "price" | "name" | "createdAt" | "popularity";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
    /** Only include available products */
    availableOnly?: boolean;
    /** Include featured products first */
    featuredFirst?: boolean;
    /** Additional filters specific to the provider */
    filters?: ProductFilters;
}
/**
 * Options for getting a single product
 */
interface GetProductOptions {
    /** Include related products */
    includeRelated?: boolean;
    /** Number of related products to include */
    relatedLimit?: number;
    /** Include category details */
    includeCategory?: boolean;
}
/**
 * Product with related items
 */
interface ProductWithRelated extends Product {
    /** Related products */
    relatedProducts?: Product[];
}
/**
 * Product search result
 */
interface ProductSearchResult {
    /** Matching products */
    products: Product[];
    /** Total matches */
    total: number;
    /** Search suggestions */
    suggestions?: string[];
    /** Facets for filtering */
    facets?: ProductFacets;
}
/**
 * Facets for product filtering
 */
interface ProductFacets {
    /** Available categories with counts */
    categories?: Array<{
        id: string;
        name: string;
        count: number;
    }>;
    /** Available collections with counts */
    collections?: Array<{
        value: string;
        count: number;
    }>;
    /** Available materials with counts */
    materials?: Array<{
        value: string;
        count: number;
    }>;
    /** Price range */
    priceRange?: {
        min: number;
        max: number;
    };
}
/**
 * Product inventory info
 */
interface ProductInventory {
    productId: string;
    sku: string;
    available: number;
    reserved: number;
    incoming?: number;
    incomingDate?: string;
}
/**
 * Interface for product-related operations.
 * All adapters must implement this interface.
 */
interface IProductService {
    /**
     * List products with optional filtering and pagination.
     *
     * @param options - Listing options
     * @returns Paginated list of products
     *
     * @example
     * ```typescript
     * const products = await api.products.list({
     *   categoryId: "cat_123",
     *   page: 1,
     *   pageSize: 20,
     *   sortBy: "price",
     *   sortOrder: "asc"
     * });
     * ```
     */
    list(options?: ListProductsOptions): Promise<PaginatedResponse<Product>>;
    /**
     * Get a single product by ID.
     *
     * @param id - Product ID
     * @param options - Additional options
     * @returns Product details
     *
     * @example
     * ```typescript
     * const product = await api.products.get("prod_123", {
     *   includeRelated: true,
     *   relatedLimit: 4
     * });
     * ```
     */
    get(id: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by slug.
     *
     * @param slug - Product slug
     * @param options - Additional options
     * @returns Product details
     */
    getBySlug(slug: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Get a product by SKU/reference.
     *
     * @param sku - Product SKU or reference
     * @param options - Additional options
     * @returns Product details
     */
    getBySku(sku: string, options?: GetProductOptions): Promise<ProductWithRelated>;
    /**
     * Search products by query.
     *
     * @param query - Search query
     * @param options - Search options
     * @returns Search results with facets
     *
     * @example
     * ```typescript
     * const results = await api.products.search("gold ring", {
     *   pageSize: 20,
     *   filters: { minPrice: 100 }
     * });
     * ```
     */
    search(query: string, options?: ListProductsOptions): Promise<ProductSearchResult>;
    /**
     * Get multiple products by IDs.
     *
     * @param ids - Array of product IDs
     * @returns Array of products (in same order as IDs)
     */
    getMany(ids: string[]): Promise<Product[]>;
    /**
     * Get featured products.
     *
     * @param limit - Maximum number to return
     * @returns Array of featured products
     */
    getFeatured(limit?: number): Promise<Product[]>;
    /**
     * Get new products.
     *
     * @param limit - Maximum number to return
     * @param daysBack - Consider products new within this many days
     * @returns Array of new products
     */
    getNew(limit?: number, daysBack?: number): Promise<Product[]>;
    /**
     * Get products by category.
     *
     * @param categoryId - Category ID
     * @param options - Listing options
     * @returns Paginated list of products
     */
    getByCategory(categoryId: string, options?: Omit<ListProductsOptions, "categoryId">): Promise<PaginatedResponse<Product>>;
    /**
     * Get inventory information for a product.
     *
     * @param productId - Product ID
     * @returns Inventory information
     */
    getInventory(productId: string): Promise<ProductInventory>;
    /**
     * Get inventory for multiple products.
     *
     * @param productIds - Array of product IDs
     * @returns Map of product ID to inventory
     */
    getInventoryBulk(productIds: string[]): Promise<Map<string, ProductInventory>>;
}

/**
 * Category Service Interface
 * Defines the contract for category-related operations.
 */

/**
 * Extended category with hierarchy information
 */
interface CategoryWithHierarchy extends Category {
    /** Parent category */
    parent?: Category;
    /** Child categories */
    children?: Category[];
    /** Full path from root */
    path?: Category[];
    /** Breadcrumb trail */
    breadcrumbs?: Array<{
        id: string;
        name: string;
        slug: string;
    }>;
}
/**
 * Category tree node
 */
interface CategoryTreeNode extends Category {
    /** Nested child categories */
    children: CategoryTreeNode[];
    /** Depth level in tree (0 = root) */
    level: number;
}
/**
 * Options for listing categories
 */
interface ListCategoriesOptions {
    /** Parent category ID (null for root categories) */
    parentId?: string | null;
    /** Include categories with no products */
    includeEmpty?: boolean;
    /** Maximum depth to include children */
    depth?: number;
    /** Include product counts */
    includeProductCount?: boolean;
}
/**
 * Interface for category-related operations.
 * All adapters must implement this interface.
 */
interface ICategoryService {
    /**
     * List all categories.
     *
     * @param options - Listing options
     * @returns Array of categories
     *
     * @example
     * ```typescript
     * const categories = await api.categories.list({
     *   includeEmpty: false,
     *   includeProductCount: true
     * });
     * ```
     */
    list(options?: ListCategoriesOptions): Promise<Category[]>;
    /**
     * Get a single category by ID.
     *
     * @param id - Category ID
     * @returns Category details with hierarchy
     */
    get(id: string): Promise<CategoryWithHierarchy>;
    /**
     * Get a category by slug.
     *
     * @param slug - Category slug
     * @returns Category details with hierarchy
     */
    getBySlug(slug: string): Promise<CategoryWithHierarchy>;
    /**
     * Get the full category tree.
     *
     * @param options - Tree options
     * @returns Root categories with nested children
     *
     * @example
     * ```typescript
     * const tree = await api.categories.getTree({ depth: 3 });
     * // Returns nested structure: [{ id, name, children: [...] }]
     * ```
     */
    getTree(options?: ListCategoriesOptions): Promise<CategoryTreeNode[]>;
    /**
     * Get root level categories.
     *
     * @returns Array of root categories
     */
    getRoots(): Promise<Category[]>;
    /**
     * Get child categories of a parent.
     *
     * @param parentId - Parent category ID
     * @returns Array of child categories
     */
    getChildren(parentId: string): Promise<Category[]>;
    /**
     * Get the breadcrumb path for a category.
     *
     * @param categoryId - Category ID
     * @returns Array of categories from root to target
     */
    getBreadcrumbs(categoryId: string): Promise<Category[]>;
    /**
     * Get multiple categories by IDs.
     *
     * @param ids - Array of category IDs
     * @returns Array of categories
     */
    getMany(ids: string[]): Promise<Category[]>;
}

/**
 * Cart Service Interface
 * Defines the contract for cart-related operations.
 */
/**
 * Cart line item
 */
interface CartLineItem {
    /** Unique line item ID */
    id: string;
    /** Product ID */
    productId: string;
    /** Product variant ID (if applicable) */
    variantId?: string;
    /** Product SKU */
    sku: string;
    /** Product name */
    name: string;
    /** Product image URL */
    imageUrl?: string;
    /** Unit price */
    unitPrice: number;
    /** Quantity */
    quantity: number;
    /** Line total (unitPrice * quantity) */
    lineTotal: number;
    /** Original price (before discounts) */
    originalPrice?: number;
    /** Discount amount per unit */
    discountAmount?: number;
    /** Whether item is available */
    isAvailable: boolean;
    /** Available stock quantity */
    availableStock?: number;
    /** Custom attributes */
    attributes?: Record<string, string>;
    /** Product reference for navigation */
    productSlug?: string;
}
/**
 * Cart discount
 */
interface CartDiscount {
    /** Discount ID */
    id: string;
    /** Discount code (if from coupon) */
    code?: string;
    /** Discount type */
    type: "percentage" | "fixed" | "free_shipping";
    /** Discount value */
    value: number;
    /** Calculated discount amount */
    amount: number;
    /** Description */
    description?: string;
}
/**
 * Shipping option for cart
 */
interface CartShippingOption {
    /** Option ID */
    id: string;
    /** Carrier name */
    carrier: string;
    /** Service name */
    name: string;
    /** Shipping cost */
    price: number;
    /** Estimated delivery days */
    estimatedDays?: number;
    /** Estimated delivery date */
    estimatedDeliveryDate?: string;
}
/**
 * Cart totals breakdown
 */
interface CartTotals {
    /** Subtotal (sum of line totals) */
    subtotal: number;
    /** Total discount amount */
    discount: number;
    /** Shipping cost */
    shipping: number;
    /** Tax amount */
    tax: number;
    /** Grand total */
    total: number;
    /** Currency code */
    currency: string;
    /** Number of items */
    itemCount: number;
    /** Number of unique items */
    uniqueItemCount: number;
}
/**
 * Full cart object
 */
interface Cart {
    /** Cart ID */
    id: string;
    /** Customer ID (if logged in) */
    customerId?: string;
    /** Company ID (for B2B) */
    companyId?: string;
    /** Region/market ID */
    regionId?: string;
    /** Line items */
    items: CartLineItem[];
    /** Applied discounts */
    discounts: CartDiscount[];
    /** Selected shipping option */
    shippingOption?: CartShippingOption;
    /** Available shipping options */
    availableShippingOptions?: CartShippingOption[];
    /** Cart totals */
    totals: CartTotals;
    /** Shipping address ID */
    shippingAddressId?: string;
    /** Billing address ID */
    billingAddressId?: string;
    /** Cart metadata */
    metadata?: Record<string, unknown>;
    /** ISO timestamp of creation */
    createdAt: string;
    /** ISO timestamp of last update */
    updatedAt: string;
    /** Cart expiry timestamp */
    expiresAt?: string;
}
/**
 * Input for adding item to cart
 */
interface AddToCartInput {
    /** Product ID */
    productId: string;
    /** Variant ID */
    variantId?: string;
    /** Quantity to add */
    quantity: number;
    /** Custom attributes */
    attributes?: Record<string, string>;
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Input for updating cart item
 */
interface UpdateCartItemInput {
    /** New quantity */
    quantity: number;
    /** Updated attributes */
    attributes?: Record<string, string>;
}
/**
 * Input for bulk adding items
 */
interface BulkAddToCartInput {
    /** Items to add */
    items: AddToCartInput[];
    /** Whether to replace existing cart */
    replaceExisting?: boolean;
}
/**
 * Result of bulk add operation
 */
interface BulkAddResult {
    /** Successfully added items */
    added: CartLineItem[];
    /** Failed items with reasons */
    failed: Array<{
        input: AddToCartInput;
        reason: string;
    }>;
    /** Updated cart */
    cart: Cart;
}
/**
 * Interface for cart-related operations.
 * All adapters must implement this interface.
 */
interface ICartService {
    /**
     * Get or create a cart.
     *
     * @param cartId - Existing cart ID (optional)
     * @returns Cart object
     *
     * @example
     * ```typescript
     * // Get existing cart
     * const cart = await api.cart.get("cart_123");
     *
     * // Create new cart
     * const newCart = await api.cart.get();
     * ```
     */
    get(cartId?: string): Promise<Cart>;
    /**
     * Create a new cart.
     *
     * @param regionId - Region/market ID
     * @param customerId - Customer ID (optional)
     * @returns New cart object
     */
    create(regionId?: string, customerId?: string): Promise<Cart>;
    /**
     * Add an item to the cart.
     *
     * @param cartId - Cart ID
     * @param input - Item to add
     * @returns Updated cart
     *
     * @example
     * ```typescript
     * const cart = await api.cart.addItem("cart_123", {
     *   productId: "prod_456",
     *   quantity: 2
     * });
     * ```
     */
    addItem(cartId: string, input: AddToCartInput): Promise<Cart>;
    /**
     * Update a cart item.
     *
     * @param cartId - Cart ID
     * @param itemId - Line item ID
     * @param input - Update data
     * @returns Updated cart
     */
    updateItem(cartId: string, itemId: string, input: UpdateCartItemInput): Promise<Cart>;
    /**
     * Remove an item from the cart.
     *
     * @param cartId - Cart ID
     * @param itemId - Line item ID
     * @returns Updated cart
     */
    removeItem(cartId: string, itemId: string): Promise<Cart>;
    /**
     * Add multiple items to cart (bulk operation).
     *
     * @param cartId - Cart ID
     * @param input - Bulk add input
     * @returns Result with successes and failures
     *
     * @example
     * ```typescript
     * const result = await api.cart.addItemsBulk("cart_123", {
     *   items: [
     *     { productId: "prod_1", quantity: 5 },
     *     { productId: "prod_2", quantity: 10 },
     *   ]
     * });
     * ```
     */
    addItemsBulk(cartId: string, input: BulkAddToCartInput): Promise<BulkAddResult>;
    /**
     * Clear all items from cart.
     *
     * @param cartId - Cart ID
     * @returns Empty cart
     */
    clear(cartId: string): Promise<Cart>;
    /**
     * Apply a discount code.
     *
     * @param cartId - Cart ID
     * @param code - Discount code
     * @returns Updated cart
     */
    applyDiscount(cartId: string, code: string): Promise<Cart>;
    /**
     * Remove a discount.
     *
     * @param cartId - Cart ID
     * @param discountId - Discount ID
     * @returns Updated cart
     */
    removeDiscount(cartId: string, discountId: string): Promise<Cart>;
    /**
     * Set shipping option.
     *
     * @param cartId - Cart ID
     * @param optionId - Shipping option ID
     * @returns Updated cart
     */
    setShippingOption(cartId: string, optionId: string): Promise<Cart>;
    /**
     * Get available shipping options for cart.
     *
     * @param cartId - Cart ID
     * @returns Array of shipping options
     */
    getShippingOptions(cartId: string): Promise<CartShippingOption[]>;
    /**
     * Associate cart with customer.
     *
     * @param cartId - Cart ID
     * @param customerId - Customer ID
     * @returns Updated cart
     */
    setCustomer(cartId: string, customerId: string): Promise<Cart>;
    /**
     * Set addresses for cart.
     *
     * @param cartId - Cart ID
     * @param shippingAddressId - Shipping address ID
     * @param billingAddressId - Billing address ID (optional, defaults to shipping)
     * @returns Updated cart
     */
    setAddresses(cartId: string, shippingAddressId: string, billingAddressId?: string): Promise<Cart>;
    /**
     * Update cart metadata.
     *
     * @param cartId - Cart ID
     * @param metadata - Metadata to merge
     * @returns Updated cart
     */
    updateMetadata(cartId: string, metadata: Record<string, unknown>): Promise<Cart>;
    /**
     * Delete a cart.
     *
     * @param cartId - Cart ID
     */
    delete(cartId: string): Promise<void>;
    /**
     * Merge guest cart into customer cart.
     *
     * @param guestCartId - Guest cart ID
     * @param customerCartId - Customer cart ID
     * @returns Merged cart
     */
    merge(guestCartId: string, customerCartId: string): Promise<Cart>;
}

/**
 * Order Service Interface
 * Defines the contract for order-related operations.
 */

/**
 * Options for listing orders
 */
interface ListOrdersOptions {
    /** Page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
    /** Filter by status */
    status?: OrderStatus | OrderStatus[];
    /** Filter by customer ID */
    customerId?: string;
    /** Filter by company ID (B2B) */
    companyId?: string;
    /** Filter orders after this date */
    createdAfter?: string;
    /** Filter orders before this date */
    createdBefore?: string;
    /** Sort field */
    sortBy?: "createdAt" | "updatedAt" | "total" | "orderNumber";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
    /** Search by order number or product name */
    search?: string;
}
/**
 * Input for creating an order from cart
 */
interface CreateOrderInput {
    /** Cart ID to convert */
    cartId: string;
    /** Shipping address (required if not on cart) */
    shippingAddress?: ShippingAddress;
    /** Billing address (defaults to shipping) */
    billingAddress?: BillingAddress;
    /** Payment method */
    paymentMethod?: PaymentMethod;
    /** Order notes */
    notes?: string;
    /** PO number (B2B) */
    purchaseOrderNumber?: string;
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Input for creating a direct order (without cart)
 */
interface CreateDirectOrderInput {
    /** Order items */
    items: Array<{
        productId: string;
        variantId?: string;
        quantity: number;
        unitPrice?: number;
    }>;
    /** Customer ID */
    customerId?: string;
    /** Company ID (B2B) */
    companyId?: string;
    /** Shipping address */
    shippingAddress: ShippingAddress;
    /** Billing address */
    billingAddress?: BillingAddress;
    /** Payment method */
    paymentMethod?: PaymentMethod;
    /** Shipping option ID */
    shippingOptionId?: string;
    /** Discount codes */
    discountCodes?: string[];
    /** Notes */
    notes?: string;
    /** PO number */
    purchaseOrderNumber?: string;
    /** Metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Order with additional computed fields
 */
interface OrderWithDetails extends Order {
    /** Customer name */
    customerName?: string;
    /** Customer email */
    customerEmail?: string;
    /** Company name (B2B) */
    companyName?: string;
    /** Tracking URL */
    trackingUrl?: string;
    /** Invoice URL */
    invoiceUrl?: string;
    /** Can be cancelled */
    canCancel: boolean;
    /** Can be modified */
    canModify: boolean;
    /** Time since creation */
    age?: string;
}
/**
 * Order fulfillment information
 */
interface OrderFulfillment {
    id: string;
    orderId: string;
    status: "pending" | "packed" | "shipped" | "delivered" | "failed";
    items: Array<{
        orderItemId: string;
        quantity: number;
    }>;
    trackingNumber?: string;
    trackingUrl?: string;
    carrier?: string;
    shippedAt?: string;
    deliveredAt?: string;
    estimatedDelivery?: string;
}
/**
 * Order refund information
 */
interface OrderRefund {
    id: string;
    orderId: string;
    amount: number;
    reason: string;
    status: "pending" | "processing" | "completed" | "failed";
    items?: Array<{
        orderItemId: string;
        quantity: number;
        amount: number;
    }>;
    createdAt: string;
    processedAt?: string;
}
/**
 * Interface for order-related operations.
 * All adapters must implement this interface.
 */
interface IOrderService {
    /**
     * List orders with optional filtering.
     *
     * @param options - Listing options
     * @returns Paginated list of orders
     *
     * @example
     * ```typescript
     * const orders = await api.orders.list({
     *   status: "shipped",
     *   pageSize: 20
     * });
     * ```
     */
    list(options?: ListOrdersOptions): Promise<PaginatedResponse<Order>>;
    /**
     * Get a single order by ID.
     *
     * @param id - Order ID
     * @returns Order details
     */
    get(id: string): Promise<OrderWithDetails>;
    /**
     * Get order by order number.
     *
     * @param orderNumber - Human-readable order number
     * @returns Order details
     */
    getByNumber(orderNumber: string): Promise<OrderWithDetails>;
    /**
     * Create an order from a cart.
     *
     * @param input - Order creation input
     * @returns Created order
     *
     * @example
     * ```typescript
     * const order = await api.orders.create({
     *   cartId: "cart_123",
     *   notes: "Please leave at door"
     * });
     * ```
     */
    create(input: CreateOrderInput): Promise<Order>;
    /**
     * Create an order directly (without cart).
     *
     * @param input - Direct order input
     * @returns Created order
     */
    createDirect(input: CreateDirectOrderInput): Promise<Order>;
    /**
     * Cancel an order.
     *
     * @param orderId - Order ID
     * @param reason - Cancellation reason
     * @returns Updated order
     */
    cancel(orderId: string, reason?: string): Promise<Order>;
    /**
     * Update order notes.
     *
     * @param orderId - Order ID
     * @param notes - New notes
     * @returns Updated order
     */
    updateNotes(orderId: string, notes: string): Promise<Order>;
    /**
     * Get fulfillments for an order.
     *
     * @param orderId - Order ID
     * @returns Array of fulfillments
     */
    getFulfillments(orderId: string): Promise<OrderFulfillment[]>;
    /**
     * Get refunds for an order.
     *
     * @param orderId - Order ID
     * @returns Array of refunds
     */
    getRefunds(orderId: string): Promise<OrderRefund[]>;
    /**
     * Request a refund.
     *
     * @param orderId - Order ID
     * @param items - Items to refund
     * @param reason - Refund reason
     * @returns Created refund request
     */
    requestRefund(orderId: string, items: Array<{
        orderItemId: string;
        quantity: number;
    }>, reason: string): Promise<OrderRefund>;
    /**
     * Get orders for a customer.
     *
     * @param customerId - Customer ID
     * @param options - Listing options
     * @returns Paginated orders
     */
    getCustomerOrders(customerId: string, options?: Omit<ListOrdersOptions, "customerId">): Promise<PaginatedResponse<Order>>;
    /**
     * Get orders for a company (B2B).
     *
     * @param companyId - Company ID
     * @param options - Listing options
     * @returns Paginated orders
     */
    getCompanyOrders(companyId: string, options?: Omit<ListOrdersOptions, "companyId">): Promise<PaginatedResponse<Order>>;
    /**
     * Reorder (create new order from existing order).
     *
     * @param orderId - Original order ID
     * @returns New cart with items from order
     */
    reorder(orderId: string): Promise<Cart>;
    /**
     * Get order invoice PDF URL.
     *
     * @param orderId - Order ID
     * @returns Invoice download URL
     */
    getInvoiceUrl(orderId: string): Promise<string>;
    /**
     * Track order shipment.
     *
     * @param orderId - Order ID
     * @returns Tracking information
     */
    track(orderId: string): Promise<{
        status: string;
        carrier?: string;
        trackingNumber?: string;
        trackingUrl?: string;
        estimatedDelivery?: string;
        events?: Array<{
            status: string;
            description: string;
            location?: string;
            timestamp: string;
        }>;
    }>;
}

/**
 * Customer Service Interface
 * Defines the contract for customer-related operations.
 */

/**
 * Customer profile
 */
interface Customer {
    /** Unique identifier */
    id: string;
    /** Email address */
    email: string;
    /** First name */
    firstName: string;
    /** Last name */
    lastName: string;
    /** Full name */
    fullName: string;
    /** Phone number */
    phone?: string;
    /** Avatar URL */
    avatarUrl?: string;
    /** Date of birth */
    dateOfBirth?: string;
    /** Preferred language */
    language?: string;
    /** Marketing opt-in */
    acceptsMarketing: boolean;
    /** Company ID (for B2B) */
    companyId?: string;
    /** Metadata */
    metadata?: Record<string, unknown>;
    /** Account creation date */
    createdAt: string;
    /** Last update date */
    updatedAt: string;
    /** Last order date */
    lastOrderAt?: string;
    /** Total orders count */
    ordersCount?: number;
    /** Total spent */
    totalSpent?: number;
}
/**
 * Customer address (shipping or billing)
 */
interface CustomerAddress extends ShippingAddress {
    /** Address ID */
    id: string;
    /** Customer ID */
    customerId: string;
    /** Address type */
    type: "shipping" | "billing" | "both";
    /** Address label (e.g., "Home", "Work") */
    label?: string;
    /** Whether this is the default address */
    isDefault: boolean;
    /** Company name (for billing) */
    companyName?: string;
    /** VAT number (for billing) */
    vatNumber?: string;
    /** Creation date */
    createdAt: string;
    /** Last update */
    updatedAt: string;
}
/**
 * Input for creating/updating a customer
 */
interface CustomerInput {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    dateOfBirth?: string;
    language?: string;
    acceptsMarketing?: boolean;
    metadata?: Record<string, unknown>;
}
/**
 * Input for creating/updating an address
 */
interface AddressInput {
    type?: "shipping" | "billing" | "both";
    label?: string;
    isDefault?: boolean;
    firstName: string;
    lastName: string;
    address: string;
    addressLine2?: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
    companyName?: string;
    vatNumber?: string;
}
/**
 * Customer authentication result
 */
interface AuthResult {
    /** Authenticated customer */
    customer: Customer;
    /** Access token */
    accessToken: string;
    /** Refresh token */
    refreshToken?: string;
    /** Token expiry timestamp */
    expiresAt: string;
}
/**
 * Password reset request result
 */
interface PasswordResetResult {
    /** Whether reset was requested successfully */
    success: boolean;
    /** Message to display */
    message: string;
}
/**
 * Interface for customer-related operations.
 * All adapters must implement this interface.
 */
interface ICustomerService {
    /**
     * Get the current authenticated customer.
     *
     * @returns Current customer profile
     */
    getCurrent(): Promise<Customer>;
    /**
     * Get a customer by ID.
     *
     * @param id - Customer ID
     * @returns Customer profile
     */
    get(id: string): Promise<Customer>;
    /**
     * Get a customer by email.
     *
     * @param email - Customer email
     * @returns Customer profile
     */
    getByEmail(email: string): Promise<Customer>;
    /**
     * Update customer profile.
     *
     * @param customerId - Customer ID
     * @param input - Update data
     * @returns Updated customer
     *
     * @example
     * ```typescript
     * const customer = await api.customers.update("cust_123", {
     *   firstName: "John",
     *   acceptsMarketing: true
     * });
     * ```
     */
    update(customerId: string, input: CustomerInput): Promise<Customer>;
    /**
     * Register a new customer.
     *
     * @param email - Email address
     * @param password - Password
     * @param profile - Optional profile data
     * @returns Auth result with token
     *
     * @example
     * ```typescript
     * const result = await api.customers.register(
     *   "john@example.com",
     *   "securePassword123",
     *   { firstName: "John", lastName: "Doe" }
     * );
     * ```
     */
    register(email: string, password: string, profile?: Omit<CustomerInput, "email">): Promise<AuthResult>;
    /**
     * Authenticate a customer.
     *
     * @param email - Email address
     * @param password - Password
     * @returns Auth result with token
     */
    login(email: string, password: string): Promise<AuthResult>;
    /**
     * Logout the current customer.
     */
    logout(): Promise<void>;
    /**
     * Refresh authentication token.
     *
     * @param refreshToken - Refresh token
     * @returns New auth result
     */
    refreshToken(refreshToken: string): Promise<AuthResult>;
    /**
     * Request a password reset.
     *
     * @param email - Customer email
     * @returns Reset request result
     */
    requestPasswordReset(email: string): Promise<PasswordResetResult>;
    /**
     * Reset password with token.
     *
     * @param token - Reset token
     * @param newPassword - New password
     * @returns Result
     */
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    /**
     * Change password (authenticated).
     *
     * @param currentPassword - Current password
     * @param newPassword - New password
     * @returns Result
     */
    changePassword(currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    /**
     * List customer addresses.
     *
     * @param customerId - Customer ID
     * @returns Array of addresses
     */
    listAddresses(customerId: string): Promise<CustomerAddress[]>;
    /**
     * Get a specific address.
     *
     * @param customerId - Customer ID
     * @param addressId - Address ID
     * @returns Address
     */
    getAddress(customerId: string, addressId: string): Promise<CustomerAddress>;
    /**
     * Add a new address.
     *
     * @param customerId - Customer ID
     * @param input - Address data
     * @returns Created address
     *
     * @example
     * ```typescript
     * const address = await api.customers.addAddress("cust_123", {
     *   type: "shipping",
     *   label: "Home",
     *   firstName: "John",
     *   lastName: "Doe",
     *   address: "123 Main St",
     *   city: "Paris",
     *   postalCode: "75001",
     *   country: "FR",
     *   isDefault: true
     * });
     * ```
     */
    addAddress(customerId: string, input: AddressInput): Promise<CustomerAddress>;
    /**
     * Update an address.
     *
     * @param customerId - Customer ID
     * @param addressId - Address ID
     * @param input - Update data
     * @returns Updated address
     */
    updateAddress(customerId: string, addressId: string, input: Partial<AddressInput>): Promise<CustomerAddress>;
    /**
     * Delete an address.
     *
     * @param customerId - Customer ID
     * @param addressId - Address ID
     */
    deleteAddress(customerId: string, addressId: string): Promise<void>;
    /**
     * Set default address.
     *
     * @param customerId - Customer ID
     * @param addressId - Address ID
     * @param type - Address type to set as default
     * @returns Updated address
     */
    setDefaultAddress(customerId: string, addressId: string, type: "shipping" | "billing"): Promise<CustomerAddress>;
    /**
     * Get default shipping address.
     *
     * @param customerId - Customer ID
     * @returns Default shipping address or null
     */
    getDefaultShippingAddress(customerId: string): Promise<CustomerAddress | null>;
    /**
     * Get default billing address.
     *
     * @param customerId - Customer ID
     * @returns Default billing address or null
     */
    getDefaultBillingAddress(customerId: string): Promise<CustomerAddress | null>;
    /**
     * Delete customer account.
     *
     * @param customerId - Customer ID
     */
    delete(customerId: string): Promise<void>;
}

/**
 * B2B Company Service Interface
 * Defines the contract for company-related operations in B2B context.
 */

/**
 * Options for listing companies
 */
interface ListCompaniesOptions {
    /** Page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
    /** Filter by status */
    status?: CompanyStatus | CompanyStatus[];
    /** Filter by tier */
    tier?: CompanyTier | CompanyTier[];
    /** Filter by account manager */
    accountManagerId?: string;
    /** Search by name, email, or tax ID */
    search?: string;
    /** Sort field */
    sortBy?: "name" | "createdAt" | "lastOrderAt" | "creditAvailable";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
    /** Filter by tags */
    tags?: string[];
}
/**
 * Company registration request
 */
interface CompanyRegistrationRequest {
    /** Company details */
    company: CreateCompanyInput;
    /** Admin user details */
    adminUser: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
        jobTitle?: string;
    };
    /** Password for admin user */
    password: string;
}
/**
 * Company registration result
 */
interface CompanyRegistrationResult {
    /** Created company */
    company: Company;
    /** Admin employee ID */
    adminEmployeeId: string;
    /** Whether approval is required */
    requiresApproval: boolean;
    /** Message to display */
    message: string;
}
/**
 * Credit adjustment input
 */
interface CreditAdjustmentInput {
    /** Amount to adjust (positive = add, negative = subtract) */
    amount: number;
    /** Reason for adjustment */
    reason: string;
    /** Reference (e.g., order ID, invoice ID) */
    reference?: string;
}
/**
 * Credit history entry
 */
interface CreditHistoryEntry {
    id: string;
    companyId: string;
    type: "order" | "payment" | "adjustment" | "refund";
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reference?: string;
    description: string;
    createdById?: string;
    createdByName?: string;
    createdAt: string;
}
/**
 * Interface for B2B company operations.
 * All adapters must implement this interface.
 */
interface ICompanyService {
    /**
     * List companies with optional filtering.
     *
     * @param options - Listing options
     * @returns Paginated list of companies
     *
     * @example
     * ```typescript
     * const companies = await api.b2b.companies.list({
     *   status: "active",
     *   tier: ["premium", "enterprise"],
     *   pageSize: 20
     * });
     * ```
     */
    list(options?: ListCompaniesOptions): Promise<PaginatedResponse<CompanySummary>>;
    /**
     * Get a company by ID.
     *
     * @param id - Company ID
     * @returns Full company details
     */
    get(id: string): Promise<Company>;
    /**
     * Get company by slug.
     *
     * @param slug - Company slug
     * @returns Full company details
     */
    getBySlug(slug: string): Promise<Company>;
    /**
     * Get the current user's company.
     *
     * @returns Current company or null
     */
    getCurrent(): Promise<Company | null>;
    /**
     * Register a new company.
     *
     * @param request - Registration request
     * @returns Registration result
     *
     * @example
     * ```typescript
     * const result = await api.b2b.companies.register({
     *   company: {
     *     name: "Acme Inc",
     *     email: "contact@acme.com",
     *     taxId: "FR12345678901"
     *   },
     *   adminUser: {
     *     email: "admin@acme.com",
     *     firstName: "John",
     *     lastName: "Doe"
     *   },
     *   password: "securePassword123"
     * });
     * ```
     */
    register(request: CompanyRegistrationRequest): Promise<CompanyRegistrationResult>;
    /**
     * Update a company.
     *
     * @param id - Company ID
     * @param input - Update data
     * @returns Updated company
     */
    update(id: string, input: UpdateCompanyInput): Promise<Company>;
    /**
     * Update company status.
     *
     * @param id - Company ID
     * @param status - New status
     * @param reason - Reason for status change
     * @returns Updated company
     */
    updateStatus(id: string, status: CompanyStatus, reason?: string): Promise<Company>;
    /**
     * Update company tier.
     *
     * @param id - Company ID
     * @param tier - New tier
     * @returns Updated company
     */
    updateTier(id: string, tier: CompanyTier): Promise<Company>;
    /**
     * List company addresses.
     *
     * @param companyId - Company ID
     * @returns Array of addresses
     */
    listAddresses(companyId: string): Promise<CompanyAddress[]>;
    /**
     * Add a company address.
     *
     * @param companyId - Company ID
     * @param address - Address data
     * @returns Created address
     */
    addAddress(companyId: string, address: Omit<CompanyAddress, "id" | "createdAt" | "updatedAt" | "isVerified">): Promise<CompanyAddress>;
    /**
     * Update a company address.
     *
     * @param companyId - Company ID
     * @param addressId - Address ID
     * @param address - Update data
     * @returns Updated address
     */
    updateAddress(companyId: string, addressId: string, address: Partial<Omit<CompanyAddress, "id" | "createdAt" | "updatedAt">>): Promise<CompanyAddress>;
    /**
     * Delete a company address.
     *
     * @param companyId - Company ID
     * @param addressId - Address ID
     */
    deleteAddress(companyId: string, addressId: string): Promise<void>;
    /**
     * Set default address.
     *
     * @param companyId - Company ID
     * @param addressId - Address ID
     * @param type - Address type
     * @returns Updated address
     */
    setDefaultAddress(companyId: string, addressId: string, type: "billing" | "shipping"): Promise<CompanyAddress>;
    /**
     * Get company credit information.
     *
     * @param companyId - Company ID
     * @returns Credit info
     */
    getCreditInfo(companyId: string): Promise<{
        creditLimit: number;
        creditUsed: number;
        creditAvailable: number;
        currency: string;
    }>;
    /**
     * Adjust company credit.
     *
     * @param companyId - Company ID
     * @param input - Adjustment input
     * @returns Updated credit info
     */
    adjustCredit(companyId: string, input: CreditAdjustmentInput): Promise<{
        creditLimit: number;
        creditUsed: number;
        creditAvailable: number;
    }>;
    /**
     * Get credit history.
     *
     * @param companyId - Company ID
     * @param options - Pagination options
     * @returns Paginated credit history
     */
    getCreditHistory(companyId: string, options?: {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<CreditHistoryEntry>>;
    /**
     * Update credit limit.
     *
     * @param companyId - Company ID
     * @param newLimit - New credit limit
     * @param reason - Reason for change
     * @returns Updated company
     */
    updateCreditLimit(companyId: string, newLimit: number, reason?: string): Promise<Company>;
    /**
     * Add tags to company.
     *
     * @param companyId - Company ID
     * @param tags - Tags to add
     * @returns Updated company
     */
    addTags(companyId: string, tags: string[]): Promise<Company>;
    /**
     * Remove tags from company.
     *
     * @param companyId - Company ID
     * @param tags - Tags to remove
     * @returns Updated company
     */
    removeTags(companyId: string, tags: string[]): Promise<Company>;
    /**
     * Delete a company.
     *
     * @param id - Company ID
     */
    delete(id: string): Promise<void>;
}

/**
 * B2B Employee Service Interface
 * Defines the contract for employee-related operations in B2B context.
 */

/**
 * Options for listing employees
 */
interface ListEmployeesOptions {
    /** Page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
    /** Filter by company ID */
    companyId?: string;
    /** Filter by status */
    status?: EmployeeStatus | EmployeeStatus[];
    /** Filter by role */
    role?: EmployeeRole | EmployeeRole[];
    /** Filter by department */
    departmentId?: string;
    /** Filter approvers only */
    isApprover?: boolean;
    /** Search by name or email */
    search?: string;
    /** Sort field */
    sortBy?: "fullName" | "email" | "role" | "createdAt" | "lastLoginAt";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
}
/**
 * Employee login result
 */
interface EmployeeLoginResult {
    /** Authenticated employee */
    employee: Employee;
    /** Company details */
    company: {
        id: string;
        name: string;
        status: string;
    };
    /** Access token */
    accessToken: string;
    /** Refresh token */
    refreshToken?: string;
    /** Token expiry */
    expiresAt: string;
    /** Permissions */
    permissions: EmployeePermission[];
}
/**
 * Interface for B2B employee operations.
 * All adapters must implement this interface.
 */
interface IEmployeeService {
    /**
     * List employees with optional filtering.
     *
     * @param options - Listing options
     * @returns Paginated list of employees
     *
     * @example
     * ```typescript
     * const employees = await api.b2b.employees.list({
     *   companyId: "comp_123",
     *   status: "active",
     *   role: ["admin", "manager"]
     * });
     * ```
     */
    list(options?: ListEmployeesOptions): Promise<PaginatedResponse<EmployeeSummary>>;
    /**
     * Get an employee by ID.
     *
     * @param id - Employee ID
     * @returns Full employee details
     */
    get(id: string): Promise<Employee>;
    /**
     * Get the current authenticated employee.
     *
     * @returns Current employee
     */
    getCurrent(): Promise<Employee>;
    /**
     * Invite a new employee to the company.
     *
     * @param companyId - Company ID
     * @param input - Invitation data
     * @returns Created invitation
     *
     * @example
     * ```typescript
     * const invitation = await api.b2b.employees.invite("comp_123", {
     *   email: "jane@company.com",
     *   firstName: "Jane",
     *   lastName: "Smith",
     *   role: "purchaser",
     *   spendingLimitMonthly: 5000
     * });
     * ```
     */
    invite(companyId: string, input: InviteEmployeeInput): Promise<EmployeeInvitation>;
    /**
     * Resend an invitation.
     *
     * @param invitationId - Invitation ID
     * @returns Updated invitation
     */
    resendInvitation(invitationId: string): Promise<EmployeeInvitation>;
    /**
     * Cancel an invitation.
     *
     * @param invitationId - Invitation ID
     */
    cancelInvitation(invitationId: string): Promise<void>;
    /**
     * Accept an invitation.
     *
     * @param token - Invitation token
     * @param password - Password for the new account
     * @returns Login result
     */
    acceptInvitation(token: string, password: string): Promise<EmployeeLoginResult>;
    /**
     * List pending invitations.
     *
     * @param companyId - Company ID
     * @returns Array of pending invitations
     */
    listInvitations(companyId: string): Promise<EmployeeInvitation[]>;
    /**
     * Update an employee.
     *
     * @param id - Employee ID
     * @param input - Update data
     * @returns Updated employee
     */
    update(id: string, input: UpdateEmployeeInput): Promise<Employee>;
    /**
     * Update employee status.
     *
     * @param id - Employee ID
     * @param status - New status
     * @param reason - Reason (required for suspension)
     * @returns Updated employee
     */
    updateStatus(id: string, status: EmployeeStatus, reason?: string): Promise<Employee>;
    /**
     * Update employee role.
     *
     * @param id - Employee ID
     * @param role - New role
     * @param customPermissions - Custom permissions (for custom role)
     * @returns Updated employee
     */
    updateRole(id: string, role: EmployeeRole, customPermissions?: EmployeePermission[]): Promise<Employee>;
    /**
     * Update employee permissions.
     *
     * @param id - Employee ID
     * @param permissions - New permissions
     * @returns Updated employee
     */
    updatePermissions(id: string, permissions: EmployeePermission[]): Promise<Employee>;
    /**
     * Update spending limits.
     *
     * @param id - Employee ID
     * @param limits - New limits
     * @returns Updated employee
     */
    updateSpendingLimits(id: string, limits: {
        perOrder?: number;
        daily?: number;
        weekly?: number;
        monthly?: number;
    }): Promise<Employee>;
    /**
     * Reset spending counters.
     *
     * @param id - Employee ID
     * @param period - Period to reset
     * @returns Updated employee
     */
    resetSpending(id: string, period: "daily" | "weekly" | "monthly" | "all"): Promise<Employee>;
    /**
     * Get employee permissions.
     *
     * @param id - Employee ID
     * @returns Array of effective permissions
     */
    getPermissions(id: string): Promise<EmployeePermission[]>;
    /**
     * Check if employee has specific permission.
     *
     * @param id - Employee ID
     * @param permission - Permission to check
     * @returns Whether employee has permission
     */
    hasPermission(id: string, permission: EmployeePermission): Promise<boolean>;
    /**
     * Employee login.
     *
     * @param email - Email address
     * @param password - Password
     * @returns Login result
     */
    login(email: string, password: string): Promise<EmployeeLoginResult>;
    /**
     * Employee logout.
     */
    logout(): Promise<void>;
    /**
     * Refresh employee token.
     *
     * @param refreshToken - Refresh token
     * @returns New login result
     */
    refreshToken(refreshToken: string): Promise<EmployeeLoginResult>;
    /**
     * Change password.
     *
     * @param currentPassword - Current password
     * @param newPassword - New password
     */
    changePassword(currentPassword: string, newPassword: string): Promise<void>;
    /**
     * Request password reset.
     *
     * @param email - Employee email
     */
    requestPasswordReset(email: string): Promise<void>;
    /**
     * Reset password with token.
     *
     * @param token - Reset token
     * @param newPassword - New password
     */
    resetPassword(token: string, newPassword: string): Promise<void>;
    /**
     * Get employee activity log.
     *
     * @param id - Employee ID
     * @param options - Pagination options
     * @returns Paginated activity entries
     */
    getActivity(id: string, options?: {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<EmployeeActivity>>;
    /**
     * List departments.
     *
     * @param companyId - Company ID
     * @returns Array of departments
     */
    listDepartments(companyId: string): Promise<Department[]>;
    /**
     * Create a department.
     *
     * @param companyId - Company ID
     * @param input - Department data
     * @returns Created department
     */
    createDepartment(companyId: string, input: Omit<Department, "id" | "companyId" | "createdAt" | "updatedAt">): Promise<Department>;
    /**
     * Update a department.
     *
     * @param departmentId - Department ID
     * @param input - Update data
     * @returns Updated department
     */
    updateDepartment(departmentId: string, input: Partial<Omit<Department, "id" | "companyId" | "createdAt" | "updatedAt">>): Promise<Department>;
    /**
     * Delete a department.
     *
     * @param departmentId - Department ID
     */
    deleteDepartment(departmentId: string): Promise<void>;
    /**
     * Get employees in a department.
     *
     * @param departmentId - Department ID
     * @returns Array of employees
     */
    getByDepartment(departmentId: string): Promise<EmployeeSummary[]>;
    /**
     * Delete an employee.
     *
     * @param id - Employee ID
     */
    delete(id: string): Promise<void>;
}

/**
 * B2B Quote Service Interface
 * Defines the contract for quote-related operations in B2B context.
 */

/**
 * Options for listing quotes
 */
interface ListQuotesOptions extends QuoteFilters {
    /** Page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
    /** Sort field */
    sortBy?: "createdAt" | "updatedAt" | "validUntil" | "total" | "quoteNumber";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
}
/**
 * Quote conversion result
 */
interface QuoteConversionResult {
    /** Created order ID */
    orderId: string;
    /** Order number */
    orderNumber: string;
    /** Updated quote */
    quote: Quote;
    /** Success message */
    message: string;
}
/**
 * Quote PDF options
 */
interface QuotePdfOptions {
    /** Include company letterhead */
    includeLetterhead?: boolean;
    /** Include terms and conditions */
    includeTerms?: boolean;
    /** Language for the PDF */
    language?: string;
}
/**
 * Interface for B2B quote operations.
 * All adapters must implement this interface.
 */
interface IQuoteService {
    /**
     * List quotes with optional filtering.
     *
     * @param options - Listing options
     * @returns Paginated list of quotes
     *
     * @example
     * ```typescript
     * const quotes = await api.b2b.quotes.list({
     *   status: ["submitted", "responded"],
     *   companyId: "comp_123",
     *   pageSize: 20
     * });
     * ```
     */
    list(options?: ListQuotesOptions): Promise<PaginatedResponse<QuoteSummary>>;
    /**
     * Get a quote by ID.
     *
     * @param id - Quote ID
     * @returns Full quote details
     */
    get(id: string): Promise<Quote>;
    /**
     * Get quote by quote number.
     *
     * @param quoteNumber - Human-readable quote number
     * @returns Full quote details
     */
    getByNumber(quoteNumber: string): Promise<Quote>;
    /**
     * Create a new quote from cart.
     *
     * @param cartId - Cart ID to convert
     * @param input - Additional quote details
     * @returns Created quote
     *
     * @example
     * ```typescript
     * const quote = await api.b2b.quotes.createFromCart("cart_123", {
     *   requestedDeliveryDate: "2024-03-01",
     *   notesForSeller: "Need bulk discount"
     * });
     * ```
     */
    createFromCart(cartId: string, input?: Partial<CreateQuoteInput>): Promise<Quote>;
    /**
     * Create a new quote directly.
     *
     * @param input - Quote creation input
     * @returns Created quote
     */
    create(input: CreateQuoteInput): Promise<Quote>;
    /**
     * Update a draft quote.
     *
     * @param id - Quote ID
     * @param input - Update data
     * @returns Updated quote
     */
    update(id: string, input: UpdateQuoteInput): Promise<Quote>;
    /**
     * Submit a draft quote for review.
     *
     * @param id - Quote ID
     * @param message - Optional message for seller
     * @returns Updated quote
     */
    submit(id: string, message?: string): Promise<Quote>;
    /**
     * Accept a responded quote.
     *
     * @param id - Quote ID
     * @param comment - Optional comment
     * @returns Updated quote
     */
    accept(id: string, comment?: string): Promise<Quote>;
    /**
     * Reject a quote.
     *
     * @param id - Quote ID
     * @param reason - Rejection reason
     * @returns Updated quote
     */
    reject(id: string, reason: string): Promise<Quote>;
    /**
     * Cancel a quote.
     *
     * @param id - Quote ID
     * @param reason - Cancellation reason
     * @returns Updated quote
     */
    cancel(id: string, reason?: string): Promise<Quote>;
    /**
     * Convert an accepted quote to an order.
     *
     * @param id - Quote ID
     * @param options - Conversion options
     * @returns Conversion result
     *
     * @example
     * ```typescript
     * const result = await api.b2b.quotes.convertToOrder("quote_123", {
     *   purchaseOrderNumber: "PO-2024-001"
     * });
     * ```
     */
    convertToOrder(id: string, options?: {
        purchaseOrderNumber?: string;
        notes?: string;
    }): Promise<QuoteConversionResult>;
    /**
     * Convert quote to cart for further editing.
     *
     * @param id - Quote ID
     * @returns New cart with quote items
     */
    convertToCart(id: string): Promise<Cart>;
    /**
     * Request a quote revision.
     *
     * @param id - Quote ID
     * @param message - Message explaining requested changes
     * @returns Updated quote
     */
    requestRevision(id: string, message: string): Promise<Quote>;
    /**
     * Create a revision of a quote.
     *
     * @param id - Original quote ID
     * @returns New quote (revision)
     */
    createRevision(id: string): Promise<Quote>;
    /**
     * Add item to draft quote.
     *
     * @param quoteId - Quote ID
     * @param item - Item to add
     * @returns Updated quote
     */
    addItem(quoteId: string, item: {
        productId: string;
        quantity: number;
        requestedPrice?: number;
        notes?: string;
    }): Promise<Quote>;
    /**
     * Update item in draft quote.
     *
     * @param quoteId - Quote ID
     * @param itemId - Item ID
     * @param updates - Updates
     * @returns Updated quote
     */
    updateItem(quoteId: string, itemId: string, updates: {
        quantity?: number;
        requestedPrice?: number;
        notes?: string;
    }): Promise<Quote>;
    /**
     * Remove item from draft quote.
     *
     * @param quoteId - Quote ID
     * @param itemId - Item ID
     * @returns Updated quote
     */
    removeItem(quoteId: string, itemId: string): Promise<Quote>;
    /**
     * Get messages for a quote.
     *
     * @param quoteId - Quote ID
     * @returns Array of messages
     */
    getMessages(quoteId: string): Promise<QuoteMessage[]>;
    /**
     * Send a message on a quote.
     *
     * @param quoteId - Quote ID
     * @param message - Message content
     * @param attachments - Optional attachments
     * @returns Created message
     */
    sendMessage(quoteId: string, message: string, attachments?: File[]): Promise<QuoteMessage>;
    /**
     * Mark messages as read.
     *
     * @param quoteId - Quote ID
     */
    markMessagesRead(quoteId: string): Promise<void>;
    /**
     * Upload attachment to quote.
     *
     * @param quoteId - Quote ID
     * @param file - File to upload
     * @returns Created attachment
     */
    uploadAttachment(quoteId: string, file: File): Promise<QuoteAttachment>;
    /**
     * Delete attachment from quote.
     *
     * @param quoteId - Quote ID
     * @param attachmentId - Attachment ID
     */
    deleteAttachment(quoteId: string, attachmentId: string): Promise<void>;
    /**
     * Generate quote PDF.
     *
     * @param id - Quote ID
     * @param options - PDF options
     * @returns PDF download URL
     */
    generatePdf(id: string, options?: QuotePdfOptions): Promise<string>;
    /**
     * Get PDF download URL.
     *
     * @param id - Quote ID
     * @returns PDF URL
     */
    getPdfUrl(id: string): Promise<string>;
    /**
     * Get quotes for a company.
     *
     * @param companyId - Company ID
     * @param options - Listing options
     * @returns Paginated quotes
     */
    getByCompany(companyId: string, options?: Omit<ListQuotesOptions, "companyId">): Promise<PaginatedResponse<QuoteSummary>>;
    /**
     * Get quotes for an employee.
     *
     * @param employeeId - Employee ID
     * @param options - Listing options
     * @returns Paginated quotes
     */
    getByEmployee(employeeId: string, options?: Omit<ListQuotesOptions, "employeeId">): Promise<PaginatedResponse<QuoteSummary>>;
    /**
     * Get quotes requiring attention.
     *
     * @returns Quotes with unread messages or expiring soon
     */
    getRequiringAttention(): Promise<QuoteSummary[]>;
    /**
     * Delete a draft quote.
     *
     * @param id - Quote ID
     */
    delete(id: string): Promise<void>;
}

/**
 * B2B Approval Service Interface
 * Defines the contract for approval workflow operations in B2B context.
 */

/**
 * Options for listing approvals
 */
interface ListApprovalsOptions extends ApprovalFilters {
    /** Page number */
    page?: number;
    /** Items per page */
    pageSize?: number;
    /** Sort field */
    sortBy?: "createdAt" | "dueAt" | "priority" | "entityAmount";
    /** Sort direction */
    sortOrder?: "asc" | "desc";
}
/**
 * Approval action result
 */
interface ApprovalActionResult {
    /** Updated approval request */
    approval: ApprovalRequest;
    /** Whether action was successful */
    success: boolean;
    /** Result message */
    message: string;
    /** Next steps (if any) */
    nextSteps?: string;
}
/**
 * Approval statistics
 */
interface ApprovalStats {
    /** Pending count */
    pending: number;
    /** In review count */
    inReview: number;
    /** Approved today */
    approvedToday: number;
    /** Rejected today */
    rejectedToday: number;
    /** Average approval time (hours) */
    avgApprovalTimeHours: number;
    /** Overdue count */
    overdue: number;
}
/**
 * Interface for B2B approval operations.
 * All adapters must implement this interface.
 */
interface IApprovalService {
    /**
     * List approval requests with optional filtering.
     *
     * @param options - Listing options
     * @returns Paginated list of approvals
     *
     * @example
     * ```typescript
     * const approvals = await api.b2b.approvals.list({
     *   status: "pending",
     *   approverId: "emp_123",
     *   entityType: "order"
     * });
     * ```
     */
    list(options?: ListApprovalsOptions): Promise<PaginatedResponse<ApprovalSummary>>;
    /**
     * Get an approval request by ID.
     *
     * @param id - Approval request ID
     * @returns Full approval details
     */
    get(id: string): Promise<ApprovalRequest>;
    /**
     * Get approval by request number.
     *
     * @param requestNumber - Human-readable request number
     * @returns Full approval details
     */
    getByNumber(requestNumber: string): Promise<ApprovalRequest>;
    /**
     * Get approvals pending for current user.
     *
     * @param options - Listing options
     * @returns Paginated pending approvals
     */
    getMyPending(options?: Omit<ListApprovalsOptions, "approverId" | "status">): Promise<PaginatedResponse<ApprovalSummary>>;
    /**
     * Get approvals I submitted.
     *
     * @param options - Listing options
     * @returns Paginated submitted approvals
     */
    getMySubmitted(options?: Omit<ListApprovalsOptions, "requesterId">): Promise<PaginatedResponse<ApprovalSummary>>;
    /**
     * Get approval statistics.
     *
     * @param companyId - Company ID (optional)
     * @returns Approval statistics
     */
    getStats(companyId?: string): Promise<ApprovalStats>;
    /**
     * Take action on an approval.
     *
     * @param id - Approval request ID
     * @param input - Action input
     * @returns Action result
     *
     * @example
     * ```typescript
     * // Approve
     * await api.b2b.approvals.takeAction("apr_123", {
     *   action: "approve",
     *   comment: "Approved for Q1 budget"
     * });
     *
     * // Reject
     * await api.b2b.approvals.takeAction("apr_123", {
     *   action: "reject",
     *   comment: "Exceeds monthly limit"
     * });
     *
     * // Delegate
     * await api.b2b.approvals.takeAction("apr_123", {
     *   action: "delegate",
     *   delegateToId: "emp_456"
     * });
     * ```
     */
    takeAction(id: string, input: ApprovalActionInput): Promise<ApprovalActionResult>;
    /**
     * Approve a request (shorthand).
     *
     * @param id - Approval request ID
     * @param comment - Optional comment
     * @returns Action result
     */
    approve(id: string, comment?: string): Promise<ApprovalActionResult>;
    /**
     * Reject a request (shorthand).
     *
     * @param id - Approval request ID
     * @param reason - Rejection reason
     * @returns Action result
     */
    reject(id: string, reason: string): Promise<ApprovalActionResult>;
    /**
     * Delegate a request.
     *
     * @param id - Approval request ID
     * @param delegateToId - Employee ID to delegate to
     * @param comment - Optional comment
     * @returns Action result
     */
    delegate(id: string, delegateToId: string, comment?: string): Promise<ApprovalActionResult>;
    /**
     * Escalate a request.
     *
     * @param id - Approval request ID
     * @param reason - Escalation reason
     * @returns Action result
     */
    escalate(id: string, reason?: string): Promise<ApprovalActionResult>;
    /**
     * Request more information.
     *
     * @param id - Approval request ID
     * @param question - Information needed
     * @returns Action result
     */
    requestInfo(id: string, question: string): Promise<ApprovalActionResult>;
    /**
     * Add comment to approval.
     *
     * @param id - Approval request ID
     * @param comment - Comment text
     * @returns Updated approval
     */
    addComment(id: string, comment: string): Promise<ApprovalRequest>;
    /**
     * List approval workflows.
     *
     * @param companyId - Company ID
     * @returns Array of workflows
     */
    listWorkflows(companyId: string): Promise<ApprovalWorkflow[]>;
    /**
     * Get a workflow by ID.
     *
     * @param id - Workflow ID
     * @returns Workflow details
     */
    getWorkflow(id: string): Promise<ApprovalWorkflow>;
    /**
     * Create a new workflow.
     *
     * @param companyId - Company ID
     * @param input - Workflow data
     * @returns Created workflow
     *
     * @example
     * ```typescript
     * const workflow = await api.b2b.approvals.createWorkflow("comp_123", {
     *   name: "High Value Orders",
     *   entityType: "order",
     *   triggers: [{ type: "amount_exceeds", threshold: 10000 }],
     *   levels: [
     *     {
     *       name: "Manager Approval",
     *       approverRole: "manager",
     *       requiredApprovals: 1,
     *       requireAll: false,
     *       escalationHours: 24
     *     }
     *   ]
     * });
     * ```
     */
    createWorkflow(companyId: string, input: CreateApprovalWorkflowInput): Promise<ApprovalWorkflow>;
    /**
     * Update a workflow.
     *
     * @param id - Workflow ID
     * @param input - Update data
     * @returns Updated workflow
     */
    updateWorkflow(id: string, input: UpdateApprovalWorkflowInput): Promise<ApprovalWorkflow>;
    /**
     * Delete a workflow.
     *
     * @param id - Workflow ID
     */
    deleteWorkflow(id: string): Promise<void>;
    /**
     * Activate a workflow.
     *
     * @param id - Workflow ID
     * @returns Updated workflow
     */
    activateWorkflow(id: string): Promise<ApprovalWorkflow>;
    /**
     * Deactivate a workflow.
     *
     * @param id - Workflow ID
     * @returns Updated workflow
     */
    deactivateWorkflow(id: string): Promise<ApprovalWorkflow>;
    /**
     * List delegations for a company.
     *
     * @param companyId - Company ID
     * @returns Array of delegations
     */
    listDelegations(companyId: string): Promise<ApprovalDelegation[]>;
    /**
     * Create a delegation.
     *
     * @param input - Delegation data
     * @returns Created delegation
     *
     * @example
     * ```typescript
     * const delegation = await api.b2b.approvals.createDelegation({
     *   delegateeId: "emp_456",
     *   startDate: "2024-01-15",
     *   endDate: "2024-01-22",
     *   reason: "Vacation",
     *   entityTypes: ["order"],
     *   maxAmount: 5000
     * });
     * ```
     */
    createDelegation(input: Omit<ApprovalDelegation, "id" | "companyId" | "delegatorId" | "delegatorName" | "delegateeName" | "isActive" | "createdAt">): Promise<ApprovalDelegation>;
    /**
     * Cancel a delegation.
     *
     * @param id - Delegation ID
     */
    cancelDelegation(id: string): Promise<void>;
    /**
     * Get active delegations for current user.
     *
     * @returns Array of active delegations
     */
    getMyDelegations(): Promise<ApprovalDelegation[]>;
    /**
     * Get delegations to current user.
     *
     * @returns Array of delegations where current user is delegatee
     */
    getDelegationsToMe(): Promise<ApprovalDelegation[]>;
    /**
     * Approve multiple requests.
     *
     * @param ids - Approval request IDs
     * @param comment - Comment for all
     * @returns Results for each
     */
    approveMany(ids: string[], comment?: string): Promise<Map<string, ApprovalActionResult>>;
    /**
     * Reject multiple requests.
     *
     * @param ids - Approval request IDs
     * @param reason - Reason for all
     * @returns Results for each
     */
    rejectMany(ids: string[], reason: string): Promise<Map<string, ApprovalActionResult>>;
}

/**
 * B2B Spending Service Interface
 * Defines the contract for spending limit operations in B2B context.
 */

/**
 * Options for listing spending limits
 */
interface ListSpendingLimitsOptions {
    /** Filter by entity type */
    entityType?: SpendingLimitEntityType;
    /** Filter by entity ID */
    entityId?: string;
    /** Filter by period */
    period?: SpendingPeriod;
    /** Include only active limits */
    activeOnly?: boolean;
    /** Include exceeded limits only */
    exceededOnly?: boolean;
}
/**
 * Spending check result
 */
interface SpendingCheckResult {
    /** Whether spending is allowed */
    allowed: boolean;
    /** Reason if not allowed */
    reason?: string;
    /** Affected limits */
    affectedLimits: Array<{
        limitId: string;
        limitName: string;
        currentSpending: number;
        limitAmount: number;
        remainingAfterPurchase: number;
        wouldExceed: boolean;
    }>;
    /** Triggered rules */
    triggeredRules: Array<{
        ruleId: string;
        ruleName: string;
        action: string;
        message?: string;
    }>;
    /** Whether approval is required */
    requiresApproval: boolean;
    /** Approval workflow ID if required */
    approvalWorkflowId?: string;
}
/**
 * Budget summary
 */
interface BudgetSummary {
    /** Entity type */
    entityType: SpendingLimitEntityType;
    /** Entity ID */
    entityId: string;
    /** Entity name */
    entityName: string;
    /** Period */
    period: SpendingPeriod;
    /** Budget amount */
    budget: number;
    /** Current spending */
    spent: number;
    /** Remaining */
    remaining: number;
    /** Percentage used */
    percentUsed: number;
    /** Period start date */
    periodStart: string;
    /** Period end date */
    periodEnd: string;
    /** Days remaining in period */
    daysRemaining: number;
}
/**
 * Interface for B2B spending operations.
 * All adapters must implement this interface.
 */
interface ISpendingService {
    /**
     * List spending limits.
     *
     * @param companyId - Company ID
     * @param options - Listing options
     * @returns Array of spending limits
     *
     * @example
     * ```typescript
     * const limits = await api.b2b.spending.listLimits("comp_123", {
     *   entityType: "employee",
     *   activeOnly: true
     * });
     * ```
     */
    listLimits(companyId: string, options?: ListSpendingLimitsOptions): Promise<SpendingLimit[]>;
    /**
     * Get a spending limit by ID.
     *
     * @param id - Limit ID
     * @returns Spending limit details
     */
    getLimit(id: string): Promise<SpendingLimit>;
    /**
     * Get limits for an employee.
     *
     * @param employeeId - Employee ID
     * @returns Array of applicable limits
     */
    getEmployeeLimits(employeeId: string): Promise<SpendingLimit[]>;
    /**
     * Get limits for a department.
     *
     * @param departmentId - Department ID
     * @returns Array of limits
     */
    getDepartmentLimits(departmentId: string): Promise<SpendingLimit[]>;
    /**
     * Create a spending limit.
     *
     * @param companyId - Company ID
     * @param input - Limit data
     * @returns Created limit
     *
     * @example
     * ```typescript
     * const limit = await api.b2b.spending.createLimit("comp_123", {
     *   name: "Monthly Employee Limit",
     *   entityType: "employee",
     *   entityId: "emp_456",
     *   period: "monthly",
     *   limitAmount: 5000,
     *   currency: "EUR",
     *   warningThreshold: 80
     * });
     * ```
     */
    createLimit(companyId: string, input: CreateSpendingLimitInput): Promise<SpendingLimit>;
    /**
     * Update a spending limit.
     *
     * @param id - Limit ID
     * @param input - Update data
     * @returns Updated limit
     */
    updateLimit(id: string, input: UpdateSpendingLimitInput): Promise<SpendingLimit>;
    /**
     * Delete a spending limit.
     *
     * @param id - Limit ID
     */
    deleteLimit(id: string): Promise<void>;
    /**
     * Reset a spending limit counter.
     *
     * @param id - Limit ID
     * @param reason - Reason for reset
     * @returns Updated limit
     */
    resetLimit(id: string, reason?: string): Promise<SpendingLimit>;
    /**
     * List spending rules.
     *
     * @param companyId - Company ID
     * @returns Array of rules
     */
    listRules(companyId: string): Promise<SpendingRule[]>;
    /**
     * Get a spending rule.
     *
     * @param id - Rule ID
     * @returns Rule details
     */
    getRule(id: string): Promise<SpendingRule>;
    /**
     * Create a spending rule.
     *
     * @param companyId - Company ID
     * @param input - Rule data
     * @returns Created rule
     */
    createRule(companyId: string, input: CreateSpendingRuleInput): Promise<SpendingRule>;
    /**
     * Update a spending rule.
     *
     * @param id - Rule ID
     * @param input - Update data
     * @returns Updated rule
     */
    updateRule(id: string, input: Partial<CreateSpendingRuleInput>): Promise<SpendingRule>;
    /**
     * Delete a spending rule.
     *
     * @param id - Rule ID
     */
    deleteRule(id: string): Promise<void>;
    /**
     * Activate a rule.
     *
     * @param id - Rule ID
     * @returns Updated rule
     */
    activateRule(id: string): Promise<SpendingRule>;
    /**
     * Deactivate a rule.
     *
     * @param id - Rule ID
     * @returns Updated rule
     */
    deactivateRule(id: string): Promise<SpendingRule>;
    /**
     * Check if a purchase is allowed.
     *
     * @param employeeId - Employee ID
     * @param amount - Purchase amount
     * @param categoryId - Product category (optional)
     * @returns Check result
     *
     * @example
     * ```typescript
     * const check = await api.b2b.spending.checkPurchase("emp_123", 500, "cat_456");
     * if (!check.allowed) {
     *   console.log("Cannot purchase:", check.reason);
     *   if (check.requiresApproval) {
     *     // Redirect to approval flow
     *   }
     * }
     * ```
     */
    checkPurchase(employeeId: string, amount: number, categoryId?: string): Promise<SpendingCheckResult>;
    /**
     * Get remaining budget for an employee.
     *
     * @param employeeId - Employee ID
     * @param period - Budget period (optional)
     * @returns Remaining amount
     */
    getRemainingBudget(employeeId: string, period?: SpendingPeriod): Promise<number>;
    /**
     * List spending transactions.
     *
     * @param companyId - Company ID
     * @param filters - Filter options
     * @returns Paginated transactions
     */
    listTransactions(companyId: string, filters?: SpendingFilters & {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<SpendingTransaction>>;
    /**
     * Get transactions for an employee.
     *
     * @param employeeId - Employee ID
     * @param filters - Filter options
     * @returns Paginated transactions
     */
    getEmployeeTransactions(employeeId: string, filters?: SpendingFilters & {
        page?: number;
        pageSize?: number;
    }): Promise<PaginatedResponse<SpendingTransaction>>;
    /**
     * Record a manual adjustment.
     *
     * @param companyId - Company ID
     * @param input - Adjustment data
     * @returns Created transaction
     */
    recordAdjustment(companyId: string, input: SpendingAdjustmentInput): Promise<SpendingTransaction>;
    /**
     * Get spending report.
     *
     * @param companyId - Company ID
     * @param periodStart - Period start date
     * @param periodEnd - Period end date
     * @returns Spending report
     *
     * @example
     * ```typescript
     * const report = await api.b2b.spending.getReport(
     *   "comp_123",
     *   "2024-01-01",
     *   "2024-01-31"
     * );
     * console.log("Total spending:", report.totalSpending);
     * console.log("By category:", report.byCategory);
     * ```
     */
    getReport(companyId: string, periodStart: string, periodEnd: string): Promise<SpendingReport>;
    /**
     * Get budget summaries.
     *
     * @param companyId - Company ID
     * @returns Array of budget summaries
     */
    getBudgetSummaries(companyId: string): Promise<BudgetSummary[]>;
    /**
     * Get employee budget summary.
     *
     * @param employeeId - Employee ID
     * @returns Budget summary for employee
     */
    getEmployeeBudgetSummary(employeeId: string): Promise<BudgetSummary[]>;
    /**
     * Get department budget summary.
     *
     * @param departmentId - Department ID
     * @returns Budget summary for department
     */
    getDepartmentBudgetSummary(departmentId: string): Promise<BudgetSummary>;
    /**
     * Export spending report.
     *
     * @param companyId - Company ID
     * @param filters - Report filters
     * @param format - Export format
     * @returns Download URL
     */
    exportReport(companyId: string, filters: SpendingFilters, format: "csv" | "xlsx" | "pdf"): Promise<string>;
    /**
     * Get spending alerts.
     *
     * @param companyId - Company ID
     * @returns Array of current alerts
     */
    getAlerts(companyId: string): Promise<Array<{
        type: "exceeded" | "near_limit";
        entityType: SpendingLimitEntityType;
        entityId: string;
        entityName: string;
        limitName: string;
        limitAmount: number;
        currentSpending: number;
        percentUsed: number;
    }>>;
    /**
     * Dismiss an alert.
     *
     * @param alertId - Alert ID
     */
    dismissAlert(alertId: string): Promise<void>;
}

/**
 * Commerce Client Interface
 * Main interface that all API adapters must implement.
 */

/**
 * B2B services namespace
 */
interface IB2BServices {
    /** Company management */
    readonly companies: ICompanyService;
    /** Employee management */
    readonly employees: IEmployeeService;
    /** Quote management */
    readonly quotes: IQuoteService;
    /** Approval workflows */
    readonly approvals: IApprovalService;
    /** Spending limits */
    readonly spending: ISpendingService;
}
/**
 * Commerce client configuration
 */
interface CommerceClientConfig {
    /** Base URL for the API */
    baseUrl: string;
    /** Region/market ID */
    regionId?: string;
    /** Publishable API key */
    publishableKey?: string;
    /** Auth token */
    authToken?: string;
    /** Default timeout in ms */
    timeout?: number;
    /** Default headers */
    defaultHeaders?: Record<string, string>;
    /** Custom fetch implementation */
    fetch?: typeof globalThis.fetch;
    /** Enable B2B features */
    enableB2B?: boolean;
    /** B2B specific config */
    b2b?: {
        /** Company ID */
        companyId?: string;
        /** Employee ID */
        employeeId?: string;
    };
}
/**
 * API provider type
 */
type ApiProvider = "medusa" | "bridge" | "sage" | "shopify" | "custom";
/**
 * Provider configuration
 */
interface ProviderConfig extends CommerceClientConfig {
    /** Provider type */
    provider: ApiProvider;
    /** Provider-specific options */
    providerOptions?: Record<string, unknown>;
}
/**
 * Main commerce client interface.
 * All API adapters must implement this interface.
 *
 * @example
 * ```typescript
 * // Using with Medusa adapter
 * const api = createApiClient({
 *   provider: "medusa",
 *   baseUrl: "https://api.mystore.com",
 *   regionId: "reg_123",
 *   enableB2B: true
 * });
 *
 * // Fetch products
 * const products = await api.products.list({ pageSize: 20 });
 *
 * // Add to cart
 * const cart = await api.cart.addItem(cartId, {
 *   productId: "prod_123",
 *   quantity: 2
 * });
 *
 * // B2B: Create quote
 * const quote = await api.b2b.quotes.createFromCart(cartId);
 * ```
 */
interface ICommerceClient extends ApiAdapter {
    /** Provider type */
    readonly provider: ApiProvider;
    /** Configuration */
    readonly config: CommerceClientConfig;
    /** Product operations */
    readonly products: IProductService;
    /** Category operations */
    readonly categories: ICategoryService;
    /** Cart operations */
    readonly cart: ICartService;
    /** Order operations */
    readonly orders: IOrderService;
    /** Customer operations */
    readonly customers: ICustomerService;
    /** B2B operations (companies, employees, quotes, approvals, spending) */
    readonly b2b: IB2BServices | null;
    /**
     * Set authentication token.
     *
     * @param token - Auth token
     */
    setAuthToken(token: string): void;
    /**
     * Clear authentication.
     */
    clearAuth(): void;
    /**
     * Get current auth token.
     *
     * @returns Current token or null
     */
    getAuthToken(): string | null;
    /**
     * Set B2B context (company and employee).
     *
     * @param companyId - Company ID
     * @param employeeId - Employee ID
     */
    setB2BContext(companyId: string, employeeId?: string): void;
    /**
     * Clear B2B context.
     */
    clearB2BContext(): void;
    /**
     * Get current B2B context.
     *
     * @returns Current B2B context
     */
    getB2BContext(): {
        companyId?: string;
        employeeId?: string;
    } | null;
    /**
     * Check if B2B is enabled.
     *
     * @returns Whether B2B is enabled
     */
    isB2BEnabled(): boolean;
    /**
     * Get the underlying HTTP client.
     * Useful for custom requests not covered by services.
     */
    getHttpClient(): {
        get<T>(path: string, options?: Record<string, unknown>): Promise<T>;
        post<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        put<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        patch<T>(path: string, body?: unknown, options?: Record<string, unknown>): Promise<T>;
        delete<T>(path: string, options?: Record<string, unknown>): Promise<T>;
    };
}
/**
 * Commerce client factory function type
 */
type CommerceClientFactory = (config: ProviderConfig) => ICommerceClient;

export type { AddToCartInput, AddressInput, ApiProvider, ApprovalActionResult, ApprovalStats, AuthResult, BudgetSummary, BulkAddResult, BulkAddToCartInput, Cart, CartDiscount, CartLineItem, CartShippingOption, CartTotals, CategoryTreeNode, CategoryWithHierarchy, CommerceClientConfig, CommerceClientFactory, CompanyRegistrationRequest, CompanyRegistrationResult, CreateDirectOrderInput, CreateOrderInput, CreditAdjustmentInput, CreditHistoryEntry, Customer, CustomerAddress, CustomerInput, EmployeeLoginResult, GetProductOptions, IApprovalService, IB2BServices, ICartService, ICategoryService, ICommerceClient, ICompanyService, ICustomerService, IEmployeeService, IOrderService, IProductService, IQuoteService, ISpendingService, ListApprovalsOptions, ListCategoriesOptions, ListCompaniesOptions, ListEmployeesOptions, ListOrdersOptions, ListProductsOptions, ListQuotesOptions, ListSpendingLimitsOptions, OrderFulfillment, OrderRefund, OrderWithDetails, PasswordResetResult, ProductFacets, ProductInventory, ProductSearchResult, ProductWithRelated, ProviderConfig, QuoteConversionResult, QuotePdfOptions, SpendingCheckResult, UpdateCartItemInput };
