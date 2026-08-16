#ifndef ONA_ALGORITHMS_H
#define ONA_ALGORITHMS_H

#include "graph.h"
#include "queue.h"
#include "stack.h"

#define MAX_DEPTS 16

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

// Calcul de la Centralité PageRank (Power Iteration)
void calculate_pagerank(Graph* g, int iterations, double damping_factor);

// Calcul de la Centralité d'Intermédiarité (Betweenness)
void calculate_betweenness(Graph* g);

// Analyse des Silos Organisationnels & Score d'Isolation Inter-Départements
SiloReport analyze_department_silos(Graph* g);

// Simulation de Propagation d'Information (Parcours BFS avec Queue)
void simulate_propagation(Graph* g, int start_node_id, int max_steps);

// Simulation d'Impact de Démission ("What-If")
int simulate_resignation(Graph* g, int remove_node_id);

#endif // ONA_ALGORITHMS_H
