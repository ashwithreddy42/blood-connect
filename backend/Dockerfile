# Multi-stage Dockerfile for Blood Connect Spring Boot Backend
# Stage 1: Build the application using Maven and JDK 21
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml and pre-fetch dependencies for Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy application source code and compile production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime environment using lightweight Java 21 JRE
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Default to port 9090 locally; Render injects PORT at runtime
ENV PORT=9090
EXPOSE ${PORT}

# Copy the executable Spring Boot JAR from builder stage
COPY --from=builder /app/target/blood-connect-backend-*.jar app.jar

# Execute application binding to PORT and supporting DB_* environment variables
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-9090} -jar app.jar"]
