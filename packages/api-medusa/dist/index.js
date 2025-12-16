import { registerProvider } from '@maison/api-client';
import { BaseApiClient } from '@maison/api-core';

// src/index.ts

// src/mappers/product.ts
function mapMedusaProduct(medusaProduct, regionId, currencyCode = "EUR") {
  const images = medusaProduct.images?.map((img) => img.url) ?? [];
  if (medusaProduct.thumbnail && !images.includes(medusaProduct.thumbnail)) {
    images.unshift(medusaProduct.thumbnail);
  }
  const defaultVariant = medusaProduct.variants?.[0];
  const price = getVariantPrice(defaultVariant, regionId, currencyCode);
  const primaryCategory = medusaProduct.categories?.[0];
  return {
    id: medusaProduct.id,
    reference: defaultVariant?.sku ?? medusaProduct.id,
    name: medusaProduct.title,
    nameEn: medusaProduct.title,
    // Medusa doesn't have separate i18n by default
    slug: medusaProduct.handle,
    ean: defaultVariant?.barcode ?? void 0,
    description: medusaProduct.description ?? "",
    shortDescription: medusaProduct.subtitle ?? "",
    price: price / 100,
    // Medusa stores in cents
    isPriceTTC: false,
    // Medusa prices are typically HT
    images,
    categoryId: primaryCategory?.id ?? medusaProduct.collection_id ?? "",
    category: primaryCategory ? mapMedusaCategory(primaryCategory) : void 0,
    collection: medusaProduct.collection?.title,
    materials: extractMaterials(medusaProduct.metadata),
    weight: medusaProduct.weight ?? void 0,
    weightUnit: "g",
    brand: extractBrand(medusaProduct.metadata),
    origin: medusaProduct.origin_country ?? void 0,
    stock: defaultVariant?.inventory_quantity ?? 0,
    isAvailable: medusaProduct.status === "published",
    featured: extractFeatured(medusaProduct.metadata),
    isNew: isProductNew(medusaProduct.created_at),
    createdAt: medusaProduct.created_at
  };
}
function getVariantPrice(variant, regionId, currencyCode = "EUR") {
  if (!variant?.prices?.length) return 0;
  if (regionId) {
    const regionPrice = variant.prices.find((p) => p.region_id === regionId);
    if (regionPrice) return regionPrice.amount;
  }
  const currencyPrice = variant.prices.find(
    (p) => p.currency_code === currencyCode.toLowerCase()
  );
  if (currencyPrice) return currencyPrice.amount;
  return variant.prices[0]?.amount ?? 0;
}
function mapMedusaCategory(medusaCategory) {
  return {
    id: medusaCategory.id,
    code: medusaCategory.handle,
    name: medusaCategory.name,
    slug: medusaCategory.handle,
    description: "",
    image: "",
    productCount: 0
  };
}
function extractMaterials(metadata) {
  if (!metadata) return [];
  const materials = metadata["materials"];
  if (!materials) return [];
  if (Array.isArray(materials)) {
    return materials.filter((m) => typeof m === "string");
  }
  if (typeof materials === "string") {
    return [materials];
  }
  return [];
}
function extractBrand(metadata) {
  if (!metadata) return void 0;
  const brand = metadata["brand"];
  if (typeof brand === "string") {
    return brand;
  }
  return void 0;
}
function extractFeatured(metadata) {
  if (!metadata) return false;
  return metadata["featured"] === true;
}
function isProductNew(createdAt) {
  const created = new Date(createdAt);
  const thirtyDaysAgo = /* @__PURE__ */ new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}

// src/mappers/cart.ts
function mapMedusaCart(medusaCart) {
  const items = medusaCart.items.map(mapMedusaLineItem);
  const totals = mapMedusaTotals(medusaCart, items);
  const selectedShipping = medusaCart.shipping_methods?.[0];
  const shippingOption = selectedShipping?.shipping_option ? {
    id: selectedShipping.shipping_option.id,
    carrier: selectedShipping.shipping_option.provider_id ?? "standard",
    name: selectedShipping.shipping_option.name,
    price: selectedShipping.price / 100
  } : void 0;
  return {
    id: medusaCart.id,
    customerId: medusaCart.customer_id ?? void 0,
    regionId: medusaCart.region_id,
    items,
    discounts: medusaCart.discounts?.map(mapMedusaDiscount) ?? [],
    shippingOption,
    totals,
    shippingAddressId: medusaCart.shipping_address?.id,
    billingAddressId: medusaCart.billing_address?.id,
    metadata: medusaCart.metadata,
    createdAt: medusaCart.created_at,
    updatedAt: medusaCart.updated_at
  };
}
function mapMedusaLineItem(item) {
  const unitPrice = item.unit_price / 100;
  const originalPrice = item.original_price ? item.original_price / 100 : void 0;
  const discountAmount = originalPrice && originalPrice > unitPrice ? originalPrice - unitPrice : void 0;
  return {
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    sku: item.variant?.sku ?? "",
    name: item.title,
    imageUrl: item.thumbnail ?? void 0,
    unitPrice,
    quantity: item.quantity,
    lineTotal: item.total / 100,
    originalPrice,
    discountAmount,
    isAvailable: true,
    // Medusa items are available if they're in cart
    availableStock: item.variant?.inventory_quantity,
    attributes: item.metadata,
    productSlug: item.variant?.product?.handle
  };
}
function mapMedusaDiscount(discount) {
  return {
    id: discount.id,
    code: discount.code,
    type: discount.rule.type,
    value: discount.rule.value,
    amount: 0,
    // Will be calculated by Medusa in the totals
    description: discount.rule.description
  };
}
function mapMedusaTotals(cart, items) {
  return {
    subtotal: cart.subtotal / 100,
    discount: cart.discount_total / 100,
    shipping: cart.shipping_total / 100,
    tax: cart.tax_total / 100,
    total: cart.total / 100,
    currency: cart.currency_code.toUpperCase(),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    uniqueItemCount: items.length
  };
}
function mapMedusaShippingOptions(options) {
  return options.map((opt) => ({
    id: opt.id,
    carrier: opt.provider_id ?? "standard",
    name: opt.name,
    price: opt.amount / 100,
    estimatedDays: void 0
    // Medusa doesn't provide this by default
  }));
}

// src/services/products.ts
var MedusaProductService = class {
  constructor(client, regionId, currencyCode = "EUR") {
    this.client = client;
    this.regionId = regionId;
    this.currencyCode = currencyCode;
  }
  /**
   * List products with filtering, sorting, and pagination.
   */
  async list(options = {}) {
    const {
      page = 1,
      pageSize = 20,
      categoryId,
      collection,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice
    } = options;
    const offset = (page - 1) * pageSize;
    const sortFieldMap = {
      createdAt: "created_at",
      price: "price",
      name: "title",
      popularity: "created_at"
      // Medusa doesn't have popularity, fallback to created_at
    };
    const medusaSortBy = sortFieldMap[sortBy] ?? "created_at";
    const params = new URLSearchParams();
    params.set("offset", offset.toString());
    params.set("limit", pageSize.toString());
    params.set("order", sortOrder === "asc" ? medusaSortBy : `-${medusaSortBy}`);
    if (categoryId) params.set("category_id[]", categoryId);
    if (collection) params.set("collection_id[]", collection);
    if (search) params.set("q", search);
    const response = await this.client.get(
      `/store/products?${params.toString()}`
    );
    const products = (response.data.products ?? []).map(
      (p) => mapMedusaProduct(p, this.regionId, this.currencyCode)
    );
    let filteredProducts = products;
    if (minPrice !== void 0 || maxPrice !== void 0) {
      filteredProducts = products.filter((p) => {
        if (minPrice !== void 0 && p.price < minPrice) return false;
        if (maxPrice !== void 0 && p.price > maxPrice) return false;
        return true;
      });
    }
    const total = response.data.count ?? products.length;
    const totalPages = Math.ceil(total / pageSize);
    return {
      items: filteredProducts,
      total,
      page,
      pageSize,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
  /**
   * Get a single product by ID with optional related products.
   */
  async get(id, options = {}) {
    const product = await this.fetchProduct(id);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    let relatedProducts;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }
    return {
      ...product,
      relatedProducts
    };
  }
  /**
   * Get a product by slug/handle.
   */
  async getBySlug(slug, options = {}) {
    const listResponse = await this.client.get(
      `/store/products?handle=${slug}`
    );
    const medusaProduct = listResponse.data.products?.[0];
    if (!medusaProduct) {
      throw new Error(`Product not found with slug: ${slug}`);
    }
    const product = mapMedusaProduct(medusaProduct, this.regionId, this.currencyCode);
    let relatedProducts;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }
    return {
      ...product,
      relatedProducts
    };
  }
  /**
   * Get a product by SKU/reference.
   */
  async getBySku(sku, options = {}) {
    const listResponse = await this.client.get(
      `/store/products?q=${sku}`
    );
    const medusaProduct = listResponse.data.products?.find(
      (p) => p.variants?.some((v) => v.sku === sku)
    );
    if (!medusaProduct) {
      throw new Error(`Product not found with SKU: ${sku}`);
    }
    const product = mapMedusaProduct(medusaProduct, this.regionId, this.currencyCode);
    let relatedProducts;
    if (options.includeRelated && product.categoryId) {
      const related = await this.list({
        categoryId: product.categoryId,
        pageSize: options.relatedLimit ?? 4
      });
      relatedProducts = related.items.filter((p) => p.id !== product.id).slice(0, options.relatedLimit ?? 4);
    }
    return {
      ...product,
      relatedProducts
    };
  }
  /**
   * Search products by query.
   */
  async search(query, options = {}) {
    const response = await this.list({
      ...options,
      search: query
    });
    const facets = await this.getFacetsFromProducts(response.items);
    return {
      products: response.items,
      facets,
      total: response.total,
      suggestions: []
      // Would need separate endpoint for suggestions
    };
  }
  /**
   * Get multiple products by IDs.
   */
  async getMany(ids) {
    const products = await Promise.all(
      ids.map((id) => this.fetchProduct(id).catch(() => null))
    );
    return products.filter((p) => p !== null);
  }
  /**
   * Get featured products.
   */
  async getFeatured(limit = 10) {
    const response = await this.list({ pageSize: limit });
    return response.items.filter((p) => p.featured);
  }
  /**
   * Get new products.
   */
  async getNew(limit = 10, daysBack = 30) {
    const response = await this.list({
      pageSize: limit,
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    const cutoffDate = /* @__PURE__ */ new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    return response.items.filter((p) => {
      const productDate = new Date(p.createdAt);
      return productDate >= cutoffDate;
    });
  }
  /**
   * Get products by category.
   */
  async getByCategory(categoryId, options) {
    return this.list({ ...options, categoryId });
  }
  /**
   * Get product inventory/stock information.
   */
  async getInventory(productId) {
    const product = await this.fetchProduct(productId);
    return {
      productId,
      sku: product?.reference ?? "",
      available: product?.stock ?? 0,
      reserved: 0
      // Medusa doesn't expose reserved stock in store API
    };
  }
  /**
   * Get inventory for multiple products.
   */
  async getInventoryBulk(productIds) {
    const inventoryMap = /* @__PURE__ */ new Map();
    await Promise.all(
      productIds.map(async (id) => {
        try {
          const inventory = await this.getInventory(id);
          inventoryMap.set(id, inventory);
        } catch {
        }
      })
    );
    return inventoryMap;
  }
  /**
   * Fetch a single product without related products (internal helper).
   */
  async fetchProduct(idOrHandle) {
    try {
      const response = await this.client.get(
        `/store/products/${idOrHandle}`
      );
      if (!response.data.product) return null;
      return mapMedusaProduct(response.data.product, this.regionId, this.currencyCode);
    } catch {
      const listResponse = await this.client.get(
        `/store/products?handle=${idOrHandle}`
      );
      const product = listResponse.data.products?.[0];
      if (!product) return null;
      return mapMedusaProduct(product, this.regionId, this.currencyCode);
    }
  }
  /**
   * Extract facets from product list.
   */
  async getFacetsFromProducts(products) {
    const categories = /* @__PURE__ */ new Map();
    const collections = /* @__PURE__ */ new Map();
    const materials = /* @__PURE__ */ new Map();
    let minPrice = Infinity;
    let maxPrice = 0;
    for (const product of products) {
      if (product.categoryId && product.category) {
        const existing = categories.get(product.categoryId);
        if (existing) {
          existing.count++;
        } else {
          categories.set(product.categoryId, {
            id: product.categoryId,
            name: product.category.name,
            count: 1
          });
        }
      }
      if (product.collection) {
        collections.set(product.collection, (collections.get(product.collection) ?? 0) + 1);
      }
      product.materials.forEach((m) => {
        materials.set(m, (materials.get(m) ?? 0) + 1);
      });
      if (product.price < minPrice) minPrice = product.price;
      if (product.price > maxPrice) maxPrice = product.price;
    }
    return {
      categories: Array.from(categories.values()),
      collections: Array.from(collections.entries()).map(([value, count]) => ({ value, count })),
      materials: Array.from(materials.entries()).map(([value, count]) => ({ value, count })),
      priceRange: {
        min: minPrice === Infinity ? 0 : minPrice,
        max: maxPrice
      }
    };
  }
};

// src/services/cart.ts
var MedusaCartService = class {
  constructor(client, regionId) {
    this.client = client;
    this.regionId = regionId;
  }
  /**
   * Get or create a cart.
   */
  async get(cartId) {
    if (!cartId) {
      return this.create();
    }
    try {
      const response = await this.client.get(
        `/store/carts/${cartId}`
      );
      return mapMedusaCart(response.data.cart);
    } catch {
      return this.create();
    }
  }
  /**
   * Create a new cart.
   */
  async create(regionId, customerId) {
    const body = {
      region_id: regionId ?? this.regionId
    };
    if (customerId) {
      body["customer_id"] = customerId;
    }
    const response = await this.client.post("/store/carts", body);
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Add item to cart.
   */
  async addItem(cartId, input) {
    const response = await this.client.post(
      `/store/carts/${cartId}/line-items`,
      {
        variant_id: input.variantId ?? input.productId,
        quantity: input.quantity,
        metadata: input.metadata
      }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Update cart item quantity.
   */
  async updateItem(cartId, itemId, input) {
    const response = await this.client.post(
      `/store/carts/${cartId}/line-items/${itemId}`,
      {
        quantity: input.quantity
      }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Remove item from cart.
   */
  async removeItem(cartId, itemId) {
    const response = await this.client.delete(
      `/store/carts/${cartId}/line-items/${itemId}`
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Add multiple items to cart (bulk operation).
   */
  async addItemsBulk(cartId, input) {
    const added = [];
    const failed = [];
    if (input.replaceExisting) {
      await this.clear(cartId);
    }
    let currentCart = null;
    for (const item of input.items) {
      try {
        currentCart = await this.addItem(cartId, item);
        const addedItem = currentCart.items.find(
          (i) => i.productId === item.productId || i.variantId === item.variantId
        );
        if (addedItem) {
          added.push(addedItem);
        }
      } catch (error) {
        failed.push({
          input: item,
          reason: error instanceof Error ? error.message : "Failed to add item"
        });
      }
    }
    const finalCart = currentCart ?? await this.get(cartId);
    return {
      added,
      failed,
      cart: finalCart
    };
  }
  /**
   * Clear all items from cart.
   */
  async clear(cartId) {
    const cart = await this.get(cartId);
    for (const item of cart.items) {
      await this.client.delete(`/store/carts/${cartId}/line-items/${item.id}`);
    }
    return this.get(cartId);
  }
  /**
   * Apply discount code to cart.
   */
  async applyDiscount(cartId, code) {
    const response = await this.client.post(
      `/store/carts/${cartId}/discounts`,
      { code }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Remove discount from cart.
   */
  async removeDiscount(cartId, discountId) {
    const response = await this.client.delete(
      `/store/carts/${cartId}/discounts/${discountId}`
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Set shipping option.
   */
  async setShippingOption(cartId, optionId) {
    const response = await this.client.post(
      `/store/carts/${cartId}/shipping-methods`,
      { option_id: optionId }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Get available shipping options.
   */
  async getShippingOptions(cartId) {
    const response = await this.client.get(
      `/store/shipping-options/${cartId}`
    );
    return mapMedusaShippingOptions(response.data.shipping_options ?? []);
  }
  /**
   * Associate cart with customer.
   */
  async setCustomer(cartId, customerId) {
    const response = await this.client.post(
      `/store/carts/${cartId}`,
      { customer_id: customerId }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Set addresses for cart.
   */
  async setAddresses(cartId, shippingAddressId, billingAddressId) {
    const response = await this.client.post(
      `/store/carts/${cartId}`,
      {
        shipping_address_id: shippingAddressId,
        billing_address_id: billingAddressId ?? shippingAddressId
      }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Update cart metadata.
   */
  async updateMetadata(cartId, metadata) {
    const response = await this.client.post(
      `/store/carts/${cartId}`,
      { metadata }
    );
    return mapMedusaCart(response.data.cart);
  }
  /**
   * Delete a cart.
   */
  async delete(cartId) {
    await this.client.delete(`/store/carts/${cartId}`);
  }
  /**
   * Merge guest cart into customer cart.
   */
  async merge(guestCartId, customerCartId) {
    const guestCart = await this.get(guestCartId);
    for (const item of guestCart.items) {
      await this.addItem(customerCartId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        attributes: item.attributes
      });
    }
    await this.delete(guestCartId);
    return this.get(customerCartId);
  }
};

// src/client.ts
var MedusaApiClient = class extends BaseApiClient {
  dynamicHeaders = {};
  constructor(config) {
    super(config);
  }
  /**
   * Set a dynamic header
   */
  setDynamicHeader(name, value) {
    this.dynamicHeaders[name] = value;
  }
  /**
   * Remove a dynamic header
   */
  removeDynamicHeader(name) {
    delete this.dynamicHeaders[name];
  }
  /**
   * Override buildHeaders to include dynamic headers
   */
  buildHeaders(customHeaders) {
    const baseHeaders = super.buildHeaders(customHeaders);
    for (const [name, value] of Object.entries(this.dynamicHeaders)) {
      baseHeaders.set(name, value);
    }
    return baseHeaders;
  }
};
var MedusaCommerceClient = class {
  // ApiAdapter interface
  name = "medusa";
  version = "2.0";
  // ICommerceClient interface
  provider = "medusa";
  config;
  httpClient;
  authToken = null;
  b2bContext = null;
  initialized = false;
  // Service instances (lazy initialized)
  _products = null;
  _categories = null;
  _cart = null;
  _orders = null;
  _customers = null;
  _b2b = null;
  constructor(config) {
    this.config = config;
    const defaultHeaders = {
      ...config.defaultHeaders
    };
    if (config.publishableKey) {
      defaultHeaders["x-publishable-api-key"] = config.publishableKey;
    }
    this.httpClient = new MedusaApiClient({
      baseUrl: config.baseUrl,
      defaultHeaders,
      timeout: config.timeout
    });
    if (config.enableB2B && config.b2b) {
      this.b2bContext = {
        companyId: config.b2b.companyId,
        employeeId: config.b2b.employeeId
      };
    }
    this.initialized = true;
  }
  // ==========================================
  // ApiAdapter Interface
  // ==========================================
  async initialize() {
    this.initialized = true;
  }
  isConfigured() {
    return this.initialized && !!this.config.baseUrl;
  }
  async healthCheck() {
    try {
      await this.httpClient.get("/health");
      return true;
    } catch {
      return false;
    }
  }
  // ==========================================
  // Service Accessors (Lazy Initialization)
  // ==========================================
  get products() {
    if (!this._products) {
      this._products = new MedusaProductService(
        this.httpClient,
        this.config.regionId
      );
    }
    return this._products;
  }
  get categories() {
    if (!this._categories) {
      this._categories = this.createStubCategoryService();
    }
    return this._categories;
  }
  get cart() {
    if (!this._cart) {
      if (!this.config.regionId) {
        throw new Error("regionId is required for cart operations");
      }
      this._cart = new MedusaCartService(this.httpClient, this.config.regionId);
    }
    return this._cart;
  }
  get orders() {
    if (!this._orders) {
      this._orders = this.createStubOrderService();
    }
    return this._orders;
  }
  get customers() {
    if (!this._customers) {
      this._customers = this.createStubCustomerService();
    }
    return this._customers;
  }
  get b2b() {
    if (!this.config.enableB2B) {
      return null;
    }
    if (!this._b2b) {
      this._b2b = this.createStubB2BServices();
    }
    return this._b2b;
  }
  // ==========================================
  // Authentication Methods
  // ==========================================
  setAuthToken(token) {
    this.authToken = token;
    this.httpClient.setDynamicHeader("Authorization", `Bearer ${token}`);
  }
  clearAuth() {
    this.authToken = null;
    this.httpClient.removeDynamicHeader("Authorization");
  }
  getAuthToken() {
    return this.authToken;
  }
  // ==========================================
  // B2B Context Methods
  // ==========================================
  setB2BContext(companyId, employeeId) {
    this.b2bContext = { companyId, employeeId };
    this.httpClient.setDynamicHeader("x-company-id", companyId);
    if (employeeId) {
      this.httpClient.setDynamicHeader("x-employee-id", employeeId);
    }
  }
  clearB2BContext() {
    this.b2bContext = null;
    this.httpClient.removeDynamicHeader("x-company-id");
    this.httpClient.removeDynamicHeader("x-employee-id");
  }
  getB2BContext() {
    return this.b2bContext;
  }
  isB2BEnabled() {
    return this.config.enableB2B ?? false;
  }
  // ==========================================
  // HTTP Client Access
  // ==========================================
  getHttpClient() {
    return {
      get: (path, options) => this.httpClient.get(path, options).then((r) => r.data),
      post: (path, body, options) => this.httpClient.post(path, body, options).then((r) => r.data),
      put: (path, body, options) => this.httpClient.put(path, body, options).then((r) => r.data),
      patch: (path, body, options) => this.httpClient.patch(path, body, options).then((r) => r.data),
      delete: (path, options) => this.httpClient.delete(path, options).then((r) => r.data)
    };
  }
  // ==========================================
  // Stub Services (to be implemented)
  // ==========================================
  createStubCategoryService() {
    const notImplemented = () => {
      throw new Error("Category service not implemented for Medusa adapter");
    };
    return {
      list: async () => [],
      get: async () => notImplemented(),
      getBySlug: async () => notImplemented(),
      getTree: async () => [],
      getRoots: async () => [],
      getChildren: async () => [],
      getBreadcrumbs: async () => [],
      getMany: async () => []
    };
  }
  createStubOrderService() {
    const notImplemented = () => {
      throw new Error("Order service not implemented for Medusa adapter");
    };
    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false
    });
    return {
      list: async () => emptyPaginated(),
      get: async () => notImplemented(),
      getByNumber: async () => notImplemented(),
      create: async () => notImplemented(),
      createDirect: async () => notImplemented(),
      cancel: async () => notImplemented(),
      updateNotes: async () => notImplemented(),
      getFulfillments: async () => [],
      getRefunds: async () => [],
      requestRefund: async () => notImplemented(),
      getCustomerOrders: async () => emptyPaginated(),
      getCompanyOrders: async () => emptyPaginated(),
      reorder: async () => notImplemented(),
      getInvoiceUrl: async () => notImplemented(),
      track: async () => notImplemented()
    };
  }
  createStubCustomerService() {
    const notImplemented = () => {
      throw new Error("Customer service not implemented for Medusa adapter");
    };
    return {
      getCurrent: async () => notImplemented(),
      get: async () => notImplemented(),
      getByEmail: async () => notImplemented(),
      update: async () => notImplemented(),
      register: async () => notImplemented(),
      login: async () => notImplemented(),
      logout: async () => {
      },
      refreshToken: async () => notImplemented(),
      requestPasswordReset: async () => notImplemented(),
      resetPassword: async () => notImplemented(),
      changePassword: async () => notImplemented(),
      listAddresses: async () => [],
      getAddress: async () => notImplemented(),
      addAddress: async () => notImplemented(),
      updateAddress: async () => notImplemented(),
      deleteAddress: async () => {
      },
      setDefaultAddress: async () => notImplemented(),
      getDefaultShippingAddress: async () => null,
      getDefaultBillingAddress: async () => null,
      delete: async () => {
      }
    };
  }
  createStubB2BServices() {
    const notImplemented = () => {
      throw new Error("B2B service not implemented. Requires Medusa B2B plugins.");
    };
    const emptyPaginated = () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
      hasNextPage: false,
      hasPreviousPage: false
    });
    return {
      companies: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getBySlug: async () => notImplemented(),
        getCurrent: async () => null,
        register: async () => notImplemented(),
        update: async () => notImplemented(),
        updateStatus: async () => notImplemented(),
        updateTier: async () => notImplemented(),
        listAddresses: async () => [],
        addAddress: async () => notImplemented(),
        updateAddress: async () => notImplemented(),
        deleteAddress: async () => {
        },
        setDefaultAddress: async () => notImplemented(),
        getCreditInfo: async () => notImplemented(),
        adjustCredit: async () => notImplemented(),
        getCreditHistory: async () => emptyPaginated(),
        updateCreditLimit: async () => notImplemented(),
        addTags: async () => notImplemented(),
        removeTags: async () => notImplemented(),
        delete: async () => {
        }
      },
      employees: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getCurrent: async () => notImplemented(),
        invite: async () => notImplemented(),
        resendInvitation: async () => notImplemented(),
        cancelInvitation: async () => {
        },
        acceptInvitation: async () => notImplemented(),
        listInvitations: async () => [],
        update: async () => notImplemented(),
        updateStatus: async () => notImplemented(),
        updateRole: async () => notImplemented(),
        updatePermissions: async () => notImplemented(),
        updateSpendingLimits: async () => notImplemented(),
        resetSpending: async () => notImplemented(),
        getPermissions: async () => [],
        hasPermission: async () => false,
        login: async () => notImplemented(),
        logout: async () => {
        },
        refreshToken: async () => notImplemented(),
        changePassword: async () => {
        },
        requestPasswordReset: async () => {
        },
        resetPassword: async () => {
        },
        getActivity: async () => emptyPaginated(),
        listDepartments: async () => [],
        createDepartment: async () => notImplemented(),
        updateDepartment: async () => notImplemented(),
        deleteDepartment: async () => {
        },
        getByDepartment: async () => [],
        delete: async () => {
        }
      },
      quotes: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getByNumber: async () => notImplemented(),
        createFromCart: async () => notImplemented(),
        create: async () => notImplemented(),
        update: async () => notImplemented(),
        submit: async () => notImplemented(),
        accept: async () => notImplemented(),
        reject: async () => notImplemented(),
        cancel: async () => notImplemented(),
        convertToOrder: async () => notImplemented(),
        convertToCart: async () => notImplemented(),
        requestRevision: async () => notImplemented(),
        createRevision: async () => notImplemented(),
        addItem: async () => notImplemented(),
        updateItem: async () => notImplemented(),
        removeItem: async () => notImplemented(),
        getMessages: async () => [],
        sendMessage: async () => notImplemented(),
        markMessagesRead: async () => {
        },
        uploadAttachment: async () => notImplemented(),
        deleteAttachment: async () => {
        },
        generatePdf: async () => notImplemented(),
        getPdfUrl: async () => notImplemented(),
        getByCompany: async () => emptyPaginated(),
        getByEmployee: async () => emptyPaginated(),
        getRequiringAttention: async () => [],
        delete: async () => {
        }
      },
      approvals: {
        list: async () => emptyPaginated(),
        get: async () => notImplemented(),
        getByNumber: async () => notImplemented(),
        getMyPending: async () => emptyPaginated(),
        getMySubmitted: async () => emptyPaginated(),
        getStats: async () => notImplemented(),
        takeAction: async () => notImplemented(),
        approve: async () => notImplemented(),
        reject: async () => notImplemented(),
        delegate: async () => notImplemented(),
        escalate: async () => notImplemented(),
        requestInfo: async () => notImplemented(),
        addComment: async () => notImplemented(),
        listWorkflows: async () => [],
        getWorkflow: async () => notImplemented(),
        createWorkflow: async () => notImplemented(),
        updateWorkflow: async () => notImplemented(),
        deleteWorkflow: async () => {
        },
        activateWorkflow: async () => notImplemented(),
        deactivateWorkflow: async () => notImplemented(),
        listDelegations: async () => [],
        createDelegation: async () => notImplemented(),
        cancelDelegation: async () => {
        },
        getMyDelegations: async () => [],
        getDelegationsToMe: async () => [],
        approveMany: async () => /* @__PURE__ */ new Map(),
        rejectMany: async () => /* @__PURE__ */ new Map()
      },
      spending: {
        listLimits: async () => [],
        getLimit: async () => notImplemented(),
        getEmployeeLimits: async () => [],
        getDepartmentLimits: async () => [],
        createLimit: async () => notImplemented(),
        updateLimit: async () => notImplemented(),
        deleteLimit: async () => {
        },
        resetLimit: async () => notImplemented(),
        listRules: async () => [],
        getRule: async () => notImplemented(),
        createRule: async () => notImplemented(),
        updateRule: async () => notImplemented(),
        deleteRule: async () => {
        },
        activateRule: async () => notImplemented(),
        deactivateRule: async () => notImplemented(),
        checkPurchase: async () => ({
          allowed: true,
          affectedLimits: [],
          triggeredRules: [],
          requiresApproval: false
        }),
        getRemainingBudget: async () => 0,
        listTransactions: async () => emptyPaginated(),
        getEmployeeTransactions: async () => emptyPaginated(),
        recordAdjustment: async () => notImplemented(),
        getReport: async () => notImplemented(),
        getBudgetSummaries: async () => [],
        getEmployeeBudgetSummary: async () => [],
        getDepartmentBudgetSummary: async () => notImplemented(),
        exportReport: async () => notImplemented(),
        getAlerts: async () => [],
        dismissAlert: async () => {
        }
      }
    };
  }
};
function createMedusaClient(config) {
  return new MedusaCommerceClient(config);
}

// src/index.ts
function registerMedusaProvider() {
  registerProvider("medusa", (config) => {
    return createMedusaClient(config);
  });
}
try {
  registerMedusaProvider();
} catch {
}

export { MedusaCartService, MedusaCommerceClient, MedusaProductService, createMedusaClient, mapMedusaCart, mapMedusaCategory, mapMedusaDiscount, mapMedusaLineItem, mapMedusaProduct, mapMedusaShippingOptions, mapMedusaTotals, registerMedusaProvider };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map