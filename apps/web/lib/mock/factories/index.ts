/**
 * Mock Data Factories - Export Central
 *
 * Ce module fournit des donnees mockees pour toutes les entites
 * de la plateforme B2B, permettant de visualiser les fonctionnalites
 * avant la connexion au back-end Medusa.
 *
 * @packageDocumentation
 */

// Base utilities
export { faker, generateId, randomDate, randomPrice, randomItem, randomItems, slugify } from './base';

// Address
export {
  createMockAddress,
  createMockAddresses,
  mockAddresses,
  type MockAddress,
} from './address.factory';

// Category
export {
  createMockCategory,
  createCategoryTree,
  getFlatCategories,
  mockCategoryTree,
  mockCategories,
  mockParentCategories,
  mockChildCategories,
  type MockCategory,
} from './category.factory';

// Product
export {
  createMockProduct,
  createMockProducts,
  searchProducts,
  mockProducts,
  newProducts,
  bestSellers,
  onSaleProducts,
  type MockProduct,
  type MockProductVariant,
} from './product.factory';

// User
export {
  createMockUser,
  createMockUsers,
  departments,
  type MockUser,
} from './user.factory';

// Company
export {
  createMockCompany,
  createMockCompanies,
  mockCompanies,
  currentCompany,
  currentUser,
  type MockCompany,
  type MockDepartment,
} from './company.factory';

// Cart
export {
  createCartItem,
  createMockCart,
  createMockSavedCart,
  createMockSavedCarts,
  mockCurrentCart,
  mockEmptyCart,
  type MockCart,
  type MockCartItem,
  type MockSavedCart,
} from './cart.factory';

// Order
export {
  createMockOrder,
  createMockOrders,
  filterOrdersByStatus,
  getOrderStats,
  type MockOrder,
  type MockOrderItem,
  type MockShipment,
  type OrderStatus,
  type PaymentStatus,
} from './order.factory';

// Quote
export {
  createMockQuote,
  createMockQuotes,
  getQuoteStats,
  type MockQuote,
  type MockQuoteItem,
  type MockQuoteMessage,
  type QuoteStatus,
} from './quote.factory';

// Warehouse
export {
  createMockWarehouse,
  createWarehouseStock,
  getProductAvailability,
  findNearestWarehouse,
  mockWarehouses,
  mockWarehouseStocks,
  mockPickupPoints,
  type MockWarehouse,
  type MockWarehouseStock,
} from './warehouse.factory';
