#include "../include/hashtable.h"

HashTable* create_hash_table(int capacity) {
    HashTable* ht = (HashTable*)malloc(sizeof(HashTable));
    if (!ht) return NULL;

    ht->capacity = capacity > 0 ? capacity : 1024;
    ht->size = 0;
    ht->buckets = (HashEntry**)calloc(ht->capacity, sizeof(HashEntry*));

    return ht;
}

// Algorithme de hachage djb2 de Dan Bernstein (extrêmement rapide et efficace pour les chaînes)
unsigned long hash_djb2(const char* str) {
    unsigned long hash = 5381;
    int c;
    while ((c = *str++)) {
        hash = ((hash << 5) + hash) + c; /* hash * 33 + c */
    }
    return hash;
}

void ht_insert(HashTable* ht, const char* email, int node_id) {
    if (!ht || !email) return;

    unsigned long bucket_idx = hash_djb2(email) % ht->capacity;
    HashEntry* current = ht->buckets[bucket_idx];

    // Vérifier si la clé existe déjà
    while (current) {
        if (strcmp(current->email, email) == 0) {
            current->node_id = node_id; // Mise à jour
            return;
        }
        current = current->next;
    }

    // Nouvelle entrée (insertion en tête de liste)
    HashEntry* new_entry = (HashEntry*)malloc(sizeof(HashEntry));
    strncpy(new_entry->email, email, MAX_EMAIL_LEN - 1);
    new_entry->email[MAX_EMAIL_LEN - 1] = '\0';
    new_entry->node_id = node_id;
    new_entry->next = ht->buckets[bucket_idx];

    ht->buckets[bucket_idx] = new_entry;
    ht->size++;
}

int ht_get(HashTable* ht, const char* email) {
    if (!ht || !email) return -1;

    unsigned long bucket_idx = hash_djb2(email) % ht->capacity;
    HashEntry* current = ht->buckets[bucket_idx];

    while (current) {
        if (strcmp(current->email, email) == 0) {
            return current->node_id;
        }
        current = current->next;
    }

    return -1; // Non trouvé
}

void free_hash_table(HashTable* ht) {
    if (!ht) return;

    for (int i = 0; i < ht->capacity; i++) {
        HashEntry* current = ht->buckets[i];
        while (current) {
            HashEntry* temp = current;
            current = current->next;
            free(temp);
        }
    }

    free(ht->buckets);
    free(ht);
}
