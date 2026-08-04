package com.mailinfluence.ona.controller;

import com.mailinfluence.ona.model.EmployeeNode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/graph")
@CrossOrigin(origins = "*")
public class GraphController {

    /**
     * Endpoint pour récupérer les nœuds et arêtes du graphe d'entreprise.
     */
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getGraphData() {
        Map<String, Object> response = new HashMap<>();

        List<EmployeeNode> sampleNodes = List.of(
            EmployeeNode.builder().emailHash("alex@corp.com").name("Alex Mercer").department("Executive").role("CEO").pageRankScore(0.245).betweennessScore(12.5).communityId(1).build(),
            EmployeeNode.builder().emailHash("sarah@corp.com").name("Sarah Connor").department("Engineering").role("CTO").pageRankScore(0.312).betweennessScore(18.2).communityId(1).build(),
            EmployeeNode.builder().emailHash("david@corp.com").name("David Miller").department("Engineering").role("Tech Lead").pageRankScore(0.189).betweennessScore(22.4).communityId(1).build(),
            EmployeeNode.builder().emailHash("claire@corp.com").name("Claire Bennet").department("HR").role("HR Director").pageRankScore(0.145).betweennessScore(15.0).communityId(2).build(),
            EmployeeNode.builder().emailHash("mark@corp.com").name("Mark Sloan").department("Sales").role("VP Sales").pageRankScore(0.109).betweennessScore(8.1).communityId(3).build()
        );

        response.put("nodes", sampleNodes);
        response.put("totalNodes", sampleNodes.size());
        response.put("status", "SUCCESS");

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint pour le Top 5 des employés les plus influents (PageRank).
     */
    @GetMapping("/influencers")
    public ResponseEntity<List<EmployeeNode>> getTopInfluencers() {
        List<EmployeeNode> topInfluencers = List.of(
            EmployeeNode.builder().emailHash("sarah@corp.com").name("Sarah Connor").department("Engineering").pageRankScore(0.312).betweennessScore(18.2).build(),
            EmployeeNode.builder().emailHash("alex@corp.com").name("Alex Mercer").department("Executive").pageRankScore(0.245).betweennessScore(12.5).build(),
            EmployeeNode.builder().emailHash("david@corp.com").name("David Miller").department("Engineering").pageRankScore(0.189).betweennessScore(22.4).build()
        );
        return ResponseEntity.ok(topInfluencers);
    }
}
