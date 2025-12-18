# Announcement Banner - Specifications UX/UI

## 1. Analyse de l'existant

### Points forts actuels
- Gestion du dismiss avec persistance localStorage
- Animation d'entree/sortie fluide
- Support des couleurs personnalisees depuis le CMS
- Polling des annonces (mise a jour sans refresh)
- Support liens internes (Next.js Link) et externes

### Problemes identifies

| Probleme | Impact UX | Severite |
|----------|-----------|----------|
| Mono-annonce uniquement | L'utilisateur rate des informations importantes | Haute |
| CTA cache sur mobile | Perte de conversion mobile | Haute |
| CTA non distingue du message | Affordance faible, clic hesitant | Moyenne |
| Zone tactile bouton fermer trop petite (28x28px) | Accessibilite WCAG 2.5.5 non respectee | Haute |
| Pas d'annonce pour screen readers lors des changements | Accessibilite WCAG 4.1.3 non respectee | Moyenne |

---

## 2. Specifications du Slider Multi-annonces

### 2.1 Comportement de rotation automatique

```
INTERVALLE: 6 secondes (optimal pour lecture complete)

PAUSE automatique quand:
- Souris survole le bandeau (mouseenter)
- Focus clavier sur un element interactif
- Onglet du navigateur inactif (Page Visibility API)
- prefers-reduced-motion: reduce active

RESUME automatique quand:
- Souris quitte le bandeau (mouseleave)
- Focus quitte le dernier element interactif
- Onglet redevient actif
```

### 2.2 Transitions

```css
/* Animation recommandee: Fade crossfade */
.announcement-enter {
  opacity: 0;
  transform: translateY(-4px);
}

.announcement-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}

.announcement-exit {
  opacity: 1;
  transform: translateY(0);
}

.announcement-exit-active {
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}

/* Si prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .announcement-enter-active,
  .announcement-exit-active {
    transition: none;
  }
}
```

### 2.3 Navigation et indicateurs

**Indicateurs (dots/tirets):**
- Visibles uniquement si 2+ annonces actives
- Style: tirets horizontaux (plus elegant que dots pour luxe)
- Taille: 8px x 2px (inactif) / 16px x 2px (actif)
- Couleur: rgba(255,255,255,0.4) inactif / rgba(255,255,255,0.9) actif
- Espacement: 6px entre chaque
- Zone cliquable: 44x44px (accessibilite tactile)
- Clic = navigation directe vers l'annonce

**Fleches prev/next:**
- NON RECOMMANDE pour ce format (bandeau trop fin)
- Alternative si demande: icones 12px avec zone 44px

**Swipe tactile (mobile):**
- Activer sur ecrans tactiles
- Threshold: 50px de deplacement minimum
- Direction: gauche = suivant, droite = precedent

### 2.4 Ordre et filtrage

```typescript
// Logique de tri et filtrage
const activeAnnouncements = announcements
  .filter(a => a.is_active)
  .filter(a => !isDismissed(a.id))
  .filter(a => isWithinDateRange(a.start_date, a.end_date))
  .sort((a, b) => b.priority - a.priority);
```

---

## 3. Layout et positionnement du CTA

### 3.1 Structure desktop (>= 768px)

```
+--------------------------------------------------------------------------------+
|  [X]  |        Message de l'annonce centree          |  |   CTA >   |  === === |
+--------------------------------------------------------------------------------+
   ^                       ^                            ^       ^           ^
  44px               flex-grow, centre                 1px   min-w        gaps
```

**Specifications:**
- Hauteur totale: 40px (`--promo-height`)
- Padding horizontal: 16px
- Container: max-w-7xl, mx-auto

**Zones:**
1. **Zone fermeture** (gauche): 44px, sticky
2. **Zone message** (centre): flex-grow, text-center
3. **Separateur**: 1px vertical, rgba(255,255,255,0.2), height 16px
4. **Zone CTA** (droite): min-width 100px, text-right
5. **Zone indicateurs** (extreme droite): auto, flex gap-1.5

### 3.2 Structure mobile (< 768px)

```
+--------------------------------------------------+
| [X] | Message tronque si besoin... | Voir > | == |
+--------------------------------------------------+
```

**Adaptations mobile:**
- Message: truncate avec ellipsis si trop long
- CTA: texte court "Voir" ou "Go"
- Indicateurs: 6px x 2px (reduits)
- Tout reste visible (pas de hidden)

### 3.3 Style du CTA - Design luxe

```css
.announcement-cta {
  /* Typographie */
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  /* Couleur - accent gold sur fond sombre */
  color: #d4a84b; /* --color-gold */

  /* Espacement */
  padding: 4px 12px;
  margin-left: 12px;

  /* Interaction */
  transition: all 200ms ease;
  position: relative;
}

.announcement-cta::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 12px;
  right: 12px;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 200ms ease;
}

.announcement-cta:hover::after {
  transform: scaleX(1);
}

.announcement-cta:hover {
  color: #e5b85c; /* gold plus clair */
}
```

### 3.4 Icone CTA

```tsx
// Utiliser ChevronRight pour liens internes
// Utiliser ArrowUpRight (ou ExternalLink) pour liens externes
<span className="announcement-cta">
  {linkText}
  {isExternal ? (
    <ArrowUpRight className="w-3 h-3 ml-1 inline" />
  ) : (
    <ChevronRight className="w-3 h-3 ml-0.5 inline" />
  )}
</span>
```

---

## 4. Accessibilite (WCAG 2.1 AA)

### 4.1 Structure ARIA

```tsx
<div
  role="region"
  aria-label="Annonces promotionnelles"
  aria-live="polite"
  aria-atomic="true"
>
  {/* Annonce pour screen readers */}
  <div className="sr-only" aria-live="polite">
    Annonce {currentIndex + 1} sur {total}
  </div>

  {/* Contenu visible */}
  <div role="group" aria-roledescription="annonce">
    ...
  </div>
</div>
```

### 4.2 Navigation clavier

| Touche | Action |
|--------|--------|
| Tab | Focus sur le lien/CTA |
| Tab | Focus sur le bouton fermer |
| Tab | Focus sur les indicateurs (si presents) |
| Enter/Space | Activer l'element focus |
| Escape | Fermer l'annonce courante |

### 4.3 Focus visible

```css
.announcement-interactive:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
  border-radius: 2px;
}
```

### 4.4 Zone tactile minimum

```css
/* Bouton fermer - zone 44x44px minimum */
.announcement-close {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-close svg {
  width: 16px;
  height: 16px;
}

/* Indicateurs - zone 44x44px mais visuel compact */
.announcement-indicator {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.announcement-indicator::before {
  content: '';
  width: 8px;
  height: 2px;
  /* ... styles ... */
}
```

### 4.5 Contraste des couleurs

**Combinaisons pre-approuvees (ratio >= 4.5:1):**

| Fond | Texte | CTA | Ratio |
|------|-------|-----|-------|
| #0A0A0A (noir) | #FFFFFF | #d4a84b | 16.8:1 / 8.2:1 |
| #1e293b (slate-800) | #FFFFFF | #d4a84b | 12.6:1 / 6.2:1 |
| #7c2d12 (orange-900) | #FFFFFF | #fef3c7 | 7.8:1 / 10.1:1 |
| #1e3a5f (navy) | #FFFFFF | #d4a84b | 10.4:1 / 5.1:1 |

**Validation dynamique:**
```typescript
function hasValidContrast(bgColor: string, textColor: string): boolean {
  const ratio = getContrastRatio(bgColor, textColor);
  return ratio >= 4.5;
}

// Fallback si contraste insuffisant
const safeTextColor = hasValidContrast(bgColor, textColor)
  ? textColor
  : '#FFFFFF';
```

### 4.6 Reduced Motion

```tsx
const prefersReducedMotion = usePrefersReducedMotion();

// Pas d'auto-rotation si reduced motion
useEffect(() => {
  if (prefersReducedMotion) return;

  const interval = setInterval(nextAnnouncement, 6000);
  return () => clearInterval(interval);
}, [prefersReducedMotion]);

// Transitions instantanees
const transitionDuration = prefersReducedMotion ? 0 : 300;
```

---

## 5. Etats et comportements

### 5.1 Diagramme d'etats

```
[Loading] --> [0 annonces] --> [Hidden]
    |
    v
[1+ annonces] --> [Affiche annonce 1]
                        |
        [Timer 6s] <----+----> [User dismiss]
             |                      |
             v                      v
      [Transition]           [Remove de la liste]
             |                      |
             v                      v
      [Annonce suivante]    [Autres annonces?]
                                   |
                         +----+----+
                         |         |
                        Oui       Non
                         |         |
                         v         v
                 [Affiche suivante] [Hidden]
```

### 5.2 Gestion des erreurs

```typescript
// API error: fail silently, don't show banner
if (!response.ok) {
  console.error('Announcement API error:', response.status);
  return null; // Banner reste cache
}

// Empty response: normal case
if (!data.announcements?.length) {
  return null;
}
```

### 5.3 Etats visuels du CTA

| Etat | Style |
|------|-------|
| Default | Gold #d4a84b, pas de underline |
| Hover | Gold clair #e5b85c, underline slide-in |
| Focus | Outline 2px white, offset 2px |
| Active | Scale 0.98 |
| Disabled | Opacity 0.5 (si lien vide) |

---

## 6. Specifications techniques

### 6.1 Props du composant

```typescript
interface AnnouncementBannerProps {
  /** Classes CSS additionnelles */
  className?: string;

  /** Desactiver l'auto-rotation */
  autoRotate?: boolean; // default: true

  /** Intervalle de rotation en ms */
  rotationInterval?: number; // default: 6000

  /** Afficher les indicateurs */
  showIndicators?: boolean; // default: true

  /** Callback lors du clic sur une annonce */
  onAnnouncementClick?: (announcement: Announcement) => void;

  /** Callback lors de la fermeture */
  onDismiss?: (announcementId: string) => void;
}
```

### 6.2 Hooks personnalises suggeres

```typescript
// Hook pour gerer le carousel
function useAnnouncementCarousel(announcements: Announcement[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // ...
}

// Hook pour detecter reduced motion
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  // ...
}

// Hook pour swipe gesture
function useSwipeGesture(onSwipeLeft: () => void, onSwipeRight: () => void) {
  // ...
}
```

### 6.3 Performance

- **Memoization**: `useMemo` pour le tri/filtrage des annonces
- **Callback stability**: `useCallback` pour handlers
- **Animation**: CSS transforms (GPU accelerated)
- **Re-renders**: Minimiser avec `memo()` deja en place

---

## 7. Wireframes ASCII

### Desktop - 1 annonce

```
+--------------------------------------------------------------------------------+
|  X  |         Livraison offerte des 200EUR d'achat sur toute la France         |
+--------------------------------------------------------------------------------+
```

### Desktop - Multiple annonces avec CTA

```
+--------------------------------------------------------------------------------+
|  X  |    Nouvelle collection Printemps 2025 disponible    |  |  Decouvrir >  | === |
+--------------------------------------------------------------------------------+
```

### Mobile - Multiple annonces

```
+--------------------------------------------------+
| X | Nouvelle collection Printemps... | Voir > |==|
+--------------------------------------------------+
```

### Indicateurs actifs

```
Inactif:  ==  ==  ==
Actif:    ====  ==  ==
          ^
          Annonce courante (plus large)
```

---

## 8. Checklist d'implementation

- [ ] Refactoriser pour supporter plusieurs annonces
- [ ] Implementer le carousel avec auto-rotation
- [ ] Ajouter les indicateurs de navigation
- [ ] Repositionner le CTA a droite du message
- [ ] Augmenter la zone tactile du bouton fermer (44x44px)
- [ ] Ajouter aria-live pour les changements d'annonce
- [ ] Implementer le support swipe mobile
- [ ] Respecter prefers-reduced-motion
- [ ] Valider le contraste des couleurs dynamiquement
- [ ] Ajouter les tests unitaires et d'accessibilite

---

## 9. References

- [WCAG 2.1 Success Criterion 2.2.2 - Pause, Stop, Hide](https://www.w3.org/WAI/WCAG21/Understanding/pause-stop-hide.html)
- [WCAG 2.1 Success Criterion 2.5.5 - Target Size](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Nielsen Norman Group - Carousel Usability](https://www.nngroup.com/articles/designing-effective-carousels/)
- [Inclusive Components - Notification](https://inclusive-components.design/notifications/)
