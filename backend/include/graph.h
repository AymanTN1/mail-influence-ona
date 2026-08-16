#ifndef GRAPH_H
#define GRAPH_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_STR 64

// Représentation d'un Employé (Nœud du Graphe ONA)
typedef struct {
    int id;
    char name[MAX_STR];
    char email[MAX_STR];
    char dept[MAX_STR];
    char role[MAX_STR];
    double page_rank;
    double betweenness;
} Node;

// Représentation d'une Interaction Email (Arête Orientée)
typedef struct {
    int source; // ID du noeud émetteur
    int target; // ID du noeud destinataire
    double weight; // Poids calculé (fréquence, TO/CC)
} Edge;

// Structure du Graphe ONA (Tableaux Dynamiques Simples)
typedef struct {
    Node* nodes;
    int num_nodes;
    int capacity_nodes;

    Edge* edges;
    int num_edges;
    int capacity_edges;
} Graph;

// Prototypes de fonctions
Graph* create_graph(void);
int add_node(Graph* g, const char* name, const char* email, const char* dept, const char* role);
void add_edge(Graph* g, int source_id, int target_id, double weight);
int find_node_by_email(Graph* g, const char* email);
void free_graph(Graph* g);

#endif // GRAPH_H
