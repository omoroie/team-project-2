# 만개의레시피 (Recipe Platform)

한국 요리 전문 레시피 공유 플랫폼입니다. 마이크로서비스 아키텍처로 구성되어 있으며, React 프론트엔드와 Spring Boot 백엔드 서비스들로 구성됩니다.

## 🏗️ 아키텍처

### 프론트엔드
- **React + TypeScript** (포트: 5000)
- **Vite** 개발 서버
- **TailwindCSS + shadcn/ui** 컴포넌트
- **TanStack Query** 상태 관리
- **Wouter** 라우팅

### 백엔드 마이크로서비스
- **User Service** (포트: 8081) - 사용자 인증/관리
- **Recipe Service** (포트: 8082) - 레시피 관리
- **Ingredient Service** (포트: 8083) - 재료 관리
- **Board Service** (포트: 8084) - 게시판 관리

### 데이터베이스
- **PostgreSQL** - 각 서비스별 독립 데이터베이스
- **Redis** - 세션 및 캐시 관리

## 🚀 로컬 개발 환경 설정

### 1. 사전 요구사항
```bash
# 필수 설치 항목
- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Maven 3.8+
```

### 2. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb recipe_db

# Redis 서버 실행
redis-server
```

### 3. 환경변수 설정

각 백엔드 서비스의 `application.yml`에서 다음 환경변수를 설정하세요:

#### User Service (8081)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/recipe_db}
    username: ${DB_USERNAME:recipe_user}
    password: ${DB_PASSWORD:recipe_password}
  redis:
    host: ${REDIS_HOST:localhost}
    port: ${REDIS_PORT:6379}

jwt:
  secret: ${JWT_SECRET:Secret-key}
```

#### Recipe Service (8082)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/recipe_db}
    username: ${DB_USERNAME:recipe_user}
    password: ${DB_PASSWORD:recipe_password}
```

#### Ingredient Service (8083)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/recipe_db}
    username: ${DB_USERNAME:recipe_user}
    password: ${DB_PASSWORD:recipe_password}
```

#### Board Service (8084)
```yaml
spring:
  datasource:
    url: ${DB_URL:jdbc:postgresql://localhost:5432/recipe_db}
    username: ${DB_USERNAME:recipe_user}
    password: ${DB_PASSWORD:recipe_password}
```

### 4. 서비스 실행 순서

#### 백엔드 서비스 실행
```bash
# 1. User Service 실행
cd backend/user-service
mvn spring-boot:run

# 2. Recipe Service 실행 (새 터미널)
cd backend/recipe-service
mvn spring-boot:run

# 3. Ingredient Service 실행 (새 터미널)
cd backend/ingredient-service
mvn spring-boot:run

# 4. Board Service 실행 (새 터미널)
cd backend/board-service
mvn spring-boot:run
```

#### 프론트엔드 실행
```bash
# 프론트엔드 실행 (새 터미널)
npm install
npm run dev
```

### 5. 서비스 확인
- **프론트엔드**: http://localhost:5000
- **User Service**: http://localhost:8081/actuator/health
- **Recipe Service**: http://localhost:8082/actuator/health
- **Ingredient Service**: http://localhost:8083/actuator/health
- **Board Service**: http://localhost:8084/actuator/health

## 🐳 Docker 컨테이너 실행

### 1. Docker Compose 실행
```bash
# 모든 서비스 빌드 및 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build
```

### 2. 개별 서비스 빌드
```bash
# User Service
cd backend/user-service
docker build -t recipe-platform/user-service .

# Recipe Service
cd backend/recipe-service
docker build -t recipe-platform/recipe-service .

# Ingredient Service
cd backend/ingredient-service
docker build -t recipe-platform/ingredient-service .

# Board Service
cd backend/board-service
docker build -t recipe-platform/board-service .

# Frontend
docker build -f Dockerfile.frontend -t recipe-platform/frontend .
```

## 📋 API 엔드포인트

### User Service (8081)
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/logout` - 로그아웃
- `GET /auth/me` - 사용자 정보 조회

### Recipe Service (8082)
- `GET /recipes` - 레시피 목록 조회
- `GET /recipes/best` - 인기 레시피 조회
- `GET /recipes/{id}` - 레시피 상세 조회
- `POST /recipes` - 레시피 생성
- `PUT /recipes/{id}` - 레시피 수정
- `DELETE /recipes/{id}` - 레시피 삭제

### Ingredient Service (8083)
- `GET /ingredients` - 재료 목록 조회
- `GET /ingredients/{id}` - 재료 상세 조회
- `POST /ingredients` - 재료 생성
- `PUT /ingredients/{id}` - 재료 수정
- `DELETE /ingredients/{id}` - 재료 삭제

### Board Service (8084)
- `GET /board` - 게시글 목록 조회
- `GET /board/{id}` - 게시글 상세 조회
- `POST /board` - 게시글 생성
- `PUT /board/{id}` - 게시글 수정
- `DELETE /board/{id}` - 게시글 삭제

## 🛠️ 개발 가이드

### 프론트엔드 개발
- 컴포넌트는 `client/src/components/` 에 위치
- 페이지는 `client/src/pages/` 에 위치
- API 클라이언트는 `client/src/lib/apiClient.ts` 에서 관리
- 다국어 지원: 한국어/영어

### 백엔드 개발
- 각 서비스는 독립적인 Maven 프로젝트
- Spring Boot 3.2.0 + Java 17 사용
- JPA + PostgreSQL 사용
- Redis를 통한 세션 관리

### 빌드 및 배포
```bash
# 프론트엔드 빌드
npm run build

# 백엔드 빌드 (각 서비스별)
mvn clean package -DskipTests
```

## 🔧 트러블슈팅

### CORS 오류
각 백엔드 서비스에서 `http://localhost:5000` 을 허용하도록 설정됨

### 데이터베이스 연결 오류
PostgreSQL 서비스가 실행 중인지 확인하고 연결 정보를 점검하세요

### 포트 충돌
각 서비스가 지정된 포트를 사용하는지 확인하세요:
- Frontend: 5000
- User Service: 8081
- Recipe Service: 8082
- Ingredient Service: 8083
- Board Service: 8084

## 🚀 배포

### Kubernetes 배포
```bash
# Namespace 생성
kubectl apply -f k8s/namespace.yaml

# 서비스 배포
kubectl apply -f k8s/
```

### 환경별 설정
- **개발환경**: 로컬 PostgreSQL/Redis 사용
- **운영환경**: 클러스터 환경의 데이터베이스 서비스 사용

## 📝 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.