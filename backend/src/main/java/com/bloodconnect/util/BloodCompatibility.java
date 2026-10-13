package com.bloodconnect.util;

import java.util.List;
import java.util.Locale;

public class BloodCompatibility {

    public static List<String> getCompatibleDonorGroups(String recipientGroup) {
        if (recipientGroup == null) {
            return List.of();
        }

        String normalized = recipientGroup.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "A+" -> List.of("A+", "A-", "O+", "O-");
            case "A-" -> List.of("A-", "O-");
            case "B+" -> List.of("B+", "B-", "O+", "O-");
            case "B-" -> List.of("B-", "O-");
            case "AB+" -> List.of("AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-");
            case "AB-" -> List.of("AB-", "A-", "B-", "O-");
            case "O+" -> List.of("O+", "O-");
            case "O-" -> List.of("O-");
            default -> List.of(normalized);
        };
    }
}
