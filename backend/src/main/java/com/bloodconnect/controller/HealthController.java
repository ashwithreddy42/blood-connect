package com.bloodconnect.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/health")
    public Map<String, Object> checkHealth() {
        return Map.of(
            "status", "UP",
            "service", "Blood Connect Backend",
            "timestamp", Instant.now().toString(),
            "message", "Service is healthy and operating normally"
        );
    }

    @GetMapping("/db-check")
    public ResponseEntity<Map<String, Object>> checkDatabase() {
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                return ResponseEntity.ok(Map.of(
                    "status", "UP",
                    "database", "MySQL (Aiven)",
                    "queryResult", result,
                    "message", "Database connection successful",
                    "timestamp", Instant.now().toString()
                ));
            } else {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "status", "DOWN",
                    "message", "Unexpected query result from database",
                    "timestamp", Instant.now().toString()
                ));
            }
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "status", "DOWN",
                "error", ex.getClass().getSimpleName(),
                "message", "Database connection failed. Please check network connectivity or database credentials.",
                "timestamp", Instant.now().toString()
            ));
        }
    }
}
