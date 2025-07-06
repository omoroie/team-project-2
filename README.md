# 만개의레시피 (Recipe Platform)

한국 요리 전문 레시피 공유 플랫폼입니다. 마이크로서비스 아키텍처로 구성되어 있으며, React 프론트엔드와 Spring Boot 백엔드 서비스들로 구성됩니다.

## 🏗️ 아키텍처

### 프론트엔드
- **React 18 + TypeScript** (포트: 5000)
- **Vite** 개발 서버
- **TailwindCSS + shadcn/ui** 컴포넌트
- **TanStack Query** 상태 관리
- **Wouter** 라우팅
- **React Hook Form + Zod** 폼 검증

### 백엔드 마이크로서비스
- **User Service** (포트: 8081) - 사용자 인증/관리
- **Recipe Service** (포트: 8082) - 레시피 관리

### 데이터베이스
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 세션 및 캐시 관리

## 🚀 빠른 시작

### 1. 사전 요구사항
```bash
# 필수 설치 항목
- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- Maven 3.8+
- Docker & Docker Compose (선택사항)
```

### 2. 프로젝트 클론 및 의존성 설치
```bash
# 프로젝트 클론
git clone <repository-url>
cd pj-1

# 모든 의존성 설치
npm run install:all
```

### 3. 환경변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# Database 설정
DB_HOST=localhost
DB_NAME=recipe_db
DB_USER=recipe_user
DB_PASSWORD=recipe_password

# JWT 설정
JWT_SECRET=your_jwt_secret_key_here

# Redis 설정
REDIS_HOST=localhost
REDIS_PORT=6379

# Node 환경
NODE_ENV=development
```

### 4. 데이터베이스 설정
```bash
# PostgreSQL 데이터베이스 생성
createdb recipe_db

# Redis 서버 실행
redis-server
```

### 5. 서비스 실행

#### 전체 서비스 동시 실행 (권장)
```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev
```

#### 개별 서비스 실행
```bash
# 프론트엔드만 실행
npm run dev:frontend

# 백엔드 서비스들만 실행
npm run dev:backend

# 개별 서비스 실행
npm run dev:user-service
npm run dev:recipe-service
```

### 6. 서비스 확인
- **프론트엔드**: http://localhost:5000
- **User Service**: http://localhost:8081/actuator/health
- **Recipe Service**: http://localhost:8082/actuator/health

## 🐳 Docker 환경 실행

### 1. Docker Compose로 전체 서비스 실행
```bash
# 모든 서비스 빌드 및 실행
npm run docker:up

# 백그라운드 실행
docker-compose up -d --build

# 서비스 중지
npm run docker:down
```

### 2. 개별 서비스 빌드
```bash
# User Service
cd backend/user-service
docker build -t recipe-platform/user-service .

# Recipe Service
cd backend/recipe-service
docker build -t recipe-platform/recipe-service .

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
- `POST /images/upload` - 이미지 업로드

## 🛠️ 개발 가이드

### 프로젝트 구조
```
pj-1/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # 커스텀 훅
│   │   └── lib/           # 유틸리티 및 설정
│   └── package.json
├── backend/
│   ├── user-service/      # 사용자 서비스
│   └── recipe-service/    # 레시피 서비스
├── k8s/                   # Kubernetes 설정
├── shared/                # 공유 스키마
└── docker-compose.yml
```

### 프론트엔드 개발
- 컴포넌트는 `client/src/components/` 에 위치
- 페이지는 `client/src/pages/` 에 위치
- API 클라이언트는 `client/src/lib/apiClient.ts` 에서 관리
- 다국어 지원: 한국어/영어 (`client/src/lib/translations.ts`)

### 백엔드 개발
- 각 서비스는 독립적인 Maven 프로젝트
- Spring Boot 3.2.0 + Java 17 사용
- JPA + PostgreSQL 사용
- Redis를 통한 세션 관리

### 빌드 및 배포
```bash
# 프론트엔드 빌드
npm run build:frontend

# 백엔드 빌드 (각 서비스별)
npm run build:user-service
npm run build:recipe-service

# 전체 빌드
npm run build
```

## ☸️ Kubernetes 배포

### 1. 네임스페이스 생성
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. 시크릿 생성
```bash
kubectl apply -f k8s/secrets.yaml
```

### 3. 서비스 배포
```bash
# 데이터베이스 및 Redis
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/redis.yaml

# 백엔드 서비스
kubectl apply -f k8s/user-service.yaml
kubectl apply -f k8s/recipe-service.yaml

# 프론트엔드
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-config-dev.yaml  # 또는 frontend-config-prod.yaml
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
- PostgreSQL: 5432
- Redis: 6379

### 빌드 오류
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
cd client && rm -rf node_modules package-lock.json && npm install
```

## 📝 주요 기능

### 사용자 관리
- 회원가입/로그인/로그아웃
- JWT 기반 인증
- 사용자 프로필 관리

### 레시피 관리
- 레시피 CRUD 작업
- 재료 및 조리 단계 관리
- 이미지 업로드 (Unsplash API 연동)
- 태그 시스템
- 조회수 추적

### 프론트엔드 기능
- 반응형 디자인
- 다국어 지원 (한국어/영어)
- 실시간 검색
- 무한 스크롤
- 이미지 갤러리

## 🚀 배포 환경

### 개발 환경
- 로컬 PostgreSQL/Redis 사용
- 핫 리로드 지원
- 디버깅 모드

### 프로덕션 환경
- 클러스터 환경의 데이터베이스 서비스 사용
- 코드 최적화 및 압축
- 보안 강화

## 📄 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.


