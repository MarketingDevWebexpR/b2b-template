# Plan d'Implementation - Tunnel d'Achat Luxe

## Core Objective
Creer un tunnel d'achat premium et memorable pour une application de bijouterie de luxe, avec une experience utilisateur fluide, des animations elegantes et une integration Stripe securisee.

**Success Metric:** Taux de conversion du panier > 80%, temps de checkout < 2 minutes, NPS experience checkout > 70

---

## Vue d'Ensemble de l'Architecture

```
app/
  checkout/
    _layout.tsx           # Layout modal avec navigation
    index.tsx             # Point d'entree / redirection
    shipping.tsx          # Etape 1: Livraison
    payment.tsx           # Etape 2: Paiement Stripe
    confirmation.tsx      # Etape 3: Confirmation celebratoire

components/
  checkout/
    index.ts              # Barrel export
    CheckoutStepIndicator.tsx
    ShippingForm.tsx
    ShippingOptionCard.tsx
    PaymentForm.tsx
    OrderSummary.tsx
    CheckoutButton.tsx
    OrderConfirmationOverlay.tsx
    SecurePaymentBadge.tsx

hooks/
  useCheckout.ts          # Etat global du checkout
  useStripePayment.ts     # Integration Stripe
```

---

## Stage 1: Foundation Layer

**Goal:** Infrastructure de base pour le tunnel d'achat
**Status:** Not Started
**Estimated Time:** 45 min

### Task 1.1: Installation des Dependances
**Task ID:** CHKT-0001
**Priority:** Critical

```bash
npx expo install @stripe/stripe-react-native
```

**Dependencies additionnelles a verifier:**
- expo-secure-store (deja installe)
- react-native-reanimated (deja installe)

**Acceptance Criteria:**
- [ ] Package @stripe/stripe-react-native installe
- [ ] Aucune erreur de build apres installation
- [ ] Pods installes pour iOS

---

### Task 1.2: Hook useCheckout
**Task ID:** CHKT-0002
**Priority:** Critical
**File:** `/hooks/useCheckout.ts`

**Specification:**
```typescript
interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
}

interface ShippingOption {
  id: 'standard' | 'express' | 'premium';
  label: string;
  description: string;
  price: number;
  estimatedDays: string;
}

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

interface CheckoutState {
  step: CheckoutStep;
  shippingInfo: ShippingInfo;
  selectedShippingOption: ShippingOption | null;
  isProcessing: boolean;
  error: string | null;
  orderId: string | null;
}

interface CheckoutActions {
  setShippingInfo: (info: Partial<ShippingInfo>) => void;
  setShippingOption: (option: ShippingOption) => void;
  goToStep: (step: CheckoutStep) => void;
  validateShipping: () => boolean;
  createOrder: () => Promise<string>;
  reset: () => void;
}
```

**Acceptance Criteria:**
- [ ] Hook exporte useCheckout avec etat et actions
- [ ] Validation des champs shipping implementee
- [ ] Persistance de l'etat durant la navigation
- [ ] Reset du state apres confirmation

---

### Task 1.3: Hook useStripePayment
**Task ID:** CHKT-0003
**Priority:** Critical
**File:** `/hooks/useStripePayment.ts`

**Specification:**
```typescript
interface PaymentState {
  isReady: boolean;
  isProcessing: boolean;
  error: string | null;
  paymentIntentId: string | null;
}

interface UseStripePaymentReturn {
  state: PaymentState;
  initializePayment: (amount: number) => Promise<string>; // Returns clientSecret
  confirmPayment: (clientSecret: string) => Promise<boolean>;
  reset: () => void;
}
```

**Note Implementation:**
- Phase 1: Mock implementation (simule delai + succes)
- Phase 2: Integration reelle avec backend Stripe

**Acceptance Criteria:**
- [ ] Hook fonctionnel avec mock implementation
- [ ] Gestion des erreurs (timeout, echec)
- [ ] Loading states corrects
- [ ] Types TypeScript complets

---

### Task 1.4: Barrel Export Components
**Task ID:** CHKT-0004
**Priority:** High
**File:** `/components/checkout/index.ts`

```typescript
export { CheckoutStepIndicator } from './CheckoutStepIndicator';
export { ShippingForm } from './ShippingForm';
export { ShippingOptionCard } from './ShippingOptionCard';
export { PaymentForm } from './PaymentForm';
export { OrderSummary } from './OrderSummary';
export { CheckoutButton } from './CheckoutButton';
export { OrderConfirmationOverlay } from './OrderConfirmationOverlay';
export { SecurePaymentBadge } from './SecurePaymentBadge';
```

**Acceptance Criteria:**
- [ ] Fichier cree avec exports placeholder
- [ ] Imports fonctionnent depuis autres fichiers

---

## Stage 2: Core Components

**Goal:** Composants UI reutilisables pour le checkout
**Status:** Not Started
**Estimated Time:** 90 min

### Task 2.1: CheckoutStepIndicator
**Task ID:** CHKT-0010
**Priority:** High
**File:** `/components/checkout/CheckoutStepIndicator.tsx`

**Design Specs:**
- 3 cercles connectes par des lignes
- Etape active: cercle plein hermes (#f67828)
- Etape completee: cercle avec checkmark anime
- Etape future: cercle outline gris
- Animation spring lors des transitions

**Props:**
```typescript
interface Props {
  currentStep: 1 | 2 | 3;
  labels?: [string, string, string];
}
```

**Animation Details:**
- Utiliser `springConfigs.celebration` pour le checkmark
- Ligne de progression animee avec `withTiming`
- Duree transition: 300ms

**Acceptance Criteria:**
- [ ] Affiche 3 etapes avec labels
- [ ] Indicateur visuel de l'etape courante
- [ ] Animation fluide lors du changement d'etape
- [ ] Checkmark anime pour etapes completees

---

### Task 2.2: ShippingForm
**Task ID:** CHKT-0011
**Priority:** High
**File:** `/components/checkout/ShippingForm.tsx`

**Design Specs:**
- Inputs avec style luxueux (border-radius elegant, padding genereux)
- Labels discrets au-dessus des champs
- Validation en temps reel avec feedback visuel
- Focus state avec border hermes

**Fields:**
```
Row 1: [Prenom*] [Nom*]
Row 2: [Adresse*]
Row 3: [Complement]
Row 4: [Code postal*] [Ville*]
Row 5: [Pays] (dropdown)
Row 6: [Telephone*]
Row 7: [Email*]
```

**Validation Rules:**
- Prenom/Nom: min 2 caracteres
- Adresse: min 5 caracteres
- Code postal: 5 chiffres (FR)
- Telephone: format FR (+33 ou 0X)
- Email: format valide

**Acceptance Criteria:**
- [ ] Tous les champs implementes
- [ ] Validation en temps reel
- [ ] Messages d'erreur elegants
- [ ] Keyboard avoiding view
- [ ] Auto-focus sur erreur

---

### Task 2.3: ShippingOptionCard
**Task ID:** CHKT-0012
**Priority:** High
**File:** `/components/checkout/ShippingOptionCard.tsx`

**Design Specs:**
- Card avec radio button luxueux
- Icone a gauche (Package, Truck, Crown)
- Titre + description + delai
- Prix a droite (ou "Gratuit")
- Selected state avec border hermes + background leger

**Props:**
```typescript
interface Props {
  option: ShippingOption;
  isSelected: boolean;
  onSelect: () => void;
  isFree?: boolean; // Affiche "Offert" au lieu du prix
}
```

**Options Standard:**
```typescript
const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'standard',
    label: 'Livraison Standard',
    description: 'Colissimo avec suivi',
    price: 9.90,
    estimatedDays: '3-5 jours ouvrables',
    icon: 'Package'
  },
  {
    id: 'express',
    label: 'Livraison Express',
    description: 'Chronopost 24h',
    price: 19.90,
    estimatedDays: '1-2 jours ouvrables',
    icon: 'Truck'
  },
  {
    id: 'premium',
    label: 'Livraison Premium',
    description: 'Remise en main propre, ecrin cadeau',
    price: 49.90,
    estimatedDays: 'Sur rendez-vous',
    icon: 'Crown'
  }
];
```

**Acceptance Criteria:**
- [ ] 3 options de livraison affichees
- [ ] Selection avec animation
- [ ] Affichage conditionnel "Offert"
- [ ] Haptic feedback sur selection

---

### Task 2.4: OrderSummary
**Task ID:** CHKT-0013
**Priority:** High
**File:** `/components/checkout/OrderSummary.tsx`

**Design Specs:**
- Liste des articles avec miniatures
- Sous-total, frais de livraison, total
- Style compact ou expandable
- Separateurs elegants

**Props:**
```typescript
interface Props {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  variant?: 'compact' | 'full';
  collapsible?: boolean;
}
```

**Acceptance Criteria:**
- [ ] Affiche articles du panier
- [ ] Calculs corrects
- [ ] Mode compact pour sidebar
- [ ] Mode full pour recapitulatif

---

### Task 2.5: CheckoutButton
**Task ID:** CHKT-0014
**Priority:** High
**File:** `/components/checkout/CheckoutButton.tsx`

**Design Specs:**
- Bouton pleine largeur
- Background hermes (#f67828)
- Loading state avec spinner
- Disabled state (opacity 0.5)
- Press animation (scale 0.97)

**Props:**
```typescript
interface Props {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
}
```

**Animation:**
- Utiliser `springConfigs.button` pour scale
- Spinner anime pendant loading

**Acceptance Criteria:**
- [ ] States visuels corrects
- [ ] Animation press fluide
- [ ] Haptic feedback
- [ ] Loading spinner centre

---

### Task 2.6: SecurePaymentBadge
**Task ID:** CHKT-0015
**Priority:** Medium
**File:** `/components/checkout/SecurePaymentBadge.tsx`

**Design Specs:**
- Icone Shield + Lock
- Texte "Paiement 100% securise"
- Logos cartes (Visa, MC, Amex)
- Background subtil (success-light)

**Acceptance Criteria:**
- [ ] Badge compact et elegant
- [ ] Logos cartes affiches
- [ ] Inspire confiance

---

### Task 2.7: PaymentForm
**Task ID:** CHKT-0016
**Priority:** High
**File:** `/components/checkout/PaymentForm.tsx`

**Design Specs:**
- Wrapper autour de Stripe CardField
- Style coherent avec le design system
- Gestion des erreurs Stripe
- Indicateur de carte detectee

**Note:** Integration Stripe CardField pour PCI compliance

**Acceptance Criteria:**
- [ ] CardField Stripe integre
- [ ] Style personnalise applique
- [ ] Erreurs affichees clairement
- [ ] Detection type de carte

---

### Task 2.8: OrderConfirmationOverlay
**Task ID:** CHKT-0017
**Priority:** High
**File:** `/components/checkout/OrderConfirmationOverlay.tsx`

**Design Inspiration:** Utiliser le pattern de `AddToCartSuccessOverlay.tsx`

**Animation Sequence:**
1. Backdrop blur fade in (200ms)
2. Cercle blanc scale avec bounce (spring celebration)
3. Checkmark dore anime (draw effect)
4. Confetti/particules luxe (or, hermes, champagne)
5. Texte "Commande confirmee" fade in
6. Numero de commande apparait
7. Details commande slide up
8. Boutons CTA fade in

**Elements:**
- Cercle de succes avec glow dore
- Checkmark anime (stroke-dasharray animation)
- Particules: diamants, etoiles, confettis dores
- Texte serif elegant
- Numero de commande stylise
- Resume commande
- Bouton "Voir ma commande" + "Continuer mes achats"

**Duree totale:** ~2.5 secondes avant interaction possible

**Acceptance Criteria:**
- [ ] Animation spectaculaire et fluide
- [ ] Particules luxueuses
- [ ] Numero de commande affiche
- [ ] Boutons CTA fonctionnels
- [ ] Performance optimisee (60fps)

---

## Stage 3: Checkout Screens

**Goal:** Ecrans du tunnel d'achat
**Status:** Not Started
**Estimated Time:** 120 min

### Task 3.1: Checkout Layout
**Task ID:** CHKT-0020
**Priority:** Critical
**File:** `/app/checkout/_layout.tsx`

**Specification:**
```typescript
// Modal layout avec header navigation
// Back button pour revenir a l'etape precedente
// Close button pour fermer le checkout
// Titre dynamique selon l'etape
```

**Header Behavior:**
- Step 1 (Shipping): Back -> Ferme modal, X visible
- Step 2 (Payment): Back -> Shipping, X visible
- Step 3 (Confirmation): Pas de back, pas de X

**Acceptance Criteria:**
- [ ] Layout modal correct
- [ ] Navigation header dynamique
- [ ] Transitions fluides entre ecrans
- [ ] Gesture swipe to dismiss (sauf confirmation)

---

### Task 3.2: Checkout Index
**Task ID:** CHKT-0021
**Priority:** High
**File:** `/app/checkout/index.tsx`

**Behavior:**
- Si panier vide: redirect vers cart
- Sinon: redirect vers /checkout/shipping
- Point d'entree unique

**Acceptance Criteria:**
- [ ] Redirection correcte selon etat panier
- [ ] Pas de flash/flicker

---

### Task 3.3: Shipping Screen
**Task ID:** CHKT-0022
**Priority:** Critical
**File:** `/app/checkout/shipping.tsx`

**Layout:**
```
[CheckoutStepIndicator - Step 1]
[ScrollView]
  [ShippingForm]
  [ShippingOptionCards]
  [OrderSummary - compact]
[Sticky Bottom]
  [CheckoutButton - "Continuer vers le paiement"]
```

**Flow:**
1. User remplit formulaire
2. User selectionne option livraison
3. Validation au clic sur CTA
4. Navigation vers /checkout/payment

**Acceptance Criteria:**
- [ ] Formulaire fonctionnel
- [ ] Options livraison selectionnables
- [ ] Validation complete
- [ ] Keyboard avoiding
- [ ] Scroll smooth

---

### Task 3.4: Payment Screen
**Task ID:** CHKT-0023
**Priority:** Critical
**File:** `/app/checkout/payment.tsx`

**Layout:**
```
[CheckoutStepIndicator - Step 2]
[ScrollView]
  [Resume Adresse Livraison]
  [PaymentForm - Stripe CardField]
  [SecurePaymentBadge]
  [OrderSummary - full]
[Sticky Bottom]
  [CheckoutButton - "Payer {total}"]
```

**Flow:**
1. Affiche resume adresse (editable)
2. User entre carte via Stripe
3. Click "Payer"
4. Processing overlay
5. Success -> /checkout/confirmation
6. Error -> Message d'erreur inline

**Integration Stripe:**
```typescript
// 1. Creer PaymentIntent (backend mock)
// 2. Confirmer avec CardField
// 3. Gerer 3DS si necessaire
// 4. Resultat succes/echec
```

**Acceptance Criteria:**
- [ ] Stripe CardField fonctionnel
- [ ] Processing state visible
- [ ] Gestion erreurs elegante
- [ ] Montant total affiche sur CTA

---

### Task 3.5: Confirmation Screen
**Task ID:** CHKT-0024
**Priority:** High
**File:** `/app/checkout/confirmation.tsx`

**Layout:**
```
[OrderConfirmationOverlay - animated]
  [Success animation]
  [Numero commande]
  [Resume commande]
  [Boutons CTA]
```

**Behavior:**
- Auto-trigger de l'animation au mount
- Clear cart apres succes
- Disable back navigation
- Store order in history

**CTAs:**
- "Voir ma commande" -> /orders
- "Continuer mes achats" -> /(tabs)

**Acceptance Criteria:**
- [ ] Animation celebratoire complete
- [ ] Panier vide apres confirmation
- [ ] Navigation correcte via CTAs
- [ ] Numero de commande unique genere

---

## Stage 4: Integration & Polish

**Goal:** Integration finale et polish
**Status:** Not Started
**Estimated Time:** 30 min

### Task 4.1: Update Root Layout
**Task ID:** CHKT-0030
**Priority:** Critical
**File:** `/app/_layout.tsx`

**Changes:**
- Remplacer la config existante du checkout
- Configurer pour nested layout
- Ajouter StripeProvider wrapper (si necessaire globalement)

```typescript
// Avant (a supprimer)
<Stack.Screen
  name="checkout"
  options={{
    headerShown: true,
    headerTitle: 'Paiement',
    presentation: 'modal',
  }}
/>

// Apres
<Stack.Screen
  name="checkout"
  options={{
    headerShown: false,
    presentation: 'modal',
  }}
/>
```

**Acceptance Criteria:**
- [ ] Routing checkout fonctionne
- [ ] Modal presentation OK
- [ ] Pas de conflits avec ancien fichier

---

### Task 4.2: Delete Old Checkout
**Task ID:** CHKT-0031
**Priority:** High

**Action:** Supprimer `/app/checkout.tsx` (ancien fichier monolithique)

**Acceptance Criteria:**
- [ ] Fichier supprime
- [ ] Aucune reference cassee
- [ ] App compile sans erreur

---

### Task 4.3: Haptic Feedback Integration
**Task ID:** CHKT-0032
**Priority:** Medium

**Points d'integration:**
- Selection option livraison: `hapticFeedback.softConfirm()`
- Validation formulaire reussie: `hapticFeedback.success()`
- Erreur: `hapticFeedback.error()`
- Bouton CTA press: `hapticFeedback.impact()`
- Confirmation commande: `hapticFeedback.celebration()`

**Acceptance Criteria:**
- [ ] Haptics sur toutes les interactions cles
- [ ] Coherence avec le reste de l'app

---

### Task 4.4: End-to-End Testing
**Task ID:** CHKT-0033
**Priority:** High

**Test Scenarios:**
1. Panier vide -> redirection vers cart
2. Flow complet shipping -> payment -> confirmation
3. Validation formulaire (champs vides, formats)
4. Erreur paiement -> message + retry
5. Succes paiement -> animation + clear cart
6. Navigation back durant checkout
7. Fermeture modale -> confirmation dialog

**Acceptance Criteria:**
- [ ] Tous les scenarios passes
- [ ] Aucun crash
- [ ] Performance acceptable

---

## Dependencies Installation

```bash
# Dependance principale
npx expo install @stripe/stripe-react-native

# Verifier que ces deps sont presentes (normalement deja installees)
# expo-haptics (deja la)
# react-native-reanimated (deja la)
# expo-blur (deja la)
```

### Configuration Stripe (app.json/app.config.js)

```json
{
  "expo": {
    "plugins": [
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.bijoux.app",
          "enableGooglePay": true
        }
      ]
    ]
  }
}
```

### Variables d'environnement requises

```
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx (backend only)
```

---

## Points d'Attention Techniques

### 1. PCI Compliance
- Ne JAMAIS manipuler les donnees carte directement
- Utiliser exclusivement Stripe CardField ou PaymentSheet
- Les donnees transitent directement vers Stripe

### 2. Performance Animations
- Utiliser `useNativeDriver: true` quand possible
- Limiter le nombre de particules (12 max)
- Lazy load du composant confirmation
- Eviter les re-renders inutiles avec useMemo/useCallback

### 3. Gestion d'Etat
- Checkout state persiste durant navigation (pas AsyncStorage, juste Context)
- Clear explicite apres confirmation
- Gestion timeout pour PaymentIntent

### 4. UX Mobile
- Keyboard avoiding view sur tous les formulaires
- Input accessory view pour navigation clavier
- Validation progressive (pas tout a la fin)
- Loading states clairs et immediats

### 5. Accessibility
- Labels accessibilite sur tous les inputs
- Contraste suffisant
- Touch targets minimum 44x44
- Announcements pour screen readers

### 6. Error Handling
- Erreurs reseau: retry avec backoff
- Erreurs validation: inline immediate
- Erreurs Stripe: messages traduits en francais
- Timeout paiement: 30 secondes max

---

## Estimation Totale

| Stage | Description | Temps |
|-------|-------------|-------|
| 1 | Foundation Layer | 45 min |
| 2 | Core Components | 90 min |
| 3 | Checkout Screens | 120 min |
| 4 | Integration & Polish | 30 min |
| **Total** | | **~5h** |

---

## Priorite d'Execution

```
CRITIQUE (Bloquant):
1. CHKT-0001: Install dependencies
2. CHKT-0002: useCheckout hook
3. CHKT-0003: useStripePayment hook
4. CHKT-0020: Checkout layout
5. CHKT-0022: Shipping screen
6. CHKT-0023: Payment screen

HAUTE (Core Experience):
7. CHKT-0010: StepIndicator
8. CHKT-0011: ShippingForm
9. CHKT-0013: OrderSummary
10. CHKT-0017: ConfirmationOverlay
11. CHKT-0024: Confirmation screen

MOYENNE (Polish):
12. CHKT-0012: ShippingOptionCard
13. CHKT-0014: CheckoutButton
14. CHKT-0015: SecurePaymentBadge
15. CHKT-0016: PaymentForm
16. CHKT-0032: Haptics

BASSE (Cleanup):
17. CHKT-0030: Update root layout
18. CHKT-0031: Delete old checkout
19. CHKT-0033: E2E testing
```

---

## Next Steps

1. **Immediate:** Installer @stripe/stripe-react-native
2. **Creer la structure de fichiers** (dossiers + fichiers vides)
3. **Implementer hooks** (useCheckout, useStripePayment)
4. **Construire composants** dans l'ordre de priorite
5. **Assembler les screens**
6. **Tester et polir**

---

*Document genere le: $(date)*
*Version: 1.0*
*Auteur: AI Product Manager*
