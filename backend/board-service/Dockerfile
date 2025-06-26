# Build Stage
FROM --platform=linux/amd64 my-openjdk-maven:17 as builder
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Runtime Stage
FROM --platform=linux/amd64 eclipse-temurin:17-jdk-jammy
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8084
CMD ["java", "-jar", "app.jar"]
