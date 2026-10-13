# Root Dockerfile for Blood Connect Spring Boot Backend
# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven descriptor from backend/
COPY backend/pom.xml ./backend/
RUN cd backend && mvn dependency:go-offline -B || true

# Copy source code and build
COPY backend/src ./backend/src
RUN cd backend && mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ENV PORT=9090
EXPOSE ${PORT}

# Copy JAR from backend target
COPY --from=builder /app/backend/target/blood-connect-backend-*.jar app.jar

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-9090} -jar app.jar"]
