# ADR-003: Architecture des Plugins Medusa B2B

## Statut

Accepté

## Date

2024-12-15

## Contexte

Medusa V2 ne fournit pas nativement toutes les fonctionnalités B2B nécessaires pour notre plateforme e-commerce :
- Gestion des entreprises et employés
- Système de devis (quotes)
- Workflow d'approbation multi-niveau
- Limites de dépenses par employé/département

Nous devons étendre Medusa avec des plugins custom tout en maintenant la compatibilité avec les futures versions.

## Décision

### Structure des Plugins

Nous créons 4 plugins indépendants dans le dossier `plugins/` :

```
plugins/
├── b2b-companies/      # Gestion entreprises
├── b2b-quotes/         # Système de devis
├── b2b-approvals/      # Workflow approbations
└── b2b-spending-limits/ # Limites de dépenses
```

### Architecture de chaque Plugin

Chaque plugin suit la structure standard Medusa V2 :

```
plugins/b2b-{feature}/
├── src/
│   ├── models/         # Entités TypeORM/Mikro-ORM
│   ├── services/       # Business logic
│   ├── api/
│   │   ├── store/      # Routes publiques
│   │   └── admin/      # Routes admin
│   ├── subscribers/    # Event handlers
│   ├── workflows/      # Workflows Medusa
│   └── migrations/     # Database migrations
├── package.json
└── index.ts
```

### Plugin b2b-companies

**Modèles** :
- `Company` : Entreprise avec settings, credit limits, payment terms
- `CompanyAddress` : Adresses multiples (facturation, livraison)
- `Employee` : Lien Customer → Company avec rôle et permissions

**Services** :
- `CompanyService` : CRUD + gestion des tiers
- `EmployeeService` : Gestion employés + permissions

**Routes Store** :
- `GET /store/companies/:id` - Détails entreprise
- `GET /store/companies/:id/employees` - Liste employés
- `POST /store/companies/:id/employees/invite` - Inviter employé

### Plugin b2b-quotes

**Modèles** :
- `Quote` : Devis avec items, validité, statut
- `QuoteItem` : Ligne de devis (produit, prix négocié)
- `QuoteComment` : Historique des échanges

**Workflow** :
```
Draft → Submitted → Under Review → Responded → Accepted/Rejected/Expired
```

**Services** :
- `QuoteService` : Création, soumission, réponse
- `QuoteConversionService` : Conversion devis → commande

### Plugin b2b-approvals

**Modèles** :
- `ApprovalRequest` : Demande d'approbation
- `ApprovalRule` : Règles de déclenchement
- `ApprovalStep` : Étapes du workflow

**Triggers** :
- Montant > seuil
- Premier achat client
- Dépassement limite de dépenses
- Nouveau produit/catégorie

**Services** :
- `ApprovalService` : Création, décision, délégation
- `ApprovalRuleEngine` : Évaluation des règles

### Plugin b2b-spending-limits

**Modèles** :
- `SpendingLimit` : Limite par période (order/daily/weekly/monthly)
- `SpendingRecord` : Historique des dépenses

**Services** :
- `SpendingLimitService` : CRUD limites
- `SpendingValidationService` : Validation avant achat
- `SpendingResetJob` : Reset automatique des compteurs

## Conséquences

### Positives

- **Séparation des concerns** : Chaque plugin est indépendant et testable
- **Évolutivité** : Nouveaux plugins ajoutables sans modifier les existants
- **Compatibilité Medusa** : Suit les conventions officielles
- **Réutilisabilité** : Plugins utilisables sur d'autres projets Medusa

### Négatives

- **Complexité** : Plus de code à maintenir
- **Coordination** : Les plugins doivent communiquer via events
- **Migrations** : Gestion des migrations inter-plugins

### Risques

- **Breaking changes Medusa V2** : L'API Medusa V2 est en évolution
- **Performance** : Les workflows peuvent ajouter de la latence

## Alternatives Considérées

### 1. Tout dans un seul plugin "b2b"

**Rejeté** : Trop monolithique, difficile à maintenir et tester

### 2. Extensions inline dans le backend

**Rejeté** : Moins portable, mélange code custom et framework

### 3. Microservices séparés

**Rejeté** : Over-engineering pour notre scale actuel

## Références

- [Medusa V2 Documentation](https://docs.medusajs.com/v2)
- [Medusa Plugins Guide](https://docs.medusajs.com/v2/resources/medusa-workflows-reference)
