FROM my-openjdk-maven:17

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests && \
    mv target/*.jar app.jar && \
    rm -rf ~/.m2

EXPOSE 8083

CMD ["java", "-jar", "app.jar"]