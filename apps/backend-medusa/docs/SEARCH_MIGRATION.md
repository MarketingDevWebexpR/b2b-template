# Guide de Migration Search: Meilisearch → App Search

Ce document decrit la procedure de migration progressive de Meilisearch vers Elastic App Search pour le moteur de recherche B2B bijoux.

## Table des matieres

1. [Architecture](#architecture)
2. [Pre-requis](#pre-requis)
3. [Configuration](#configuration)
4. [Procedure de migration](#procedure-de-migration)
5. [Monitoring](#monitoring)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Mode Dual-Engine

```
                    ┌─────────────────┐
                    │   Frontend      │
                    │   (Next.js)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Proxy     │
                    │  /api/search/*  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ SearchModule    │
                    │    Service      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ Meilisearch│  │   DUAL     │  │ App Search │
     │   (dev)    │  │  (migrate) │  │   (prod)   │
     └────────────┘  └────────────┘  └────────────┘
```

### Modes disponibles

| Mode | Indexation | Recherche | Usage |
|------|------------|-----------|-------|
| `meilisearch` | Meilisearch | Meilisearch | Developpement |
| `dual` | Les deux | Split trafic | Migration |
| `appsearch` | App Search | App Search | Production |

---

## Pre-requis

### Elastic Cloud

1. Creer un deployment Elastic Cloud avec App Search
2. Noter les credentials:
   - `APPSEARCH_ENDPOINT`: URL du deployment (ex: `https://xxx.ent-search.cloud.es.io`)
   - `APPSEARCH_PRIVATE_KEY`: Cle privee pour indexation
   - `APPSEARCH_PUBLIC_KEY`: Cle publique pour recherche frontend

### Verification des services

```bash
# Verifier Meilisearch
curl http://localhost:7700/health

# Verifier App Search
curl -H "Authorization: Bearer $APPSEARCH_PRIVATE_KEY" \
     "$APPSEARCH_ENDPOINT/api/as/v1/engines"
```

---

## Configuration

### Variables d'environnement

```bash
# Mode de recherche
SEARCH_PROVIDER=meilisearch  # ou "dual" ou "appsearch"

# Meilisearch (toujours configure comme fallback)
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key
MEILISEARCH_INDEX_PREFIX=bijoux_

# App Search
APPSEARCH_ENDPOINT=https://xxx.ent-search.cloud.es.io
APPSEARCH_PRIVATE_KEY=private-xxxxx
APPSEARCH_PUBLIC_KEY=search-xxxxx
APPSEARCH_ENGINE=bijoux

# Traffic splitting (mode dual uniquement)
APPSEARCH_TRAFFIC_PERCENTAGE=0  # 0-100
```

### Engines App Search

Le systeme cree automatiquement trois engines:
- `bijoux-products`: Produits du catalogue
- `bijoux-categories`: Categories hierarchiques
- `bijoux-marques`: Marques/Brands

---

## Procedure de migration

### Etape 1: Preparation (J-7)

```bash
# 1. Configurer les credentials App Search
cp .env.template .env.local
# Editer .env.local avec les credentials

# 2. Tester la connexion
npm run search:test

# 3. Charger les donnees initiales
npm run search:sync
```

### Etape 2: Mode Dual - Phase 1 (J-0)

```bash
# Activer le mode dual avec 10% de trafic vers App Search
SEARCH_PROVIDER=dual
APPSEARCH_TRAFFIC_PERCENTAGE=10
```

Verification:
```bash
# Via API admin
curl http://localhost:9000/admin/search/status \
     -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Etape 3: Augmentation progressive (J+1 a J+7)

| Jour | Pourcentage | Action |
|------|-------------|--------|
| J+1 | 10% | Observer les metriques |
| J+2 | 25% | Verifier qualite recherche |
| J+3 | 50% | Comparer performances |
| J+5 | 75% | Pre-production |
| J+7 | 100% | Migration complete |

```bash
# Ajuster via API admin
curl -X PUT http://localhost:9000/admin/search/engine \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "active_engine": "meilisearch",
       "dual_write_enabled": true,
       "appsearch_traffic_percentage": 50,
       "confirmation_token": "CONFIRM_ENGINE_SWITCH"
     }'
```

### Etape 4: Basculement final (J+7)

```bash
SEARCH_PROVIDER=appsearch
APPSEARCH_TRAFFIC_PERCENTAGE=100
```

Ou via API:
```bash
curl -X PUT http://localhost:9000/admin/search/engine \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "active_engine": "appsearch",
       "dual_write_enabled": false,
       "confirmation_token": "CONFIRM_ENGINE_SWITCH"
     }'
```

---

## Monitoring

### Endpoints de sante

```bash
# Status global
GET /admin/search/status

# Historique des syncs
GET /admin/search/sync-reports?limit=10

# Configuration moteur
GET /admin/search/engine
```

### Metriques a surveiller

1. **Latence de recherche**
   - Meilisearch: < 50ms
   - App Search: < 100ms (acceptable)

2. **Taux de succes**
   - Objectif: > 99.9%

3. **Qualite des resultats**
   - Verifier manuellement les top 10 pour queries populaires

### Logs

```bash
# Logs de synchronisation
tail -f logs/medusa.log | grep "\[Search\]"

# Erreurs specifiques
grep -E "\[Search\].*Error" logs/medusa.log
```

---

## Rollback

### Rollback immediat (< 5 min)

```bash
# Option 1: Variable d'environnement
SEARCH_PROVIDER=meilisearch

# Option 2: API admin
curl -X PUT http://localhost:9000/admin/search/engine \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "active_engine": "meilisearch",
       "dual_write_enabled": false,
       "confirmation_token": "CONFIRM_ENGINE_SWITCH"
     }'
```

### Script de rollback automatise

```bash
npm run search:rollback
```

### Verification post-rollback

```bash
# 1. Verifier le status
curl http://localhost:9000/admin/search/status

# 2. Tester une recherche
curl "http://localhost:9000/search?q=bague"

# 3. Verifier les logs
tail -20 logs/medusa.log | grep "\[Search\]"
```

---

## Troubleshooting

### Erreur: "App Search not available"

```bash
# Verifier la connectivite
curl -I "$APPSEARCH_ENDPOINT/api/as/v1/engines"

# Verifier les credentials
echo $APPSEARCH_PRIVATE_KEY | head -c 20
```

### Erreur: "Index not found"

```bash
# Re-creer les engines
npm run search:sync
```

### Erreur: "Rate limit exceeded"

App Search limite a 100 documents par requete.
Le systeme gere automatiquement le batching.

```bash
# Verifier le batch size dans la config
grep "BATCH_SIZE" src/modules/search/providers/appsearch-provider.ts
```

### Donnees desynchronisees

```bash
# Forcer une re-indexation complete
curl -X POST http://localhost:9000/admin/search/reindex \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "sync_type": "full",
       "entity_types": ["all"],
       "clear_before": true,
       "async": true
     }'
```

### Performances degradees

1. Verifier la charge du cluster Elastic
2. Augmenter les resources si necessaire
3. Reduire temporairement le trafic vers App Search

---

## Checklist de migration

- [ ] Credentials App Search configures
- [ ] Test de connexion reussi (`npm run search:test`)
- [ ] Donnees initiales chargees (`npm run search:sync`)
- [ ] Mode dual active avec 10%
- [ ] Monitoring en place
- [ ] Procedure de rollback testee
- [ ] Augmentation progressive validee
- [ ] Basculement final effectue
- [ ] Meilisearch garde en standby (30 jours)

---

## Support

- Documentation Elastic App Search: https://www.elastic.co/guide/en/app-search/current/
- Issues projet: Contacter l'equipe backend
