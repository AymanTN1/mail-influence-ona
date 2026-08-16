#include "../include/graph.h"

Graph* create_graph(void) {
    Graph* g = (Graph*)malloc(sizeof(Graph));
    if (!g) return NULL;
    
    g->capacity_nodes = 16;
    g->num_nodes = 0;
    g->nodes = (Node*)malloc(g->capacity_nodes * sizeof(Node));

    g->capacity_edges = 32;
    g->num_edges = 0;
    g->edges = (Edge*)malloc(g->capacity_edges * sizeof(Edge));

    return g;
}

int add_node(Graph* g, const char* name, const char* email, const char* dept, const char* role) {
    // Vérifier si le nœud existe déjà
    int existing_id = find_node_by_email(g, email);
    if (existing_id != -1) {
        return existing_id;
    }

    // Réallocation si la capacité est atteinte
    if (g->num_nodes >= g->capacity_nodes) {
        g->capacity_nodes *= 2;
        g->nodes = (Node*)realloc(g->nodes, g->capacity_nodes * sizeof(Node));
    }

    int id = g->num_nodes;
    g->nodes[id].id = id;
    strncpy(g->nodes[id].name, name, MAX_STR - 1);
    strncpy(g->nodes[id].email, email, MAX_STR - 1);
    strncpy(g->nodes[id].dept, dept, MAX_STR - 1);
    strncpy(g->nodes[id].role, role, MAX_STR - 1);
    g->nodes[id].page_rank = 0.0;
    g->nodes[id].betweenness = 0.0;

    g->num_nodes++;
    return id;
}

void add_edge(Graph* g, int source_id, int target_id, double weight) {
    if (source_id < 0 || source_id >= g->num_nodes || target_id < 0 || target_id >= g->num_nodes) {
        return;
    }

    // Réallocation d'arêtes si nécessaire
    if (g->num_edges >= g->capacity_edges) {
        g->capacity_edges *= 2;
        g->edges = (Edge*)realloc(g->edges, g->capacity_edges * sizeof(Edge));
    }

    g->edges[g->num_edges].source = source_id;
    g->edges[g->num_edges].target = target_id;
    g->edges[g->num_edges].weight = weight;
    g->num_edges++;
}

int find_node_by_email(Graph* g, const char* email) {
    for (int i = 0; i < g->num_nodes; i++) {
        if (strcmp(g->nodes[i].email, email) == 0) {
            return i;
        }
    }
    return -1;
}

void free_graph(Graph* g) {
    if (!g) return;
    if (g->nodes) free(g->nodes);
    if (g->edges) free(g->edges);
    free(g);
}
