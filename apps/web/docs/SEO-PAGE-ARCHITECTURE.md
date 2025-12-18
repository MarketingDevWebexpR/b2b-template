# Architecture SEO des Pages - WebexpR Pro B2B

## Vue d'ensemble

Ce document décrit l'architecture complète des URLs et pages SEO-optimisées pour la plateforme e-commerce B2B bijoux.

---

## 1. Pages Catégories (`/c/...`)

### Structure hiérarchique (jusqu'à 5 niveaux)

```
/c                                    → Page racine listant toutes les catégories L1
/c/{l1}                               → Catégorie niveau 1 (ex: /c/bijoux)
/c/{l1}/{l2}                          → Catégorie niveau 2 (ex: /c/bijoux/colliers)
/c/{l1}/{l2}/{l3}                     → Catégorie niveau 3 (ex: /c/bijoux/colliers/or)
/c/{l1}/{l2}/{l3}/{l4}                → Catégorie niveau 4
/c/{l1}/{l2}/{l3}/{l4}/{l5}           → Catégorie niveau 5
```

### Exemple concret d'arborescence

```
/c
├── /c/bijoux
│   ├── /c/bijoux/colliers
│   │   ├── /c/bijoux/colliers/or
│   │   ├── /c/bijoux/colliers/argent
│   │   └── /c/bijoux/colliers/fantaisie
│   ├── /c/bijoux/bagues
│   │   ├── /c/bijoux/bagues/fiancailles
│   │   └── /c/bijoux/bagues/alliances
│   ├── /c/bijoux/bracelets
│   └── /c/bijoux/boucles-oreilles
├── /c/montres
│   ├── /c/montres/homme
│   └── /c/montres/femme
├── /c/accessoires
│   ├── /c/accessoires/etuis
│   └── /c/accessoires/presentoirs
└── /c/fournitures
    ├── /c/fournitures/outils
    └── /c/fournitures/emballages
```

### Sources de données

| Page | Source | Données |
|------|--------|---------|
| `/c` (racine) | Meilisearch | Liste catégories L1 avec compteurs |
| `/c/[...slug]` | Meilisearch + Medusa | Catégorie + sous-catégories + produits |

### Contenu de chaque page catégorie

1. **Hero Section** (Meilisearch)
   - Nom catégorie
   - Description
   - Image de couverture
   - Breadcrumbs hiérarchiques
   - Statistiques (nb produits, nb sous-catégories)

2. **Grille sous-catégories** (Meilisearch)
   - Sous-catégories directes
   - Images miniatures
   - Compteurs produits

3. **Listing produits** (Medusa)
   - Produits de la catégorie
   - Filtres (prix, marque, matière)
   - Tri (pertinence, prix, nouveautés)
   - Pagination

4. **Sidebar navigation** (Meilisearch)
   - Arbre de navigation
   - Catégories sœurs
   - Retour parent

### SEO par page catégorie

- **Title**: `{Catégorie} | {Chemin} | WebexpR Pro B2B`
- **Meta description**: Description catégorie ou génération automatique
- **Canonical**: URL hiérarchique complète
- **JSON-LD**: `BreadcrumbList` + `CollectionPage`
- **OpenGraph**: Image catégorie + description

---

## 2. Pages Marques (`/marques/...`)

### Structure

```
/marques                              → Page racine listant toutes les marques
/marques/{slug}                       → Page détail d'une marque avec ses produits
```

### Exemple d'arborescence

```
/marques
├── /marques/pandora
├── /marques/swarovski
├── /marques/thomas-sabo
├── /marques/fossil
├── /marques/calvin-klein
├── /marques/guess
└── ... (120+ marques)
```

### Sources de données

| Page | Source | Données |
|------|--------|---------|
| `/marques` | Medusa (module marques) | Liste complète des marques |
| `/marques/[slug]` | Medusa | Détail marque + produits associés |

### Contenu page listing marques (`/marques`)

1. **Hero Section**
   - Titre "Nos Marques Partenaires"
   - Compteur total marques

2. **Filtres**
   - Recherche textuelle
   - Filtre alphabétique (A-Z)
   - Filtre par pays d'origine

3. **Section Premium**
   - Marques partenaires premium en vedette

4. **Grille par lettre**
   - Marques groupées alphabétiquement
   - Logo + nom + compteur produits

### Contenu page détail marque (`/marques/[slug]`)

1. **Hero Section** (Medusa)
   - Logo marque
   - Nom + description
   - Pays d'origine
   - Année de fondation
   - Site web officiel
   - Badges (premium, certifié, etc.)

2. **Produits de la marque** (Medusa)
   - Grille produits paginée
   - Filtres (catégorie, prix)
   - Tri

3. **Marques similaires** (Medusa)
   - Suggestions de marques connexes

### SEO par page marque

- **Title**: `{Marque} | Nos Marques | WebexpR Pro B2B`
- **Meta description**: Description marque
- **Canonical**: `/marques/{slug}`
- **JSON-LD**: `Brand` schema
- **OpenGraph**: Logo marque

---

## 3. Pages Produits (`/produit/...`)

### Structure

```
/produit/{handle}                     → Page détail produit
```

### Sources de données

| Page | Source | Données |
|------|--------|---------|
| `/produit/[handle]` | Medusa | Détail produit complet |

### Contenu page produit

1. **Galerie images** (Medusa)
2. **Informations produit** (Medusa)
   - Titre, description
   - Prix (HT/TTC)
   - Variantes (taille, couleur, etc.)
   - Stock disponible
3. **Actions** (Medusa + Cart)
   - Ajout panier
   - Ajout liste
   - Demande devis
4. **Breadcrumbs** (Meilisearch)
   - Chemin catégorie du produit
5. **Produits similaires** (Medusa)

### SEO par page produit

- **Title**: `{Produit} | {Catégorie} | WebexpR Pro B2B`
- **JSON-LD**: `Product` schema avec prix, disponibilité
- **OpenGraph**: Image produit principale

---

## 4. Page Recherche (`/recherche`)

### Structure

```
/recherche                            → Page résultats de recherche
/recherche?q={terme}                  → Avec terme de recherche
/recherche?q={terme}&cat={id}         → Filtré par catégorie
/recherche?q={terme}&marque={slug}    → Filtré par marque
```

### Sources de données

| Page | Source | Données |
|------|--------|---------|
| `/recherche` | Meilisearch | Produits + Catégories + Marques |

---

## 5. Sitemap XML

### Structure sitemap

```
/sitemap.xml                          → Index des sitemaps
├── /sitemap-pages.xml                → Pages statiques
├── /sitemap-categories.xml           → Toutes les catégories
├── /sitemap-brands.xml               → Toutes les marques
└── /sitemap-products.xml             → Tous les produits
```

### Priorités SEO

| Type de page | Priority | changeFreq |
|--------------|----------|------------|
| Accueil | 1.0 | daily |
| Catégories L1 | 0.9 | weekly |
| Catégories L2+ | 0.8 | weekly |
| Marques | 0.7 | weekly |
| Produits | 0.6 | weekly |
| Pages statiques | 0.5 | monthly |

---

## 6. Flux de données

```
┌─────────────────┐     ┌─────────────────┐
│   Meilisearch   │     │     Medusa      │
│                 │     │                 │
│ - Catégories    │     │ - Produits      │
│ - Index search  │     │ - Marques       │
│ - Facettes      │     │ - Variantes     │
└────────┬────────┘     │ - Prix          │
         │              │ - Stock         │
         │              └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
              ┌──────▼──────┐
              │   Next.js   │
              │   Server    │
              │  Components │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │    Pages    │
              │  /c/...     │
              │  /marques/  │
              │  /produit/  │
              └─────────────┘
```

---

## 7. Fichiers clés

### Pages

| Fichier | Description |
|---------|-------------|
| `app/(shop)/c/page.tsx` | Listing catégories racine |
| `app/(shop)/c/[...slug]/page.tsx` | Page catégorie hiérarchique |
| `app/(shop)/marques/page.tsx` | Listing marques |
| `app/(shop)/marques/[slug]/page.tsx` | Page détail marque |
| `app/(shop)/produit/[handle]/page.tsx` | Page détail produit |
| `app/(shop)/recherche/page.tsx` | Page recherche |

### Libs

| Fichier | Description |
|---------|-------------|
| `lib/categories/hierarchy.ts` | Helpers hiérarchie catégories |
| `lib/brands/server.ts` | Fonctions serveur marques |
| `lib/medusa/products.ts` | API produits Medusa |
| `lib/seo/metadata.ts` | Générateurs SEO |

### API Routes

| Route | Description |
|-------|-------------|
| `api/categories` | Catégories depuis Meilisearch |
| `api/brands` | Marques depuis Medusa |
| `api/search` | Recherche multi-index |

---

## 8. Checklist implémentation

### Catégories
- [x] Page `/c/[...slug]` - Structure créée
- [x] Breadcrumbs hiérarchiques
- [x] Hero avec stats
- [x] Grille sous-catégories
- [ ] **Listing produits depuis Medusa**
- [ ] Filtres produits
- [ ] Pagination

### Marques
- [x] Page `/marques` - Structure créée
- [x] Page `/marques/[slug]` - Structure créée
- [x] Filtre alphabétique
- [ ] **Produits marque depuis Medusa**
- [ ] Pagination produits

### Produits
- [ ] Page `/produit/[handle]`
- [ ] Galerie images
- [ ] Variantes
- [ ] Actions panier

### Recherche
- [x] Page `/recherche`
- [ ] Multi-index (produits, catégories, marques)
- [ ] Facettes dynamiques
