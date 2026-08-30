#include "../include/graph.h"
#include "../include/ona_algorithms.h"
#include "../include/http_server.h"
#include "../include/csv_parser.h"

int main(int argc, char* argv[]) {
    printf("=====================================================\n");
    printf(" 🌐✉️ MailInfluence-ONA | High Performance C Engine\n");
    printf("=====================================================\n");

    const char* dataset_path = "../mock-data/enterprise_emails_dataset.csv";
    const char* env_path = getenv("DATASET_PATH");
    if (env_path) {
        dataset_path = env_path;
    } else {
        FILE* test_fp = fopen(dataset_path, "r");
        if (!test_fp) {
            if ((test_fp = fopen("mock-data/enterprise_emails_dataset.csv", "r"))) {
                dataset_path = "mock-data/enterprise_emails_dataset.csv";
                fclose(test_fp);
            } else if ((test_fp = fopen("./enterprise_emails_dataset.csv", "r"))) {
                dataset_path = "./enterprise_emails_dataset.csv";
                fclose(test_fp);
            }
        } else {
            fclose(test_fp);
        }
    }

    BenchmarkResult bench;

    // 1. Ingestion Haute Performance du fichier CSV & Indexation Hash Table O(1)
    printf("⚡ Ingestion du dataset CSV en cours (%s)...\n", dataset_path);
    Graph* g = ingest_csv_and_benchmark(dataset_path, &bench);

    if (!g) {
        fprintf(stderr, "Erreur lors de l'ingestion du fichier CSV.\n");
        return 1;
    }

    // 2. Affichage des Métriques de Benchmark en C
    printf("\n📊 --- BENCHMARK DE PERFORMANCE MOTEUR C11 ---\n");
    printf("  - Lignes de logs traitées: %d emails\n", bench.rows_processed);
    printf("  - Nœuds uniques identifiés (Hash Table): %d employés\n", bench.total_nodes);
    printf("  - Liaisons générées: %d arêtes\n", bench.total_edges);
    printf("  - Temps de parsing & insertion: %.2f ms\n", bench.parse_time_ms);
    printf("  - Temps de calcul PageRank (25 itérations): %.2f ms\n", bench.pagerank_time_ms);
    printf("  - Temps TOTAL d'exécution: %.2f ms (Moteur C Natif)\n", bench.total_time_ms);

    // 3. Affichage des Leaders Informels (PageRank)
    printf("\n🏆 --- Top Leaders Informels Détectés (PageRank C) ---\n");
    int max_display = (g->num_nodes > 5) ? 5 : g->num_nodes;
    for (int i = 0; i < max_display; i++) {
        printf("  - %-15s | %-12s | PageRank: %.4f | Intermédiarité: %.1f\n",
               g->nodes[i].name, g->nodes[i].dept, g->nodes[i].page_rank, g->nodes[i].betweenness);
    }

    // 4. Analyse des Silos Organisationnels (Cross-Department Isolation)
    printf("\n🏢 --- Analyse des Silos Organisationnels (Homophily Score en C) ---\n");
    SiloReport silos = analyze_department_silos(g);
    for (int d = 0; d < silos.num_depts; d++) {
        printf("  - %-12s (%d membres) | Interne: %4.1f | Externe: %4.1f | Isolation: %5.1f%% %s\n",
               silos.depts[d].name, silos.depts[d].member_count,
               silos.depts[d].internal_flux, silos.depts[d].external_flux,
               silos.depts[d].isolation_score,
               silos.depts[d].is_silo ? "⚠️ [SILO ALERT]" : "✅ [CONNECTÉ]");
    }

    // 5. Détection du Bus Factor & Risque de Surcharge (Max-Heap C)
    printf("\n⚠️ --- Détection du Bus Factor & Risque de Surcharge (Max-Heap C) ---\n");
    BusFactorReport bf = calculate_bus_factor_and_overload(g);
    int max_bf_display = (bf.count > 5) ? 5 : bf.count;
    for (int b = 0; b < max_bf_display; b++) {
        printf("  - %-15s | %-12s | InFlux: %4.1f | OutFlux: %4.1f | Score: %5.1f %s\n",
               bf.members[b].name, bf.members[b].dept,
               bf.members[b].in_flux, bf.members[b].out_flux,
               bf.members[b].overload_score,
               bf.members[b].is_critical ? "🚨 [BUS FACTOR CRITIQUE]" : "🟢 [CHARGE NORMALE]");
    }

    // 6. Détection des Ponts Informels & Nœuds Passerelles (Brandes & Max-Heap C)
    printf("\n🌉 --- Détection des Ponts Informels (Boundary Spanners en C) ---\n");
    BoundarySpannerReport bridges = calculate_boundary_spanners(g);
    int max_br_display = (bridges.count > 5) ? 5 : bridges.count;
    for (int br = 0; br < max_br_display; br++) {
        BoundarySpanner* bs = &bridges.spanners[br];
        printf("  - %-15s | %-12s | Betweenness: %4.1f | %d Depts Connectés | Score Pont: %4.1f %s\n",
               bs->name, bs->dept, bs->betweenness, bs->external_depts_count, bs->bridge_score,
               bs->is_key_broker ? "🌉 [CONNECTEUR CRITIQUE]" : "🔗 [PASSERELLE]");
    }

    // 7. Détection des Tribus & Communautés Informelles (LPA en C)
    printf("\n🔮 --- Détection des Tribus & Communautés Informelles (LPA en C) ---\n");
    CommunityReport comms = calculate_graph_communities(g);
    for (int c = 0; c < comms.num_communities; c++) {
        Community* cm = &comms.communities[c];
        printf("  - %-25s | %2d Membres | Flux Interne: %5.1f | Cohésion: %5.1f%%\n",
               cm->label, cm->member_count, cm->internal_flux, cm->cohesion_score);
    }

    // 8. Crash Test : Simulation de Départs en Cascade (Algorithme de Tarjan SCC)
    printf("\n🌪️ --- Crash Test : Départs en Cascade & Fragmentation (Tarjan SCC) ---\n");
    CascadingFailureReport crash = simulate_cascading_failure(g, NULL, 0);
    printf("  - Collaborateurs démissionnaires simulés: %d personnes [ ", crash.num_resigned);
    for (int r = 0; r < crash.num_resigned; r++) {
        printf("%s ", g->nodes[crash.resigned_node_ids[r]].name);
    }
    printf("]\n");
    printf("  - Liaisons emails rompues: %d | Flux perdu: %.1f\n", crash.broken_edges_count, crash.lost_flux);
    printf("  - Fragmentation Réseau: %.1f%% | Composantes SCC: %d | Niveau de Risque: %s\n",
           crash.fragmentation_index, crash.total_components, crash.risk_level);
    printf("  - Diagnostic: %s\n", crash.impact_summary);

    // 9. Analyse Temporelle & Vélocité (Sliding Window & Dérivée Delta PageRank)
    printf("\n📈 --- Analyse Temporelle & Vélocité (Delta PageRank & Dynamique C) ---\n");
    TemporalReport temporal = calculate_temporal_ona(g);
    printf("  - Évolution Santé: %.1f -> %.1f (%+.1f pts) | Connectivité Transversale: %+.1f%%\n",
           temporal.health_score_t1, temporal.health_score_t2, temporal.delta_health_score, temporal.delta_cross_dept);
    printf("  - Leaders Émergents: %d collaborateurs | Déclins: %d collaborateurs\n",
           temporal.rising_leaders_count, temporal.declining_nodes_count);
    for (int m = 0; m < ((temporal.count > 4) ? 4 : temporal.count); m++) {
        TemporalNodeMetric* tnm = &temporal.metrics[m];
        printf("    * %-15s | %-12s | PR T1: %.4f -> T2: %.4f (%+5.1f%%) | %s\n",
               tnm->name, tnm->dept, tnm->pagerank_t1, tnm->pagerank_t2, tnm->delta_growth_pct, tnm->trend);
    }

    // 6. Rapport d'Audit Global de Santé Organisationnelle (Score 0-100)
    printf("\n======================================================================\n");
    printf(" 📑 RAPPORT D'AUDIT DE SANTÉ ORGANISATIONNELLE (ONA C ENGINE)\n");
    printf("======================================================================\n");
    AuditReport audit = generate_ona_audit_report(g);
    printf(" 🎯 SCORE GLOBAL : %.1f / 100  [GRADE : %s]\n", audit.health_score, audit.grade);
    printf(" 📋 Résumé Exécutif: %s\n", audit.executive_summary);
    printf("----------------------------------------------------------------------\n");
    printf("  - Densité du Réseau        : %5.1f%% (Degré de maillage global)\n", audit.density);
    printf("  - Taux de Réciprocité      : %5.1f%% (Communication bilatérale & confiance)\n", audit.reciprocity);
    printf("  - Connectivité Transversale: %5.1f%% (Échanges inter-départements)\n", audit.cross_dept_connectivity);
    printf("  - Résilience Bus Factor    : %5.1f%% (Sécurité face aux goulots)\n", audit.resilience_score);
    printf("----------------------------------------------------------------------\n");
    printf(" 💡 RECOMMANDATIONS RH & MANAGEMENT :\n");
    for (int r = 0; r < audit.num_recommendations; r++) {
        printf("   %d. %s\n", r + 1, audit.recommendations[r]);
    }
    printf("======================================================================\n");

    // 7. Démonstration des Simulations (Queue BFS & Graph)
    if (g->num_nodes > 0) {
        simulate_propagation(g, 0, 3);
        simulate_resignation(g, 0);
    }

    // 7. Lancement du Serveur HTTP C ou Mode CLI
    if (argc > 1 && strcmp(argv[1], "--cli") == 0) {
        printf("\n✅ Exécution terminée en mode CLI.\n");
    } else {
        int port = 8080;
        const char* env_port = getenv("PORT");
        if (env_port) {
            int p = atoi(env_port);
            if (p > 0) port = p;
        }
        // Démarre le serveur HTTP pour alimenter le frontend React
        start_http_server(g, &bench, port);
    }

    // Libération de la mémoire
    free_graph(g);
    return 0;
}
