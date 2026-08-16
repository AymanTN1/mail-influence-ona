# 🌐✉️ MailInfluence-ONA
> **Email-Based Organizational Network Analysis & Enterprise Influence Intelligence in C**

MailInfluence-ONA est une solution d'**Analyse des Réseaux Organisationnels (ONA)** développée en **Langage C (C11)** avec une interface web moderne en **React**. 
Elle transforme le flux d'emails d'entreprise en un **Graphe d'Influence et de Collaboration** dynamique et interactif.

---

## 🎯 Pourquoi le Backend en C ?
Le moteur backend a été conçu de zéro en C pur pour garantir une **complexité minimale**, une **performance maximale** et un contrôle total sur les structures de données bas niveau (pointeurs, allocations dynamiques, gestion de la mémoire) :

* **📊 Structure de Graphe personnalisée (`Graph`, `Node`, `Edge`) :** Listes d'adjacence et tableaux dynamiques réallocables.
* **⛰️ Tas Binaire Max (`Max-Heap`) :** Implémentation manuelle en C (`heap.c`) pour classer et extraire instantanément le Top-K des employés en surcharge cognitive.
* **📬 File FIFO (`Queue`) :** Implémentation manuelle en C pour les parcours en largeur (BFS) et le simulateur de propagation d'information.
* **📚 Pile LIFO (`Stack`) :** Implémentation en C pour les parcours en profondeur (DFS) et retour sur trace.
* **🧠 Algorithmes Graphe ONA natifs :**
  * **PageRank (Power Iteration en C) :** Identification des leaders informels et experts réels.
  * **Intermédiarité (Betweenness) :** Détection des goulots d'étranglement inter-équipes.
  * **⚠️ Détection du "Bus Factor" & Risque de Surcharge (Max-Heap en C) :** Calcul du ratio *In-Degree / Out-Degree* et détection des employés sur-sollicités (goulots d'étranglement critiques).
  * **🏢 Détection des Silos Organisationnels (Homophily Index en C) :** Calcul de la matrice de flux inter-départements et détection automatique des départements isolés (Score d'isolation > 50%).
  * **Simulateur de Propagation (BFS Queue) :** Diffusion d'une directive ou information dans le réseau.
  * **Simulateur d'Impact Démission ("What-If") :** Évaluation des liaisons email rompues (*Cut Vertices*).
* **⚡ Mini-Serveur HTTP REST Sockets en C :** Sert l'API JSON directement au frontend React sur `http://localhost:8080/api/ona`.

---

## 🛠️ Stack Technique

* **Backend :** Langage C (C11), POSIX/WinSock Sockets, GCC / Make.
* **Frontend :** React 18, Vite, SVG Graph Engine, CSS Tokens Modernes.
* **DevOps :** Makefile, WSL / Linux / Windows compilation cross-plateforme.

---

## 🚀 Compilation & Lancement

### 1. Backend C Engine
```bash
cd backend
make
./ona_backend
```
*Le serveur backend C démarre sur `http://localhost:8080` et sert l'API JSON ONA.*
*(Pour exécuter uniquement en mode console CLI : `./ona_backend --cli`)*

### 2. Frontend React Dashboard
```bash
cd frontend
npm run dev
```
*Ouvrez votre navigateur sur `http://localhost:5173`.*

---

## 📄 Licence
MIT License © 2026 Ayman. All rights reserved.
