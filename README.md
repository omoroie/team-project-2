# 만개의레시피 - 레시피 공유 플랫폼

TypeScript 기반의 레시피 공유 및 식재료 구매 플랫폼입니다. 만개의레시피 스타일의 UI를 참고하여 구현했습니다.

## 🍳 주요 기능

### 📱 프론트엔드
- **요리 테마 디자인**: 크림색 배경, 허브 그린, 따뜻한 오렌지 색상 테마
- **레시피 공유**: 레시피 등록, 조회, 검색 기능
- **카테고리 필터**: 종류별, 상황별, 재료별, 방법별, 타이밍별 분류
- **식재료 마켓플레이스**: 재료 구매 및 가격 정보
- **기업 전용 게시판**: 기업 계정용 특별 게시판
- **다국어 지원**: 한국어/영어 지원
- **소셜 로그인**: 카카오, 네이버 로그인 UI (API 연동 준비 완료)

### 🏗️ 백엔드 아키텍처
- **Express.js**: REST API 서버
- **Spring Boot 마이크로서비스**: 4개 독립 서비스
  - User Service (사용자 관리)
  - Recipe Service (레시피 관리)
  - Ingredient Service (식재료 관리) 
  - Board Service (게시판 관리)
- **Redis 캐싱**: 성능 최적화
- **PostgreSQL**: 데이터베이스
- **Google Translate API**: 자동 번역 기능

### 🐳 인프라
- **Docker**: 컨테이너화
- **Kubernetes**: 오케스트레이션
- **Nginx**: 로드 밸런서
- **완전한 CI/CD**: 배포 자동화

## 🛠️ 기술 스택

### Frontend
- React 18 + TypeScript
- Vite (빌드 도구)
- TailwindCSS + shadcn/ui
- TanStack Query (상태 관리)
- Wouter (라우팅)

### Backend
- Node.js + Express (Gateway)
- Spring Boot 3.x (마이크로서비스)
- Drizzle ORM
- Redis (캐싱)
- PostgreSQL (데이터베이스)

### Infrastructure
- Docker & Docker Compose
- Kubernetes
- Nginx

## 🚀 시작하기

### 필수 요구사항
- Node.js 20+
- PostgreSQL
- Redis (선택사항)

### 로컬 개발 환경 설정

1. **저장소 클론**
```bash
git clone <repository-url>
cd recipe-platform
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
# .env 파일 생성 (Replit에서 자동 관리됨)
DATABASE_URL=postgresql://...
REDIS_HOST=localhost
REDIS_PORT=6379
```

4. **개발 서버 시작**
```bash
npm run dev
```

## 🏃‍♂️ 실행 방법

### 개발 모드
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
npm start
```

### Docker로 실행
```bash
docker-compose up -d
```

### Kubernetes 배포
```bash
./deploy.sh
```

## 📁 프로젝트 구조

```
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/     # 재사용 가능한 컴포넌트
│   │   ├── pages/         # 페이지 컴포넌트
│   │   ├── contexts/      # React 컨텍스트
│   │   ├── hooks/         # 커스텀 훅
│   │   └── lib/          # 유틸리티 함수
├── server/                # Express.js 서버
├── backend/               # Spring Boot 마이크로서비스
│   ├── user-service/
│   ├── recipe-service/
│   ├── ingredient-service/
│   └── board-service/
├── shared/               # 공유 타입 및 스키마
├── k8s/                 # Kubernetes 설정
└── docker-compose.yml   # Docker 설정
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: 허브 그린 (120, 60%, 45%)
- **Accent**: 따뜻한 오렌지 (25, 85%, 65%)
- **Background**: 크림색 (42, 100%, 98%)
- **Secondary**: 따뜻한 베이지 (35, 77%, 88%)

### 컴포넌트
- shadcn/ui 기반 디자인 시스템
- 요리 테마에 최적화된 커스텀 스타일
- 반응형 디자인

## 🔧 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 사용자 정보

### 레시피
- `GET /api/recipes` - 레시피 목록
- `POST /api/recipes` - 레시피 생성
- `GET /api/recipes/:id` - 레시피 상세

### 식재료
- `GET /api/ingredients` - 식재료 목록
- `POST /api/ingredients` - 식재료 추가

### 게시판 (기업 전용)
- `GET /api/board` - 게시글 목록
- `POST /api/board` - 게시글 작성

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 연락처

프로젝트 관련 문의는 Issues를 통해 부탁드립니다.