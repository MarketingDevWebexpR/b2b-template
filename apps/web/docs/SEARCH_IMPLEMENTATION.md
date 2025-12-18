# Implementation de la Recherche Meilisearch - Frontend Next.js

> **Date**: Decembre 2024
> **Statut**: En cours
> **Stack**: Next.js 16 + React 19 + Medusa V2 + Meilisearch

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │
│  │  SearchOverlay  │  │  SearchResults  │  │  CategoryPageClient │  │
│  │  (autocomplete) │  │     Live        │  │    (listing)        │  │
│  └────────┬────────┘  └────────┬────────┘  └──────────┬──────────┘  │
│           │                    │                      │             │
│           ▼                    ▼                      ▼             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              lib/search/medusa-search-client.ts             │    │
│  │              (Client API - Singleton Pattern)               │    │
│  └──────────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │ HTTP (fetch)
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Medusa V2)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              /store/search (API Endpoint)                   │    │
│  │              /store/search/suggestions                      │    │
│  └──────────────────────────────┬──────────────────────────────┘    │
│                                 │                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              SearchModule (medusa-search.ts)                │    │
│  │              - ProductIndex                                 │    │
│  │              - CategoryIndex                                │    │
│  └──────────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MEILISEARCH (Docker)                           │
│  ┌─────────────────┐  ┌─────────────────┐                           │
│  │  products index │  │ categories index│                           │
│  └─────────────────┘  └─────────────────┘                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Ce qui a ete fait

### 1. Infrastructure Backend (Medusa V2)

| Composant | Fichier | Statut |
|-----------|---------|--------|
| Module de recherche | `apps/medusa/src/modules/search/medusa-search.ts` | ✅ Fait |
| Configuration module | `apps/medusa/medusa-config.ts` | ✅ Fait |
| API Endpoint Store | `apps/medusa/src/api/store/search/route.ts` | ✅ Fait |
| API Suggestions | `apps/medusa/src/api/store/search/suggestions/route.ts` | ✅ Fait |
| API Admin | `apps/medusa/src/api/admin/search/route.ts` | ✅ Fait |
| Event Subscribers | `apps/medusa/src/subscribers/search-*.ts` | ✅ Fait |
| Seed Categories | `apps/medusa/src/scripts/seed-categories.ts` | ✅ Fait |

### 2. Frontend - Couche d'abstraction

| Composant | Fichier | Statut |
|-----------|---------|--------|
| Client API Singleton | `lib/search/medusa-search-client.ts` | ✅ Fait |
| Adapter Medusa | `lib/search/medusa-search-adapter.ts` | ✅ Fait |
| Hook useMedusaSearch | `lib/search/useMedusaSearch.ts` | ✅ Fait |
| Index export | `lib/search/index.ts` | ✅ Fait |
| Hooks API Search | `hooks/use-search-api.ts` | ✅ Fait |

### 3. Frontend - Composants de recherche

| Composant | Fichier | Statut |
|-----------|---------|--------|
| SearchOverlay | `components/search/SearchOverlay.tsx` | ✅ Utilise API reelle |
| SearchResultsLive | `components/search/SearchResults/SearchResultsLive.tsx` | ✅ Utilise API reelle |
| SearchInput | `components/search/SearchBar/SearchInput.tsx` | ✅ Fait |
| SearchSuggestions | `components/search/SearchBar/SearchSuggestions.tsx` | ✅ Fait |
| SearchHistory | `components/search/SearchBar/SearchHistory.tsx` | ✅ Fait |
| QuickSearchBar | `components/search/SearchBar/QuickSearchBar.tsx` | ✅ Fait |
| SearchProductGrid | `components/search/SearchResults/SearchProductGrid.tsx` | ✅ Fait |
| SearchFacets | `components/search/SearchResults/SearchFacets.tsx` | ✅ Fait |
| SearchSortSelect | `components/search/SearchResults/SearchSortSelect.tsx` | ✅ Fait |
| SearchPagination | `components/search/SearchResults/SearchPagination.tsx` | ✅ Fait |
| ActiveFilters | `components/search/SearchResults/ActiveFilters.tsx` | ✅ Fait |
| ViewModeToggle | `components/search/SearchResults/ViewModeToggle.tsx` | ✅ Fait |

### 4. Pages

| Page | Route | Statut |
|------|-------|--------|
| Page de recherche | `/recherche` | ✅ Fait |
| Page categorie | `/categorie/[handle]` | ✅ Fait |
| Page produit | `/produit/[handle]` | ✅ Fait |
| Page categories | `/categories` | ✅ Fait |

### 5. TypeScript & Build

| Verification | Statut |
|--------------|--------|
| TypeScript compilation | ✅ 0 erreurs |
| Production build | ✅ Succes |
| React 19 compatible | ✅ Oui |
| Next.js 16 compatible | ✅ Oui |

---

## Ce qu'il reste a faire

### Priorite Haute

| Tache | Description | Effort |
|-------|-------------|--------|
| ⬜ Demarrer Meilisearch | Lancer le container Docker Meilisearch | 5 min |
| ⬜ Demarrer Backend Medusa | `pnpm --filter medusa dev` | 5 min |
| ⬜ Seeder les donnees | Executer le script de seed categories + produits | 10 min |
| ⬜ Tester integration E2E | Verifier que la recherche fonctionne de bout en bout | 30 min |

### Priorite Moyenne

| Tache | Description | Effort |
|-------|-------------|--------|
| ⬜ Filtres avances | Connecter les filtres (marque, materiau, prix) au backend | 2h |
| ⬜ Facettes dynamiques | Afficher les facettes retournees par Meilisearch | 2h |
| ⬜ Historique recherche | Persister l'historique en localStorage ou IndexedDB | 1h |
| ⬜ Analytics recherche | Tracker les recherches pour ameliorer les resultats | 2h |

### Priorite Basse

| Tache | Description | Effort |
|-------|-------------|--------|
| ⬜ Synonymes | Configurer les synonymes dans Meilisearch | 1h |
| ⬜ Typo tolerance | Ajuster la tolerance aux fautes de frappe | 30 min |
| ⬜ Ranking rules | Personnaliser l'ordre des resultats | 1h |
| ⬜ Stop words FR | Configurer les mots vides francais | 30 min |

---

## Commandes pour demarrer

```bash
# 1. Demarrer Meilisearch (Docker)
docker run -d --name meilisearch \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY="votre_cle_master" \
  -v meilisearch_data:/meili_data \
  getmeili/meilisearch:latest

# 2. Demarrer le backend Medusa
cd apps/medusa
pnpm dev

# 3. Seeder les categories (une fois)
pnpm seed:categories

# 4. Demarrer le frontend Next.js
cd apps/web
pnpm dev

# 5. Tester la recherche
# Ouvrir http://localhost:3000 et utiliser la barre de recherche
```

---

## Structure des fichiers de recherche (Frontend)

```
apps/web/
├── lib/search/
│   ├── index.ts                    # Re-exports
│   ├── medusa-search-client.ts     # Client API (singleton)
│   ├── medusa-search-adapter.ts    # Adaptateurs de types
│   └── useMedusaSearch.ts          # Hook React pour listings
│
├── hooks/
│   └── use-search-api.ts           # Hooks de recherche (instant, suggestions)
│
├── components/search/
│   ├── SearchOverlay.tsx           # Modal de recherche rapide
│   ├── SearchBar/
│   │   ├── index.tsx
│   │   ├── SearchInput.tsx
│   │   ├── SearchSuggestions.tsx
│   │   ├── SearchHistory.tsx
│   │   └── QuickSearchBar.tsx
│   └── SearchResults/
│       ├── index.tsx
│       ├── SearchResultsLive.tsx   # Resultats avec filtres
│       ├── SearchProductGrid.tsx
│       ├── SearchFacets.tsx
│       ├── SearchSortSelect.tsx
│       ├── SearchPagination.tsx
│       ├── ActiveFilters.tsx
│       └── ViewModeToggle.tsx
│
└── app/(shop)/
    ├── recherche/
    │   └── page.tsx                # Page de resultats
    ├── categorie/
    │   └── [handle]/
    │       ├── page.tsx            # Page categorie (SSR)
    │       ├── CategoryPageClient.tsx
    │       ├── loading.tsx
    │       └── not-found.tsx
    └── produit/
        └── [handle]/
            ├── page.tsx            # Page produit (SSR)
            └── ProductDetailClient.tsx
```

---

## API Search - Endpoints

### GET /store/search

Recherche principale avec filtres et facettes.

```typescript
// Query params
interface SearchParams {
  q: string;           // Requete de recherche
  type?: 'all' | 'products' | 'categories';
  limit?: number;      // Default: 20, Max: 100
  offset?: number;     // Pagination
  facets?: boolean;    // Inclure facettes
  category?: string;   // Filtre categorie (handle ou ID)
  brand?: string;      // Filtre marque
  material?: string;   // Filtre materiau
  tags?: string;       // Tags (comma-separated)
  in_stock?: boolean;  // Uniquement en stock
  price_min?: number;  // Prix minimum (cents)
  price_max?: number;  // Prix maximum (cents)
  sort?: string;       // Champ de tri
  order?: 'asc' | 'desc';
}

// Response
interface ProductSearchResponse {
  query: string;
  type: 'products';
  hits: ProductSearchResult[];
  total: number;
  limit: number;
  offset: number;
  processingTimeMs: number;
  facetDistribution?: Record<string, Record<string, number>>;
}
```

### GET /store/search/suggestions

Suggestions pour autocomplete.

```typescript
// Query params
interface SuggestionParams {
  q: string;
  limit?: number; // Default: 8
}

// Response
interface SuggestionsResponse {
  query: string;
  suggestions: Array<{
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    price_min: number | null;
  }>;
}
```

---

## Variables d'environnement requises

```env
# Frontend (.env.local)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Backend (apps/medusa/.env)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=votre_cle_master
```

---

## Notes techniques

### Pourquoi un proxy via Medusa ?

1. **Securite**: La cle API Meilisearch reste cote serveur
2. **Flexibilite**: Possibilite d'ajouter des transformations/enrichissements
3. **Cache**: Le backend peut mettre en cache les resultats
4. **Rate limiting**: Controle des requetes cote serveur
5. **Logs/Analytics**: Centralisation des metriques

### Adaptation des types

Le hook `useMedusaSearch` convertit automatiquement les `ProductSearchResult` en `Product` pour compatibilite avec les composants existants.

```typescript
// ProductSearchResult (Meilisearch) -> Product (App)
function adaptSearchResultToProduct(result: ProductSearchResult): Product {
  return {
    id: result.id,
    name: result.title,
    slug: result.handle,
    price: (result.price_min ?? 0) / 100,
    images: result.images,
    // ... autres proprietes
  };
}
```

---

## Prochaines etapes recommandees

1. **Tester l'integration complete** - Demarrer tous les services et verifier le flux
2. **Indexer des donnees reelles** - Importer le catalogue bijoux
3. **Configurer Meilisearch** - Synonymes, stop words, ranking
4. **Monitoring** - Mettre en place des logs et metriques
5. **Tests E2E** - Playwright pour tester les parcours utilisateur

---

*Document genere le 17 decembre 2024*
