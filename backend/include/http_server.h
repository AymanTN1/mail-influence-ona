#ifndef HTTP_SERVER_H
#define HTTP_SERVER_H

#include "graph.h"
#include "ona_algorithms.h"

// Démarre un serveur Web HTTP C simple sur le port spécifié
void start_http_server(Graph* g, int port);

#endif // HTTP_SERVER_H
