#include "../include/graph.h"
#include "../include/ona_algorithms.h"
#include "../include/http_server.h"
#include "../include/csv_parser.h"

int main(int argc, char* argv[]) {
    printf("=====================================================\n");
    printf(" 🌐✉️ MailInfluence-ONA | High Performance C Engine\n");
    printf("=====================================================\n");

    const char* dataset_path = "../mock-data/enterprise_emails_dataset.csv";
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

    // 6. Démonstration des Simulations (Queue BFS & Graph)
    if (g->num_nodes > 0) {
        simulate_propagation(g, 0, 3);
        simulate_resignation(g, 0);
    }

    // 7. Lancement du Serveur HTTP C ou Mode CLI
    if (argc > 1 && strcmp(argv[1], "--cli") == 0) {
        printf("\n✅ Exécution terminée en mode CLI.\n");
    } else {
        // Démarre le serveur HTTP pour alimenter le frontend React
        start_http_server(g, &bench, 8080);
    }

    // Libération de la mémoire
    free_graph(g);
    return 0;
}
