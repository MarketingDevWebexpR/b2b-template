# Test de diagnostic des comptages de catégories

## Résultats des vérifications

### Backend (Medusa + PostgreSQL)
- Script `debug-category-counts.ts` exécuté
- **Câbles et Fils (L2)**:
  - Direct: 0 produits
  - Total hérité: **45 produits** ✅
  - Enfants L3: Câbles Rigides (15), Câbles Souples (15), Fils de Câblage (15)

### Index Meilisearch
- Requête directe sur `http://localhost:7700/indexes/bijoux_categories/search`
- **Câbles et Fils**:
  - `product_count: 45` ✅
  - `depth: 1` (L2)

### API Frontend
- Requête sur `http://localhost:3000/api/categories`
- **Câbles et Fils**:
  - `product_count: 45` ✅
  - `depth: 1`

## Conclusion

**Le backend, Meilisearch ET l'API frontend retournent tous le bon comptage (45 produits).**

Le problème doit se situer dans :
1. L'affichage UI dans les composants React
2. Un calcul côté client qui écrase les valeurs
3. Une mauvaise interprétation de ce qui est affiché

## Actions recommandées

1. Vérifier visuellement l'affichage sur `http://localhost:3000/c/electricite/cables-fils`
2. Inspecter les props reçues par `SubcategoriesGrid` dans la console DevTools
3. Vérifier si `getTotalProductCount()` côté frontend ne recalcule pas incorrectement

## Composants à vérifier

- `/apps/web/components/categories/SubcategoriesGrid.tsx` (ligne 183-196)
- `/apps/web/components/categories/CategoryHeroEnhanced.tsx` (ligne 111, 221)
- `/apps/web/app/(shop)/c/[...slug]/page.tsx` (ligne 325, 341)
