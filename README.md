# 🌐✉️ MailInfluence-ONA
> **Email-Based Organizational Network Analysis & Enterprise Influence Intelligence in C**

MailInfluence-ONA est une solution d'**Analyse des Réseaux Organisationnels (ONA)** développée en **Langage C (C11)** avec une interface web moderne en **React**. 
Elle transforme le flux d'emails d'entreprise en un **Graphe d'Influence et de Collaboration** dynamique et interactif.

---

## 🎯 Pourquoi le Backend en C ?
Le moteur backend a été conçu de zéro en C pur pour garantir une **complexité minimale**, une **performance maximale** et un contrôle total sur les structures de données bas niveau (pointeurs, allocations dynamiques, gestion de la mémoire) :

* **📈 Analyse Temporelle & Vélocité des Échanges (*Temporal ONA & Dérivée $\Delta \text{PageRank}$ en C*) :**
  * Fenêtrage glissant (*Sliding Windows*) comparant l'état du réseau avant ($T_1$) et après ($T_2$) une réorganisation ou fusion.
  * Détection automatique des **Leaders Émergents** ($\Delta PR > +10\%$), des collaborateurs en déclin et mesure du ROI de la réorganisation ($\Delta$ Connectivité transversale).
* **🌪️ Crash Test & Départs en Cascade (*Algorithme de Tarjan DFS avec Stack en C*) :** Simulation de crises et départs simultanés de collaborateurs clés avec mesure de l'indice de fragmentation systémique ($O(V + E)$).
* **🔮 Détection des "Tribus & Communautés Informelles" (*Label Propagation Algorithm - LPA en C*) :** Détection automatique des sous-groupes et clans réels qui collaborent au quotidien au-delà de l'organigramme hiérarchique officiel, avec calcul des flux internes/externes et du taux de cohésion.
* **🌉 Détection des "Ponts Informels" & Nœuds Passerelles (*Boundary Spanners*) :** Implémentation de l'**Algorithme de Brandes ($O(V \cdot E)$)** combinant une **File FIFO (`Queue`)** et une **Pile LIFO (`Stack`)** pour le calcul exact de la centralité d'intermédiarité.
* **⚡ Algorithmes Haute Performance & Optimisations SIMD / C11 :**
  * **PageRank Ultra-Rapide (Power Iteration & Early Stopping $\epsilon=10^{-6}$) :** Calcul du PageRank vectorisé en **0.21 milliseconde** pour 2 500 arêtes.
  * **Matrice de Réciprocité en $O(E)$ :** Remplacement des boucles quadratiques $O(E^2)$ par une matrice d'adjacence booléenne pour un calcul instantané en microsecondes.
  * **Indexation Silos en $O(1)$ :** Pré-mapping des identifiants de département entiers (`dept_id`) éliminant 100% des appels `strcmp` dans les boucles d'arêtes.
  * **Indexation Hash Table `djb2` :** Résolution en temps constant $O(1)$ des adresses emails.
  * **Drapeaux de Compilation Optimisés :** `-O3 -flto -march=native -fomit-frame-pointer`.
* **📑 Générateur de Rapport d'Audit ONA & Score Global de Santé (0-100 en C) :** Évalue la densité, la réciprocité bilatérale, la connectivité transversale et la résilience face aux surcharges, avec génération automatique de recommandations RH & management.
* **⛰️ Tas Binaire Max (`Max-Heap`) :** Implémentation manuelle en C (`heap.c`) pour classer et extraire instantanément le Top-K des employés en surcharge cognitive (Bus Factor).
* **📬 File FIFO (`Queue`) & 📚 Pile LIFO (`Stack`) :** Implémentations manuelles en C pour les parcours BFS (simulateur de propagation), DFS et Brandes.
* **⚡ Mini-Serveur HTTP REST Sockets en C :** Sert l'API JSON directement au frontend React sur `http://localhost:8080/api/ona`.

---

## 📊 Benchmark de Performance (Moteur C11 Optimisé)
Sur un dataset de **2 500 logs d'emails d'entreprise** :
* **Parsing & Indexation Hash Table :** ~1.00 ms
* **Calcul PageRank (Power Iteration Optimisé) :** **0.21 ms**
* **Analyse Temporelle & Sliding Windows (2 fenêtres) :** ~0.08 ms
* **Détection des Communautés (LPA en C) :** ~0.04 ms
* **Algorithme de Tarjan & Crash Test (DFS + Stack) :** ~0.02 ms
* **Calcul Brandes Betweenness & Boundary Spanners :** ~0.03 ms
* **Génération du Rapport d'Audit & Santé ONA :** ~0.02 ms
* **Temps Total d'Exécution :** **< 1.40 ms**

---

## 🛠️ Stack Technique

* **Backend :** Langage C (C11), POSIX/WinSock Sockets, GCC / Make (`-O3`, `-flto`).
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
