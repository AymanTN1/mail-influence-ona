package com.mailinfluence.ona.parser;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmlParserService {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RawEmailPayload {
        private String messageId;
        private String sender;
        private List<String> toRecipients;
        private List<String> ccRecipients;
        private Instant sentAt;
    }

    /**
     * Analyse un flux d'emails bruts et extrait les relations pour le graphe d'influence.
     */
    public List<RawEmailPayload> parseBatchPayloads(List<RawEmailPayload> payloads) {
        if (payloads == null) {
            return new ArrayList<>();
        }
        return payloads.stream()
                .filter(p -> p.getSender() != null && !p.getSender().isBlank())
                .toList();
    }
}
