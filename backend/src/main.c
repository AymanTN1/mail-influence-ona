#include "../include/graph.h"
#include "../include/ona_algorithms.h"
#include "../include/http_server.h"

int main(int argc, char* argv[]) {
    printf("=====================================================\n");
    printf(" 🌐✉️ MailInfluence-ONA | Backend Engine (Langage C)\n");
    printf("=====================================================\n");

    // 1. Initialisation du Graphe d'influence
    Graph* g = create_graph();

    // 2. Ajout des Employés (Nœuds du réseau ONA)
    int id_sarah  = add_node(g, "Sarah Connor",  "sarah@company.com",  "Engineering", "CTO");
    int id_alex   = add_node(g, "Alex Mercer",   "alex@company.com",   "Executive",   "CEO");
    int id_david  = add_node(g, "David Miller",  "david@company.com",  "Engineering", "Tech Lead");
    int id_claire = add_node(g, "Claire Bennet", "claire@company.com", "HR",          "HR Director");
    int id_mark   = add_node(g, "Mark Sloan",    "mark@company.com",    "Sales",       "VP Sales");

    // 3. Ajout des Interactions Emails (Arêtes Orientées avec Poids)
    add_edge(g, id_sarah, id_david,  4.5); // Sarah envoie régulièrement des emails à David
    add_edge(g, id_david, id_sarah,  3.8); // Réciprocité élevée
    add_edge(g, id_sarah, id_alex,   2.5); // Sarah communique avec le CEO
    add_edge(g, id_alex,  id_claire, 3.0); // CEO envoie des directives aux RH
    add_edge(g, id_claire, id_mark,  1.8); // RH communique avec les Ventes
    add_edge(g, id_mark,  id_david,  2.0); // Ventes envoie aux Tech Leads
    add_edge(g, id_david, id_alex,   1.2);

    // 4. Calcul des Métriques ONA en C
    calculate_pagerank(g, 25, 0.85);
    calculate_betweenness(g);

    // 5. Affichage des Leaders Informels (PageRank)
    printf("\n🏆 --- Leaders Informels Détectés (PageRank C Engine) ---\n");
    for (int i = 0; i < g->num_nodes; i++) {
        printf("  - %-15s | %-12s | PageRank: %.4f | Intermédiarité: %.1f\n",
               g->nodes[i].name, g->nodes[i].dept, g->nodes[i].page_rank, g->nodes[i].betweenness);
    }

    // 6. Démonstration des Simulations (Queue & Graph Traversal)
    simulate_propagation(g, id_sarah, 3);
    simulate_resignation(g, id_sarah);

    // 7. Lancement du Serveur HTTP C ou Mode CLI
    if (argc > 1 && strcmp(argv[1], "--cli") == 0) {
        printf("\n✅ Exécution terminée en mode CLI.\n");
    } else {
        // Démarre le serveur HTTP pour alimenter le frontend React
        start_http_server(g, 8080);
    }

    // Libération de la mémoire
    free_graph(g);
    return 0;
}
