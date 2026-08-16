#ifndef ONA_ALGORITHMS_H
#define ONA_ALGORITHMS_H

#include "graph.h"
#include "queue.h"
#include "stack.h"

// Calcul de la Centralité PageRank (Power Iteration)
void calculate_pagerank(Graph* g, int iterations, double damping_factor);

// Calcul de la Centralité d'Intermédiarité (Betweenness)
void calculate_betweenness(Graph* g);

// Simulation de Propagation d'Information (Parcours BFS avec Queue)
void simulate_propagation(Graph* g, int start_node_id, int max_steps);

// Simulation d'Impact de Démission ("What-If")
int simulate_resignation(Graph* g, int remove_node_id);

#endif // ONA_ALGORITHMS_H
