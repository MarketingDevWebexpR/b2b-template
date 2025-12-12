# Specification UX - Parcours Checkout Maison Joaillerie

## Vue d'ensemble

Ce document definit l'experience utilisateur complete pour le parcours d'achat de Maison Joaillerie, de la navigation jusqu'a la confirmation de commande. L'experience est concue pour refleter l'excellence et le raffinement d'une maison de haute joaillerie francaise, inspiree par l'elegance Hermes.

---

## 1. Principes UX pour le E-commerce de Luxe

### 1.1 Philosophie de Design

| Principe | Application |
|----------|-------------|
| **Elegance sobre** | Interface epuree, espaces genereux, typographie raffinee |
| **Confiance absolue** | Reassurance a chaque etape, transparence totale |
| **Fluidite sans friction** | Parcours simplifie, minimum de clics |
| **Experience sensorielle** | Animations subtiles, micro-interactions delicates |
| **Service personnalise** | Ton chaleureux, sentiment d'exclusivite |

### 1.2 Attributs de Marque a Transmettre

- **Heritage & Savoir-faire** : References a l'artisanat, aux materiaux nobles
- **Exclusivite** : Numerotation des pieces, certificats d'authenticite
- **Attention au detail** : Packaging premium, presentation soignee
- **Service irreprochable** : Disponibilite, accompagnement, retours faciles

---

## 2. Cartographie du Parcours Utilisateur

### 2.1 User Journey Map Complet

```
DECOUVERTE          CONSIDERATION         DECISION           POST-ACHAT
    |                    |                    |                   |
    v                    v                    v                   v
[Homepage]  -->  [Collections]  -->  [Produit]  -->  [Panier]
                       |                 |              |
                       v                 v              v
                  [Filtres]     [Galerie/Zoom]   [Recapitulatif]
                       |                 |              |
                       v                 v              v
                  [Tri/Recherche]  [Add to Cart]  [Checkout]
                                                       |
                                        +--------------+--------------+
                                        |              |              |
                                        v              v              v
                                   [Livraison]   [Paiement]   [Confirmation]
                                                                   |
                                                                   v
                                                            [Suivi commande]
                                                            [Mon compte]
```

### 2.2 Etats Emotionnels par Etape

| Etape | Emotion Cible | Elements UX |
|-------|---------------|-------------|
| **Decouverte** | Emerveillement, Desir | Visuels premium, storytelling |
| **Consideration** | Confiance, Curiosite | Details produit, materiaux, artisanat |
| **Ajout panier** | Satisfaction, Anticipation | Feedback positif, animation elegante |
| **Panier** | Assurance, Clarte | Resume clair, pas de surprises |
| **Livraison** | Securite, Simplicite | Formulaire fluide, options claires |
| **Paiement** | Confiance, Serénité | Securite visible, methodes reconnues |
| **Confirmation** | Joie, Exclusivite | Celebration discrete, prochaines etapes |

---

## 3. Architecture des Pages

### 3.1 Page Panier (/panier)

#### Structure

```
+------------------------------------------------------------------+
|  HEADER (sticky)                                                  |
+------------------------------------------------------------------+
|  BREADCRUMB: Accueil > Panier                                    |
+------------------------------------------------------------------+
|                                                                  |
|  TITRE: "Votre Panier" (h1)                                     |
|  Sous-titre: "{n} article(s)"                                    |
|                                                                  |
+------------------------------------------------------------------+
|                         |                                        |
|  LISTE ARTICLES (70%)   |  RESUME COMMANDE (30%)                |
|                         |                                        |
|  +-------------------+  |  +-----------------------------+       |
|  | [Image] Produit 1 |  |  | Sous-total:      X XXX EUR |       |
|  | Nom - Ref         |  |  | Livraison:       Offerte   |       |
|  | Prix - Quantite   |  |  +-----------------------------+       |
|  | [Supprimer]       |  |  | TOTAL:           X XXX EUR |       |
|  +-------------------+  |  +-----------------------------+       |
|                         |  | [PASSER COMMANDE]           |       |
|  +-------------------+  |  +-----------------------------+       |
|  | [Image] Produit 2 |  |  | - Paiement securise         |       |
|  | ...               |  |  | - Retours sous 30 jours     |       |
|  +-------------------+  |  | - Livraison assurée         |       |
|                         |  +-----------------------------+       |
+------------------------------------------------------------------+
|  REASSURANCE BAR                                                 |
|  [Livraison] [Retours] [Certificat] [Service Client]            |
+------------------------------------------------------------------+
|  VOUS AIMEREZ AUSSI (suggestions)                                |
+------------------------------------------------------------------+
```

#### Composants Detailles

**Item du Panier**
```
+---------------------------------------------------------------+
| +--------+                                                     |
| | IMAGE  |  Bague Solitaire Eclipse                           |
| | 120x120|  Reference: MJ-00425                               |
| |        |                                                    |
| +--------+  Or jaune 18 carats - Diamant 0.5ct               |
|                                                               |
|             Prix unitaire: 4 850,00 EUR                       |
|                                                               |
|             Quantite: [-] 1 [+]                               |
|                                                               |
|             Total: 4 850,00 EUR                               |
|                                                               |
|             [Supprimer de mon panier]                         |
+---------------------------------------------------------------+
```

### 3.2 Flux Checkout (/checkout)

#### Indicateur de Progression

```
[1. Livraison]  ------>  [2. Paiement]  ------>  [3. Confirmation]
     (active)               (a venir)               (a venir)

Design: Ligne horizontale avec cercles numerotes
- Etape active: Cercle plein hermes-500, texte gras
- Etape completee: Cercle avec checkmark, ligne remplie
- Etape a venir: Cercle vide, texte gris
```

#### 3.2.1 Etape 1: Livraison (/checkout/livraison)

```
+------------------------------------------------------------------+
|  PROGRESS INDICATOR                                              |
+------------------------------------------------------------------+
|                                                                  |
|  TITRE: "Informations de livraison"                             |
|                                                                  |
+------------------------------------------------------------------+
|                              |                                   |
|  FORMULAIRE (60%)            |  RESUME (40%)                    |
|                              |                                   |
|  +------------------------+  |  +---------------------------+    |
|  | INFORMATIONS CONTACT   |  |  | VOTRE COMMANDE           |    |
|  |                        |  |  |                          |    |
|  | Email *                |  |  | [Mini] Produit 1  4850E  |    |
|  | Telephone *            |  |  | [Mini] Produit 2  2200E  |    |
|  +------------------------+  |  |                          |    |
|                              |  | Sous-total:      7050E   |    |
|  +------------------------+  |  | Livraison:       Offerte |    |
|  | ADRESSE DE LIVRAISON   |  |  | -----------------------  |    |
|  |                        |  |  | TOTAL:           7050E   |    |
|  | Prenom *  | Nom *      |  |  +---------------------------+    |
|  | Adresse *              |  |                                   |
|  | Complement             |  |  [Code promo?] [Appliquer]       |
|  | Code postal * | Ville *|  |                                   |
|  | Pays *                 |  |                                   |
|  +------------------------+  |                                   |
|                              |                                   |
|  [ ] Adresse de facturation  |                                   |
|      differente              |                                   |
|                              |                                   |
|  [CONTINUER VERS PAIEMENT]   |                                   |
|                              |                                   |
+------------------------------------------------------------------+
```

#### 3.2.2 Etape 2: Paiement (/checkout/paiement)

```
+------------------------------------------------------------------+
|  PROGRESS INDICATOR                                              |
+------------------------------------------------------------------+
|                                                                  |
|  TITRE: "Paiement securise"                                     |
|                                                                  |
+------------------------------------------------------------------+
|                              |                                   |
|  METHODES PAIEMENT (60%)     |  RESUME (40%)                    |
|                              |                                   |
|  +------------------------+  |  +---------------------------+    |
|  | CARTE BANCAIRE         |  |  | LIVRAISON                |    |
|  | [Visa][MC][Amex]       |  |  | Jean Dupont              |    |
|  |                        |  |  | 12 rue de la Paix        |    |
|  | Numero de carte        |  |  | 75002 Paris, France      |    |
|  | [________________]     |  |  | [Modifier]               |    |
|  |                        |  |  +---------------------------+    |
|  | Expiration | CVC       |  |                                   |
|  | [__/__]    | [___]     |  |  +---------------------------+    |
|  |                        |  |  | VOTRE COMMANDE           |    |
|  | Nom sur la carte       |  |  | ...                      |    |
|  | [________________]     |  |  | TOTAL: 7 050,00 EUR      |    |
|  +------------------------+  |  +---------------------------+    |
|                              |                                   |
|  +------------------------+  |  [Lock] Paiement 100% securise   |
|  | PAYPAL                 |  |  Vos donnees sont protegees      |
|  | [Logo PayPal]          |  |                                   |
|  +------------------------+  |                                   |
|                              |                                   |
|  [ ] Sauvegarder pour        |                                   |
|      mes prochains achats    |                                   |
|                              |                                   |
|  [CONFIRMER ET PAYER]        |                                   |
|                              |                                   |
+------------------------------------------------------------------+
|                                                                  |
|  En confirmant, vous acceptez nos Conditions Generales           |
|  de Vente et notre Politique de Confidentialite.                 |
|                                                                  |
+------------------------------------------------------------------+
```

#### 3.2.3 Etape 3: Confirmation (/checkout/confirmation)

```
+------------------------------------------------------------------+
|                                                                  |
|              [Check Icon - Animation elegante]                   |
|                                                                  |
|              Merci pour votre commande                           |
|                                                                  |
|              Commande n° MJ-2024-00847                           |
|                                                                  |
|  Un email de confirmation a ete envoye a                         |
|  jean.dupont@email.com                                           |
|                                                                  |
+------------------------------------------------------------------+
|                              |                                   |
|  DETAILS COMMANDE (60%)      |  PROCHAINES ETAPES (40%)         |
|                              |                                   |
|  +------------------------+  |  +---------------------------+    |
|  | ARTICLES               |  |  | LIVRAISON ESTIMEE        |    |
|  | [Mini] Produit 1       |  |  | 18-22 Decembre 2024      |    |
|  | [Mini] Produit 2       |  |  |                          |    |
|  +------------------------+  |  | Vous recevrez un email   |    |
|                              |  | avec le suivi de votre   |    |
|  +------------------------+  |  | colis.                   |    |
|  | ADRESSE DE LIVRAISON   |  |  +---------------------------+    |
|  | Jean Dupont            |  |                                   |
|  | 12 rue de la Paix      |  |  +---------------------------+    |
|  | 75002 Paris            |  |  | BESOIN D'AIDE ?          |    |
|  +------------------------+  |  | service@maisonjoaillerie |    |
|                              |  | 01 XX XX XX XX           |    |
|  +------------------------+  |  +---------------------------+    |
|  | MODE DE PAIEMENT       |  |                                   |
|  | Visa ****4242          |  |                                   |
|  +------------------------+  |                                   |
|                              |                                   |
|  TOTAL PAYE: 7 050,00 EUR    |  [SUIVRE MA COMMANDE]            |
|                              |  [CONTINUER MES ACHATS]          |
|                              |                                   |
+------------------------------------------------------------------+
```

---

## 4. Design System - Checkout

### 4.1 Couleurs Specifiques

| Token | Valeur | Usage |
|-------|--------|-------|
| `background-cream` | `#fffcf7` | Fond principal |
| `background-warm` | `#f6f1eb` | Zones de resume, hover |
| `hermes-500` | `#f67828` | CTA principal, accents |
| `text-primary` | `#2b333f` | Titres, texte principal |
| `text-muted` | `#696969` | Labels, texte secondaire |
| `border-light` | `#f0ebe3` | Separateurs legers |
| `success` | `#16a34a` | Validation, confirmation |
| `error` | `#dc2626` | Erreurs |

### 4.2 Typographie Checkout

| Element | Font | Taille | Weight | Tracking |
|---------|------|--------|--------|----------|
| Titre page | `font-serif` | `text-heading-2` | 400 | -0.01em |
| Titre section | `font-sans` | `text-lg` | 600 | 0.01em |
| Labels | `font-sans` | `text-sm` | 500 | 0.02em |
| Input text | `font-sans` | `text-base` | 400 | normal |
| Prix | `font-sans` | `text-lg` | 500 | normal |
| CTA principal | `font-sans` | `text-sm` | 600 | `tracking-luxe` |

### 4.3 Composants Formulaire

#### Input Field (etend le composant existant)

```tsx
// Checkout-specific styling
<Input
  label="Email"
  name="email"
  type="email"
  placeholder="votre@email.com"
  error={errors.email}
  helperText="Pour le suivi de votre commande"
  required
  className="bg-white border-border-light focus:border-hermes-500"
/>
```

**Etats du champ:**
- Default: `border-border-light` (#f0ebe3)
- Focus: `border-hermes-500` + `ring-1 ring-hermes-500/20`
- Error: `border-red-500` + message rouge sous le champ
- Valid: `border-green-500` + icone checkmark
- Disabled: `bg-background-muted opacity-60`

#### Bouton Principal (CTA)

```tsx
<Button
  type="submit"
  variant="primary"
  size="lg"
  className="w-full uppercase tracking-luxe"
  isLoading={isSubmitting}
>
  Continuer vers le paiement
</Button>
```

**Styles specifiques:**
- Hauteur: 56px minimum (touch friendly)
- Coins: Carres (rounded-none) pour elegance
- Hover: Leger eclaircissement + ombre subtile
- Loading: Spinner dore, texte invisible

---

## 5. Guidelines Formulaires

### 5.1 Structure des Champs

#### Groupement Logique

```
INFORMATIONS PERSONNELLES
|-- Civilite (optionnel)
|-- Prenom *
|-- Nom *
|-- Email *
|-- Telephone *

ADRESSE
|-- Adresse *
|-- Complement (optionnel)
|-- Code postal * | Ville *
|-- Pays *
```

#### Layout Responsive

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | 1 colonne, champs empiles |
| Tablet (640-1024px) | 2 colonnes pour paires (CP/Ville) |
| Desktop (>1024px) | Formulaire 60% / Resume 40% |

### 5.2 Validation

#### Validation en Temps Reel

```typescript
// Schema Zod pour l'adresse de livraison
const shippingSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prenom est requis')
    .min(2, 'Le prenom doit contenir au moins 2 caracteres'),
  lastName: z
    .string()
    .min(1, 'Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caracteres'),
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Veuillez entrer une adresse email valide'),
  phone: z
    .string()
    .min(1, 'Le telephone est requis')
    .regex(/^(?:\+33|0)[1-9](?:[0-9]{8})$/, 'Numero de telephone invalide'),
  address: z
    .string()
    .min(1, 'L\'adresse est requise')
    .min(5, 'Adresse trop courte'),
  addressComplement: z.string().optional(),
  postalCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .regex(/^[0-9]{5}$/, 'Code postal invalide'),
  city: z
    .string()
    .min(1, 'La ville est requise'),
  country: z
    .string()
    .min(1, 'Le pays est requis'),
});
```

#### Moment de Validation

| Evenement | Action |
|-----------|--------|
| `onBlur` | Validation du champ individuel |
| `onChange` | Effacement de l'erreur si correction |
| `onSubmit` | Validation complete + scroll vers premiere erreur |

### 5.3 Messages d'Erreur

**Principes:**
- Clairs et actionables
- Ton respectueux, jamais accusateur
- Position: Sous le champ, anime (fade-in)

**Exemples:**
```
"Le prenom est requis"
"Veuillez entrer une adresse email valide"
"Le code postal doit contenir 5 chiffres"
"Ce champ est requis pour traiter votre commande"
```

### 5.4 Etats de Feedback

#### Chargement

```tsx
<Button isLoading={true}>
  <span className="opacity-0">Texte</span>
  <Loader2 className="absolute animate-spin" />
</Button>
```

#### Succes

```tsx
// Notification toast elegante
<Toast variant="success">
  <Check className="text-green-500" />
  Informations enregistrees
</Toast>
```

#### Erreur Serveur

```tsx
// Banniere d'erreur
<Alert variant="error">
  <AlertCircle />
  Une erreur est survenue. Veuillez reessayer.
  <Button variant="ghost" size="sm">Reessayer</Button>
</Alert>
```

---

## 6. Considerations Mobile-First

### 6.1 Hierarchie Mobile

**Page Panier (Mobile):**
```
+----------------------------+
| [< Retour] PANIER         |
+----------------------------+
| Article 1                  |
| [Image] Nom - Prix         |
| Qte: [-] 1 [+] [Supprimer]|
+----------------------------+
| Article 2                  |
| ...                        |
+----------------------------+
| TOTAL: X XXX EUR           |
| [COMMANDER] (sticky)       |
+----------------------------+
```

**Page Checkout (Mobile):**
```
+----------------------------+
| [1] - [2] - [3] Progress  |
+----------------------------+
| LIVRAISON                  |
|                            |
| [Formulaire pleine largeur]|
|                            |
+----------------------------+
| RESUME (collapsed)         |
| Total: 7050E [Voir detail] |
+----------------------------+
| [CONTINUER] (sticky)       |
+----------------------------+
```

### 6.2 Interactions Tactiles

| Element | Taille Minimum | Espacement |
|---------|----------------|------------|
| Boutons | 48px hauteur | 8px entre boutons |
| Inputs | 48px hauteur | 16px entre champs |
| Liens cliquables | 44x44px zone | N/A |
| Checkbox/Radio | 24x24px + label | 12px label-box |

### 6.3 Clavier Virtuel

```tsx
// Types de clavier adaptes
<Input type="email" inputMode="email" />
<Input type="tel" inputMode="tel" />
<Input name="postalCode" inputMode="numeric" pattern="[0-9]*" />
```

### 6.4 Gestion du Scroll

- Resume commande: Sticky en desktop, accordeon en mobile
- Bouton CTA: Sticky bottom sur mobile
- Formulaire: Scroll smooth vers erreurs

---

## 7. Accessibilite (WCAG 2.1 AA)

### 7.1 Structure Semantique

```html
<main>
  <h1>Votre Panier</h1>

  <section aria-labelledby="cart-items">
    <h2 id="cart-items" class="sr-only">Articles dans votre panier</h2>
    <ul role="list">
      <li><!-- Item --></li>
    </ul>
  </section>

  <aside aria-labelledby="order-summary">
    <h2 id="order-summary">Resume de commande</h2>
    <!-- Summary -->
  </aside>
</main>
```

### 7.2 Navigation Formulaire

```tsx
// Groupes de champs
<fieldset>
  <legend>Adresse de livraison</legend>
  {/* Champs */}
</fieldset>

// Labels explicites
<label htmlFor="firstName">
  Prenom
  <span aria-hidden="true">*</span>
  <span className="sr-only">(requis)</span>
</label>
<input
  id="firstName"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? "firstName-error" : undefined}
/>
{hasError && (
  <p id="firstName-error" role="alert">
    {errorMessage}
  </p>
)}
```

### 7.3 Annonces Live

```tsx
// Mise a jour du panier
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {cartUpdated && `Votre panier contient maintenant ${totalItems} articles`}
</div>

// Progression checkout
<div aria-live="polite" className="sr-only">
  {`Etape ${currentStep} sur 3: ${stepNames[currentStep]}`}
</div>
```

### 7.4 Contrastes

| Combinaison | Ratio | Conformite |
|-------------|-------|------------|
| Texte principal sur cream | 11.5:1 | AAA |
| Texte muted sur cream | 5.2:1 | AA |
| Hermes sur cream | 3.1:1 | AA (large text) |
| Blanc sur hermes | 4.5:1 | AA |
| Erreur sur cream | 7.2:1 | AAA |

### 7.5 Focus Visible

```css
/* Custom focus ring luxe */
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fffcf7, 0 0 0 4px #f67828;
}

/* Alternative pour inputs */
input:focus-visible {
  border-color: #f67828;
  box-shadow: 0 0 0 3px rgba(246, 120, 40, 0.2);
}
```

---

## 8. Micro-interactions & Feedback

### 8.1 Ajout au Panier

```tsx
// Animation du bouton
const addToCartAnimation = {
  initial: { scale: 1 },
  tap: { scale: 0.98 },
  success: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 }
  }
};

// Etats du bouton
1. Default: "Ajouter au panier"
2. Loading: Spinner + "Ajout en cours..."
3. Success: Check + "Ajoute au panier" (vert, 2s)
4. Return: Default
```

### 8.2 Mise a Jour Quantite

```tsx
// Debounce pour eviter spam API
const debouncedUpdate = useDebouncedCallback(
  (quantity) => updateQuantity(productId, quantity),
  500
);

// Animation du prix
<motion.span
  key={totalPrice}
  initial={{ opacity: 0, y: -10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  {formatPrice(totalPrice)}
</motion.span>
```

### 8.3 Progression Checkout

```tsx
// Step indicator animation
const stepVariants = {
  inactive: { scale: 1, backgroundColor: 'transparent' },
  active: { scale: 1.1, backgroundColor: '#f67828' },
  completed: { scale: 1, backgroundColor: '#16a34a' }
};

// Line progress
<motion.div
  className="h-0.5 bg-hermes-500"
  initial={{ width: '0%' }}
  animate={{ width: `${(step / totalSteps) * 100}%` }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
/>
```

### 8.4 Confirmation de Commande

```tsx
// Animation celebratoire (subtile)
const confirmationAnimation = {
  icon: {
    initial: { scale: 0, rotate: -180 },
    animate: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15
      }
    }
  },
  content: {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.5 }
    }
  }
};
```

### 8.5 Validation de Champ

```tsx
// Checkmark apparition
<motion.div
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 500 }}
>
  <Check className="w-4 h-4 text-green-500" />
</motion.div>

// Shake on error
<motion.div
  animate={hasError ? { x: [-10, 10, -10, 10, 0] } : {}}
  transition={{ duration: 0.4 }}
>
  <Input error={errorMessage} />
</motion.div>
```

---

## 9. Points de Friction & Solutions

### 9.1 Abandon de Panier

| Point de Friction | Solution UX |
|-------------------|-------------|
| Prix inattendus | Afficher frais des le panier (livraison offerte) |
| Processus trop long | Checkout en 3 etapes maximum, guest checkout |
| Manque de confiance | Badges securite, temoignages, garanties visibles |
| Pas de sauvegarde | Persistence panier localStorage + compte optionnel |
| Distraction | Checkout dedie sans navigation principale |

#### Implementation: Exit Intent Popup

```tsx
// Detecte intention de quitter (desktop)
useEffect(() => {
  const handleMouseLeave = (e: MouseEvent) => {
    if (e.clientY < 10 && !hasShownExitIntent) {
      showExitIntentModal();
    }
  };
  document.addEventListener('mouseleave', handleMouseLeave);
  return () => document.removeEventListener('mouseleave', handleMouseLeave);
}, []);

// Modal elegant
<Modal>
  <h3>Vous nous quittez deja ?</h3>
  <p>Votre panier vous attend. Profitez de la livraison offerte.</p>
  <Button>Finaliser ma commande</Button>
  <button>Recevoir mon panier par email</button>
</Modal>
```

### 9.2 Guest Checkout vs Compte

**Strategie recommandee:**

```
CHECKOUT FLOW:
1. [Email] --> Check if exists
   |
   +-- EXISTS: "Connectez-vous pour retrouver vos informations"
   |           [Se connecter] ou [Continuer sans compte]
   |
   +-- NEW: Continue vers formulaire
             [ ] Creer un compte pour suivre mes commandes
```

**Avantages:**
- Pas de barriere a l'achat
- Proposition de valeur claire pour creation compte
- Sauvegarde automatique si compte cree

### 9.3 Reassurance Paiement

**Elements de confiance:**
```
+------------------------------------------+
| [Lock] Paiement 100% securise            |
|                                          |
| Vos donnees bancaires sont protegees     |
| par un chiffrement SSL 256-bit.          |
|                                          |
| [Visa] [Mastercard] [Amex] [PayPal]      |
|                                          |
| Certifie par [PCI DSS Logo]              |
+------------------------------------------+
```

### 9.4 Recuperation d'Erreur

**Erreur de paiement:**
```tsx
<Alert variant="warning">
  <AlertTriangle />
  <div>
    <strong>Paiement refuse</strong>
    <p>Votre banque a decline la transaction.</p>
    <ul>
      <li>Verifiez vos informations de carte</li>
      <li>Essayez une autre methode de paiement</li>
      <li>Contactez votre banque si le probleme persiste</li>
    </ul>
  </div>
  <Button variant="secondary">Reessayer</Button>
  <Button variant="ghost">Autre methode</Button>
</Alert>
```

**Produit indisponible:**
```tsx
<Alert variant="info">
  <Info />
  <div>
    <strong>Article retire du panier</strong>
    <p>La "Bague Eclipse" n'est plus disponible dans cette quantite.</p>
  </div>
  <Button variant="ghost">Voir alternatives</Button>
</Alert>
```

---

## 10. Pages Compte (/compte)

### 10.1 Dashboard Compte

```
+------------------------------------------------------------------+
|  Bienvenue, Jean                                                 |
+------------------------------------------------------------------+
|                                                                  |
|  NAVIGATION LATERALE     |  CONTENU PRINCIPAL                   |
|                          |                                       |
|  [User] Mon profil       |  +-------------------------------+    |
|  [Package] Mes commandes |  | DERNIERE COMMANDE             |    |
|  [Heart] Mes favoris     |  | N° MJ-2024-00847              |    |
|  [MapPin] Mes adresses   |  | Status: En cours de livraison |    |
|  [Settings] Parametres   |  | [Voir details] [Suivre]       |    |
|  [LogOut] Deconnexion    |  +-------------------------------+    |
|                          |                                       |
|                          |  +-------------------------------+    |
|                          |  | INFORMATIONS RAPIDES          |    |
|                          |  | 3 commandes | 2 adresses      |    |
|                          |  +-------------------------------+    |
|                          |                                       |
+------------------------------------------------------------------+
```

### 10.2 Historique Commandes (/compte/commandes)

```
+------------------------------------------------------------------+
|  Mes Commandes                                                   |
+------------------------------------------------------------------+
|                                                                  |
|  [Filter: Toutes | En cours | Livrees | Annulees]               |
|                                                                  |
|  +------------------------------------------------------------+ |
|  | COMMANDE N° MJ-2024-00847                     15 Dec 2024   | |
|  | Status: [Badge] En cours de livraison                       | |
|  | +--------+                                                  | |
|  | | [Img]  | Bague Solitaire Eclipse x1        4 850,00 EUR  | |
|  | +--------+                                                  | |
|  | +--------+                                                  | |
|  | | [Img]  | Collier Perle Tahiti x1           2 200,00 EUR  | |
|  | +--------+                                                  | |
|  | Total: 7 050,00 EUR                                         | |
|  | [Voir details] [Suivre le colis] [Aide]                     | |
|  +------------------------------------------------------------+ |
|                                                                  |
|  +------------------------------------------------------------+ |
|  | COMMANDE N° MJ-2024-00823                     28 Nov 2024   | |
|  | Status: [Badge] Livree                                      | |
|  | ...                                                         | |
|  +------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### 10.3 Detail Commande

```
+------------------------------------------------------------------+
|  [< Retour] Commande N° MJ-2024-00847                           |
+------------------------------------------------------------------+
|                                                                  |
|  TIMELINE SUIVI                                                  |
|  [o]--[o]--[o]--[o]--[ ]                                        |
|  Confirmee > Preparee > Expediee > En livraison > Livree        |
|  15 Dec     16 Dec     17 Dec      18 Dec                       |
|                                                                  |
+------------------------------------------------------------------+
|                              |                                   |
|  ARTICLES                    |  INFORMATIONS                    |
|                              |                                   |
|  [Image large] Bague...      |  ADRESSE LIVRAISON               |
|  Reference: MJ-00425         |  Jean Dupont                     |
|  Quantite: 1                 |  12 rue de la Paix               |
|  Prix: 4 850,00 EUR          |  75002 Paris                     |
|                              |                                   |
|  [Image large] Collier...    |  MODE DE PAIEMENT                |
|  ...                         |  Visa ****4242                   |
|                              |                                   |
|  SOUS-TOTAL: 7 050,00 EUR    |  TRANSPORTEUR                    |
|  LIVRAISON: Offerte          |  Colissimo Signature             |
|  TOTAL: 7 050,00 EUR         |  N° 6X123456789                  |
|                              |  [Suivre sur Colissimo]          |
|                              |                                   |
+------------------------------------------------------------------+
|                                                                  |
|  [Telecharger facture PDF] [Contacter le service client]        |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 11. Performance & Optimisation

### 11.1 Metriques Cibles

| Metrique | Cible | Methode |
|----------|-------|---------|
| LCP | < 2.5s | Images optimisees Next.js |
| FID | < 100ms | Code splitting, lazy load |
| CLS | < 0.1 | Dimensions reservees |
| TTI | < 3.5s | Bundle optimise |

### 11.2 Strategies d'Optimisation

**Images Produits:**
```tsx
<Image
  src={product.images[0]}
  alt={product.name}
  width={120}
  height={120}
  sizes="(max-width: 640px) 80px, 120px"
  placeholder="blur"
  blurDataURL={product.blurPlaceholder}
  loading="lazy"
/>
```

**Code Splitting:**
```tsx
// Checkout components loaded on demand
const PaymentForm = dynamic(
  () => import('@/components/checkout/PaymentForm'),
  {
    loading: () => <PaymentFormSkeleton />,
    ssr: false
  }
);
```

**Prefetching:**
```tsx
// Prefetch next checkout step
const router = useRouter();
useEffect(() => {
  router.prefetch('/checkout/paiement');
}, []);
```

---

## 12. Implementation - Checklist

### Phase 1: Panier

- [ ] Page /panier avec liste articles
- [ ] Composant CartItem avec quantite modifiable
- [ ] Resume commande avec totaux
- [ ] Panier vide (etat + suggestions)
- [ ] Persistence localStorage (existant dans CartContext)
- [ ] Animation ajout/suppression
- [ ] Mobile: Layout adaptatif

### Phase 2: Checkout Livraison

- [ ] Layout checkout avec sidebar resume
- [ ] Progress indicator 3 etapes
- [ ] Formulaire adresse avec validation Zod
- [ ] Autocomplete adresse (optionnel)
- [ ] Checkbox facturation differente
- [ ] Sauvegarde session (guest) ou compte
- [ ] Transition vers paiement

### Phase 3: Checkout Paiement

- [ ] Selection methode paiement
- [ ] Integration Stripe Elements
- [ ] Resume modifiable (retour livraison)
- [ ] Validation pre-soumission
- [ ] Gestion erreurs paiement
- [ ] Loading state soumission

### Phase 4: Confirmation

- [ ] Page confirmation avec animation
- [ ] Details commande complets
- [ ] Email de confirmation
- [ ] CTA suivi commande
- [ ] CTA continuer achats

### Phase 5: Compte

- [ ] Dashboard utilisateur
- [ ] Liste commandes avec filtres
- [ ] Detail commande + timeline
- [ ] Gestion adresses
- [ ] Modification profil

---

## 13. Annexes

### A. Labels Francais

```typescript
const labels = {
  cart: {
    title: 'Votre Panier',
    empty: 'Votre panier est vide',
    emptySubtext: 'Decouvrez nos collections d\'exception',
    continueShopping: 'Continuer mes achats',
    checkout: 'Passer commande',
    remove: 'Supprimer',
    quantity: 'Quantite',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    shippingFree: 'Offerte',
    total: 'Total',
  },
  checkout: {
    shipping: {
      title: 'Informations de livraison',
      contact: 'Coordonnees',
      address: 'Adresse de livraison',
      differentBilling: 'Adresse de facturation differente',
      continue: 'Continuer vers le paiement',
    },
    payment: {
      title: 'Paiement securise',
      methods: 'Mode de paiement',
      card: 'Carte bancaire',
      cardNumber: 'Numero de carte',
      expiry: 'Date d\'expiration',
      cvc: 'Code de securite',
      nameOnCard: 'Nom sur la carte',
      saveCard: 'Sauvegarder pour mes prochains achats',
      confirm: 'Confirmer et payer',
      secure: 'Paiement 100% securise',
    },
    confirmation: {
      title: 'Merci pour votre commande',
      orderNumber: 'Commande n°',
      emailSent: 'Un email de confirmation a ete envoye a',
      estimatedDelivery: 'Livraison estimee',
      trackOrder: 'Suivre ma commande',
      continueShopping: 'Continuer mes achats',
    },
  },
  form: {
    firstName: 'Prenom',
    lastName: 'Nom',
    email: 'Email',
    phone: 'Telephone',
    address: 'Adresse',
    addressComplement: 'Complement d\'adresse',
    postalCode: 'Code postal',
    city: 'Ville',
    country: 'Pays',
    required: 'requis',
  },
  errors: {
    required: 'Ce champ est requis',
    invalidEmail: 'Adresse email invalide',
    invalidPhone: 'Numero de telephone invalide',
    invalidPostalCode: 'Code postal invalide',
    paymentFailed: 'Le paiement a echoue',
    tryAgain: 'Veuillez reessayer',
  },
  reassurance: {
    freeShipping: 'Livraison offerte',
    returns: 'Retours sous 30 jours',
    certificate: 'Certificat d\'authenticite',
    support: 'Service client dedie',
    secure: 'Paiement securise',
  },
};
```

### B. Icons Utilises

| Fonction | Icon (Lucide) | Usage |
|----------|---------------|-------|
| Panier | `ShoppingBag` | Header, CTA |
| Succes | `Check` | Validation, confirmation |
| Erreur | `AlertCircle` | Messages erreur |
| Info | `Info` | Aide contextuelle |
| Livraison | `Truck` | Reassurance, suivi |
| Retours | `RotateCcw` | Politique retours |
| Securite | `Lock` | Paiement securise |
| Certificat | `Award` | Authenticite |
| Supprimer | `X` ou `Trash2` | Retirer du panier |
| Modifier | `Pencil` | Edit inline |
| Chevron | `ChevronRight/Left` | Navigation |
| Loading | `Loader2` | Etats de chargement |

### C. Breakpoints Reference

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};
```

---

*Document maintenu par l'equipe UX - Derniere mise a jour: Decembre 2024*
