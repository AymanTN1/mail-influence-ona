#include "../include/csv_parser.h"
#include <time.h>

void generate_enterprise_mock_dataset(const char* filepath, int num_records) {
    FILE* fp = fopen(filepath, "w");
    if (!fp) return;

    fprintf(fp, "sender_email,sender_name,sender_dept,sender_role,recipient_email,recipient_name,recipient_dept,recipient_role,weight\n");

    const char* names[] = {
        "Sarah Connor", "Alex Mercer", "David Miller", "Claire Bennet", "Mark Sloan",
        "Elena Rostova", "James Vance", "Sophia Lin", "Lucas Scott", "Emma Watson",
        "Michael Chang", "Rachel Green", "Harvey Specter", "Donna Paulsen", "Louis Litt"
    };

    const char* emails[] = {
        "sarah@corp.com", "alex@corp.com", "david@corp.com", "claire@corp.com", "mark@corp.com",
        "elena@corp.com", "james@corp.com", "sophia@corp.com", "lucas@corp.com", "emma@corp.com",
        "michael@corp.com", "rachel@corp.com", "harvey@corp.com", "donna@corp.com", "louis@corp.com"
    };

    const char* depts[] = {
        "Engineering", "Executive", "Engineering", "HR", "Sales",
        "Engineering", "Product", "Product", "Sales", "Design",
        "Finance", "HR", "Legal", "Executive", "Legal"
    };

    const char* roles[] = {
        "CTO", "CEO", "Tech Lead", "HR Director", "VP Sales",
        "Senior Dev", "Head of Product", "Product Owner", "Sales Lead", "Lead UI/UX",
        "CFO", "Talent Lead", "General Counsel", "Chief of Staff", "Senior Partner"
    };

    int total_employees = sizeof(names) / sizeof(names[0]);

    // Définition de 3 Tribus Informelles réalistes
    int tribe1[] = {0, 2, 5, 7, 9};       // Tech & Product Innovation
    int tribe2[] = {1, 6, 10, 12, 13, 14}; // Executive, Finance & Legal
    int tribe3[] = {3, 4, 8, 11};         // People, HR & Sales Growth

    int s1 = sizeof(tribe1) / sizeof(tribe1[0]);
    int s2 = sizeof(tribe2) / sizeof(tribe2[0]);
    int s3 = sizeof(tribe3) / sizeof(tribe3[0]);

    srand((unsigned int)time(NULL));
    for (int i = 0; i < num_records; i++) {
        int src, tgt;
        double weight;

        // 75% d'échanges intra-communautaires forts, 25% de ponts transversaux
        int r = rand() % 100;
        if (r < 35) {
            // Échange au sein de la Tribu 1
            src = tribe1[rand() % s1];
            tgt = tribe1[rand() % s1];
            while (tgt == src) tgt = tribe1[rand() % s1];
            weight = 2.5 + ((rand() % 35) / 10.0);
        } else if (r < 65) {
            // Échange au sein de la Tribu 2
            src = tribe2[rand() % s2];
            tgt = tribe2[rand() % s2];
            while (tgt == src) tgt = tribe2[rand() % s2];
            weight = 2.5 + ((rand() % 35) / 10.0);
        } else if (r < 85) {
            // Échange au sein de la Tribu 3
            src = tribe3[rand() % s3];
            tgt = tribe3[rand() % s3];
            while (tgt == src) tgt = tribe3[rand() % s3];
            weight = 2.5 + ((rand() % 35) / 10.0);
        } else {
            // Ponts transversaux inter-tribus
            src = rand() % total_employees;
            tgt = rand() % total_employees;
            while (tgt == src) tgt = rand() % total_employees;
            weight = 1.0 + ((rand() % 25) / 10.0);
        }

        fprintf(fp, "%s,%s,%s,%s,%s,%s,%s,%s,%.2f\n",
            emails[src], names[src], depts[src], roles[src],
            emails[tgt], names[tgt], depts[tgt], roles[tgt],
            weight);
    }

    fclose(fp);
}

static inline char* fast_next_field(char** cursor) {
    char* start = *cursor;
    if (!start || *start == '\0') return NULL;
    char* comma = strchr(start, ',');
    if (comma) {
        *comma = '\0';
        *cursor = comma + 1;
    } else {
        char* nl = strpbrk(start, "\r\n");
        if (nl) *nl = '\0';
        *cursor = NULL;
    }
    return start;
}

Graph* ingest_csv_and_benchmark(const char* filepath, BenchmarkResult* bench) {
    if (!bench) return NULL;
    memset(bench, 0, sizeof(BenchmarkResult));

    clock_t start_total = clock();
    FILE* fp = fopen(filepath, "r");
    if (!fp) {
        // Générer le jeu de données automatiquement si absent
        generate_enterprise_mock_dataset(filepath, 2500);
        fp = fopen(filepath, "r");
        if (!fp) return NULL;
    }

    Graph* g = create_graph();
    HashTable* ht = create_hash_table(2048);

    char line[1024];
    int line_count = 0;

    clock_t start_parse = clock();

    // Ignorer la ligne d'en-tête
    if (fgets(line, sizeof(line), fp) != NULL) {
        // En-tête passée
    }

    while (fgets(line, sizeof(line), fp)) {
        char* cursor = line;
        char* from_email = fast_next_field(&cursor);
        char* from_name  = fast_next_field(&cursor);
        char* from_dept  = fast_next_field(&cursor);
        char* from_role  = fast_next_field(&cursor);
        char* to_email   = fast_next_field(&cursor);
        char* to_name    = fast_next_field(&cursor);
        char* to_dept    = fast_next_field(&cursor);
        char* to_role    = fast_next_field(&cursor);
        char* weight_str = fast_next_field(&cursor);

        if (!from_email || !to_email) continue;

        double weight = weight_str ? atof(weight_str) : 1.0;

        // Indexation O(1) dans la Hash Table
        int src_id = ht_get(ht, from_email);
        if (src_id == -1) {
            src_id = add_node(g, from_name ? from_name : "Unknown", from_email, from_dept ? from_dept : "General", from_role ? from_role : "Member");
            ht_insert(ht, from_email, src_id);
        }

        int tgt_id = ht_get(ht, to_email);
        if (tgt_id == -1) {
            tgt_id = add_node(g, to_name ? to_name : "Unknown", to_email, to_dept ? to_dept : "General", to_role ? to_role : "Member");
            ht_insert(ht, to_email, tgt_id);
        }

        add_edge(g, src_id, tgt_id, weight);
        line_count++;
    }

    fclose(fp);
    clock_t end_parse = clock();

    // Calcul de PageRank & Betweenness avec algorithmes optimisés
    clock_t start_pr = clock();
    calculate_pagerank(g, 25, 0.85);
    calculate_betweenness(g);
    clock_t end_pr = clock();

    clock_t end_total = clock();

    bench->rows_processed = line_count;
    bench->total_nodes = g->num_nodes;
    bench->total_edges = g->num_edges;
    bench->parse_time_ms = ((double)(end_parse - start_parse) / CLOCKS_PER_SEC) * 1000.0;
    bench->pagerank_time_ms = ((double)(end_pr - start_pr) / CLOCKS_PER_SEC) * 1000.0;
    bench->total_time_ms = ((double)(end_total - start_total) / CLOCKS_PER_SEC) * 1000.0;

    free_hash_table(ht);
    return g;
}
