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

// Simulation de Propagation d'Information (Parcours BFS avec Queue)
void simulate_propagation(Graph* g, int start_node_id, int max_steps);

// Simulation d'Impact de Démission ("What-If")
int simulate_resignation(Graph* g, int remove_node_id);

#endif // ONA_ALGORITHMS_H
