#ifndef ONA_ALGORITHMS_H
#define ONA_ALGORITHMS_H

#include "graph.h"
#include "queue.h"
#include "stack.h"
#include "heap.h"

#define MAX_DEPTS 16
#define MAX_MEMBERS 64

// Métriques de Surcharge et Bus Factor pour un employé
typedef struct {
    int node_id;
    char name[MAX_STR];
    char dept[MAX_STR];
    char role[MAX_STR];
    double in_flux;         // Volume total d'emails reçus
    double out_flux;        // Volume total d'emails émis
    double overload_score;  // Score calculé de surcharge cognitive
    bool is_critical;       // true si Bus Factor élevé (goulot d'étranglement)
} BusFactorMember;

// Rapport global du Bus Factor (trié par Max-Heap)
typedef struct {
    BusFactorMember members[MAX_MEMBERS];
    int count;
} BusFactorReport;

// Métriques d'un département
typedef struct {
    char name[MAX_STR];
    int member_count;
    double internal_flux;
    double external_flux;
    double isolation_score; // 0.0% à 100.0% (Homophily Index)
    bool is_silo;           // true si isolation_score > 60%
} DeptMetrics;

// Résultat global de l'analyse des silos
typedef struct {
    DeptMetrics depts[MAX_DEPTS];
    int num_depts;
    double matrix[MAX_DEPTS][MAX_DEPTS];
} SiloReport;

// Rapport Global d'Audit de Santé Organisationnelle (Score 0-100)
typedef struct {
    double density;                  // Densité du réseau (0.0% à 100.0%)
    double reciprocity;              // Taux de réciprocité bilatérale (0.0% à 100.0%)
    double cross_dept_connectivity; // Connectivité inter-équipes (0.0% à 100.0%)
    double resilience_score;        // Résilience face aux surcharges (0.0% à 100.0%)
    double health_score;            // Score Global ONA (0.0 à 100.0)
    char grade[8];                  // "A+", "A", "B", "C", "D"
    char executive_summary[256];
    char recommendations[3][256];
    int num_recommendations;
} AuditReport;

// Métriques d'un Connecteur Informel / Nœud Pont (Boundary Spanner)
typedef struct {
    int node_id;
    char name[MAX_STR];
    char dept[MAX_STR];
    char role[MAX_STR];
    double betweenness;            // Centralité exacte de Brandes O(V*E)
    double normalized_betweenness; // 0.0% à 100.0%
    int external_depts_count;      // Nombre de départements distincts connectés
    double bridge_score;           // Indice de passerelle inter-silos
    bool is_key_broker;            // true si connecteur critique
    char connected_depts[MAX_DEPTS][MAX_STR];
} BoundarySpanner;

// Rapport global des Ponts Informels
typedef struct {
    BoundarySpanner spanners[MAX_MEMBERS];
    int count;
    int critical_bridges_count;
} BoundarySpannerReport;

// Structure d'une Communauté / Tribu Informelle Détectée (LPA / Modularity)
typedef struct {
    int id;
    char label[MAX_STR];
    int member_ids[MAX_MEMBERS];
    int member_count;
    double internal_flux;
    double external_flux;
    double cohesion_score; // 0.0% à 100.0%
    char dominant_dept[MAX_STR];
} Community;

// Rapport Global de Détection des Communautés
typedef struct {
    Community communities[MAX_DEPTS];
    int num_communities;
    double modularity_score; // Score de modularité de Newman Q
    int node_community[MAX_MEMBERS]; // node_id -> community_id
} CommunityReport;

// Structure d'une Composante Connexe Issue de la Fragmentation (Tarjan SCC)
typedef struct {
    int scc_id;
    int member_ids[MAX_MEMBERS];
    int member_count;
    char dominant_dept[MAX_STR];
    bool is_isolated; // true si îlot isolé déconnecté du cœur de l'entreprise
} ConnectedComponent;

// Rapport du Simulateur de Crise & Départs en Cascade (Cascading Failure & Tarjan)
typedef struct {
    int resigned_node_ids[MAX_MEMBERS];
    int num_resigned;
    int broken_edges_count;
    double lost_flux;
    int total_components;
    int isolated_employees_count;
    double fragmentation_index; // 0.0% à 100.0%
    ConnectedComponent components[MAX_DEPTS];
    char risk_level[16]; // "FAIBLE", "MODÉRÉ", "CRITIQUE", "CATASTROPHIQUE"
    char impact_summary[256];
} CascadingFailureReport;

// Structure d'une Métrique Temporelle d'un Employé (Dérivée de PageRank)
typedef struct {
    int node_id;
    char name[MAX_STR];
    char dept[MAX_STR];
    char role[MAX_STR];
    double pagerank_t1;
    double pagerank_t2;
    double delta_pagerank;     // PR_t2 - PR_t1
    double delta_growth_pct;   // Taux de variation en %
    double in_flux_t1;
    double in_flux_t2;
    double delta_flux;
    char trend[24];            // "📈 EN FORTE HAUSSE", "📉 EN BAISSE", "➡️ STABLE"
} TemporalNodeMetric;

// Rapport Global d'Analyse Temporelle & Vélocité des Échanges
typedef struct {
    TemporalNodeMetric metrics[MAX_MEMBERS];
    int count;
    double health_score_t1;
    double health_score_t2;
    double delta_health_score;
    double cross_dept_t1;
    double cross_dept_t2;
    double delta_cross_dept;
    int rising_leaders_count;
    int declining_nodes_count;
    char executive_summary[256];
} TemporalReport;

// Calcul de la Centralité PageRank (Power Iteration)
void calculate_pagerank(Graph* g, int iterations, double damping_factor);

// Calcul de la Centralité d'Intermédiarité (Betweenness)
void calculate_betweenness(Graph* g);

// Analyse des Silos Organisationnels & Score d'Isolation Inter-Départements
SiloReport analyze_department_silos(Graph* g);

// Détection du Bus Factor & Risque de Surcharge via Tas Binaire (Max-Heap)
BusFactorReport calculate_bus_factor_and_overload(Graph* g);

// Générateur du Rapport d'Audit & Score de Santé Organisationnelle (0-100)
AuditReport generate_ona_audit_report(Graph* g);

// Détection des Ponts Informels & Nœuds Passerelles (Algorithme de Brandes O(V*E))
BoundarySpannerReport calculate_boundary_spanners(Graph* g);

// Détection des Tribus & Communautés Informelles (Label Propagation Algorithm - LPA en C)
CommunityReport calculate_graph_communities(Graph* g);

// Simulateur de Crise & Départs en Cascade (Algorithme de Tarjan DFS avec Stack en C)
CascadingFailureReport simulate_cascading_failure(Graph* g, const int* resigned_ids, int num_resigned);

// Analyse Temporelle & Vélocité des Échanges (Sliding Window & Dérivée Delta PageRank en C)
TemporalReport calculate_temporal_ona(Graph* g);

// Simulation de Propagation d'Information (Parcours BFS avec Queue)
void simulate_propagation(Graph* g, int start_node_id, int max_steps);

// Simulation d'Impact de Démission ("What-If")
int simulate_resignation(Graph* g, int remove_node_id);

#endif // ONA_ALGORITHMS_H
