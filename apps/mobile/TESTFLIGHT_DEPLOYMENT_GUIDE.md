# Guide de Deploiement TestFlight - Maison Bijoux

Ce guide detaille toutes les etapes pour publier l'application Maison Bijoux sur TestFlight via App Store Connect en utilisant EAS Build.

---

## Table des Matieres

1. [Prerequis](#1-prerequis)
2. [Configuration Initiale](#2-configuration-initiale)
3. [Preparation des Assets](#3-preparation-des-assets)
4. [Configuration EAS](#4-configuration-eas)
5. [Build et Soumission](#5-build-et-soumission)
6. [Configuration App Store Connect](#6-configuration-app-store-connect)
7. [Activation TestFlight](#7-activation-testflight)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Prerequis

### Comptes Requis

| Compte | Description | Lien |
|--------|-------------|------|
| **Apple Developer Program** | Abonnement annuel (99 USD/an) | [developer.apple.com](https://developer.apple.com/programs/) |
| **Compte Expo** | Gratuit | [expo.dev](https://expo.dev/signup) |

### Verification du Compte Apple Developer

Assurez-vous que votre compte Apple Developer est:
- [x] Inscrit au Apple Developer Program (pas seulement un compte Apple ID)
- [x] Acceptation des derniers accords dans App Store Connect
- [x] Informations fiscales et bancaires configurees (pour les apps payantes)

### Outils a Installer

```bash
# 1. Node.js (v20+)
node --version  # Doit etre >= 20.0.0

# 2. EAS CLI (installer globalement)
npm install -g eas-cli

# 3. Verifier l'installation
eas --version
```

---

## 2. Configuration Initiale

### Etape 2.1: Connexion a Expo

```bash
cd /Users/jean_webexpr/Documents/projets_webexpr/monorepo_bijoux/apps/mobile

# Se connecter a Expo
eas login
# Entrez vos identifiants Expo
```

### Etape 2.2: Initialiser le Projet EAS

```bash
# Initialiser EAS pour ce projet
eas init

# Cela va:
# - Creer un projet sur expo.dev
# - Generer un projectId unique
# - Mettre a jour app.json automatiquement
```

**IMPORTANT**: Notez le `projectId` genere et mettez a jour ces fichiers:

**app.json** - Remplacez les placeholders:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "VOTRE_PROJECT_ID_ICI"  // <- Remplacer
      }
    },
    "owner": "VOTRE_USERNAME_EXPO",  // <- Remplacer
    "updates": {
      "url": "https://u.expo.dev/VOTRE_PROJECT_ID_ICI"  // <- Remplacer
    }
  }
}
```

### Etape 2.3: Connexion a Apple Developer

```bash
# Configurer les credentials Apple
eas credentials --platform ios

# Selectionnez:
# 1. "Log in to your Apple Developer account"
# 2. Entrez votre Apple ID
# 3. Entrez votre mot de passe (ou App-Specific Password si 2FA active)
```

**Note 2FA**: Si vous avez l'authentification a deux facteurs activee sur votre Apple ID:
1. Allez sur [appleid.apple.com](https://appleid.apple.com)
2. Security > App-Specific Passwords
3. Generez un mot de passe pour "EAS CLI"

---

## 3. Preparation des Assets

### Assets Requis pour l'App Store

| Asset | Taille | Format | Description |
|-------|--------|--------|-------------|
| `icon.png` | 1024x1024 | PNG | Icone de l'app (sans transparence, coins carres) |
| `splash.png` | 1284x2778 | PNG | Ecran de demarrage |
| `adaptive-icon.png` | 1024x1024 | PNG | Icone Android adaptive |
| `favicon.png` | 48x48 | PNG | Favicon web |

### Generer les Assets

**Option A: Utiliser le script fourni**
```bash
# Installer librsvg pour la conversion SVG -> PNG
brew install librsvg

# Generer les assets
pnpm run generate:assets
# ou
./scripts/generate-assets.sh
```

**Option B: Utiliser Figma/Illustrator**
1. Ouvrez les fichiers SVG dans `/assets/images/`
2. Exportez en PNG aux tailles indiquees

**Option C: Service en ligne**
1. Utilisez [svgtopng.com](https://svgtopng.com)
2. Convertissez chaque SVG aux dimensions requises

### Verification des Assets

```bash
# Verifier que tous les assets PNG existent
ls -la assets/images/
# Doit contenir: icon.png, splash.png, adaptive-icon.png, favicon.png
```

---

## 4. Configuration EAS

### Etape 4.1: Mettre a Jour eas.json

Editez `/apps/mobile/eas.json` avec vos informations:

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "votre.email@example.com",      // <- Votre Apple ID
        "ascAppId": "1234567890",                  // <- ID App Store Connect (voir section 6)
        "appleTeamId": "ABCD1234EF"               // <- Votre Team ID
      }
    }
  }
}
```

### Obtenir votre Apple Team ID

```bash
# Le Team ID est affiche lors de:
eas credentials --platform ios

# Ou trouvez-le sur:
# https://developer.apple.com/account -> Membership -> Team ID
```

---

## 5. Build et Soumission

### Etape 5.1: Premier Build de Production

```bash
cd /Users/jean_webexpr/Documents/projets_webexpr/monorepo_bijoux/apps/mobile

# Lancer le build iOS production
pnpm run eas:build:prod
# ou
eas build --profile production --platform ios
```

**Ce qui se passe:**
1. EAS compile votre app dans le cloud
2. Genere automatiquement les certificates et provisioning profiles
3. Cree un fichier .ipa signe

**Duree estimee:** 15-30 minutes

### Etape 5.2: Soumettre a l'App Store

```bash
# Soumettre le dernier build
pnpm run eas:submit:ios
# ou
eas submit --platform ios

# Ou build + submit en une commande:
pnpm run eas:build:submit
# ou
eas build --profile production --platform ios --auto-submit
```

**Questions du CLI:**
1. "Select a build to submit" -> Choisissez le dernier build
2. "Apple ID" -> Entrez votre email Apple Developer
3. "App Store Connect App ID" -> Voir section suivante

---

## 6. Configuration App Store Connect

### Etape 6.1: Creer l'App sur App Store Connect

1. Allez sur [App Store Connect](https://appstoreconnect.apple.com)
2. Cliquez sur "Apps" > "+" > "New App"
3. Remplissez les informations:

| Champ | Valeur |
|-------|--------|
| Platform | iOS |
| Name | Maison Bijoux |
| Primary Language | French |
| Bundle ID | com.maisonbijoux.app |
| SKU | maison-bijoux-ios-001 |
| User Access | Full Access |

4. Cliquez "Create"

### Etape 6.2: Recuperer l'App Store Connect App ID

1. Dans App Store Connect, ouvrez votre app
2. Dans l'URL, recuperez l'ID: `https://appstoreconnect.apple.com/apps/XXXXXXXXXX/...`
3. Le `XXXXXXXXXX` est votre `ascAppId`
4. Mettez a jour `eas.json` avec cette valeur

### Etape 6.3: Configurer les Informations de l'App

Dans App Store Connect, remplissez:

**App Information:**
- Subtitle (optionnel): "Joaillerie de Luxe"
- Category: Shopping
- Content Rights: Ne contient pas de contenu tiers

**Pricing and Availability:**
- Price: Free (ou votre prix)
- Availability: France (+ autres pays)

**App Privacy:**
- Privacy Policy URL: `https://maisonbijoux.com/privacy`
- Data Collection: Configurez selon vos collectes de donnees

---

## 7. Activation TestFlight

### Etape 7.1: Verification du Build

Une fois le build soumis:
1. Allez dans App Store Connect > Votre App > TestFlight
2. Le build apparait avec le statut "Processing"
3. Attendez que le statut passe a "Ready to Submit" (5-30 min)

### Etape 7.2: Compliance

Apple peut demander des informations sur le chiffrement:
- Si votre app utilise HTTPS standard uniquement: "No" aux questions sur le chiffrement
- Cette app est configuree avec `usesNonExemptEncryption: false`

### Etape 7.3: Groupes de Test Internes

1. TestFlight > Internal Testing > "+"
2. Creez un groupe: "Equipe Maison Bijoux"
3. Ajoutez des membres de votre equipe Apple Developer
4. Selectionnez le build a tester
5. Cliquez "Start Testing"

**Limite:** 100 testeurs internes max

### Etape 7.4: Groupes de Test Externes

1. TestFlight > External Testing > "+"
2. Creez un groupe: "Beta Testeurs"
3. Remplissez les informations requises:
   - What to Test: "Testez la navigation, l'ajout au panier, et le processus de checkout"
   - Contact Email: support@maisonbijoux.com
   - Privacy Policy URL: https://maisonbijoux.com/privacy
4. Soumettez pour review Beta App Review (24-48h)

**Limite:** 10,000 testeurs externes max

### Etape 7.5: Inviter des Testeurs

**Testeurs Internes:**
- Recevront automatiquement l'invitation par email
- Doivent installer TestFlight depuis l'App Store

**Testeurs Externes:**
1. Ajoutez les emails dans le groupe
2. Ou generez un lien public de test
3. Les testeurs installent TestFlight et rejoignent

---

## 8. Troubleshooting

### Probleme: "Invalid Bundle Identifier"

**Cause:** Le Bundle ID n'est pas enregistre sur Apple Developer Portal

**Solution:**
```bash
# EAS cree automatiquement le Bundle ID, mais si erreur:
# 1. Allez sur developer.apple.com > Certificates, IDs & Profiles
# 2. Identifiers > "+" > App IDs
# 3. Entrez: com.maisonbijoux.app
```

### Probleme: "Missing Compliance"

**Solution:**
Dans `app.json`, assurez-vous que:
```json
"ios": {
  "config": {
    "usesNonExemptEncryption": false
  }
}
```

### Probleme: "Icon must be 1024x1024"

**Solution:**
- L'icone doit etre exactement 1024x1024 pixels
- Pas de transparence (fond alpha)
- Pas de coins arrondis (Apple les ajoute)
- Format PNG uniquement

### Probleme: Build echoue - "Provisioning Profile"

**Solution:**
```bash
# Regenerer les credentials
eas credentials --platform ios

# Selectionnez "Manage your Apple credentials"
# Puis "Remove a provisioning profile"
# Relancez le build
```

### Probleme: "App uses non-public APIs"

**Cause:** Une dependance utilise des APIs privees

**Solution:**
1. Verifiez les logs du build pour identifier la dependance
2. Mettez a jour la dependance ou trouvez une alternative
3. Contactez le support si l'erreur persiste

---

## Commandes Utiles Resumees

```bash
# === CONFIGURATION ===
eas login                           # Connexion Expo
eas init                            # Initialiser le projet
eas credentials --platform ios      # Gerer les credentials Apple

# === BUILD ===
pnpm run eas:build:dev              # Build developpement (simulateur)
pnpm run eas:build:preview          # Build preview (devices internes)
pnpm run eas:build:prod             # Build production

# === SOUMISSION ===
pnpm run eas:submit:ios             # Soumettre a App Store Connect
pnpm run eas:build:submit           # Build + Submit en une fois

# === UTILITAIRES ===
eas build:list                      # Liste des builds
eas build:view                      # Details du dernier build
eas device:create                   # Ajouter un device pour preview
```

---

## Checklist Pre-Soumission

- [ ] Compte Apple Developer actif et paye
- [ ] Compte Expo connecte (`eas login`)
- [ ] Assets PNG generes (icon, splash, adaptive-icon, favicon)
- [ ] `app.json` configure avec projectId et owner
- [ ] `eas.json` configure avec appleId, ascAppId, appleTeamId
- [ ] App creee sur App Store Connect
- [ ] Informations app remplies (privacy policy, categories, etc.)
- [ ] Premier build reussi
- [ ] Build soumis a App Store Connect
- [ ] Groupe TestFlight cree
- [ ] Testeurs invites

---

## Support

- **Documentation Expo EAS:** https://docs.expo.dev/eas/
- **App Store Connect Help:** https://developer.apple.com/help/app-store-connect/
- **TestFlight Documentation:** https://developer.apple.com/testflight/

---

*Guide genere pour Maison Bijoux - Derniere mise a jour: Decembre 2024*
