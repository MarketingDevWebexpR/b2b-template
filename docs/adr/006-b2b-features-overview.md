# ADR-006: Vue d'Ensemble des Fonctionnalités B2B

## Statut

Accepté

## Date

2024-12-15

## Contexte

Ce document décrit les fonctionnalités B2B implémentées dans la plateforme e-commerce, servant de référence pour les développeurs et stakeholders.

## Fonctionnalités B2B

### 1. Gestion des Entreprises (Companies)

#### Modèle de données

```typescript
interface Company {
  id: string;
  name: string;
  registrationNumber?: string;    // SIRET, etc.
  vatNumber?: string;
  tier: 'standard' | 'premium' | 'enterprise';
  status: 'pending' | 'active' | 'suspended';

  // Finances
  creditLimit: number;
  currentBalance: number;
  paymentTerms: PaymentTerms;

  // Adresses
  billingAddress: Address;
  shippingAddresses: Address[];

  // Relations
  employees: Employee[];
  orders: Order[];
  quotes: Quote[];
}

interface PaymentTerms {
  type: 'prepaid' | 'net_15' | 'net_30' | 'net_60' | 'net_90';
  discountPercent?: number;      // Ex: 2% si paiement anticipé
  discountDays?: number;         // Ex: dans les 10 jours
}
```

#### Fonctionnalités

| Feature | Description | API Endpoint |
|---------|-------------|--------------|
| Création | Inscription entreprise avec validation | `POST /store/companies` |
| Profil | Consultation et mise à jour | `GET/PUT /store/companies/:id` |
| Adresses | Gestion multi-adresses | `POST/PUT/DELETE /store/companies/:id/addresses` |
| Tiers | Upgrade automatique selon volume | Admin only |

### 2. Gestion des Employés (Employees)

#### Rôles et Permissions

```typescript
type EmployeeRole = 'owner' | 'admin' | 'manager' | 'purchaser' | 'viewer' | 'custom';

type EmployeePermission =
  | 'orders.create'
  | 'orders.view'
  | 'orders.approve'
  | 'quotes.create'
  | 'quotes.respond'
  | 'company.edit'
  | 'company.manage_employees'
  | 'spending.view_reports'
  | 'spending.set_limits';
```

#### Matrice des Permissions par Défaut

| Permission | Owner | Admin | Manager | Purchaser | Viewer |
|------------|-------|-------|---------|-----------|--------|
| orders.create | ✅ | ✅ | ✅ | ✅ | ❌ |
| orders.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| orders.approve | ✅ | ✅ | ✅ | ❌ | ❌ |
| quotes.create | ✅ | ✅ | ✅ | ✅ | ❌ |
| company.edit | ✅ | ✅ | ❌ | ❌ | ❌ |
| company.manage_employees | ✅ | ✅ | ❌ | ❌ | ❌ |
| spending.view_reports | ✅ | ✅ | ✅ | ❌ | ❌ |
| spending.set_limits | ✅ | ✅ | ❌ | ❌ | ❌ |

### 3. Système de Devis (Quotes)

#### Workflow

```
┌─────────┐    ┌───────────┐    ┌──────────────┐    ┌───────────┐
│  Draft  │───▶│ Submitted │───▶│ Under Review │───▶│ Responded │
└─────────┘    └───────────┘    └──────────────┘    └───────────┘
                                                           │
                    ┌──────────────────────────────────────┼──────────────────┐
                    ▼                                      ▼                  ▼
              ┌──────────┐                          ┌──────────┐       ┌─────────┐
              │ Accepted │──────▶ Conversion ──────▶│  Order   │       │Rejected │
              └──────────┘        to Order          └──────────┘       └─────────┘
                    │
                    ▼
              ┌─────────┐
              │ Expired │  (Validité dépassée)
              └─────────┘
```

#### Fonctionnalités

| Feature | Description |
|---------|-------------|
| Création depuis panier | Transformer le panier en demande de devis |
| Prix négociés | Le vendeur peut ajuster les prix |
| Validité | Date d'expiration configurable (défaut: 30 jours) |
| Commentaires | Échange acheteur/vendeur |
| PDF | Génération automatique pour impression |
| Conversion | Un clic pour transformer en commande |

### 4. Workflow d'Approbation (Approvals)

#### Déclencheurs

```typescript
interface ApprovalRule {
  id: string;
  name: string;
  trigger: ApprovalTrigger;
  threshold?: number;
  approvers: string[];          // Employee IDs ou rôles
  isActive: boolean;
}

type ApprovalTrigger =
  | { type: 'amount_exceeds'; threshold: number }
  | { type: 'spending_limit_exceeded' }
  | { type: 'new_customer_first_order' }
  | { type: 'product_category'; categoryIds: string[] }
  | { type: 'manual_request' };
```

#### Workflow Multi-Niveau

```
┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────┐    Reject    ┌──────────┐
│  Level 1    │─────────────▶│ Rejected │
│  (Manager)  │              └──────────┘
└──────┬──────┘
       │ Approve
       ▼
┌─────────────┐    Reject    ┌──────────┐
│  Level 2    │─────────────▶│ Rejected │
│  (Director) │              └──────────┘
└──────┬──────┘
       │ Approve
       ▼
┌─────────────┐
│  Approved   │──────▶ Order proceeds
└─────────────┘
```

#### Notifications

- Email à chaque étape
- Push notification (mobile)
- Webhook pour intégrations externes
- Rappels automatiques après X heures

### 5. Limites de Dépenses (Spending Limits)

#### Types de Limites

```typescript
interface SpendingLimit {
  id: string;
  employeeId: string;
  period: 'per_order' | 'daily' | 'weekly' | 'monthly';
  limitAmount: number;
  currentSpending: number;
  remainingAmount: number;
  percentageUsed: number;
  isExceeded: boolean;
  isWarning: boolean;           // > 80% utilisé
  lastResetAt: string;
  nextResetAt: string;
}
```

#### Comportement

| Scénario | Action |
|----------|--------|
| Sous la limite | Commande autorisée |
| Limite atteinte | Blocage + suggestion demande d'approbation |
| Proche limite (>80%) | Avertissement visuel |
| Limite dépassée par manager | Workflow d'approbation déclenché |

### 6. Commandes en Volume (Bulk Orders)

#### Fonctionnalités

| Feature | Description |
|---------|-------------|
| Import CSV | Upload fichier avec SKU + quantités |
| Scan rapide | Scanner codes-barres (mobile) |
| Templates | Réutiliser des commandes passées |
| Validation | Vérification stock et prix en temps réel |

#### Format CSV

```csv
sku,quantity,notes
PROD-001,100,
PROD-002,50,Urgent
PROD-003,200,Pour projet X
```

### 7. Rapports et Analytics

#### Rapports Disponibles

| Rapport | Description | Fréquence |
|---------|-------------|-----------|
| Dépenses par employé | Qui dépense combien | Temps réel |
| Dépenses par catégorie | Répartition des achats | Mensuel |
| Historique des approbations | Taux d'approbation, délais | Mensuel |
| Comparaison périodes | Évolution des dépenses | Trimestriel |

## Conséquences

### Valeur Business

- **Autonomie clients** : Les entreprises gèrent leurs propres employés
- **Contrôle financier** : Limites de dépenses = maîtrise du budget
- **Efficacité** : Bulk orders = gain de temps
- **Négociation** : Devis = flexibilité commerciale

### Complexité Technique

- 4 plugins Medusa custom à maintenir
- Tests end-to-end critiques pour les workflows
- Documentation utilisateur nécessaire

## Références

- ADR-003: Architecture des Plugins Medusa B2B
- ADR-004: Stratégie de Gestion d'État
- ADR-005: Flux d'Authentification B2B
