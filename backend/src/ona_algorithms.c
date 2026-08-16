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
            break; // Convergence atteinte
        }
    }

    free(new_pr);
    free(inv_out_weight);
    free(out_weight_sum);
}

// Algorithme exact de Brandes pour la Centralité d'Intermédiarité O(V * E) avec Queue & Stack
void calculate_betweenness(Graph* g) {
    if (!g || g->num_nodes < 2) return;

    int N = g->num_nodes;
    int E = g->num_edges;

    for (int i = 0; i < N; i++) {
        g->nodes[i].betweenness = 0.0;
    }

    // Structure des listes d'adjacence pour accès direct en O(1)
    int* head = (int*)malloc(N * sizeof(int));
    int* next = (int*)malloc(E * sizeof(int));
    int* to = (int*)malloc(E * sizeof(int));

    if (!head || !next || !to) {
        if (head) free(head);
        if (next) free(next);
        if (to) free(to);
        return;
    }

    for (int i = 0; i < N; i++) head[i] = -1;
    for (int e = 0; e < E; e++) {
        int u = g->edges[e].source;
        int v = g->edges[e].target;
        to[e] = v;
        next[e] = head[u];
        head[u] = e;
    }

    // Tableaux de travail pour Brandes
    int* d = (int*)malloc(N * sizeof(int));
    double* sigma = (double*)malloc(N * sizeof(double));
    double* delta = (double*)malloc(N * sizeof(double));
    
    // Prédécesseurs (listes dynamiques réutilisables)
    int** P = (int**)malloc(N * sizeof(int*));
    int* P_count = (int*)malloc(N * sizeof(int));
    int* P_cap = (int*)malloc(N * sizeof(int));
    for (int i = 0; i < N; i++) {
        P_cap[i] = 8;
        P_count[i] = 0;
        P[i] = (int*)malloc(P_cap[i] * sizeof(int));
    }

    Stack* S = create_stack(N + 10);
    Queue* Q = create_queue(N + 10);

    for (int s = 0; s < N; s++) {
        // 1. Initialisation pour la source s
        for (int w = 0; w < N; w++) {
            P_count[w] = 0;
            sigma[w] = 0.0;
            d[w] = -1;
            delta[w] = 0.0;
        }
        sigma[s] = 1.0;
        d[s] = 0;

        enqueue(Q, s);

        // 2. BFS pour trouver les plus courts chemins (Queue FIFO)
        while (!is_queue_empty(Q)) {
            int v = dequeue(Q);
            push(S, v);

            for (int e = head[v]; e != -1; e = next[e]) {
                int w = to[e];
                // Premier chemin découvert vers w
                if (d[w] < 0) {
                    d[w] = d[v] + 1;
                    enqueue(Q, w);
                }
                // Plus court chemin passant par v
                if (d[w] == d[v] + 1) {
                    sigma[w] += sigma[v];
                    if (P_count[w] >= P_cap[w]) {
                        P_cap[w] *= 2;
                        P[w] = (int*)realloc(P[w], P_cap[w] * sizeof(int));
                    }
                    P[w][P_count[w]++] = v;
                }
            }
        }

        // 3. Accumulation des dépendances de bas en haut (Stack LIFO)
        while (!is_stack_empty(S)) {
            int w = pop(S);
            for (int i = 0; i < P_count[w]; i++) {
                int v = P[w][i];
                if (sigma[w] > 0.0) {
                    delta[v] += (sigma[v] / sigma[w]) * (1.0 + delta[w]);
                }
            }
            if (w != s) {
                g->nodes[w].betweenness += delta[w];
            }
        }
    }

    // Compléter avec la centralité de flux si le graphe est ultra-dense (clique)
    double max_bet = 0.0;
    for (int i = 0; i < N; i++) {
        if (g->nodes[i].betweenness > max_bet) max_bet = g->nodes[i].betweenness;
    }
    if (max_bet < 1e-6) {
        for (int e = 0; e < E; e++) {
            g->nodes[g->edges[e].source].betweenness += 0.1 * g->edges[e].weight;
            g->nodes[g->edges[e].target].betweenness += 0.1 * g->edges[e].weight;
        }
    }

    // Libération de la mémoire
    free_stack(S);
    free_queue(Q);
    for (int i = 0; i < N; i++) free(P[i]);
    free(P);
    free(P_count);
    free(P_cap);
    free(d);
    free(sigma);
    free(delta);
    free(head);
    free(next);
    free(to);
}

// Détection des Ponts Informels & Nœuds Passerelles (Boundary Spanners en C)
BoundarySpannerReport calculate_boundary_spanners(Graph* g) {
    BoundarySpannerReport report;
    memset(&report, 0, sizeof(BoundarySpannerReport));

    if (!g || g->num_nodes == 0) return report;

    int N = g->num_nodes;
    calculate_betweenness(g);

    double norm_factor = (N > 2) ? 1.0 / ((double)(N - 1) * (N - 2)) : 1.0;
    MaxHeap* heap = create_max_heap(N);

    for (int i = 0; i < N; i++) {
        Node* n = &g->nodes[i];
        double norm_bet = n->betweenness * norm_factor;
        if (norm_bet > 1.0) norm_bet = 1.0;

        // Identifier les départements externes distincts connectés
        char external_depts[MAX_DEPTS][MAX_STR];
        int ext_count = 0;

        for (int e = 0; e < g->num_edges; e++) {
            int src = g->edges[e].source;
            int tgt = g->edges[e].target;
            const char* other_dept = NULL;

            if (src == i && tgt != i) {
                other_dept = g->nodes[tgt].dept;
            } else if (tgt == i && src != i) {
                other_dept = g->nodes[src].dept;
            }

            if (other_dept && strcmp(other_dept, n->dept) != 0) {
                bool exists = false;
                for (int d = 0; d < ext_count; d++) {
                    if (strcmp(external_depts[d], other_dept) == 0) {
                        exists = true;
                        break;
                    }
                }
                if (!exists && ext_count < MAX_DEPTS) {
                    strncpy(external_depts[ext_count++], other_dept, MAX_STR - 1);
                }
            }
        }

        // Bridge Score = Normalized Betweenness * (1 + 0.75 * Distinct External Depts) + bonus
        double bridge_score = (norm_bet * 100.0) * (1.0 + 0.75 * ext_count) + (ext_count * 2.5);
        heap_push(heap, i, n->name, n->dept, n->role, bridge_score);
    }

    report.count = 0;
    report.critical_bridges_count = 0;

    while (!is_heap_empty(heap) && report.count < MAX_MEMBERS) {
        HeapItem item = heap_pop(heap);
        int idx = report.count;
        int nid = item.node_id;
        Node* n = &g->nodes[nid];

        report.spanners[idx].node_id = nid;
        strncpy(report.spanners[idx].name, item.name, MAX_STR - 1);
        strncpy(report.spanners[idx].dept, item.dept, MAX_STR - 1);
        strncpy(report.spanners[idx].role, item.role, MAX_STR - 1);
        report.spanners[idx].betweenness = n->betweenness;
        report.spanners[idx].normalized_betweenness = n->betweenness * norm_factor * 100.0;
        report.spanners[idx].bridge_score = item.score;

        // Re-remplir les départements connectés
        int ext_count = 0;
        for (int e = 0; e < g->num_edges; e++) {
            int src = g->edges[e].source;
            int tgt = g->edges[e].target;
            const char* other_dept = NULL;

            if (src == nid && tgt != nid) other_dept = g->nodes[tgt].dept;
            else if (tgt == nid && src != nid) other_dept = g->nodes[src].dept;

            if (other_dept && strcmp(other_dept, n->dept) != 0) {
                bool exists = false;
                for (int d = 0; d < ext_count; d++) {
                    if (strcmp(report.spanners[idx].connected_depts[d], other_dept) == 0) {
                        exists = true;
                        break;
                    }
                }
                if (!exists && ext_count < MAX_DEPTS) {
                    strncpy(report.spanners[idx].connected_depts[ext_count++], other_dept, MAX_STR - 1);
                }
            }
        }
        report.spanners[idx].external_depts_count = ext_count;
        report.spanners[idx].is_key_broker = (ext_count >= 3 || item.score >= 20.0);
        if (report.spanners[idx].is_key_broker) {
            report.critical_bridges_count++;
        }

        report.count++;
    }

    free_max_heap(heap);
    return report;
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

            // Trouver tous les voisins
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

// Analyse des Silos Organisationnels Optimisée
SiloReport analyze_department_silos(Graph* g) {
    SiloReport report;
    memset(&report, 0, sizeof(SiloReport));

    if (!g || g->num_nodes == 0) return report;

    // 1. Identifier les départements uniques et pré-assigner dept_id
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
            g->nodes[i].dept_id = found;
            report.depts[found].member_count++;
        }
    }

    // 2. Construire la matrice d'échange en O(E) sans strcmp
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

    // 1. Calculer les flux entrants et sortants en O(E)
    for (int e = 0; e < g->num_edges; e++) {
        int src = g->edges[e].source;
        int tgt = g->edges[e].target;
        double w = g->edges[e].weight;

        out_flux[src] += w;
        in_flux[tgt] += w;
        in_deg[tgt]++;
    }

    // 2. Insérer dans le Tas Binaire Max (Max-Heap)
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

    // 2. Taux de Réciprocité Bilatérale Optimisé en O(E)
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

// Détection des Tribus & Communautés Informelles (Label Propagation Algorithm - LPA en C)
CommunityReport calculate_graph_communities(Graph* g) {
    CommunityReport report;
    memset(&report, 0, sizeof(CommunityReport));

    if (!g || g->num_nodes == 0) return report;

    int N = g->num_nodes;
    int E = g->num_edges;

    int* labels = (int*)malloc(N * sizeof(int));
    double* label_weights = (double*)malloc(N * sizeof(double));

    if (!labels || !label_weights) {
        if (labels) free(labels);
        if (label_weights) free(label_weights);
        return report;
    }

    // 1. Initialisation : Chaque collaborateur commence dans sa propre communauté
    for (int i = 0; i < N; i++) {
        labels[i] = i;
    }

    // 2. Propagation itérative pondérée des labels
    int max_iterations = 15;
    for (int iter = 0; iter < max_iterations; iter++) {
        int changes = 0;

        for (int u = 0; u < N; u++) {
            memset(label_weights, 0, N * sizeof(double));

            for (int e = 0; e < E; e++) {
                int src = g->edges[e].source;
                int tgt = g->edges[e].target;
                double w = g->edges[e].weight;

                if (src == u) {
                    label_weights[labels[tgt]] += w;
                } else if (tgt == u) {
                    label_weights[labels[src]] += w * 0.9;
                }
            }

            double max_w = -1.0;
            int best_label = labels[u];

            for (int i = 0; i < N; i++) {
                if (label_weights[i] > max_w) {
                    max_w = label_weights[i];
                    best_label = i;
                }
            }

            if (best_label != labels[u] && max_w > 0.0) {
                labels[u] = best_label;
                changes++;
            }
        }

        if (changes == 0) break;
    }

    // 3. Agrégation des Communautés Détectées
    int unique_labels[MAX_DEPTS];
    int num_unique = 0;

    for (int i = 0; i < N; i++) {
        int l = labels[i];
        int found = -1;
        for (int c = 0; c < num_unique; c++) {
            if (unique_labels[c] == l) {
                found = c;
                break;
            }
        }
        if (found == -1 && num_unique < MAX_DEPTS) {
            found = num_unique;
            unique_labels[num_unique++] = l;
        }

        if (found != -1) {
            report.node_community[i] = found;
            Community* comm = &report.communities[found];
            comm->id = found;
            comm->member_ids[comm->member_count++] = i;
        }
    }
    report.num_communities = num_unique;

    // 4. Calcul des flux internes/externes, cohésion et département dominant
    double total_network_flux = 0.0;
    double total_internal_flux = 0.0;

    for (int c = 0; c < report.num_communities; c++) {
        Community* comm = &report.communities[c];
        comm->internal_flux = 0.0;
        comm->external_flux = 0.0;

        int dept_counts[MAX_DEPTS] = {0};
        char dept_names[MAX_DEPTS][MAX_STR];
        int num_depts_seen = 0;

        for (int m = 0; m < comm->member_count; m++) {
            int nid = comm->member_ids[m];
            const char* dname = g->nodes[nid].dept;

            int didx = -1;
            for (int d = 0; d < num_depts_seen; d++) {
                if (strcmp(dept_names[d], dname) == 0) {
                    didx = d;
                    break;
                }
            }
            if (didx == -1 && num_depts_seen < MAX_DEPTS) {
                didx = num_depts_seen;
                strncpy(dept_names[num_depts_seen++], dname, MAX_STR - 1);
            }
            if (didx != -1) {
                dept_counts[didx]++;
            }
        }

        int max_dept_cnt = 0;
        int dominant_idx = 0;
        for (int d = 0; d < num_depts_seen; d++) {
            if (dept_counts[d] > max_dept_cnt) {
                max_dept_cnt = dept_counts[d];
                dominant_idx = d;
            }
        }
        if (num_depts_seen > 0) {
            strncpy(comm->dominant_dept, dept_names[dominant_idx], MAX_STR - 1);
        } else {
            strcpy(comm->dominant_dept, "Général");
        }

        for (int e = 0; e < E; e++) {
            int src = g->edges[e].source;
            int tgt = g->edges[e].target;
            double w = g->edges[e].weight;
            total_network_flux += w;

            int c_src = report.node_community[src];
            int c_tgt = report.node_community[tgt];

            if (c_src == c && c_tgt == c) {
                comm->internal_flux += w;
                total_internal_flux += w;
            } else if (c_src == c || c_tgt == c) {
                comm->external_flux += w;
            }
        }

        double total_comm_flux = comm->internal_flux + comm->external_flux;
        comm->cohesion_score = (total_comm_flux > 0.0) ? (comm->internal_flux / total_comm_flux) * 100.0 : 0.0;

        snprintf(comm->label, MAX_STR, "Tribu %d (%s & Co)", c + 1, comm->dominant_dept);
    }

    report.modularity_score = (total_network_flux > 0.0) ? (total_internal_flux / total_network_flux) : 0.0;

    free(labels);
    free(label_weights);

    return report;
}
