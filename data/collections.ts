/**
 * Collections Data
 *
 * Collections represent curated groupings of jewelry pieces,
 * distinct from categories which are product types (rings, necklaces, etc.)
 */

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  productCount: number;
}

export const collections: Collection[] = [
  {
    id: '1',
    slug: 'haute-joaillerie',
    name: 'Haute Joaillerie',
    description:
      "Pieces d'exception creees par nos maitres artisans. Chaque creation est unique, fruit d'un savoir-faire seculaire et de pierres soigneusement selectionnees.",
    productCount: 12,
  },
  {
    id: '2',
    slug: 'bagues',
    name: 'Bagues',
    description:
      "Bagues en or, argent et pierres precieuses. Des solitaires aux alliances, decouvrez notre collection de bagues d'exception.",
    productCount: 8,
  },
  {
    id: '3',
    slug: 'colliers',
    name: 'Colliers',
    description:
      "Colliers et chaines d'exception pour sublimer chaque decollete. Or, diamants et pierres precieuses s'entrelacent avec elegance.",
    productCount: 15,
  },
  {
    id: '4',
    slug: 'bracelets',
    name: 'Bracelets',
    description:
      "Bracelets elegants pour toutes les occasions. Du jonc classique au bracelet riviere, trouvez le bijou qui vous ressemble.",
    productCount: 10,
  },
  {
    id: '5',
    slug: 'boucles-oreilles',
    name: "Boucles d'Oreilles",
    description:
      "Boucles d'oreilles raffinees qui capturent la lumiere et illuminent votre visage. Creoles, pendantes ou puces, trouvez votre style.",
    productCount: 6,
  },
];

/**
 * Get a collection by its slug
 */
export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

/**
 * Get a collection by its ID
 */
export function getCollectionById(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

/**
 * Get all collections except the one with the given slug
 */
export function getOtherCollections(currentSlug: string): Collection[] {
  return collections.filter((c) => c.slug !== currentSlug);
}
