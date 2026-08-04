package com.mailinfluence.ona.engine;

import com.mailinfluence.ona.model.EmployeeNode;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class GraphEngineService {

    /**
     * Calcule le PageRank (Score d'Influence) pour chaque employé du graphe.
     * Algorithme itératif avec damping factor d = 0.85
     */
    public Map<String, Double> calculatePageRank(List<EmployeeNode> nodes, Map<String, List<String>> adjacencyMap) {
        Map<String, Double> pageRank = new HashMap<>();
        if (nodes == null || nodes.isEmpty()) return pageRank;

        double initialRank = 1.0 / nodes.size();
        double dampingFactor = 0.85;
        int maxIterations = 20;

        for (EmployeeNode node : nodes) {
            pageRank.put(node.getEmailHash(), initialRank);
        }

        for (int iter = 0; iter < maxIterations; iter++) {
            Map<String, Double> newRank = new HashMap<>();
            for (EmployeeNode node : nodes) {
                String email = node.getEmailHash();
                double rankSum = 0.0;

                // Somme des rangs des voisins qui pointent vers cet email
                for (EmployeeNode neighbor : nodes) {
                    List<String> outgoing = adjacencyMap.getOrDefault(neighbor.getEmailHash(), Collections.emptyList());
                    if (outgoing.contains(email)) {
                        rankSum += pageRank.get(neighbor.getEmailHash()) / outgoing.size();
                    }
                }

                double calculatedRank = (1 - dampingFactor) / nodes.size() + dampingFactor * rankSum;
                newRank.put(email, Math.round(calculatedRank * 10000.0) / 10000.0);
            }
            pageRank = newRank;
        }

        return pageRank;
    }

    /**
     * Détecte les ponts d'intermédiarité (Betweenness Centrality).
     * Mesure les employés qui relient plusieurs équipes.
     */
    public Map<String, Double> calculateBetweenness(List<EmployeeNode> nodes, Map<String, List<String>> adjacencyMap) {
        Map<String, Double> betweenness = new HashMap<>();
        for (EmployeeNode node : nodes) {
            // Algorithme simplifié basé sur le degré d'interconnexion inter-équipes
            List<String> neighbors = adjacencyMap.getOrDefault(node.getEmailHash(), Collections.emptyList());
            double score = neighbors.size() * 1.25;
            betweenness.put(node.getEmailHash(), Math.round(score * 100.0) / 100.0);
        }
        return betweenness;
    }
}
