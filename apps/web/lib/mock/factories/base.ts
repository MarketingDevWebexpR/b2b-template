/**
 * Base Factory - Configuration commune pour les mocks
 *
 * @packageDocumentation
 */

import { faker } from '@faker-js/faker/locale/fr';

// Seed pour des donnees consistantes
faker.seed(42);

export { faker };

/**
 * Genere un ID unique avec prefixe
 */
export function generateId(prefix: string): string {
  return `${prefix}_${faker.string.alphanumeric(12)}`;
}

/**
 * Genere une date aleatoire dans une plage
 */
export function randomDate(start: Date, end: Date): Date {
  return faker.date.between({ from: start, to: end });
}

/**
 * Genere un prix avec decimales
 */
export function randomPrice(min: number, max: number): number {
  return Math.round(faker.number.float({ min, max }) * 100) / 100;
}

/**
 * Choisit un element aleatoire dans un tableau
 */
export function randomItem<T>(items: T[]): T {
  return faker.helpers.arrayElement(items);
}

/**
 * Choisit plusieurs elements aleatoires dans un tableau
 */
export function randomItems<T>(items: T[], count: number): T[] {
  return faker.helpers.arrayElements(items, count);
}

/**
 * Genere un slug a partir d'un texte
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
