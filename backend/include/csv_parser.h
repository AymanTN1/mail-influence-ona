#ifndef CSV_PARSER_H
#define CSV_PARSER_H

#include "graph.h"
#include "hashtable.h"
#include "ona_algorithms.h"

// Métriques de Benchmark de Performance
typedef struct {
    int rows_processed;
    int total_nodes;
    int total_edges;
    double parse_time_ms;
    double pagerank_time_ms;
    double total_time_ms;
} BenchmarkResult;

// Prototypes
Graph* ingest_csv_and_benchmark(const char* filepath, BenchmarkResult* bench);
void generate_enterprise_mock_dataset(const char* filepath, int num_records);

#endif // CSV_PARSER_H
