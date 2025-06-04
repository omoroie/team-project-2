FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY build/libs/*.jar app.jar
EXPOSE 8084  # port number
ENTRYPOINT ["java", "-jar", "app.jar"]
