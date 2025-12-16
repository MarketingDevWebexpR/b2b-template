# ADR-004: Stratégie de Gestion d'État

## Statut

Accepté

## Date

2024-12-15

## Contexte

Notre application B2B nécessite une gestion d'état complexe :
- État du panier avec validation des limites de dépenses
- Contexte entreprise/employé actif
- Cache des devis et approbations
- Synchronisation entre web et mobile

Nous devons choisir une approche qui :
1. Fonctionne sur web (Next.js) et mobile (Expo)
2. Soit testable et prévisible
3. Minimise le boilerplate
4. Supporte le SSR côté Next.js

## Décision

### Architecture en Couches

```
┌─────────────────────────────────────────┐
│           UI Components                  │
├─────────────────────────────────────────┤
│           Custom Hooks                   │
│    (useCompany, useQuotes, useCart)     │
├─────────────────────────────────────────┤
│         State Package                    │
│  (reducers, selectors, actions)         │
├─────────────────────────────────────────┤
│         API Client                       │
│    (api-client, api-medusa, etc.)       │
└─────────────────────────────────────────┘
```

### Package `@maison/state`

Contient la logique d'état pure, sans dépendance à un framework spécifique :

```typescript
// Reducers purs
export function companyReducer(state: CompanyState, action: CompanyAction): CompanyState

// Selectors
export const selectCurrentCompany = (state: RootState) => state.company.current

// Action creators
export const setCompany = (company: Company): SetCompanyAction
```

### Package `@maison/hooks`

Connecte l'état aux composants React avec des hooks :

```typescript
// Utilise useReducer ou le store global
export function useCompany(api: ICommerceClient): UseCompanyResult {
  const [state, dispatch] = useReducer(companyReducer, initialState);
  // ... logique async avec l'API
}
```

### Stratégie par Plateforme

#### Web (Next.js)

- **Server Components** : Pas de state, fetch direct via API
- **Client Components** : Hooks avec `useReducer` local ou Zustand pour état global
- **Cache** : React Query (TanStack Query) pour le cache API

```typescript
// Server Component
async function CompanyPage({ params }) {
  const company = await api.b2b.companies.get(params.id);
  return <CompanyDetails company={company} />;
}

// Client Component
"use client";
function CompanyActions() {
  const { company, setCompany } = useCompany(api);
  // ...
}
```

#### Mobile (Expo)

- **State global** : Zustand pour persistance et partage
- **Cache** : React Query avec AsyncStorage
- **Offline** : Queue d'actions pour sync ultérieure

```typescript
// Store Zustand
const useStore = create(
  persist(
    (set) => ({
      company: null,
      setCompany: (company) => set({ company }),
    }),
    { name: 'b2b-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

### Gestion du Cache API

Utilisation de `useApiQuery` (wrapper de React Query pattern) :

```typescript
const { data, isLoading, error, refetch } = useApiQuery(
  ['company', companyId],
  () => api.b2b.companies.get(companyId),
  { staleTime: 60000 } // Cache 1 minute
);
```

### Invalidation et Synchronisation

```typescript
// Après mutation
const updateCompany = useApiMutation(
  (data) => api.b2b.companies.update(companyId, data),
  {
    invalidateKeys: [['company', companyId], ['companies']],
    onSuccess: () => toast.success('Entreprise mise à jour'),
  }
);
```

## Conséquences

### Positives

- **Testabilité** : Reducers purs facilement testables
- **Portabilité** : Même logique web et mobile
- **Flexibilité** : Pas de lock-in sur un framework d'état
- **Performance** : Cache intelligent avec invalidation ciblée
- **SSR Compatible** : Fonctionne avec les Server Components Next.js

### Négatives

- **Pas de store global unifié** : L'état est distribué dans les hooks
- **Coordination manuelle** : Synchronisation entre hooks si nécessaire

### Trade-offs

| Aspect | Notre choix | Alternative |
|--------|-------------|-------------|
| Global Store | Non (hooks locaux) | Redux/Zustand global |
| Cache | React Query pattern | SWR, Apollo |
| Offline | Queue d'actions | Redux Persist |

## Alternatives Considérées

### 1. Redux Toolkit global

**Rejeté** : Trop de boilerplate, complexité SSR avec Next.js 14

### 2. Zustand partout

**Partiellement adopté** : Utilisé sur mobile, mais hooks suffisants sur web

### 3. Jotai / Recoil (atomique)

**Rejeté** : Moins adapté à notre structure hiérarchique d'état

### 4. Apollo Client (GraphQL)

**Rejeté** : Notre API est REST-first (Medusa)

## Références

- [React Query / TanStack Query](https://tanstack.com/query)
- [Zustand](https://github.com/pmndrs/zustand)
- [Next.js App Router - Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
