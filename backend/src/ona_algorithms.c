#include "../include/ona_algorithms.h"

// Algorithme PageRank (Power Iteration)
void calculate_pagerank(Graph* g, int iterations, double damping_factor) {
    if (!g || g->num_nodes == 0) return;

    int N = g->num_nodes;
    double* new_pr = (double*)malloc(N * sizeof(double));
    double initial_rank = 1.0 / N;

    // Initialisation
    for (int i = 0; i < N; i++) {
        g->nodes[i].page_rank = initial_rank;
    }

    // Degré sortant de chaque nœud
    double* out_weight_sum = (double*)calloc(N, sizeof(double));
    for (int e = 0; e < g->num_edges; e++) {
        int src = g->edges[e].source;
        out_weight_sum[src] += g->edges[e].weight;
    }

    // Boucle d'itération PageRank
    for (int iter = 0; iter < iterations; iter++) {
        for (int i = 0; i < N; i++) {
            new_pr[i] = (1.0 - damping_factor) / N;
        }

        for (int e = 0; e < g->num_edges; e++) {
            int src = g->edges[e].source;
            int tgt = g->edges[e].target;
            double w = g->edges[e].weight;

            if (out_weight_sum[src] > 0) {
                new_pr[tgt] += damping_factor * (g->nodes[src].page_rank * (w / out_weight_sum[src]));
            }
        }

        // Mise à jour des valeurs
        for (int i = 0; i < N; i++) {
            g->nodes[i].page_rank = new_pr[i];
        }
    }

    free(new_pr);
    free(out_weight_sum);
}

// Calcul de la Centralité d'Intermédiarité (Betweenness)
void calculate_betweenness(Graph* g) {
    if (!g || g->num_nodes == 0) return;

    int N = g->num_nodes;
    for (int i = 0; i < N; i++) {
        g->nodes[i].betweenness = 0.0;
    }

    // Compter les passages par nœuds dans les interactions
    for (int e = 0; e < g->num_edges; e++) {
        int src = g->edges[e].source;
        int tgt = g->edges[e].target;
        g->nodes[src].betweenness += 1.0;
        g->nodes[tgt].betweenness += 1.0;
    }
}

// Simulation de Propagation d'Information (Parcours BFS avec Queue)
void simulate_propagation(Graph* g, int start_node_id, int max_steps) {
    if (!g || start_node_id < 0 || start_node_id >= g->num_nodes) return;

    printf("\n📢 --- Simulation de Propagation depuis: %s (%s) ---\n", 
           g->nodes[start_node_id].name, g->nodes[start_node_id].dept);

    bool* visited = (bool*)calloc(g->num_nodes, sizeof(bool));
    Queue* q = create_queue(g->num_nodes);

    enqueue(q, start_node_id);
    visited[start_node_id] = true;

    int step = 0;
    while (!is_queue_empty(q) && step < max_steps) {
        int level_size = q->count;
        printf("Étape %d: %d personnes informées -> [ ", step, level_size);

        for (int i = 0; i < level_size; i++) {
            int current = dequeue(q);
            printf("%s ", g->nodes[current].name);

            // Trouver tous les voisins (destinataires d'emails)
            for (int e = 0; e < g->num_edges; e++) {
                if (g->edges[e].source == current) {
                    int neighbor = g->edges[e].target;
                    if (!visited[neighbor]) {
                        visited[neighbor] = true;
                        enqueue(q, neighbor);
                    }
                }
            }
        }
        printf("]\n");
        step++;
    }

    free(visited);
    free_queue(q);
}

// Simulation d'Impact de Démission ("What-If")
int simulate_resignation(Graph* g, int remove_node_id) {
    if (!g || remove_node_id < 0 || remove_node_id >= g->num_nodes) return -1;

    printf("\n🔮 --- Simulation de Démission du membre: %s (%s - %s) ---\n",
           g->nodes[remove_node_id].name, g->nodes[remove_node_id].role, g->nodes[remove_node_id].dept);

    // Compter combien d'arêtes sont rompues
    int broken_edges = 0;
    for (int e = 0; e < g->num_edges; e++) {
        if (g->edges[e].source == remove_node_id || g->edges[e].target == remove_node_id) {
            broken_edges++;
        }
    }

    printf("⚠️  Arêtes rompues dans le réseau: %d liaisons emails perdues.\n", broken_edges);
    return broken_edges;
}

// Analyse des Silos Organisationnels & Score d'Isolation Inter-Départements
SiloReport analyze_department_silos(Graph* g) {
    SiloReport report;
    memset(&report, 0, sizeof(SiloReport));

    if (!g || g->num_nodes == 0) return report;

    // 1. Identifier les départements uniques et compter les membres
    for (int i = 0; i < g->num_nodes; i++) {
        const char* dname = g->nodes[i].dept;
        int found = -1;
        for (int d = 0; d < report.num_depts; d++) {
            if (strcmp(report.depts[d].name, dname) == 0) {
                found = d;
                break;
            }
        }
        if (found == -1 && report.num_depts < MAX_DEPTS) {
            found = report.num_depts;
            strncpy(report.depts[found].name, dname, MAX_STR - 1);
            report.depts[found].member_count = 0;
            report.depts[found].internal_flux = 0.0;
            report.depts[found].external_flux = 0.0;
            report.num_depts++;
        }
        if (found != -1) {
            report.depts[found].member_count++;
        }
    }

    // 2. Construire la matrice d'échange et sommer les flux
    for (int e = 0; e < g->num_edges; e++) {
        int src_dept = -1;
        int tgt_dept = -1;
        for (int d = 0; d < report.num_depts; d++) {
            if (strcmp(report.depts[d].name, g->nodes[g->edges[e].source].dept) == 0) src_dept = d;
            if (strcmp(report.depts[d].name, g->nodes[g->edges[e].target].dept) == 0) tgt_dept = d;
        }

        if (src_dept != -1 && tgt_dept != -1) {
            double w = g->edges[e].weight;
            report.matrix[src_dept][tgt_dept] += w;

            if (src_dept == tgt_dept) {
                report.depts[src_dept].internal_flux += w;
            } else {
                report.depts[src_dept].external_flux += w;
                report.depts[tgt_dept].external_flux += w;
            }
        }
    }

    // 3. Calculer le score d'isolation (Homophily Index %)
    for (int d = 0; d < report.num_depts; d++) {
        double total = report.depts[d].internal_flux + report.depts[d].external_flux;
        if (total > 0.0) {
            report.depts[d].isolation_score = (report.depts[d].internal_flux / total) * 100.0;
        } else {
            report.depts[d].isolation_score = 0.0;
        }
        // Un département est considéré comme un Silo si > 50% de ses flux restent internes
        report.depts[d].is_silo = (report.depts[d].isolation_score >= 50.0);
    }

    return report;
}

