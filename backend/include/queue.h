#ifndef QUEUE_H
#define QUEUE_H

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Structure simple d'une File (Queue FIFO) pour le parcours BFS
typedef struct {
    int* items;
    int front;
    int rear;
    int capacity;
    int count;
} Queue;

Queue* create_queue(int initial_capacity);
void enqueue(Queue* q, int item);
int dequeue(Queue* q);
bool is_queue_empty(Queue* q);
void free_queue(Queue* q);

#endif // QUEUE_H
