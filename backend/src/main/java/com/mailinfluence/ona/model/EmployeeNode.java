package com.mailinfluence.ona.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

@Node("Employee")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeNode {

    @Id
    private String emailHash; // Hash SHA-256 ou Email anonymisé (ex: alice@corp.com)

    private String rawEmail;
    private String name;
    private String department; // ex: Engineering, Sales, HR, Executive
    private String role;       // ex: Senior Dev, Team Lead, VP

    // ONA Centrality Metrics (Populated by Graph Engine)
    private Double pageRankScore;
    private Double betweennessScore;
    private Integer inDegree;
    private Integer outDegree;
    private Integer communityId; // Louvain Community Cluster ID
}
