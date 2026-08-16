#include "../include/stack.h"

Stack* create_stack(int initial_capacity) {
    Stack* s = (Stack*)malloc(sizeof(Stack));
    if (!s) return NULL;

    s->capacity = initial_capacity > 0 ? initial_capacity : 16;
    s->items = (int*)malloc(s->capacity * sizeof(int));
    s->top = -1;

    return s;
}

void push(Stack* s, int item) {
    if (s->top + 1 >= s->capacity) {
        s->capacity *= 2;
        s->items = (int*)realloc(s->items, s->capacity * sizeof(int));
    }
    s->top++;
    s->items[s->top] = item;
}

int pop(Stack* s) {
    if (is_stack_empty(s)) {
        return -1;
    }
    int item = s->items[s->top];
    s->top--;
    return item;
}

int peek(Stack* s) {
    if (is_stack_empty(s)) {
        return -1;
    }
    return s->items[s->top];
}

bool is_stack_empty(Stack* s) {
    return s->top == -1;
}

void free_stack(Stack* s) {
    if (!s) return;
    if (s->items) free(s->items);
    free(s);
}
