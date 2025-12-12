# Specification UI/UX - Barre de Recherche Luxe

## Vue d'ensemble

La barre de recherche pour Maison Bijoux est concue comme une experience immersive et elegante, refletant le positionnement haut de gamme de la marque. Elle s'ouvre en plein ecran avec des animations fluides et propose une interface de recherche intuitive avec suggestions et resultats en temps reel.

---

## Architecture des Composants

```
components/
  search/
    SearchOverlay.tsx    # Composant principal (overlay plein ecran)
    index.ts             # Export barrel

hooks/
  useSearch.ts           # Hook de gestion d'etat et raccourcis clavier
  index.ts               # Export barrel
```

---

## Design System - Tokens Utilises

### Couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `luxe-cream` | `#fffcf7` | Fond de l'overlay |
| `luxe-charcoal` | `#2b333f` | Texte principal, backdrop |
| `hermes-500` | `#f67828` | Accents, liens actifs |
| `text-primary` | `#2b333f` | Titres produits |
| `text-muted` | `#696969` | Labels, hints |
| `text-light` | `#8b8b8b` | Placeholder |
| `border-medium` | `#d4c9bd` | Separateurs |
| `background-warm` | `#f6f1eb` | Hover states |

### Typographie

| Element | Font | Taille | Weight | Tracking |
|---------|------|--------|--------|----------|
| Input recherche | `font-serif` | `text-xl` a `text-3xl` | 400 | Normal |
| Labels sections | `font-sans` | `text-xs` | 500 | `tracking-luxe` (0.15em) |
| Suggestions | `font-sans` | `text-sm` | 400 | Normal |
| Nom produit | `font-serif` | `text-sm` | 400 | Normal |
| Prix | `font-sans` | `text-xs` | 400 | Normal |

### Espacements

- Padding container: `px-6 lg:px-12`
- Padding vertical header: `py-6 md:py-8`
- Gap grille produits: `gap-4 md:gap-6`
- Espacement suggestions: `space-y-1`

### Ombres

| Token | Valeur | Usage |
|-------|--------|-------|
| `shadow-elegant-lg` | `0 12px 40px rgba(43,51,63,0.08)` | Overlay principal |
| `shadow-card` | `0 2px 12px rgba(43,51,63,0.04)` | Cards produits |
| `shadow-card-hover` | `0 8px 32px rgba(43,51,63,0.08)` | Cards produits au hover |

---

## Etats et Interactions

### 1. Etat Ferme (Defaut)

L'icone de recherche dans le header:
- Taille: `w-10 h-10` (touch target 40x40px)
- Icone: `w-[17px] h-[17px]`
- Hover: `scale-105`, fond `bg-background-warm`
- Focus visible: `ring-1 ring-luxe-charcoal/20`

```tsx
<button
  onClick={openSearch}
  className="w-10 h-10 rounded-full hover:bg-background-warm"
  aria-label="Rechercher (Cmd+K)"
  aria-haspopup="dialog"
>
  <Search className="w-[17px] h-[17px]" />
</button>
```

### 2. Etat Ouvert - Sans Requete

Affiche les suggestions:
- **Recherches recentes** (si presentes)
  - Icone `Clock`
  - Bouton "Effacer"
  - Max 5 items

- **Recherches populaires**
  - Icone `TrendingUp`
  - 5 suggestions predefinies

### 3. Etat Ouvert - Avec Requete

- **Chargement**: Spinner `Loader2` anime
- **Resultats**: Grille 6 colonnes (desktop), 2-3 colonnes (mobile)
- **Aucun resultat**: Message + suggestions alternatives

### 4. Navigation Clavier

| Touche | Action |
|--------|--------|
| `Cmd/Ctrl + K` | Ouvre/ferme l'overlay |
| `/` | Ouvre l'overlay (hors inputs) |
| `Escape` | Ferme l'overlay |
| `ArrowDown` | Item suivant |
| `ArrowUp` | Item precedent |
| `Enter` | Selectionne l'item ou soumet |

---

## Animations (Framer Motion)

### Overlay Backdrop

```tsx
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 }
  }
};
```

### Contenu Principal

```tsx
const contentVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.1
    }
  }
};
```

### Items en Cascade

```tsx
const staggerContainer = {
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 }
  }
};
```

---

## Accessibilite (WCAG 2.1 AA)

### ARIA Attributes

```tsx
// Overlay
<motion.div
  role="dialog"
  aria-modal="true"
  aria-label="Recherche"
>

// Input
<input
  aria-label="Rechercher"
  aria-autocomplete="list"
  aria-controls="search-results"
  aria-expanded={hasResults}
/>

// Liste resultats
<div
  id="search-results"
  role="listbox"
  aria-label="Resultats de recherche"
>

// Item
<Link
  role="option"
  aria-selected={isSelected}
>
```

### Focus Management

1. Auto-focus sur l'input a l'ouverture (avec delai pour animation)
2. Piege du focus dans l'overlay tant qu'ouvert
3. Retour du focus au bouton a la fermeture

### Contrastes

- Texte principal sur cream: `#2b333f` sur `#fffcf7` = 11.5:1 (AAA)
- Texte muted sur cream: `#696969` sur `#fffcf7` = 5.2:1 (AA)
- Hermes sur cream: `#f67828` sur `#fffcf7` = 3.1:1 (large text OK)

### Touch Targets

- Tous les boutons: minimum 44x44px
- Items de suggestion: hauteur `py-2.5` (40px+)
- Cards produits: zone cliquable complete

---

## Responsive Design

### Breakpoints

| Breakpoint | Comportement |
|------------|--------------|
| Mobile (<640px) | Input `text-xl`, grille 2 colonnes |
| Tablet (640-1024px) | Input `text-2xl`, grille 3 colonnes |
| Desktop (>1024px) | Input `text-3xl`, grille 6 colonnes |

### Hauteur de l'Overlay

- Content area: `max-h-[60vh]` avec scroll
- Gradient de fondu en bas pour indiquer le scroll

---

## API de Recherche

### Endpoint

```
GET /api/sage/articles/search?q={query}&limit=6
```

### Debounce

- Delai: 300ms apres la derniere frappe
- Indicateur de chargement pendant la requete

### Response Mapping

```typescript
interface SearchResult {
  products: Product[];
  categories: Category[];
  totalProducts: number;
}
```

---

## Stockage Local

### Recherches Recentes

```typescript
interface RecentSearch {
  query: string;
  timestamp: number;
}

// LocalStorage key: 'recentSearches'
// Max items: 5
```

---

## Performance

### Optimisations

1. **Debounce**: Limite les appels API
2. **Image lazy loading**: Via Next.js Image
3. **Body scroll lock**: Empeche le scroll de la page
4. **AnimatePresence**: Monte/demonte proprement les composants

### Metriques Cibles

- Time to Interactive: < 100ms
- First paint: < 200ms
- API response: < 500ms

---

## Usage

### Dans le Header

```tsx
import { SearchOverlay } from '@/components/search';
import { useSearch } from '@/hooks';

export function Header() {
  const { isSearchOpen, openSearch, closeSearch } = useSearch();

  return (
    <>
      <button onClick={openSearch}>
        <Search />
      </button>
      <SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
    </>
  );
}
```

### Raccourcis Clavier Automatiques

Le hook `useSearch` ajoute automatiquement les raccourcis:
- `Cmd/Ctrl + K`: Toggle overlay
- `/`: Ouvre overlay (hors inputs)

---

## Checklist Qualite

### Visuel
- [x] Coherence avec le design system luxe
- [x] Typographie serif pour l'elegance
- [x] Animations fluides et subtiles
- [x] Ombres douces et elegantes

### Accessibilite
- [x] Contraste minimum 4.5:1
- [x] Navigation clavier complete
- [x] Focus visible
- [x] Roles ARIA appropries
- [x] Labels explicites

### Technique
- [x] Responsive sur tous les breakpoints
- [x] Performance optimisee (debounce, lazy loading)
- [x] Gestion des erreurs
- [x] Etats de chargement

### UX
- [x] Suggestions pertinentes
- [x] Historique de recherche
- [x] Feedback immediat
- [x] Fermeture intuitive (ESC, click outside)
