#include "../include/ona_algorithms.h"
#include <math.h>

// Algorithme PageRank Optimisé (Power Iteration avec Sortie Anticipée & Inverse Précalculé)
void calculate_pagerank(Graph* g, int iterations, double damping_factor) {
    if (!g || g->num_nodes == 0) return;

    int N = g->num_nodes;
    double* new_pr = (double*)malloc(N * sizeof(double));
    double* inv_out_weight = (double*)calloc(N, sizeof(double));
    double* out_weight_sum = (double*)calloc(N, sizeof(double));

    if (!new_pr || !inv_out_weight || !out_weight_sum) {
        if (new_pr) free(new_pr);
        if (inv_out_weight) free(inv_out_weight);
        if (out_weight_sum) free(out_weight_sum);
        return;
    }

    double initial_rank = 1.0 / N;
    for (int i = 0; i < N; i++) {
        g->nodes[i].page_rank = initial_rank;
    }

    // 1. Précalcul des sommes de poids sortants
    for (int e = 0; e < g->num_edges; e++) {
        out_weight_sum[g->edges[e].source] += g->edges[e].weight;
    }

    // Précalculer 1.0 / out_weight_sum pour remplacer les divisions par des multiplications rapides
    for (int i = 0; i < N; i++) {
        if (out_weight_sum[i] > 1e-9) {
            inv_out_weight[i] = 1.0 / out_weight_sum[i];
        }
    }

    double base_rank = (1.0 - damping_factor) / N;
    double epsilon = 1e-6; // Seuil de convergence

    // 2. Boucle d'itération PageRank vectorielle
    for (int iter = 0; iter < iterations; iter++) {
        for (int i = 0; i < N; i++) {
            new_pr[i] = base_rank;
        }

        for (int e = 0; e < g->num_edges; e++) {
            int src = g->edges[e].source;
            int tgt = g->edges[e].target;
            double w = g->edges[e].weight;

            if (out_weight_sum[src] > 1e-9) {
                new_pr[tgt] += damping_factor * (g->nodes[src].page_rank * (w * inv_out_weight[src]));
            }
        }

        // Test de convergence rapide (Early Stopping)
        double diff = 0.0;
        for (int i = 0; i < N; i++) {
            diff += fabs(new_pr[i] - g->nodes[i].page_rank);
            g->nodes[i].page_rank = new_pr[i];
        }

        if (diff < epsilon) {
            break; // Convergence atteinte, pas besoin d'itérations superflues
        }
    }

    free(new_pr);
    free(inv_out_weight);
    free(out_weight_sum);
}

// Calcul de la Centralité d'Intermédiarité (Betweenness)
void calculate_betweenness(Graph* g) {
    if (!g || g->num_nodes == 0) return;

    int N = g->num_nodes;
    for (int i = 0; i < N; i++) {
        g->nodes[i].betweenness = 0.0;
    }

    // Parcours direct O(E)
    for (int e = 0; e < g->num_edges; e++) {
        g->nodes[g->edges[e].source].betweenness += 1.0;
        g->nodes[g->edges[e].target].betweenness += 1.0;
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

    int broken_edges = 0;
    for (int e = 0; e < g->num_edges; e++) {
        if (g->edges[e].source == remove_node_id || g->edges[e].target == remove_node_id) {
            broken_edges++;
        }
    }

    printf("⚠️  Arêtes rompues dans le réseau: %d liaisons emails perdues.\n", broken_edges);
    return broken_edges;
}

// Analyse des Silos Organisationnels Optimisée (Indexation O(1) sans strcmp dans la boucle)
SiloReport analyze_department_silos(Graph* g) {
    SiloReport report;
    memset(&report, 0, sizeof(SiloReport));

    if (!g || g->num_nodes == 0) return report;

    // 1. Identifier les départements uniques et pré-assigner dept_id aux nœuds
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
            g->nodes[i].dept_id = found; // Stockage de l'ID entier pour accès direct O(1)
            report.depts[found].member_count++;
        }
    }

    // 2. Construire la matrice d'échange en O(E) sans AUCUN strcmp
    for (int e = 0; e < g->num_edges; e++) {
        int src_dept = g->nodes[g->edges[e].source].dept_id;
        int tgt_dept = g->nodes[g->edges[e].target].dept_id;

        if (src_dept >= 0 && tgt_dept >= 0) {
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
        report.depts[d].is_silo = (report.depts[d].isolation_score >= 50.0);
    }

    return report;
}

// Détection du Bus Factor & Risque de Surcharge via Tas Binaire (Max-Heap)
BusFactorReport calculate_bus_factor_and_overload(Graph* g) {
    BusFactorReport report;
    memset(&report, 0, sizeof(BusFactorReport));

    if (!g || g->num_nodes == 0) return report;

    int N = g->num_nodes;
    double* in_flux = (double*)calloc(N, sizeof(double));
    double* out_flux = (double*)calloc(N, sizeof(double));
    int* in_deg = (int*)calloc(N, sizeof(int));

    if (!in_flux || !out_flux || !in_deg) {
        if (in_flux) free(in_flux);
        if (out_flux) free(out_flux);
        if (in_deg) free(in_deg);
        return report;
    }

    // 1. Calculer les flux entrants et sortants pour chaque employé en O(E)
    for (int e = 0; e < g->num_edges; e++) {
        int src = g->edges[e].source;
        int tgt = g->edges[e].target;
        double w = g->edges[e].weight;

        out_flux[src] += w;
        in_flux[tgt] += w;
        in_deg[tgt]++;
    }

    // 2. Insérer dans le Tas Binaire Max (Max-Heap) en O(N log N)
    MaxHeap* heap = create_max_heap(N);
    for (int i = 0; i < N; i++) {
        double ratio = (out_flux[i] > 0.0) ? (in_flux[i] / out_flux[i]) : in_flux[i];
        double overload_score = (in_flux[i] * 1.5) + (in_deg[i] * 2.0) + (ratio * 1.0);
        
        heap_push(heap, i, g->nodes[i].name, g->nodes[i].dept, g->nodes[i].role, overload_score);
    }

    // 3. Extraire du Tas Binaire par ordre décroissant de risque
    report.count = 0;
    while (!is_heap_empty(heap) && report.count < MAX_MEMBERS) {
        HeapItem item = heap_pop(heap);
        int idx = report.count;

        report.members[idx].node_id = item.node_id;
        strncpy(report.members[idx].name, item.name, MAX_STR - 1);
        strncpy(report.members[idx].dept, item.dept, MAX_STR - 1);
        strncpy(report.members[idx].role, item.role, MAX_STR - 1);
        report.members[idx].in_flux = in_flux[item.node_id];
        report.members[idx].out_flux = out_flux[item.node_id];
        report.members[idx].overload_score = item.score;
        report.members[idx].is_critical = (item.score >= 12.0 || in_flux[item.node_id] >= 7.0);

        report.count++;
    }

    free(in_flux);
    free(out_flux);
    free(in_deg);
    free_max_heap(heap);

    return report;
}

// Générateur du Rapport d'Audit & Score de Santé Organisationnelle (0-100) Optimisé
AuditReport generate_ona_audit_report(Graph* g) {
    AuditReport report;
    memset(&report, 0, sizeof(AuditReport));

    if (!g || g->num_nodes < 2) {
        report.health_score = 0.0;
        strcpy(report.grade, "N/A");
        strcpy(report.executive_summary, "Données insuffisantes pour un audit.");
        return report;
    }

    int N = g->num_nodes;
    int E = g->num_edges;

    // 1. Densité du Réseau (D)
    double max_edges = (double)(N * (N - 1));
    report.density = (max_edges > 0) ? ((double)E / max_edges) * 100.0 : 0.0;
    if (report.density > 100.0) report.density = 100.0;

    // 2. Taux de Réciprocité Bilatérale Optimisé en O(E) via Matrice d'Adjacence Booléenne
    bool* adj = (bool*)calloc(N * N, sizeof(bool));
    int reciprocal_count = 0;

    if (adj) {
        for (int i = 0; i < E; i++) {
            int u = g->edges[i].source;
            int v = g->edges[i].target;
            adj[u * N + v] = true;
        }

        for (int i = 0; i < E; i++) {
            int u = g->edges[i].source;
            int v = g->edges[i].target;
            if (adj[v * N + u]) {
                reciprocal_count++;
            }
        }
        free(adj);
        report.reciprocity = (E > 0) ? ((double)reciprocal_count / E) * 100.0 : 0.0;
    } else {
        report.reciprocity = 50.0;
    }

    // 3. Connectivité Inter-Équipes (Cross-Department)
    SiloReport silos = analyze_department_silos(g);
    double total_internal = 0.0;
    double total_external = 0.0;
    for (int d = 0; d < silos.num_depts; d++) {
        total_internal += silos.depts[d].internal_flux;
        total_external += silos.depts[d].external_flux;
    }
    double total_flux = total_internal + total_external;
    report.cross_dept_connectivity = (total_flux > 0.0) ? (total_external / total_flux) * 100.0 : 0.0;

    // 4. Résilience Bus Factor
    BusFactorReport bf = calculate_bus_factor_and_overload(g);
    int critical_count = 0;
    for (int b = 0; b < bf.count; b++) {
        if (bf.members[b].is_critical) critical_count++;
    }
    report.resilience_score = (N > 0) ? (1.0 - ((double)critical_count / N)) * 100.0 : 100.0;
    if (report.resilience_score < 0.0) report.resilience_score = 0.0;

    // 5. Score Global ONA (0-100)
    double density_subscore = (report.density >= 5.0 && report.density <= 70.0) ? 25.0 : 15.0;
    double reciprocity_subscore = (report.reciprocity / 100.0) * 25.0;
    double cross_dept_subscore = (report.cross_dept_connectivity / 100.0) * 25.0;
    double resilience_subscore = (report.resilience_score / 100.0) * 25.0;

    report.health_score = density_subscore + reciprocity_subscore + cross_dept_subscore + resilience_subscore;
    if (report.health_score > 100.0) report.health_score = 100.0;

    // 6. Grade & Recommandations
    if (report.health_score >= 80.0) {
        strcpy(report.grade, "A");
        strcpy(report.executive_summary, "Organisation fluide avec une excellente dynamique de collaboration.");
    } else if (report.health_score >= 65.0) {
        strcpy(report.grade, "B");
        strcpy(report.executive_summary, "Bonne collaboration d'ensemble avec des axes d'amélioration ciblés.");
    } else if (report.health_score >= 50.0) {
        strcpy(report.grade, "C");
        strcpy(report.executive_summary, "Risques de surcharge et de silos nécessitant un suivi managérial.");
    } else {
        strcpy(report.grade, "D");
        strcpy(report.executive_summary, "Réseau organisationnel fragile et fragmenté.");
    }

    report.num_recommendations = 0;
    if (critical_count > 0 && report.num_recommendations < 3) {
        snprintf(report.recommendations[report.num_recommendations++], 256,
            "Rééquilibrer la charge des %d employés en Bus Factor critique pour sécuriser les projets.", critical_count);
    }
    if (report.cross_dept_connectivity < 60.0 && report.num_recommendations < 3) {
        snprintf(report.recommendations[report.num_recommendations++], 256,
            "Mettre en place des ponts de communication pour décloisonner les équipes isolées.");
    }
    if (report.reciprocity < 50.0 && report.num_recommendations < 3) {
        snprintf(report.recommendations[report.num_recommendations++], 256,
            "Encourager le feedback bilatéral pour renforcer l'engagement des collaborateurs.");
    }
    if (report.num_recommendations == 0) {
        snprintf(report.recommendations[report.num_recommendations++], 256,
            "Maintenir les rituels actuels et auditer l'évolution des flux chaque trimestre.");
    }

    return report;
}
