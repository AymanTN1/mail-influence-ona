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
    if (q->count >= q->capacity) {
        q->capacity *= 2;
        q->items = (int*)realloc(q->items, q->capacity * sizeof(int));
    }

    q->rear = (q->rear + 1);
    q->items[q->rear] = item;
    q->count++;
}

int dequeue(Queue* q) {
    if (is_queue_empty(q)) {
        return -1;
    }

    int item = q->items[q->front];
    q->front++;
    q->count--;
    return item;
}

bool is_queue_empty(Queue* q) {
    return q->count == 0;
}

void free_queue(Queue* q) {
    if (!q) return;
    if (q->items) free(q->items);
    free(q);
}
