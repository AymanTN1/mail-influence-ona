#include "../include/http_server.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <signal.h>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
typedef int socklen_t;
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#define SOCKET int
#define INVALID_SOCKET -1
#define SOCKET_ERROR -1
#define closesocket close
#endif

static void send_json_response(SOCKET client_fd, Graph* g) {
    char response_body[8192];
    int offset = 0;

    offset += snprintf(response_body + offset, sizeof(response_body) - offset, "{\n  \"nodes\": [\n");

    for (int i = 0; i < g->num_nodes; i++) {
        Node* n = &g->nodes[i];
        offset += snprintf(response_body + offset, sizeof(response_body) - offset,
            "    {\"id\": %d, \"name\": \"%s\", \"email\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"pageRank\": %.4f, \"betweenness\": %.1f}%s\n",
            n->id, n->name, n->email, n->dept, n->role, n->page_rank, n->betweenness,
            (i < g->num_nodes - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, sizeof(response_body) - offset, "  ],\n  \"edges\": [\n");

    for (int e = 0; e < g->num_edges; e++) {
        Edge* ed = &g->edges[e];
        offset += snprintf(response_body + offset, sizeof(response_body) - offset,
            "    {\"source\": %d, \"target\": %d, \"weight\": %.2f}%s\n",
            ed->source, ed->target, ed->weight,
            (e < g->num_edges - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, sizeof(response_body) - offset, "  ],\n  \"silos\": [\n");

    SiloReport report = analyze_department_silos(g);
    for (int d = 0; d < report.num_depts; d++) {
        DeptMetrics* dm = &report.depts[d];
        offset += snprintf(response_body + offset, sizeof(response_body) - offset,
            "    {\"dept\": \"%s\", \"members\": %d, \"internalFlux\": %.2f, \"externalFlux\": %.2f, \"isolationScore\": %.1f, \"isSilo\": %s}%s\n",
            dm->name, dm->member_count, dm->internal_flux, dm->external_flux, dm->isolation_score,
            dm->is_silo ? "true" : "false",
            (d < report.num_depts - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, sizeof(response_body) - offset, "  ],\n  \"busFactor\": [\n");

    BusFactorReport bf = calculate_bus_factor_and_overload(g);
    for (int b = 0; b < bf.count; b++) {
        BusFactorMember* bm = &bf.members[b];
        offset += snprintf(response_body + offset, sizeof(response_body) - offset,
            "    {\"nodeId\": %d, \"name\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"inFlux\": %.2f, \"outFlux\": %.2f, \"overloadScore\": %.1f, \"isCritical\": %s}%s\n",
            bm->node_id, bm->name, bm->dept, bm->role, bm->in_flux, bm->out_flux, bm->overload_score,
            bm->is_critical ? "true" : "false",
            (b < bf.count - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, sizeof(response_body) - offset, "  ]\n}\n");

    char full_response[10240];
    int total_len = snprintf(full_response, sizeof(full_response),
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n\r\n%s",
        offset, response_body);

    send(client_fd, full_response, total_len, 0);
}

void start_http_server(Graph* g, int port) {
#ifndef _WIN32
    signal(SIGPIPE, SIG_IGN);
#else
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);
#endif

    SOCKET server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd == INVALID_SOCKET) {
        perror("Erreur création socket");
        return;
    }

    int opt = 1;
    setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, (const char*)&opt, sizeof(opt));

    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(port);

    if (bind(server_fd, (struct sockaddr*)&address, sizeof(address)) == SOCKET_ERROR) {
        perror("Erreur bind");
        closesocket(server_fd);
        return;
    }

    if (listen(server_fd, 10) == SOCKET_ERROR) {
        perror("Erreur listen");
        closesocket(server_fd);
        return;
    }

    printf("\n🚀 Serveur Backend C démarré sur http://localhost:%d\n", port);
    printf("🌐 Point d'accès API JSON ONA disponible: http://localhost:%d/api/ona\n\n", port);
    fflush(stdout);

    // Servir en boucle les requêtes HTTP du frontend
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        SOCKET client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd != INVALID_SOCKET) {
            char buffer[1024] = {0};
            recv(client_fd, buffer, sizeof(buffer) - 1, 0);
            
            // OPTIONS request (CORS Preflight)
            if (strncmp(buffer, "OPTIONS", 7) == 0) {
                const char* cors_response = 
                    "HTTP/1.1 204 No Content\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                    "Access-Control-Allow-Headers: Content-Type\r\n"
                    "Connection: close\r\n\r\n";
                send(client_fd, cors_response, strlen(cors_response), 0);
            } else {
                send_json_response(client_fd, g);
            }
            closesocket(client_fd);
        }
    }

    closesocket(server_fd);
#ifdef _WIN32
    WSACleanup();
#endif
}
