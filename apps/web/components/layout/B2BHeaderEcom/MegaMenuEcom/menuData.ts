/**
 * MegaMenu Data for Jewelry B2B E-commerce
 * Categories inspired by jewelry/watchmaking industry
 */

export interface SubCategory {
  id: string;
  name: string;
  href: string;
  count?: number;
}

export interface Category {
  id: string;
  name: string;
  href: string;
  icon?: string;
  subcategories: SubCategory[];
  featured?: {
    title: string;
    image: string;
    href: string;
  };
}

export interface MenuSection {
  id: string;
  title: string;
  categories: Category[];
  promo?: {
    title: string;
    description: string;
    image: string;
    href: string;
    badge?: string;
  };
}

// Catalogue menu data
export const catalogueMenu: MenuSection = {
  id: 'catalogue',
  title: 'Catalogue',
  categories: [
    {
      id: 'bagues',
      name: 'Bagues',
      href: '/categories/bagues',
      subcategories: [
        { id: 'bagues-or', name: 'Bagues en or', href: '/categories/bagues/or', count: 245 },
        { id: 'bagues-argent', name: 'Bagues en argent', href: '/categories/bagues/argent', count: 312 },
        { id: 'bagues-diamants', name: 'Bagues diamants', href: '/categories/bagues/diamants', count: 89 },
        { id: 'bagues-fiancailles', name: 'Bagues de fiancailles', href: '/categories/bagues/fiancailles', count: 156 },
        { id: 'alliances', name: 'Alliances', href: '/categories/bagues/alliances', count: 203 },
        { id: 'bagues-pierres', name: 'Bagues pierres precieuses', href: '/categories/bagues/pierres', count: 178 },
      ],
    },
    {
      id: 'colliers',
      name: 'Colliers & Pendentifs',
      href: '/categories/colliers',
      subcategories: [
        { id: 'colliers-or', name: 'Colliers en or', href: '/categories/colliers/or', count: 189 },
        { id: 'colliers-argent', name: 'Colliers en argent', href: '/categories/colliers/argent', count: 267 },
        { id: 'pendentifs', name: 'Pendentifs', href: '/categories/colliers/pendentifs', count: 445 },
        { id: 'chaines', name: 'Chaines', href: '/categories/colliers/chaines', count: 234 },
        { id: 'sautoirs', name: 'Sautoirs', href: '/categories/colliers/sautoirs', count: 98 },
        { id: 'colliers-perles', name: 'Colliers de perles', href: '/categories/colliers/perles', count: 67 },
      ],
    },
    {
      id: 'bracelets',
      name: 'Bracelets',
      href: '/categories/bracelets',
      subcategories: [
        { id: 'bracelets-or', name: 'Bracelets en or', href: '/categories/bracelets/or', count: 156 },
        { id: 'bracelets-argent', name: 'Bracelets en argent', href: '/categories/bracelets/argent', count: 234 },
        { id: 'bracelets-joncs', name: 'Joncs', href: '/categories/bracelets/joncs', count: 89 },
        { id: 'bracelets-charms', name: 'Bracelets charms', href: '/categories/bracelets/charms', count: 112 },
        { id: 'gourmettes', name: 'Gourmettes', href: '/categories/bracelets/gourmettes', count: 78 },
      ],
    },
    {
      id: 'boucles',
      name: 'Boucles d\'oreilles',
      href: '/categories/boucles-oreilles',
      subcategories: [
        { id: 'boucles-or', name: 'Boucles en or', href: '/categories/boucles-oreilles/or', count: 312 },
        { id: 'boucles-argent', name: 'Boucles en argent', href: '/categories/boucles-oreilles/argent', count: 456 },
        { id: 'creoles', name: 'Creoles', href: '/categories/boucles-oreilles/creoles', count: 134 },
        { id: 'puces', name: 'Puces', href: '/categories/boucles-oreilles/puces', count: 223 },
        { id: 'pendantes', name: 'Boucles pendantes', href: '/categories/boucles-oreilles/pendantes', count: 189 },
      ],
    },
    {
      id: 'montres',
      name: 'Montres',
      href: '/categories/montres',
      subcategories: [
        { id: 'montres-homme', name: 'Montres homme', href: '/categories/montres/homme', count: 234 },
        { id: 'montres-femme', name: 'Montres femme', href: '/categories/montres/femme', count: 267 },
        { id: 'montres-luxe', name: 'Haute horlogerie', href: '/categories/montres/luxe', count: 45 },
        { id: 'montres-sport', name: 'Montres sport', href: '/categories/montres/sport', count: 89 },
        { id: 'bracelets-montres', name: 'Bracelets de montres', href: '/categories/montres/bracelets', count: 156 },
      ],
    },
    {
      id: 'pierres',
      name: 'Pierres & Diamants',
      href: '/categories/pierres',
      subcategories: [
        { id: 'diamants', name: 'Diamants', href: '/categories/pierres/diamants', count: 89 },
        { id: 'rubis', name: 'Rubis', href: '/categories/pierres/rubis', count: 45 },
        { id: 'saphirs', name: 'Saphirs', href: '/categories/pierres/saphirs', count: 56 },
        { id: 'emeraudes', name: 'Emeraudes', href: '/categories/pierres/emeraudes', count: 34 },
        { id: 'perles', name: 'Perles', href: '/categories/pierres/perles', count: 78 },
        { id: 'pierres-fines', name: 'Pierres fines', href: '/categories/pierres/fines', count: 123 },
      ],
    },
  ],
  promo: {
    title: 'Nouveautes Printemps',
    description: 'Decouvrez nos nouveautes',
    image: '/images/promo-spring.jpg',
    href: '/categories?sort=newest',
    badge: 'Nouveau',
  },
};

// Brands menu data - Links redirect to categories with brand filter
export const marquesMenu: MenuSection = {
  id: 'marques',
  title: 'Marques',
  categories: [
    {
      id: 'marques-luxe',
      name: 'Haute Joaillerie',
      href: '/categories?brand=luxe',
      subcategories: [
        { id: 'cartier', name: 'Cartier', href: '/categories?brand=cartier' },
        { id: 'boucheron', name: 'Boucheron', href: '/categories?brand=boucheron' },
        { id: 'van-cleef', name: 'Van Cleef & Arpels', href: '/categories?brand=van-cleef' },
        { id: 'chaumet', name: 'Chaumet', href: '/categories?brand=chaumet' },
        { id: 'bulgari', name: 'Bulgari', href: '/categories?brand=bulgari' },
      ],
    },
    {
      id: 'marques-premium',
      name: 'Premium',
      href: '/categories?brand=premium',
      subcategories: [
        { id: 'dinh-van', name: 'Dinh Van', href: '/categories?brand=dinh-van' },
        { id: 'mauboussin', name: 'Mauboussin', href: '/categories?brand=mauboussin' },
        { id: 'fred', name: 'Fred', href: '/categories?brand=fred' },
        { id: 'messika', name: 'Messika', href: '/categories?brand=messika' },
        { id: 'pomellato', name: 'Pomellato', href: '/categories?brand=pomellato' },
      ],
    },
    {
      id: 'marques-horlogerie',
      name: 'Horlogerie',
      href: '/categories/montres',
      subcategories: [
        { id: 'rolex', name: 'Rolex', href: '/categories/montres?brand=rolex' },
        { id: 'omega', name: 'Omega', href: '/categories/montres?brand=omega' },
        { id: 'tag-heuer', name: 'TAG Heuer', href: '/categories/montres?brand=tag-heuer' },
        { id: 'longines', name: 'Longines', href: '/categories/montres?brand=longines' },
        { id: 'tissot', name: 'Tissot', href: '/categories/montres?brand=tissot' },
      ],
    },
    {
      id: 'marques-accessibles',
      name: 'Accessibles',
      href: '/categories?brand=accessible',
      subcategories: [
        { id: 'pandora', name: 'Pandora', href: '/categories?brand=pandora' },
        { id: 'swarovski', name: 'Swarovski', href: '/categories?brand=swarovski' },
        { id: 'fossil', name: 'Fossil', href: '/categories?brand=fossil' },
        { id: 'guess', name: 'Guess', href: '/categories?brand=guess' },
        { id: 'tommy-hilfiger', name: 'Tommy Hilfiger', href: '/categories?brand=tommy-hilfiger' },
      ],
    },
  ],
  promo: {
    title: 'Partenaires officiels',
    description: 'Distributeur agree de plus de 50 marques',
    image: '/images/brands-partners.jpg',
    href: '/categories',
  },
};

// Services menu data - Links to functional B2B pages
export const servicesMenu: MenuSection = {
  id: 'services',
  title: 'Services Pro',
  categories: [
    {
      id: 'services-achat',
      name: 'Services d\'achat',
      href: '/devis',
      subcategories: [
        { id: 'devis-rapide', name: 'Devis rapide', href: '/devis/nouveau' },
        { id: 'commande-rapide', name: 'Commande express', href: '/commande-rapide' },
        { id: 'listes-prix', name: 'Listes de prix', href: '/listes' },
        { id: 'mes-commandes', name: 'Mes commandes', href: '/commandes' },
      ],
    },
    {
      id: 'services-entreprise',
      name: 'Mon Entreprise',
      href: '/entreprise',
      subcategories: [
        { id: 'info-entreprise', name: 'Informations', href: '/entreprise' },
        { id: 'adresses', name: 'Adresses de livraison', href: '/entreprise/adresses' },
        { id: 'employes', name: 'Gestion des employes', href: '/entreprise/employes' },
        { id: 'parametres', name: 'Parametres', href: '/entreprise/parametres' },
      ],
    },
    {
      id: 'services-outils',
      name: 'Outils B2B',
      href: '/tableau-de-bord',
      subcategories: [
        { id: 'dashboard', name: 'Tableau de bord', href: '/tableau-de-bord' },
        { id: 'rapports', name: 'Rapports & Statistiques', href: '/rapports' },
        { id: 'approbations', name: 'Approbations', href: '/approbations' },
        { id: 'comparateur', name: 'Comparateur produits', href: '/comparer' },
      ],
    },
    {
      id: 'services-support',
      name: 'Support',
      href: '/contact',
      subcategories: [
        { id: 'contact', name: 'Nous contacter', href: '/contact' },
        { id: 'notre-histoire', name: 'A propos', href: '/notre-histoire' },
        { id: 'favoris', name: 'Mes favoris', href: '/favoris' },
      ],
    },
  ],
  promo: {
    title: 'Espace Pro',
    description: 'Tous les outils pour votre activite',
    image: '/images/services-pro.jpg',
    href: '/tableau-de-bord',
  },
};

export const menuSections: Record<string, MenuSection> = {
  catalogue: catalogueMenu,
  marques: marquesMenu,
  services: servicesMenu,
};

export type { MenuSection as MegaMenuSection };
