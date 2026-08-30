# 🚀 Guide de Déploiement Cloud (Vercel + Render + Neon)

Ce guide détaille les étapes simples pour déployer l'intégralité de **MailInfluence-ONA** en production :
* 🐘 **Base de données :** [Neon (PostgreSQL Serverless)](https://neon.tech)
* ⚡ **Moteur Backend C :** [Render (Docker Web Service)](https://render.com)
* 🌐 **Frontend React :** [Vercel (Production Web App)](https://vercel.com)

---

## 🏗️ Architecture de Déploiement

```
┌─────────────────────────────────┐
│     Vercel (React Frontend)     │
│   https://mail-ona.vercel.app   │
└────────────────┬────────────────┘
                 │ HTTPS JSON API
                 ▼
┌─────────────────────────────────┐
│     Render (Backend C Engine)   │
│ https://xxx.onrender.com/api/ona│
└────────────────┬────────────────┘
                 │ (Optionnel / Historisation)
                 ▼
┌─────────────────────────────────┐
│    Neon (PostgreSQL Serverless) │
│  Stockage logs & snapshots ONA  │
└─────────────────────────────────┘
```

---

## Étape 1 : Configurer Neon (PostgreSQL Serverless) 🐘

1. Créez un compte gratuit sur [neon.tech](https://neon.tech) et créez un projet nommé `mailinfluence-ona`.
2. Ouvrez le **SQL Editor** dans le dashboard Neon.
3. Copiez et exécutez le script de schéma :
   * Ouvrez [`neon/schema.sql`](neon/schema.sql) et collez-le dans le SQL Editor, puis cliquez sur **Run**.
4. *(Optionnel)* Insérez les données initiales :
   * Ouvrez [`neon/seed.sql`](neon/seed.sql) et collez-le dans le SQL Editor, puis cliquez sur **Run**.
5. Copiez votre **Connection String** (`DATABASE_URL`) depuis le dashboard Neon pour vos configurations.

---

## Étape 2 : Déployer le Backend C sur Render ⚡

1. Rendez-vous sur [render.com](https://render.com) et connectez votre compte GitHub.
2. Cliquez sur **New +** > **Web Service**.
3. Sélectionnez votre repository GitHub `mail-ona`.
4. Configurez les options :
   * **Name :** `mailinfluence-ona-backend`
   * **Region :** Frankfurt (EU) ou Oregon (US)
   * **Language / Runtime :** `Docker`
   * **Dockerfile Path :** `./Dockerfile` (ou `./backend/Dockerfile`)
   * **Instance Type :** `Free`
5. Dans la section **Environment Variables**, vérifiez ou ajoutez :
   * `PORT` = `8080`
   * `DATASET_PATH` = `/app/mock-data/enterprise_emails_dataset.csv`
6. Cliquez sur **Deploy Web Service**.
7. Une fois déployé, copiez l'URL générée par Render (ex : `https://mailinfluence-ona-backend.onrender.com`).
   * *Test de bon fonctionnement :* Ouvrez `https://votre-service.onrender.com/api/ona` dans votre navigateur pour voir le JSON ONA généré en temps réel par le moteur C.

---

## Étape 3 : Déployer le Frontend React sur Vercel 🌐

1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez votre compte GitHub.
2. Cliquez sur **Add New...** > **Project**.
3. Importez votre repository `mail-ona`.
4. Dans les paramètres de configuration du projet :
   * **Framework Preset :** `Vite`
   * **Root Directory :** Cliquez sur *Edit* et sélectionnez `frontend`
   * **Build Command :** `npm run build`
   * **Output Directory :** `dist`
5. Déroulez la section **Environment Variables** et ajoutez :
   * **Key :** `VITE_API_URL`
   * **Value :** `https://votre-backend.onrender.com/api/ona` *(l'URL obtenue à l'étape 2)*
6. Cliquez sur **Deploy**.
7. Vercel compile et déploie le frontend en quelques secondes !

---

## 🔄 Variables d'Environnement Résumé

| Service | Variable | Valeur d'exemple |
| :--- | :--- | :--- |
| **Vercel** (Frontend) | `VITE_API_URL` | `https://mailinfluence-backend.onrender.com/api/ona` |
| **Render** (Backend) | `PORT` | `8080` |
| **Render** (Backend) | `DATASET_PATH` | `/app/mock-data/enterprise_emails_dataset.csv` |
| **Neon** (Base de données) | `DATABASE_URL` | `postgresql://user:pass@ep-xyz.eu-central-1.aws.neon.tech/neondb` |

---

## ✅ Vérification Finale

Une fois déployé :
1. Ouvrez votre URL Vercel (`https://mail-influence.vercel.app`).
2. Le statut en haut du dashboard doit afficher : **🟢 Backend C En Ligne (Moteur C11 POSIX)**.
3. Vous pouvez interagir avec le graphe SVG, lancer le crash test de départs en cascade et consulter le rapport d'audit RH en direct !
