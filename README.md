# 삼성 레시피 플랫폼

삼성닷컴 스타일의 레시피 공유 및 식재료 구매 플랫폼입니다. TypeScript React 프론트엔드와 Spring Boot 마이크로서비스 백엔드로 구성되어 있습니다.

## 아키텍처 개요

### 프론트엔드
- **TypeScript React** 삼성 스타일 UI 디자인
- **한영 이중 언어 지원** (한국어/영어)
- **전역 상태 관리** Context API 사용
- **모던 UI 컴포넌트** shadcn/ui 라이브러리

### 백엔드 마이크로서비스
- **사용자 서비스** (8081포트) - 인증 및 사용자 관리
- **레시피 서비스** (8082포트) - 레시피 공유 및 관리
- **식재료 서비스** (8083포트) - 식재료 마켓플레이스
- **게시판 서비스** (8084포트) - 기업 전용 게시판

### 인프라
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 캐싱 레이어
- **Docker** - 컨테이너화
- **Kubernetes** - 오케스트레이션

## 주요 기능

### 핵심 기능
- ✅ JWT를 통한 사용자 등록 및 인증
- ✅ 자동 이미지 생성 레시피 공유
- ✅ 재고 관리 식재료 마켓플레이스
- ✅ 기업 전용 게시판 접근
- ✅ 한영 이중 언어 인터페이스
- ✅ 성능 최적화 Redis 캐싱

### 고급 기능
- 🔄 Google 번역 API 연동
- 🔄 Unsplash 이미지 연동
- 🔄 AWS S3 + CloudFront CDN
- 🔄 실시간 알림

## 빠른 시작

### 필수 요구사항
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 환경 변수
루트 디렉토리에 `.env` 파일을 생성하세요:

```env
# 데이터베이스
DATABASE_URL=jdbc:postgresql://localhost:5432/samsung_recipe
PGUSER=postgres
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=samsung_recipe

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# 외부 API (선택사항)
UNSPLASH_ACCESS_KEY=your_unsplash_key
GOOGLE_TRANSLATE_API_KEY=your_google_translate_key

# JWT
JWT_SECRET=samsung-recipe-platform-secret-key-2024-very-secure
```

### 개발 환경 설정

1. **인프라 시작**
```bash
docker-compose up postgres redis -d
```

2. **백엔드 서비스 시작**
```bash
# 사용자 서비스
cd backend/user-service
./mvnw spring-boot:run

# 레시피 서비스
cd backend/recipe-service
./mvnw spring-boot:run

# 식재료 서비스
cd backend/ingredient-service
./mvnw spring-boot:run

# 게시판 서비스
cd backend/board-service
./mvnw spring-boot:run
```

3. **프론트엔드 시작**
```bash
npm run dev
```

### 프로덕션 배포

#### Docker Compose
```bash
docker-compose up -d
```

#### Kubernetes
```bash
kubectl apply -f k8s/
```

## API 문서

### 사용자 서비스 (8081)
- `POST /api/users/register` - 새 사용자 등록
- `POST /api/users/login` - 사용자 인증
- `GET /api/users/{id}` - ID로 사용자 조회
- `GET /api/users/corporate` - 기업 사용자 조회

### 레시피 서비스 (8082)
- `POST /api/recipes` - 레시피 생성
- `GET /api/recipes` - 모든 레시피 조회
- `GET /api/recipes/{id}` - ID로 레시피 조회
- `GET /api/recipes/search?keyword=` - 레시피 검색
- `GET /api/recipes/author/{authorId}` - 작성자별 레시피 조회

### 식재료 서비스 (8083)
- `POST /api/ingredients` - 식재료 생성
- `GET /api/ingredients` - 모든 식재료 조회
- `GET /api/ingredients/{id}` - ID로 식재료 조회
- `GET /api/ingredients/category/{category}` - 카테고리별 조회

### 게시판 서비스 (8084)
- `POST /api/board` - 게시글 생성 (기업 전용)
- `GET /api/board` - 모든 게시글 조회 (기업 전용)
- `GET /api/board/{id}` - ID로 게시글 조회
- `POST /api/board/{id}/translate` - 게시글 번역

## 기술 스택

### 프론트엔드
- React 18 with TypeScript
- Vite 빌드 도구
- TailwindCSS 스타일링
- shadcn/ui 컴포넌트
- React Query 상태 관리
- Wouter 라우팅

### 백엔드
- Spring Boot 3.2
- Spring Data JPA
- Spring Security
- Redis 캐싱
- PostgreSQL 데이터베이스
- JWT 인증
- Lombok 코드 생성
- ModelMapper DTO 변환

### DevOps
- Docker & Docker Compose
- Kubernetes 배포
- PostgreSQL 영구 볼륨
- Redis 캐싱 클러스터
- 환경별 설정

## 데이터베이스 스키마

### 사용자 테이블
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_corporate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 레시피 테이블
```sql
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cooking_time INTEGER,
    servings INTEGER,
    difficulty VARCHAR(50),
    image_url VARCHAR(500),
    author_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 식재료 테이블
```sql
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    category VARCHAR(100),
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 성능 최적화

### Redis 캐싱 전략
- 사용자 데이터 24시간 캐싱
- 레시피 데이터 12시간 캐싱
- 식재료 데이터 6시간 캐싱
- 게시글 2시간 캐싱

### 데이터베이스 최적화
- 외래 키 인덱싱
- 커넥션 풀링
- JPA 쿼리 최적화
- 관계형 지연 로딩

## 보안 기능

### 인증
- JWT 기반 인증
- BCrypt 패스워드 해싱
- 세션 관리
- CORS 설정

### 권한 관리
- 역할 기반 접근 제어
- 기업 사용자 검증
- API 엔드포인트 보호
- 요청 데이터 검증

## 모니터링 및 헬스 체크

### 애플리케이션 상태
- Spring Actuator 엔드포인트
- 데이터베이스 연결 확인
- Redis 연결 확인
- 서비스 의존성 모니터링

### 로깅
- SLF4J 구조화 로깅
- 요청/응답 로깅
- 오류 추적 및 리포팅
- 성능 메트릭

## 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 지원

지원 및 질문사항:
- 저장소에 이슈 생성
- 개발팀 연락
- 문서 위키 확인

---

❤️로 제작된 삼성 레시피 플랫폼