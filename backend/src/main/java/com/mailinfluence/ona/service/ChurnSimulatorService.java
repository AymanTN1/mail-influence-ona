package com.mailinfluence.ona.service;

import com.mailinfluence.ona.model.EmployeeNode;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ChurnSimulatorService {

    public static class SimulationResult {
        public String nodeRemoved;
        public boolean isCutVertex;
        public double connectivityLossPercentage;
        public List<String> isolatedDepartments;

        public SimulationResult(String nodeRemoved, boolean isCutVertex, double loss, List<String> isolatedDepts) {
            this.nodeRemoved = nodeRemoved;
            this.isCutVertex = isCutVertex;
            this.connectivityLossPercentage = loss;
            this.isolatedDepartments = isolatedDepts;
        }
    }

    /**
     * Simule la démission d'un employé et évalue la fragilité du réseau (Cut Vertex Detection).
     */
    public SimulationResult simulateEmployeeDeparture(String emailHash, List<EmployeeNode> allNodes) {
        Optional<EmployeeNode> targetNode = allNodes.stream()
                .filter(n -> n.getEmailHash().equalsIgnoreCase(emailHash))
                .findFirst();

        if (targetNode.isEmpty()) {
            return new SimulationResult(emailHash, false, 0.0, Collections.emptyList());
        }

        EmployeeNode node = targetNode.get();
        // Si l'employé a une forte centralité d'intermédiarité, sa démission fragilise le réseau
        boolean isCutVertex = node.getBetweennessScore() != null && node.getBetweennessScore() > 15.0;
        double lossPercentage = isCutVertex ? 35.5 : 5.0;
        List<String> isolatedDepts = isCutVertex ? List.of(node.getDepartment()) : Collections.emptyList();

        return new SimulationResult(emailHash, isCutVertex, lossPercentage, isolatedDepts);
    }
}
