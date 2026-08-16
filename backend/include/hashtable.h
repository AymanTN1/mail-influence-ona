#ifndef HASHTABLE_H
#define HASHTABLE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>

#define MAX_EMAIL_LEN 128

// Entrée dans la table de hachage (Chaînage pour collisions)
typedef struct HashEntry {
    char email[MAX_EMAIL_LEN];
    int node_id;
    struct HashEntry* next;
} HashEntry;

// Table de Hachage en C (Indexation O(1) des adresses emails)
typedef struct {
    HashEntry** buckets;
    int capacity;
    int size;
} HashTable;

HashTable* create_hash_table(int capacity);
unsigned long hash_djb2(const char* str);
void ht_insert(HashTable* ht, const char* email, int node_id);
int ht_get(HashTable* ht, const char* email);
void free_hash_table(HashTable* ht);

#endif // HASHTABLE_H
