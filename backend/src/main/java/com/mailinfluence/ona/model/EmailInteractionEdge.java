package com.mailinfluence.ona.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.neo4j.core.schema.GeneratedValue;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

@RelationshipProperties
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailInteractionEdge {

    @Id
    @GeneratedValue
    private Long id;

    private Double weight;             // Poids calculé (TO=1.0, CC=0.3, Réciprocité, Récence)
    private Integer interactionCount;   // Nombre total d'emails échangés
    private Instant lastInteractionAt;  // Horodatage du dernier échange

    @TargetNode
    private EmployeeNode recipient;
}
