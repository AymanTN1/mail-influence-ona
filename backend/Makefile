CC = gcc
CFLAGS = -O3 -flto -march=native -funroll-loops -fno-math-errno -fno-trapping-math -fomit-frame-pointer -Wall -Wextra -std=c11 -Iinclude
SRC = src/graph.c src/queue.c src/stack.c src/heap.c src/hashtable.c src/csv_parser.c src/ona_algorithms.c src/http_server.c src/main.c
OBJ = $(SRC:.c=.o)
TARGET = ona_backend

all: $(TARGET)

$(TARGET): $(SRC)
	$(CC) $(CFLAGS) $(SRC) -o $(TARGET)

clean:
	rm -f $(TARGET) src/*.o

.PHONY: all clean
