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

static void send_json_response(SOCKET client_fd, Graph* g, BenchmarkResult* bench) {
    int buf_size = 131072;
    char* response_body = (char*)malloc(buf_size);
    char* full_response = (char*)malloc(buf_size + 1024);
    if (!response_body || !full_response) {
        if (response_body) free(response_body);
        if (full_response) free(full_response);
        return;
    }

    int offset = 0;
    offset += snprintf(response_body + offset, buf_size - offset, "{\n  \"nodes\": [\n");

    for (int i = 0; i < g->num_nodes; i++) {
        Node* n = &g->nodes[i];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"id\": %d, \"name\": \"%s\", \"email\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"pageRank\": %.4f, \"betweenness\": %.1f}%s\n",
            n->id, n->name, n->email, n->dept, n->role, n->page_rank, n->betweenness,
            (i < g->num_nodes - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"edges\": [\n");

    int max_edges_export = (g->num_edges > 50) ? 50 : g->num_edges;
    for (int e = 0; e < max_edges_export; e++) {
        Edge* ed = &g->edges[e];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"source\": %d, \"target\": %d, \"weight\": %.2f}%s\n",
            ed->source, ed->target, ed->weight,
            (e < max_edges_export - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"silos\": [\n");

    SiloReport report = analyze_department_silos(g);
    for (int d = 0; d < report.num_depts; d++) {
        DeptMetrics* dm = &report.depts[d];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"dept\": \"%s\", \"members\": %d, \"internalFlux\": %.2f, \"externalFlux\": %.2f, \"isolationScore\": %.1f, \"isSilo\": %s}%s\n",
            dm->name, dm->member_count, dm->internal_flux, dm->external_flux, dm->isolation_score,
            dm->is_silo ? "true" : "false",
            (d < report.num_depts - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"busFactor\": [\n");

    BusFactorReport bf = calculate_bus_factor_and_overload(g);
    for (int b = 0; b < bf.count; b++) {
        BusFactorMember* bm = &bf.members[b];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"nodeId\": %d, \"name\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"inFlux\": %.2f, \"outFlux\": %.2f, \"overloadScore\": %.1f, \"isCritical\": %s}%s\n",
            bm->node_id, bm->name, bm->dept, bm->role, bm->in_flux, bm->out_flux, bm->overload_score,
            bm->is_critical ? "true" : "false",
            (b < bf.count - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"boundarySpanners\": [\n");

    BoundarySpannerReport bsr = calculate_boundary_spanners(g);
    for (int s = 0; s < bsr.count; s++) {
        BoundarySpanner* bs = &bsr.spanners[s];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"nodeId\": %d, \"name\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"betweenness\": %.1f, \"normalizedBetweenness\": %.2f, \"externalDeptsCount\": %d, \"bridgeScore\": %.1f, \"isKeyBroker\": %s}%s\n",
            bs->node_id, bs->name, bs->dept, bs->role, bs->betweenness, bs->normalized_betweenness, bs->external_depts_count, bs->bridge_score,
            bs->is_key_broker ? "true" : "false",
            (s < bsr.count - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"communities\": [\n");

    CommunityReport cr = calculate_graph_communities(g);
    for (int c = 0; c < cr.num_communities; c++) {
        Community* comm = &cr.communities[c];
        offset += snprintf(response_body + offset, buf_size - offset,
            "    {\"id\": %d, \"label\": \"%s\", \"memberCount\": %d, \"dominantDept\": \"%s\", \"internalFlux\": %.2f, \"externalFlux\": %.2f, \"cohesionScore\": %.1f, \"memberIds\": [",
            comm->id, comm->label, comm->member_count, comm->dominant_dept, comm->internal_flux, comm->external_flux, comm->cohesion_score);
        
        for (int m = 0; m < comm->member_count; m++) {
            offset += snprintf(response_body + offset, buf_size - offset, "%d%s",
                comm->member_ids[m], (m < comm->member_count - 1) ? ", " : "");
        }
        offset += snprintf(response_body + offset, buf_size - offset, "]}%s\n",
            (c < cr.num_communities - 1) ? "," : "");
    }

    if (bench) {
        offset += snprintf(response_body + offset, buf_size - offset, "  ],\n  \"benchmark\": {\n");
        offset += snprintf(response_body + offset, buf_size - offset,
            "    \"rowsProcessed\": %d,\n"
            "    \"totalNodes\": %d,\n"
            "    \"totalEdges\": %d,\n"
            "    \"parseTimeMs\": %.2f,\n"
            "    \"pageRankTimeMs\": %.2f,\n"
            "    \"totalTimeMs\": %.2f\n"
            "  },\n",
            bench->rows_processed, bench->total_nodes, bench->total_edges,
            bench->parse_time_ms, bench->pagerank_time_ms, bench->total_time_ms);
    } else {
        offset += snprintf(response_body + offset, buf_size - offset, "  ],\n");
    }

    AuditReport audit = generate_ona_audit_report(g);
    offset += snprintf(response_body + offset, buf_size - offset, "  \"auditReport\": {\n");
    offset += snprintf(response_body + offset, buf_size - offset,
        "    \"healthScore\": %.1f,\n"
        "    \"grade\": \"%s\",\n"
        "    \"density\": %.1f,\n"
        "    \"reciprocity\": %.1f,\n"
        "    \"crossDeptConnectivity\": %.1f,\n"
        "    \"resilienceScore\": %.1f,\n"
        "    \"executiveSummary\": \"%s\",\n"
        "    \"recommendations\": [\n",
        audit.health_score, audit.grade, audit.density, audit.reciprocity,
        audit.cross_dept_connectivity, audit.resilience_score, audit.executive_summary);

    for (int r = 0; r < audit.num_recommendations; r++) {
        offset += snprintf(response_body + offset, buf_size - offset,
            "      \"%s\"%s\n", audit.recommendations[r],
            (r < audit.num_recommendations - 1) ? "," : "");
    }

    offset += snprintf(response_body + offset, buf_size - offset, "    ]\n  },\n");

    CascadingFailureReport cfr = simulate_cascading_failure(g, NULL, 0);
    offset += snprintf(response_body + offset, buf_size - offset, "  \"cascadingSimulation\": {\n");
    offset += snprintf(response_body + offset, buf_size - offset,
        "    \"numResigned\": %d,\n"
        "    \"brokenEdgesCount\": %d,\n"
        "    \"lostFlux\": %.2f,\n"
        "    \"totalComponents\": %d,\n"
        "    \"isolatedEmployeesCount\": %d,\n"
        "    \"fragmentationIndex\": %.1f,\n"
        "    \"riskLevel\": \"%s\",\n"
        "    \"impactSummary\": \"%s\",\n"
        "    \"resignedNodeIds\": [",
        cfr.num_resigned, cfr.broken_edges_count, cfr.lost_flux, cfr.total_components,
        cfr.isolated_employees_count, cfr.fragmentation_index, cfr.risk_level, cfr.impact_summary);

    for (int r = 0; r < cfr.num_resigned; r++) {
        offset += snprintf(response_body + offset, buf_size - offset, "%d%s",
            cfr.resigned_node_ids[r], (r < cfr.num_resigned - 1) ? ", " : "");
    }
    offset += snprintf(response_body + offset, buf_size - offset, "],\n    \"components\": [\n");

    for (int c = 0; c < cfr.total_components && c < MAX_DEPTS; c++) {
        ConnectedComponent* comp = &cfr.components[c];
        offset += snprintf(response_body + offset, buf_size - offset,
            "      {\"sccId\": %d, \"memberCount\": %d, \"dominantDept\": \"%s\", \"isIsolated\": %s, \"memberIds\": [",
            comp->scc_id, comp->member_count, comp->dominant_dept, comp->is_isolated ? "true" : "false");
        for (int m = 0; m < comp->member_count; m++) {
            offset += snprintf(response_body + offset, buf_size - offset, "%d%s",
                comp->member_ids[m], (m < comp->member_count - 1) ? ", " : "");
        }
        offset += snprintf(response_body + offset, buf_size - offset, "]}%s\n",
            (c < cfr.total_components - 1 && c < MAX_DEPTS - 1) ? "," : "");
    }
    offset += snprintf(response_body + offset, buf_size - offset, "    ]\n  },\n");

    TemporalReport tr = calculate_temporal_ona(g);
    offset += snprintf(response_body + offset, buf_size - offset, "  \"temporalReport\": {\n");
    offset += snprintf(response_body + offset, buf_size - offset,
        "    \"healthScoreT1\": %.1f,\n"
        "    \"healthScoreT2\": %.1f,\n"
        "    \"deltaHealthScore\": %.1f,\n"
        "    \"crossDeptT1\": %.1f,\n"
        "    \"crossDeptT2\": %.1f,\n"
        "    \"deltaCrossDept\": %.1f,\n"
        "    \"risingLeadersCount\": %d,\n"
        "    \"decliningNodesCount\": %d,\n"
        "    \"executiveSummary\": \"%s\",\n"
        "    \"metrics\": [\n",
        tr.health_score_t1, tr.health_score_t2, tr.delta_health_score,
        tr.cross_dept_t1, tr.cross_dept_t2, tr.delta_cross_dept,
        tr.rising_leaders_count, tr.declining_nodes_count, tr.executive_summary);

    for (int m = 0; m < tr.count; m++) {
        TemporalNodeMetric* tnm = &tr.metrics[m];
        offset += snprintf(response_body + offset, buf_size - offset,
            "      {\"nodeId\": %d, \"name\": \"%s\", \"dept\": \"%s\", \"role\": \"%s\", \"pageRankT1\": %.4f, \"pageRankT2\": %.4f, \"deltaPageRank\": %.4f, \"deltaGrowthPct\": %.1f, \"inFluxT1\": %.1f, \"inFluxT2\": %.1f, \"deltaFlux\": %.1f, \"trend\": \"%s\"}%s\n",
            tnm->node_id, tnm->name, tnm->dept, tnm->role,
            tnm->pagerank_t1, tnm->pagerank_t2, tnm->delta_pagerank, tnm->delta_growth_pct,
            tnm->in_flux_t1, tnm->in_flux_t2, tnm->delta_flux, tnm->trend,
            (m < tr.count - 1) ? "," : "");
    }
    offset += snprintf(response_body + offset, buf_size - offset, "    ]\n  }\n}\n");

    int total_len = snprintf(full_response, buf_size + 1024,
        "HTTP/1.1 200 OK\r\n"
        "Content-Type: application/json\r\n"
        "Access-Control-Allow-Origin: *\r\n"
        "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
        "Access-Control-Allow-Headers: Content-Type\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n\r\n%s",
        offset, response_body);

    send(client_fd, full_response, total_len, 0);

    free(response_body);
    free(full_response);
}

void start_http_server(Graph* g, BenchmarkResult* bench, int port) {
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

    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        SOCKET client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd != INVALID_SOCKET) {
            char buffer[1024] = {0};
            recv(client_fd, buffer, sizeof(buffer) - 1, 0);
            
            if (strncmp(buffer, "OPTIONS", 7) == 0) {
                const char* cors_response = 
                    "HTTP/1.1 204 No Content\r\n"
                    "Access-Control-Allow-Origin: *\r\n"
                    "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                    "Access-Control-Allow-Headers: Content-Type\r\n"
                    "Connection: close\r\n\r\n";
                send(client_fd, cors_response, strlen(cors_response), 0);
            } else {
                send_json_response(client_fd, g, bench);
            }
#ifndef _WIN32
            shutdown(client_fd, SHUT_RDWR);
#endif
            closesocket(client_fd);
        }
    }

    closesocket(server_fd);
#ifdef _WIN32
    WSACleanup();
#endif
}
