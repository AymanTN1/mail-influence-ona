#ifndef STACK_H
#define STACK_H

#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

// Structure simple d'une Pile (Stack LIFO) pour le parcours DFS
typedef struct {
    int* items;
    int top;
    int capacity;
} Stack;

Stack* create_stack(int initial_capacity);
void push(Stack* s, int item);
int pop(Stack* s);
int peek(Stack* s);
bool is_stack_empty(Stack* s);
void free_stack(Stack* s);

#endif // STACK_H
