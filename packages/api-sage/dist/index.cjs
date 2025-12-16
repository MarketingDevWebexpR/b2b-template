'use strict';

var apiCore = require('@maison/api-core');

// src/client.ts
var DEFAULT_API_VERSION = "v1";
var SageApiClient = class extends apiCore.BaseApiClient {
  name = "sage";
  version = "1.0.0";
  companyId;
  apiVersion;
  initialized = false;
  constructor(config) {
    super(config);
    this.companyId = config.companyId;
    this.apiVersion = config.apiVersion ?? DEFAULT_API_VERSION;
  }
  /**
   * Initialize the Sage client
   */
  async initialize() {
    const healthy = await this.healthCheck();
    if (!healthy) {
      throw new Error("Failed to connect to Sage API");
    }
    this.initialized = true;
  }
  /**
   * Check if the client is properly configured
   */
  isConfigured() {
    return this.initialized && Boolean(this.config.authToken);
  }
  /**
   * Perform health check on Sage API
   */
  async healthCheck() {
    try {
      await this.get(`/${this.apiVersion}/health`);
      return true;
    } catch {
      return false;
    }
  }
  /**
   * Get a list of products from Sage
   */
  async getProducts(options) {
    const response = await this.get(
      `/${this.apiVersion}/companies/${this.companyId}/products`,
      {
        params: {
          page: options?.page ?? 1,
          pageSize: options?.pageSize ?? 50,
          category: options?.category,
          active: options?.active
        }
      }
    );
    const { products, total, page, pageSize } = response.data;
    return {
      items: products,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
      hasPreviousPage: page > 1
    };
  }
  /**
   * Get a single product by ID
   */
  async getProduct(productId) {
    return this.get(
      `/${this.apiVersion}/companies/${this.companyId}/products/${productId}`
    );
  }
  /**
   * Get inventory for all products or a specific product
   */
  async getInventory(productId) {
    const path = productId ? `/${this.apiVersion}/companies/${this.companyId}/inventory/${productId}` : `/${this.apiVersion}/companies/${this.companyId}/inventory`;
    const response = await this.get(path);
    return response.data.inventory;
  }
  /**
   * Update inventory quantity for a product
   */
  async updateInventory(productId, warehouseId, quantity) {
    return this.patch(
      `/${this.apiVersion}/companies/${this.companyId}/inventory/${productId}`,
      {
        warehouseId,
        quantity
      }
    );
  }
  /**
   * Sync products from Sage (full sync)
   */
  async syncProducts() {
    const response = await this.post(`/${this.apiVersion}/companies/${this.companyId}/sync/products`);
    return response.data;
  }
};

// src/mappers/product.ts
function generateSlug(name, sku) {
  if (!name) return sku.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
function mapSageArticle(raw) {
  const collection = raw.Statistique1 || void 0;
  const style = raw.Statistique2 || void 0;
  let brand;
  if (raw.InfosLibres) {
    const brandInfo = raw.InfosLibres.find(
      (info) => info.Name === "Marque commerciale"
    );
    if (brandInfo && brandInfo.Value) {
      brand = String(brandInfo.Value);
    }
  }
  const isAvailable = raw.Publie && !raw.EstEnSommeil && !raw.InterdireCommande;
  const images = [];
  if (raw.Photo) {
    images.push(raw.Photo);
  }
  return {
    id: raw.Reference,
    reference: raw.Reference,
    name: raw.Intitule,
    slug: generateSlug(raw.Intitule, raw.Reference),
    description: raw.Langue1 ?? raw.Intitule,
    shortDescription: raw.Intitule,
    price: raw.PrixVente,
    isPriceTTC: raw.EstEnPrixTTTC,
    images,
    categoryId: raw.CodeFamille,
    materials: [],
    weightUnit: "g",
    stock: 0,
    // Stock comes from separate inventory call
    isAvailable,
    featured: false,
    isNew: false,
    createdAt: raw.DateCreation,
    // Optional properties
    ...raw.Langue1 && { nameEn: raw.Langue1 },
    ...raw.CodeBarres && { ean: raw.CodeBarres },
    ...collection && { collection },
    ...style && { style },
    ...raw.PoidsNet && { weight: raw.PoidsNet },
    ...brand && { brand },
    ...raw.Pays && { origin: raw.Pays },
    ...raw.Garantie && { warranty: raw.Garantie }
  };
}
function mapSageProduct(raw) {
  return {
    id: raw.id,
    reference: raw.sku,
    name: raw.name,
    slug: generateSlug(raw.name, raw.sku),
    description: raw.description ?? "",
    shortDescription: raw.description ?? "",
    price: raw.price,
    isPriceTTC: false,
    images: [],
    categoryId: raw.category ?? "",
    materials: [],
    weightUnit: "g",
    stock: 0,
    isAvailable: raw.active,
    featured: false,
    isNew: false,
    createdAt: raw.createdAt,
    ...raw.category && { collection: raw.category }
  };
}
function mapSageProducts(rawProducts) {
  return rawProducts.map(mapSageProduct);
}
function mapSageArticles(rawArticles) {
  return rawArticles.map(mapSageArticle);
}

// src/services/products.ts
var SageProductService = class {
  constructor(client) {
    this.client = client;
  }
  /**
   * List products from Sage
   */
  async list(options) {
    const result = await this.client.getProducts({
      page: options?.page ?? 1,
      pageSize: options?.pageSize ?? 50,
      ...options?.categoryId && { category: options.categoryId },
      ...options?.availableOnly !== void 0 && { active: options.availableOnly }
    });
    return {
      items: mapSageProducts([...result.items]),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage
    };
  }
  /**
   * Get a single product by ID (reference in Sage)
   */
  async get(id, _options) {
    const response = await this.client.getProduct(id);
    const product = mapSageProduct(response.data);
    return product;
  }
  /**
   * Get product by slug
   *
   * @remarks
   * Sage doesn't use slugs natively, so we search by reference.
   */
  async getBySlug(slug, options) {
    const result = await this.list({ pageSize: 100 });
    const found = result.items.find((p) => p.slug === slug);
    if (!found) {
      throw new Error(`Product with slug "${slug}" not found`);
    }
    return this.get(found.id, options);
  }
  /**
   * Get product by SKU (reference in Sage)
   */
  async getBySku(sku, options) {
    return this.get(sku, options);
  }
  /**
   * Search products
   *
   * @remarks
   * Sage has limited search capabilities. This implementation
   * fetches all products and filters client-side.
   */
  async search(query, options) {
    const result = await this.list({
      ...options,
      pageSize: options?.pageSize ?? 100
    });
    const queryLower = query.toLowerCase();
    const filtered = result.items.filter(
      (p) => p.name.toLowerCase().includes(queryLower) || p.reference.toLowerCase().includes(queryLower) || p.description?.toLowerCase().includes(queryLower)
    );
    return {
      products: filtered,
      total: filtered.length
    };
  }
  /**
   * Get multiple products by IDs
   */
  async getMany(ids) {
    const products = [];
    for (const id of ids) {
      try {
        const product = await this.get(id);
        products.push(product);
      } catch {
        console.warn(`Failed to fetch product ${id} from Sage`);
      }
    }
    return products;
  }
  /**
   * Get featured products
   *
   * @remarks
   * Sage doesn't have a concept of featured products.
   * Returns first N products instead.
   */
  async getFeatured(limit = 10) {
    const result = await this.list({ pageSize: limit, availableOnly: true });
    return [...result.items];
  }
  /**
   * Get new products
   *
   * @remarks
   * Returns products created within the specified days.
   */
  async getNew(limit = 10, daysBack = 30) {
    const result = await this.list({ pageSize: 100, availableOnly: true });
    const cutoff = /* @__PURE__ */ new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const newProducts = result.items.filter((p) => {
      if (!p.createdAt) return false;
      return new Date(p.createdAt) >= cutoff;
    });
    return newProducts.slice(0, limit);
  }
  /**
   * Get products by category
   */
  async getByCategory(categoryId, options) {
    return this.list({ ...options, categoryId });
  }
  /**
   * Get inventory for a product
   */
  async getInventory(productId) {
    const inventory = await this.client.getInventory(productId);
    if (inventory.length === 0) {
      return {
        productId,
        sku: productId,
        available: 0,
        reserved: 0
      };
    }
    const totalAvailable = inventory.reduce((sum, inv) => sum + inv.availableQuantity, 0);
    const totalReserved = inventory.reduce((sum, inv) => sum + inv.reservedQuantity, 0);
    const firstItem = inventory[0];
    return {
      productId,
      sku: firstItem ? firstItem.sku : productId,
      available: totalAvailable,
      reserved: totalReserved
    };
  }
  /**
   * Get inventory for multiple products
   */
  async getInventoryBulk(productIds) {
    const inventoryMap = /* @__PURE__ */ new Map();
    const allInventory = await this.client.getInventory();
    for (const productId of productIds) {
      const productInventory = allInventory.filter((inv) => inv.productId === productId);
      if (productInventory.length > 0) {
        const totalAvailable = productInventory.reduce(
          (sum, inv) => sum + inv.availableQuantity,
          0
        );
        const totalReserved = productInventory.reduce(
          (sum, inv) => sum + inv.reservedQuantity,
          0
        );
        const firstItem = productInventory[0];
        inventoryMap.set(productId, {
          productId,
          sku: firstItem ? firstItem.sku : productId,
          available: totalAvailable,
          reserved: totalReserved
        });
      } else {
        inventoryMap.set(productId, {
          productId,
          sku: productId,
          available: 0,
          reserved: 0
        });
      }
    }
    return inventoryMap;
  }
};

// src/commerce-client.ts
function notImplemented(method) {
  throw new Error(`${method} is not available in Sage adapter. Sage is an ERP system, not a full e-commerce platform.`);
}
function createStubCategoryService() {
  return {
    async list() {
      return [];
    },
    async get(_id) {
      notImplemented("categories.get");
    },
    async getBySlug(_slug) {
      notImplemented("categories.getBySlug");
    },
    async getTree() {
      return [];
    },
    async getRoots() {
      return [];
    },
    async getChildren(_parentId) {
      return [];
    },
    async getBreadcrumbs(_categoryId) {
      return [];
    },
    async getMany(_ids) {
      return [];
    }
  };
}
function createStubCartService() {
  return {
    async get(_cartId) {
      notImplemented("cart.get");
    },
    async create(_regionId, _customerId) {
      notImplemented("cart.create");
    },
    async addItem(_cartId, _input) {
      notImplemented("cart.addItem");
    },
    async updateItem(_cartId, _itemId, _input) {
      notImplemented("cart.updateItem");
    },
    async removeItem(_cartId, _itemId) {
      notImplemented("cart.removeItem");
    },
    async addItemsBulk(_cartId, _input) {
      notImplemented("cart.addItemsBulk");
    },
    async clear(_cartId) {
      notImplemented("cart.clear");
    },
    async applyDiscount(_cartId, _code) {
      notImplemented("cart.applyDiscount");
    },
    async removeDiscount(_cartId, _discountId) {
      notImplemented("cart.removeDiscount");
    },
    async setShippingOption(_cartId, _optionId) {
      notImplemented("cart.setShippingOption");
    },
    async getShippingOptions(_cartId) {
      return [];
    },
    async setCustomer(_cartId, _customerId) {
      notImplemented("cart.setCustomer");
    },
    async setAddresses(_cartId, _shippingAddressId, _billingAddressId) {
      notImplemented("cart.setAddresses");
    },
    async updateMetadata(_cartId, _metadata) {
      notImplemented("cart.updateMetadata");
    },
    async delete(_cartId) {
    },
    async merge(_guestCartId, _customerCartId) {
      notImplemented("cart.merge");
    }
  };
}
function createStubOrderService() {
  return {
    async list(_options) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false
      };
    },
    async get(_id) {
      notImplemented("orders.get");
    },
    async getByNumber(_orderNumber) {
      notImplemented("orders.getByNumber");
    },
    async create(_input) {
      notImplemented("orders.create");
    },
    async createDirect(_input) {
      notImplemented("orders.createDirect");
    },
    async cancel(_orderId, _reason) {
      notImplemented("orders.cancel");
    },
    async updateNotes(_orderId, _notes) {
      notImplemented("orders.updateNotes");
    },
    async getFulfillments(_orderId) {
      return [];
    },
    async getRefunds(_orderId) {
      return [];
    },
    async requestRefund(_orderId, _items, _reason) {
      notImplemented("orders.requestRefund");
    },
    async getCustomerOrders(_customerId, _options) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false
      };
    },
    async getCompanyOrders(_companyId, _options) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false
      };
    },
    async reorder(_orderId) {
      notImplemented("orders.reorder");
    },
    async getInvoiceUrl(_orderId) {
      notImplemented("orders.getInvoiceUrl");
    },
    async track(_orderId) {
      notImplemented("orders.track");
    }
  };
}
function createStubCustomerService() {
  return {
    async getCurrent() {
      notImplemented("customers.getCurrent");
    },
    async get(_id) {
      notImplemented("customers.get");
    },
    async getByEmail(_email) {
      notImplemented("customers.getByEmail");
    },
    async update(_customerId, _input) {
      notImplemented("customers.update");
    },
    async register(_email, _password, _profile) {
      notImplemented("customers.register");
    },
    async login(_email, _password) {
      notImplemented("customers.login");
    },
    async logout() {
    },
    async refreshToken(_refreshToken) {
      notImplemented("customers.refreshToken");
    },
    async requestPasswordReset(_email) {
      return { success: false, message: "Password reset not available via Sage" };
    },
    async resetPassword(_token, _newPassword) {
      return { success: false };
    },
    async changePassword(_currentPassword, _newPassword) {
      return { success: false };
    },
    async listAddresses(_customerId) {
      return [];
    },
    async getAddress(_customerId, _addressId) {
      notImplemented("customers.getAddress");
    },
    async addAddress(_customerId, _input) {
      notImplemented("customers.addAddress");
    },
    async updateAddress(_customerId, _addressId, _input) {
      notImplemented("customers.updateAddress");
    },
    async deleteAddress(_customerId, _addressId) {
    },
    async setDefaultAddress(_customerId, _addressId, _type) {
      notImplemented("customers.setDefaultAddress");
    },
    async getDefaultShippingAddress(_customerId) {
      return null;
    },
    async getDefaultBillingAddress(_customerId) {
      return null;
    },
    async delete(_customerId) {
      notImplemented("customers.delete");
    }
  };
}
var SageCommerceClient = class {
  name = "sage";
  version = "1.0.0";
  provider = "sage";
  config;
  sageClient;
  authToken = null;
  b2bContext = null;
  // Services
  products;
  categories;
  cart;
  orders;
  customers;
  b2b = null;
  // Sage doesn't support B2B workflow
  constructor(config) {
    this.config = config;
    const sageConfig = {
      baseUrl: config.baseUrl,
      companyId: config.companyId,
      ...config.apiVersion && { apiVersion: config.apiVersion },
      ...config.currency && { currency: config.currency },
      ...config.authToken && { authToken: config.authToken },
      ...config.timeout !== void 0 && { timeout: config.timeout },
      ...config.defaultHeaders && { defaultHeaders: config.defaultHeaders }
    };
    this.sageClient = new SageApiClient(sageConfig);
    if (config.authToken) {
      this.authToken = config.authToken;
    }
    this.products = new SageProductService(this.sageClient);
    this.categories = createStubCategoryService();
    this.cart = createStubCartService();
    this.orders = createStubOrderService();
    this.customers = createStubCustomerService();
  }
  /**
   * Initialize the client (verify connection)
   */
  async initialize() {
    await this.sageClient.initialize();
  }
  /**
   * Check if client is configured
   */
  isConfigured() {
    return this.sageClient.isConfigured();
  }
  /**
   * Health check
   */
  async healthCheck() {
    return this.sageClient.healthCheck();
  }
  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }
  /**
   * Clear authentication
   */
  clearAuth() {
    this.authToken = null;
  }
  /**
   * Get current auth token
   */
  getAuthToken() {
    return this.authToken;
  }
  /**
   * Set B2B context
   *
   * @remarks
   * Sage doesn't have native B2B workflow, but we track context
   * for potential filtering/reporting purposes.
   */
  setB2BContext(companyId, employeeId) {
    this.b2bContext = { companyId };
    if (employeeId) {
      this.b2bContext.employeeId = employeeId;
    }
  }
  /**
   * Clear B2B context
   */
  clearB2BContext() {
    this.b2bContext = null;
  }
  /**
   * Get current B2B context
   */
  getB2BContext() {
    return this.b2bContext;
  }
  /**
   * Check if B2B is enabled
   *
   * @remarks
   * Always returns false for Sage as it doesn't support B2B workflow.
   */
  isB2BEnabled() {
    return false;
  }
  /**
   * Get underlying HTTP client
   */
  getHttpClient() {
    return {
      get: async (path, options) => {
        const response = await this.sageClient.get(path, options);
        return response.data;
      },
      post: async (path, body, _options) => {
        const response = await this.sageClient.post(path, body);
        return response.data;
      },
      put: async (path, body, _options) => {
        const response = await this.sageClient.put(path, body);
        return response.data;
      },
      patch: async (path, body, _options) => {
        const response = await this.sageClient.patch(path, body);
        return response.data;
      },
      delete: async (path, _options) => {
        const response = await this.sageClient.delete(path);
        return response.data;
      }
    };
  }
  /**
   * Sync products from Sage (convenience method)
   *
   * @remarks
   * Triggers a full product sync from Sage ERP.
   */
  async syncProducts() {
    return this.sageClient.syncProducts();
  }
  /**
   * Update inventory (convenience method)
   *
   * @remarks
   * Updates inventory quantity in Sage for a specific product/warehouse.
   */
  async updateInventory(productId, warehouseId, quantity) {
    return this.sageClient.updateInventory(productId, warehouseId, quantity);
  }
};

exports.SageApiClient = SageApiClient;
exports.SageCommerceClient = SageCommerceClient;
exports.SageProductService = SageProductService;
exports.mapSageArticle = mapSageArticle;
exports.mapSageArticles = mapSageArticles;
exports.mapSageProduct = mapSageProduct;
exports.mapSageProducts = mapSageProducts;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map