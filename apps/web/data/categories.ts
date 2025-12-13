import { Category } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Bagues',
    slug: 'bagues',
    description: 'Des bagues d\'exception, alliant savoir-faire artisanal et design contemporain. Chaque piece est une oeuvre unique.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80',
    productCount: 24,
  },
  {
    id: '2',
    name: 'Colliers',
    slug: 'colliers',
    description: 'Colliers raffines pour sublimer chaque decollete. Or, diamants et pierres precieuses s\'entrelacent avec elegance.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80',
    productCount: 18,
  },
  {
    id: '3',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Bracelets d\'exception pour orner vos poignets. Du jonc classique au bracelet riviere, decouvrez notre collection.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80',
    productCount: 15,
  },
  {
    id: '4',
    name: 'Boucles d\'oreilles',
    slug: 'boucles-oreilles',
    description: 'Boucles d\'oreilles qui capturent la lumiere et illuminent votre visage. Creoles, pendantes ou puces, trouvez votre style.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
    productCount: 22,
  },
  {
    id: '5',
    name: 'Montres',
    slug: 'montres',
    description: 'Montres de prestige ou l\'horlogerie rencontre la joaillerie. Des garde-temps d\'exception pour les connaisseurs.',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    productCount: 12,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((cat) => cat.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((cat) => cat.id === id);
}
