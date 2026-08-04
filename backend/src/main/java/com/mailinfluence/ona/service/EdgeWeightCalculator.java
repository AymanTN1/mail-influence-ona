package com.mailinfluence.ona.service;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class EdgeWeightCalculator {

    private static final double BASE_WEIGHT_TO = 1.0;
    private static final double BASE_WEIGHT_CC = 0.3;
    private static final double RECIPROCITY_BONUS_MULTIPLIER = 1.5;

    /**
     * Calcule le poids d'une interaction email entre deux nœuds.
     */
    public double calculateInteractionWeight(boolean isToRecipient, boolean isReciprocal, Instant timestamp) {
        double baseWeight = isToRecipient ? BASE_WEIGHT_TO : BASE_WEIGHT_CC;

        if (isReciprocal) {
            baseWeight *= RECIPROCITY_BONUS_MULTIPLIER;
        }

        // Dépréciation temporelle (Exponential Time Decay)
        double recencyFactor = calculateRecencyFactor(timestamp);
        return Math.round(baseWeight * recencyFactor * 100.0) / 100.0;
    }

    private double calculateRecencyFactor(Instant timestamp) {
        if (timestamp == null) return 1.0;

        long daysOld = Duration.between(timestamp, Instant.now()).toDays();
        if (daysOld <= 30) {
            return 1.0; // Emails récents (< 30 jours)
        } else if (daysOld <= 90) {
            return 0.75;
        } else if (daysOld <= 180) {
            return 0.50;
        } else {
            return 0.25;
        }
    }
}
