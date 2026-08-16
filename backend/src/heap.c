#include "../include/heap.h"

MaxHeap* create_max_heap(int initial_capacity) {
    MaxHeap* h = (MaxHeap*)malloc(sizeof(MaxHeap));
    if (!h) return NULL;

    h->capacity = initial_capacity > 0 ? initial_capacity : 16;
    h->size = 0;
    h->items = (HeapItem*)malloc(h->capacity * sizeof(HeapItem));

    return h;
}

static void swap_items(HeapItem* a, HeapItem* b) {
    HeapItem temp = *a;
    *a = *b;
    *b = temp;
}

static void heapify_up(MaxHeap* h, int index) {
    while (index > 0) {
        int parent = (index - 1) / 2;
        if (h->items[index].score > h->items[parent].score) {
            swap_items(&h->items[index], &h->items[parent]);
            index = parent;
        } else {
            break;
        }
    }
}

static void heapify_down(MaxHeap* h, int index) {
    while (1) {
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        int largest = index;

        if (left < h->size && h->items[left].score > h->items[largest].score) {
            largest = left;
        }
        if (right < h->size && h->items[right].score > h->items[largest].score) {
            largest = right;
        }

        if (largest != index) {
            swap_items(&h->items[index], &h->items[largest]);
            index = largest;
        } else {
            break;
        }
    }
}

void heap_push(MaxHeap* h, int node_id, const char* name, const char* dept, const char* role, double score) {
    if (h->size >= h->capacity) {
        h->capacity *= 2;
        h->items = (HeapItem*)realloc(h->items, h->capacity * sizeof(HeapItem));
    }

    int index = h->size;
    h->items[index].node_id = node_id;
    strncpy(h->items[index].name, name, MAX_STR - 1);
    strncpy(h->items[index].dept, dept, MAX_STR - 1);
    strncpy(h->items[index].role, role, MAX_STR - 1);
    h->items[index].score = score;

    h->size++;
    heapify_up(h, index);
}

HeapItem heap_pop(MaxHeap* h) {
    HeapItem empty = {-1, "", "", "", 0.0};
    if (is_heap_empty(h)) {
        return empty;
    }

    HeapItem root = h->items[0];
    h->items[0] = h->items[h->size - 1];
    h->size--;

    if (h->size > 0) {
        heapify_down(h, 0);
    }

    return root;
}

bool is_heap_empty(MaxHeap* h) {
    return h->size == 0;
}

void free_max_heap(MaxHeap* h) {
    if (!h) return;
    if (h->items) free(h->items);
    free(h);
}
