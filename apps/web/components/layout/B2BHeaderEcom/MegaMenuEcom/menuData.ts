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
      href: '/categorie/bagues',
      subcategories: [
        { id: 'bagues-or', name: 'Bagues en or', href: '/categorie/bagues/or', count: 245 },
        { id: 'bagues-argent', name: 'Bagues en argent', href: '/categorie/bagues/argent', count: 312 },
        { id: 'bagues-diamants', name: 'Bagues diamants', href: '/categorie/bagues/diamants', count: 89 },
        { id: 'bagues-fiancailles', name: 'Bagues de fiancailles', href: '/categorie/bagues/fiancailles', count: 156 },
        { id: 'alliances', name: 'Alliances', href: '/categorie/bagues/alliances', count: 203 },
        { id: 'bagues-pierres', name: 'Bagues pierres precieuses', href: '/categorie/bagues/pierres', count: 178 },
      ],
    },
    {
      id: 'colliers',
      name: 'Colliers & Pendentifs',
      href: '/categorie/colliers',
      subcategories: [
        { id: 'colliers-or', name: 'Colliers en or', href: '/categorie/colliers/or', count: 189 },
        { id: 'colliers-argent', name: 'Colliers en argent', href: '/categorie/colliers/argent', count: 267 },
        { id: 'pendentifs', name: 'Pendentifs', href: '/categorie/colliers/pendentifs', count: 445 },
        { id: 'chaines', name: 'Chaines', href: '/categorie/colliers/chaines', count: 234 },
        { id: 'sautoirs', name: 'Sautoirs', href: '/categorie/colliers/sautoirs', count: 98 },
        { id: 'colliers-perles', name: 'Colliers de perles', href: '/categorie/colliers/perles', count: 67 },
      ],
    },
    {
      id: 'bracelets',
      name: 'Bracelets',
      href: '/categorie/bracelets',
      subcategories: [
        { id: 'bracelets-or', name: 'Bracelets en or', href: '/categorie/bracelets/or', count: 156 },
        { id: 'bracelets-argent', name: 'Bracelets en argent', href: '/categorie/bracelets/argent', count: 234 },
        { id: 'bracelets-joncs', name: 'Joncs', href: '/categorie/bracelets/joncs', count: 89 },
        { id: 'bracelets-charms', name: 'Bracelets charms', href: '/categorie/bracelets/charms', count: 112 },
        { id: 'gourmettes', name: 'Gourmettes', href: '/categorie/bracelets/gourmettes', count: 78 },
      ],
    },
    {
      id: 'boucles',
      name: 'Boucles d\'oreilles',
      href: '/categorie/boucles-oreilles',
      subcategories: [
        { id: 'boucles-or', name: 'Boucles en or', href: '/categorie/boucles-oreilles/or', count: 312 },
        { id: 'boucles-argent', name: 'Boucles en argent', href: '/categorie/boucles-oreilles/argent', count: 456 },
        { id: 'creoles', name: 'Creoles', href: '/categorie/boucles-oreilles/creoles', count: 134 },
        { id: 'puces', name: 'Puces', href: '/categorie/boucles-oreilles/puces', count: 223 },
        { id: 'pendantes', name: 'Boucles pendantes', href: '/categorie/boucles-oreilles/pendantes', count: 189 },
      ],
    },
    {
      id: 'montres',
      name: 'Montres',
      href: '/categorie/montres',
      subcategories: [
        { id: 'montres-homme', name: 'Montres homme', href: '/categorie/montres/homme', count: 234 },
        { id: 'montres-femme', name: 'Montres femme', href: '/categorie/montres/femme', count: 267 },
        { id: 'montres-luxe', name: 'Haute horlogerie', href: '/categorie/montres/luxe', count: 45 },
        { id: 'montres-sport', name: 'Montres sport', href: '/categorie/montres/sport', count: 89 },
        { id: 'bracelets-montres', name: 'Bracelets de montres', href: '/categorie/montres/bracelets', count: 156 },
      ],
    },
    {
      id: 'pierres',
      name: 'Pierres & Diamants',
      href: '/categorie/pierres',
      subcategories: [
        { id: 'diamants', name: 'Diamants', href: '/categorie/pierres/diamants', count: 89 },
        { id: 'rubis', name: 'Rubis', href: '/categorie/pierres/rubis', count: 45 },
        { id: 'saphirs', name: 'Saphirs', href: '/categorie/pierres/saphirs', count: 56 },
        { id: 'emeraudes', name: 'Emeraudes', href: '/categorie/pierres/emeraudes', count: 34 },
        { id: 'perles', name: 'Perles', href: '/categorie/pierres/perles', count: 78 },
        { id: 'pierres-fines', name: 'Pierres fines', href: '/categorie/pierres/fines', count: 123 },
      ],
    },
  ],
  promo: {
    title: 'Nouveautes Printemps',
    description: 'Decouvrez nos nouveautes',
    image: '/images/promo-spring.jpg',
    href: '/c?sort=newest',
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
      href: '/c?brand=luxe',
      subcategories: [
        { id: 'cartier', name: 'Cartier', href: '/c?brand=cartier' },
        { id: 'boucheron', name: 'Boucheron', href: '/c?brand=boucheron' },
        { id: 'van-cleef', name: 'Van Cleef & Arpels', href: '/c?brand=van-cleef' },
        { id: 'chaumet', name: 'Chaumet', href: '/c?brand=chaumet' },
        { id: 'bulgari', name: 'Bulgari', href: '/c?brand=bulgari' },
      ],
    },
    {
      id: 'marques-premium',
      name: 'Premium',
      href: '/c?brand=premium',
      subcategories: [
        { id: 'dinh-van', name: 'Dinh Van', href: '/c?brand=dinh-van' },
        { id: 'mauboussin', name: 'Mauboussin', href: '/c?brand=mauboussin' },
        { id: 'fred', name: 'Fred', href: '/c?brand=fred' },
        { id: 'messika', name: 'Messika', href: '/c?brand=messika' },
        { id: 'pomellato', name: 'Pomellato', href: '/c?brand=pomellato' },
      ],
    },
    {
      id: 'marques-horlogerie',
      name: 'Horlogerie',
      href: '/categorie/montres',
      subcategories: [
        { id: 'rolex', name: 'Rolex', href: '/categorie/montres?brand=rolex' },
        { id: 'omega', name: 'Omega', href: '/categorie/montres?brand=omega' },
        { id: 'tag-heuer', name: 'TAG Heuer', href: '/categorie/montres?brand=tag-heuer' },
        { id: 'longines', name: 'Longines', href: '/categorie/montres?brand=longines' },
        { id: 'tissot', name: 'Tissot', href: '/categorie/montres?brand=tissot' },
      ],
    },
    {
      id: 'marques-accessibles',
      name: 'Accessibles',
      href: '/c?brand=accessible',
      subcategories: [
        { id: 'pandora', name: 'Pandora', href: '/c?brand=pandora' },
        { id: 'swarovski', name: 'Swarovski', href: '/c?brand=swarovski' },
        { id: 'fossil', name: 'Fossil', href: '/c?brand=fossil' },
        { id: 'guess', name: 'Guess', href: '/c?brand=guess' },
        { id: 'tommy-hilfiger', name: 'Tommy Hilfiger', href: '/c?brand=tommy-hilfiger' },
      ],
    },
  ],
  promo: {
    title: 'Partenaires officiels',
    description: 'Distributeur agree de plus de 50 marques',
    image: '/images/brands-partners.jpg',
    href: '/c',
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
