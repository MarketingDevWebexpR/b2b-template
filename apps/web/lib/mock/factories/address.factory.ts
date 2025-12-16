/**
 * Address Factory - Generation d'adresses mock
 *
 * @packageDocumentation
 */

import { faker, generateId } from './base';

export interface MockAddress {
  id: string;
  label: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  countryCode: string;
  phone?: string;
  email?: string;
}

const addressTypes: Array<'billing' | 'shipping' | 'both'> = ['billing', 'shipping', 'both'];

const addressLabels = [
  'Siege social',
  'Bureau principal',
  'Entrepot Paris',
  'Entrepot Lyon',
  'Succursale Marseille',
  'Atelier',
  'Showroom',
  'Centre logistique',
  'Point de vente',
  'Bureau commercial',
];

/**
 * Cree une adresse mock
 */
export function createMockAddress(overrides: Partial<MockAddress> = {}): MockAddress {
  return {
    id: generateId('addr'),
    label: faker.helpers.arrayElement(addressLabels),
    type: faker.helpers.arrayElement(addressTypes),
    isDefault: faker.datatype.boolean({ probability: 0.2 }),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    company: faker.company.name(),
    address1: faker.location.streetAddress(),
    address2: faker.datatype.boolean() ? faker.location.secondaryAddress() : undefined,
    city: faker.location.city(),
    state: faker.location.state(),
    postalCode: faker.location.zipCode(),
    country: 'France',
    countryCode: 'FR',
    phone: faker.phone.number(),
    email: faker.internet.email(),
    ...overrides,
  };
}

/**
 * Cree plusieurs adresses mock
 */
export function createMockAddresses(count: number = 5): MockAddress[] {
  const addresses = Array.from({ length: count }, () => createMockAddress());

  // Assurer qu'au moins une adresse est par defaut
  if (!addresses.some(a => a.isDefault)) {
    addresses[0].isDefault = true;
  }

  return addresses;
}

// Pre-generated addresses for consistency
export const mockAddresses = createMockAddresses(20);
