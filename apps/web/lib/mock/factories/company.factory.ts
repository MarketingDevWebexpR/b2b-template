/**
 * Company Factory - Generation d'entreprises B2B mock
 *
 * @packageDocumentation
 */

import { faker, generateId, randomItem, randomPrice } from './base';
import { createMockAddresses, type MockAddress } from './address.factory';
import { createMockUsers, departments, type MockUser } from './user.factory';

export interface MockDepartment {
  id: string;
  name: string;
  budget?: number;
  spent: number;
  managerId?: string;
}

export interface MockCompany {
  id: string;
  name: string;
  legalName: string;
  siret: string;
  vatNumber: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  industry: string;
  size: 'small' | 'medium' | 'large' | 'enterprise';
  addresses: MockAddress[];
  billingAddressId: string;
  shippingAddressId: string;
  creditLimit: number;
  currentCredit: number;
  paymentTerms: number;
  discountPercentage: number;
  pricingTierId: string;
  users: MockUser[];
  departments: MockDepartment[];
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

const industries = [
  'Bijouterie',
  'Horlogerie',
  'Mode et accessoires',
  'Luxe',
  'Commerce de detail',
  'E-commerce',
  'Distribution',
  'Hotel et restauration',
  'Evenementiel',
  'Corporate gifts',
];

const companySizes: Array<MockCompany['size']> = ['small', 'medium', 'large', 'enterprise'];

const sizeToCreditLimit: Record<MockCompany['size'], { min: number; max: number }> = {
  small: { min: 5000, max: 20000 },
  medium: { min: 20000, max: 100000 },
  large: { min: 100000, max: 500000 },
  enterprise: { min: 500000, max: 2000000 },
};

const sizeToUserCount: Record<MockCompany['size'], { min: number; max: number }> = {
  small: { min: 2, max: 5 },
  medium: { min: 5, max: 15 },
  large: { min: 15, max: 50 },
  enterprise: { min: 50, max: 200 },
};

/**
 * Genere un numero SIRET valide (format francais)
 */
function generateSiret(): string {
  const siren = faker.string.numeric(9);
  const nic = faker.string.numeric(5);
  return `${siren}${nic}`;
}

/**
 * Genere un numero de TVA intracommunautaire
 */
function generateVatNumber(): string {
  const key = faker.string.numeric(2);
  const siren = faker.string.numeric(9);
  return `FR${key}${siren}`;
}

/**
 * Cree les departements d'une entreprise
 */
function createDepartments(size: MockCompany['size']): MockDepartment[] {
  const deptCount = {
    small: 2,
    medium: 4,
    large: 6,
    enterprise: 8,
  }[size];

  const selectedDepts = faker.helpers.arrayElements(departments, deptCount);

  return selectedDepts.map((name) => {
    const budget = faker.datatype.boolean({ probability: 0.7 })
      ? faker.number.int({ min: 5000, max: 100000 })
      : undefined;

    return {
      id: generateId('dept'),
      name,
      budget,
      spent: budget ? faker.number.int({ min: 0, max: budget }) : 0,
      managerId: faker.datatype.boolean() ? generateId('user') : undefined,
    };
  });
}

/**
 * Cree une entreprise mock complete
 */
export function createMockCompany(overrides: Partial<MockCompany> = {}): MockCompany {
  const id = generateId('company');
  const size = overrides.size || randomItem(companySizes);
  const creditLimits = sizeToCreditLimit[size];
  const userCounts = sizeToUserCount[size];

  const creditLimit = faker.number.int(creditLimits);
  const addresses = createMockAddresses(faker.number.int({ min: 2, max: 6 }));
  const users = createMockUsers(id, faker.number.int(userCounts));
  const companyDepts = createDepartments(size);

  // Assigner des utilisateurs aux departements
  users.forEach((user) => {
    if (faker.datatype.boolean({ probability: 0.8 }) && companyDepts.length > 0) {
      user.departmentId = randomItem(companyDepts).id;
    }
  });

  const billingAddress = addresses.find((a) => a.type === 'billing' || a.type === 'both') || addresses[0];
  const shippingAddress = addresses.find((a) => a.type === 'shipping' || a.type === 'both') || addresses[0];

  const companyName = faker.company.name();

  return {
    id,
    name: companyName,
    legalName: `${companyName} ${faker.helpers.arrayElement(['SAS', 'SARL', 'SA', 'EURL', 'SNC'])}`,
    siret: generateSiret(),
    vatNumber: generateVatNumber(),
    email: faker.internet.email({ provider: faker.internet.domainName() }),
    phone: faker.phone.number(),
    website: faker.datatype.boolean() ? faker.internet.url() : undefined,
    logo: faker.datatype.boolean() ? faker.image.urlLoremFlickr({ category: 'business' }) : undefined,
    industry: randomItem(industries),
    size,
    addresses,
    billingAddressId: billingAddress.id,
    shippingAddressId: shippingAddress.id,
    creditLimit,
    currentCredit: faker.number.int({ min: 0, max: creditLimit }),
    paymentTerms: faker.helpers.arrayElement([0, 15, 30, 45, 60, 90]),
    discountPercentage: faker.helpers.arrayElement([0, 5, 10, 15, 20, 25]),
    pricingTierId: `tier_${faker.helpers.arrayElement(['standard', 'silver', 'gold', 'platinum'])}`,
    users,
    departments: companyDepts,
    isActive: faker.datatype.boolean({ probability: 0.95 }),
    isVerified: faker.datatype.boolean({ probability: 0.85 }),
    createdAt: faker.date.past({ years: 3 }).toISOString(),
    updatedAt: faker.date.recent({ days: 90 }).toISOString(),
    ...overrides,
  };
}

/**
 * Cree plusieurs entreprises mock
 */
export function createMockCompanies(count: number = 10): MockCompany[] {
  return Array.from({ length: count }, () => createMockCompany());
}

// Pre-generate companies for consistency
export const mockCompanies = createMockCompanies(15);

// Get the current company (first one for demo)
export const currentCompany = mockCompanies[0];
export const currentUser = currentCompany.users.find((u) => u.role === 'admin') || currentCompany.users[0];
