# 🌐✉️ MailInfluence-ONA
> **Email-Based Organizational Network Analysis & Enterprise Influence Intelligence**

MailInfluence-ONA est une solution complète d'**Analyse des Réseaux Organisationnels (ONA)** qui transforme le flux d'emails d'entreprise (Gmail, Outlook M365, archives `.eml`/`.mbox`) en un **Graphe d'Influence et de Collaboration** dynamique et interactif.

---

## 🚀 Fonctionnalités Clés

* **✉️ Ingestion Multi-Source d'Emails :** Support des formats standard d'archivage (`.eml`, `.mbox`) et connecteurs API pour Google Workspace (Gmail API) et Microsoft 365 (Microsoft Graph API).
* **🔒 Anonymisation RGPD (Privacy-First) :** Aucune lecture du corps des emails. Extraction uniquement des métadonnées (`From`, `To`, `Cc`, `Timestamp`, `Message-ID`). Anonymisation SHA-256 disponible.
* **⚖️ Calcul de Pondération Intelligent :** Prise en compte de la direction de l'interaction, de la réciprocité, du rôle (`TO` vs `CC`) et de la dépréciation temporelle.
* **🧠 Algorithmes de Graphe Avancés (Centralité & Communautés) :**
  * **PageRank (Super-Connecteurs) :** Identification des leaders informels et des experts rééls.
  * **Centralité d'Intermédiarité (Betweenness) :** Détection des "ponts" d'information et des goulots d'étranglement inter-équipes.
  * **Centralité de Degré (In/Out Degree) :** Mesure de la popularité vs l'activité d'émission.
  * **Algorithme de Louvain :** Regroupement automatique en communautés d'intérêt informelles.
* **📊 Visualiseur 2D/3D & Dashboard Interactive :** Exploration fluide du graphe d'entreprise avec coloration par département/communauté et dimensionnement selon le PageRank.
* **🔮 Simulateur d'Impact "What-If" :** Mesure de la fragilité du réseau et de la perte de connectivité en cas de démission d'un membre clé (*Cut Vertex Detection*).
* **📢 Simulateur de Propagation d'Information :** Visualisation de la diffusion d'une directive ou d'une information dans le graphe (parcours BFS/épidémique).

---

## 🛠️ Stack Technique

* **Backend :** Java 17 / Spring Boot 3.x, Neo4j Graph Database, Neo4j OGM / Cypher, Jackson / Mime4j (EML Parser).
* **Frontend :** React 18, Vite, Cytoscape.js / 3D-Force-Graph, Tailwind CSS / Vanilla CSS modern design.
* **Graphe Engine :** Neo4j Graph Data Science (GDS) / NetworkX.
* **DevOps :** Docker, Docker Compose, GitHub Actions.

---

## 📅 Roadmap Scrum Sprints

- [x] **Sprint 1 :** Ingestion d'emails, Pondération, Anonymisation & Dépôt initial.
- [ ] **Sprint 2 :** Intégration Neo4j & Algorithmes de Centralité (PageRank, Betweenness, Louvain).
- [ ] **Sprint 3 :** Dashboard Web React + Visualisation de Graphe 2D/3D + Leaderboard ONA.
- [ ] **Sprint 4 :** Simulateur d'impact Démission ("What-If") & Propagation d'information.

---

## 📄 Licence
MIT License © 2026 Ayman. All rights reserved.
