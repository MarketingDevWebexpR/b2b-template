/**
 * User Factory - Generation d'utilisateurs B2B mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem } from './base';

export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  phone?: string;
  role: 'admin' | 'manager' | 'buyer' | 'viewer';
  permissions: string[];
  companyId: string;
  departmentId?: string;
  spendingLimit?: number;
  currentSpending: number;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

const roles: Array<MockUser['role']> = ['admin', 'manager', 'buyer', 'viewer'];

const rolePermissions: Record<MockUser['role'], string[]> = {
  admin: [
    'manage_company',
    'manage_users',
    'manage_roles',
    'manage_addresses',
    'manage_budgets',
    'view_all_orders',
    'create_orders',
    'approve_orders',
    'manage_quotes',
    'view_reports',
    'export_data',
  ],
  manager: [
    'view_team_orders',
    'create_orders',
    'approve_orders',
    'manage_quotes',
    'view_reports',
    'manage_addresses',
  ],
  buyer: [
    'create_orders',
    'view_own_orders',
    'create_quotes',
    'view_own_quotes',
    'manage_lists',
  ],
  viewer: [
    'view_catalog',
    'view_own_orders',
    'view_own_quotes',
  ],
};

const departments = [
  'Direction',
  'Achats',
  'Commercial',
  'Logistique',
  'Marketing',
  'Production',
  'Finance',
  'RH',
];

/**
 * Cree un utilisateur mock
 */
export function createMockUser(
  companyId: string,
  overrides: Partial<MockUser> = {}
): MockUser {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const role = overrides.role || randomItem(roles);
  const spendingLimit = role === 'buyer' ? faker.number.int({ min: 1000, max: 50000 }) : undefined;

  return {
    id: generateId('user'),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    avatar: faker.image.avatar(),
    phone: faker.phone.number(),
    role,
    permissions: rolePermissions[role],
    companyId,
    departmentId: faker.datatype.boolean() ? generateId('dept') : undefined,
    spendingLimit,
    currentSpending: spendingLimit
      ? faker.number.int({ min: 0, max: spendingLimit })
      : 0,
    isActive: faker.datatype.boolean({ probability: 0.9 }),
    lastLoginAt: faker.datatype.boolean()
      ? faker.date.recent({ days: 30 }).toISOString()
      : undefined,
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    ...overrides,
  };
}

/**
 * Cree plusieurs utilisateurs pour une entreprise
 */
export function createMockUsers(
  companyId: string,
  count: number = 10
): MockUser[] {
  const users: MockUser[] = [];

  // Toujours creer au moins un admin
  users.push(createMockUser(companyId, { role: 'admin' }));

  // Creer quelques managers
  const managerCount = Math.max(1, Math.floor(count * 0.2));
  for (let i = 0; i < managerCount; i++) {
    users.push(createMockUser(companyId, { role: 'manager' }));
  }

  // Remplir avec des buyers et viewers
  while (users.length < count) {
    const role = faker.datatype.boolean({ probability: 0.7 }) ? 'buyer' : 'viewer';
    users.push(createMockUser(companyId, { role }));
  }

  return users;
}

export { departments };
