package com.mailinfluence.ona.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class AnonymizerService {

    /**
     * Anonymise une adresse email en utilisant SHA-256 tout en conservant le domaine pour l'analyse ONA.
     * Exemple: john.doe@corp.com -> a89f2e34...b12@corp.com
     */
    public String anonymizeEmail(String email, boolean enableHash) {
        if (email == null || email.isBlank()) {
            return "unknown@domain.com";
        }
        
        String cleanEmail = email.trim().toLowerCase();
        if (!enableHash) {
            return cleanEmail;
        }

        String[] parts = cleanEmail.split("@");
        String localPart = parts[0];
        String domainPart = parts.length > 1 ? "@" + parts[1] : "@domain.com";

        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(localPart.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.substring(0, 12) + domainPart;
        } catch (NoSuchAlgorithmException e) {
            return "anon_" + Math.abs(cleanEmail.hashCode()) + domainPart;
        }
    }
}
