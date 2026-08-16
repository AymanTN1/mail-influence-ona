#include "../include/queue.h"

Queue* create_queue(int initial_capacity) {
    Queue* q = (Queue*)malloc(sizeof(Queue));
    if (!q) return NULL;

    q->capacity = initial_capacity > 0 ? initial_capacity : 16;
    q->items = (int*)malloc(q->capacity * sizeof(int));
    q->front = 0;
    q->rear = -1;
    q->count = 0;

    return q;
}

void enqueue(Queue* q, int item) {
    if (!q) return;
    if (q->count >= q->capacity) {
        int new_cap = q->capacity * 2;
        int* new_items = (int*)malloc(new_cap * sizeof(int));
        for (int i = 0; i < q->count; i++) {
            new_items[i] = q->items[(q->front + i) % q->capacity];
        }
        free(q->items);
        q->items = new_items;
        q->capacity = new_cap;
        q->front = 0;
        q->rear = q->count - 1;
    }

    q->rear = (q->rear + 1) % q->capacity;
    q->items[q->rear] = item;
    q->count++;
}

int dequeue(Queue* q) {
    if (!q || is_queue_empty(q)) {
        return -1;
    }

    int item = q->items[q->front];
    q->front = (q->front + 1) % q->capacity;
    q->count--;
    return item;
}

bool is_queue_empty(Queue* q) {
    return !q || q->count == 0;
}

void free_queue(Queue* q) {
    if (!q) return;
    if (q->items) free(q->items);
    free(q);
}
