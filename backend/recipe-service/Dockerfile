FROM --platform=linux/amd64 eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Maven 설치
RUN apt-get update \
    && apt-get install -y maven \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 소스 코드 복사
COPY pom.xml .
COPY src ./src

# 애플리케이션 빌드
RUN mvn clean package -DskipTests

EXPOSE 8082
CMD ["java", "-jar", "target/*.jar"]
