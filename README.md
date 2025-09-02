# Previously

Une application web moderne pour gérer vos films et séries, développée avec Vue.js 3 et Quasar Framework.

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

### Ubuntu/Linux

**Méthode 1 - Via le gestionnaire de paquets Ubuntu :**

```bash
# Mettre à jour la liste des paquets
sudo apt update

# Installer Node.js et npm
sudo apt install nodejs npm

# Vérifier l'installation
node --version
npm --version
```

### Windows

1. Téléchargez et installez Node.js depuis [nodejs.org](https://nodejs.org/) (version 18 ou supérieure)
2. Vérifiez l'installation en ouvrant PowerShell ou CMD :

```cmd
node --version
npm --version
```

## 🚀 Installation

1. **Cloner le repository**

```bash
git clone <git@github.com:EpitechWebAcademiePromo2026/W-SPE-502-LIL-2-1-previously-valentin.verscheure.git>
cd previously
```

2. **Installer les dépendances**

```bash
npm install
```

## ⚙️ Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
VITE_BETASERIES_CLIENT_ID="Clé API"
VITE_BETASERIES_CLIENT_SECRET="Clé secrète"
VITE_BETASERIES_REDIRECT_URI=http://localhost:9000/auth/callback
VITE_BETASERIES_AUTH_URL=https://www.betaseries.com/authorize
VITE_BETASERIES_TOKEN_URL=https://api.betaseries.com/oauth/access_token
```

**⚠️ Important :**

- Le fichier `.env` est déjà dans le `.gitignore` pour des raisons de sécurité
- Ne partagez jamais vos clés API publiquement
- Pour obtenir vos propres clés API BetaSeries, rendez-vous sur [betaseries.com](https://www.betaseries.com/api)

## 🏃‍♂️ Lancement de l'application

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:9000` et s'ouvrira automatiquement dans votre navigateur.

## 🏗️ Architecture du projet

```
src/
├── components/          # Composants Vue réutilisables
├── pages/              # Pages de l'application
├── layouts/            # Layouts de l'application
├── router/             # Configuration du routage
├── stores/             # Stores Pinia pour la gestion d'état
├── services/           # Services API (BetaSeries)
├── boot/               # Fichiers d'initialisation
└── assets/             # Ressources statiques
```

## 🔧 Technologies utilisées

- **Vue.js 3** - Framework JavaScript
- **Quasar Framework** - Framework Vue.js avec composants Material Design
- **TypeScript** - Langage de programmation typé
- **Pinia** - Gestion d'état pour Vue.js
- **Vue Router** - Routage côté client
- **Axios** - Client HTTP
- **ESLint** - Linter pour JavaScript/TypeScript
- **Prettier** - Formateur de code

## 🐛 Résolution de problèmes

### Erreur de port déjà utilisé

Si le port 9000 est déjà utilisé, vous pouvez le changer dans `quasar.config.ts` :

```typescript
devServer: {
  port: 8080, // ou un autre port disponible
  open: true,
}
```

### Problèmes de dépendances

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller les dépendances
npm install
```

### Erreurs de linting

```bash
# Vérifier les erreurs
npm run lint

# Corriger automatiquement si possible
npm run format
```

## 👥 Auteur

**Valentin Verscheure**

- Email: valentin.verscheure@epitech.eu

## 🔗 Liens utiles

- [Documentation Quasar](https://quasar.dev/)
- [Documentation Vue.js](https://vuejs.org/)
- [API BetaSeries](https://www.betaseries.com/api)
- [Documentation TypeScript](https://www.typescriptlang.org/)

---
