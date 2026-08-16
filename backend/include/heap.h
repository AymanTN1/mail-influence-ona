#ifndef HEAP_H
#define HEAP_H

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

#define MAX_STR 64

// Élément stocké dans le Tas Binaire Max (Max-Heap)
typedef struct {
    int node_id;
    char name[MAX_STR];
    char dept[MAX_STR];
    char role[MAX_STR];
    double score; // Score de Surcharge / Bus Factor
} HeapItem;

// Structure du Tas Binaire Max (Max-Heap)
typedef struct {
    HeapItem* items;
    int size;
    int capacity;
} MaxHeap;

MaxHeap* create_max_heap(int initial_capacity);
void heap_push(MaxHeap* h, int node_id, const char* name, const char* dept, const char* role, double score);
HeapItem heap_pop(MaxHeap* h);
bool is_heap_empty(MaxHeap* h);
void free_max_heap(MaxHeap* h);

#endif // HEAP_H
