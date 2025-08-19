# 🔒 보안 설정 가이드

이 문서는 Recipe Platform을 안전하게 배포하고 운영하기 위한 보안 설정 가이드입니다.

## ⚠️ 중요: 배포 전 필수 설정 사항

### 1. 환경변수 설정

`.env` 파일을 생성하고 다음 값들을 **실제 값으로** 설정하세요:

```bash
# .env 파일 생성 (이 파일은 git에 커밋되지 않습니다)
cp env.example .env
```

#### 필수 환경변수 목록:

```bash
# 데이터베이스 설정 (실제 값으로 변경 필요)
DB_HOST=your-actual-db-host
DB_NAME=recipe_db
DB_USER=your-actual-gcp-service-account@gcp-sa-cloud-sql.iam.gserviceaccount.com
DB_PASSWORD=your-actual-secure-password

# Redis 설정
REDIS_HOST=your-redis-host
REDIS_PORT=6379

# JWT 시크릿 (강력한 무작위 문자열로 생성)
JWT_SECRET=your-strong-jwt-secret-key-minimum-32-characters

# GCP 설정 (실제 값으로 변경 필요)
GCP_PROJECT_ID=your-actual-gcp-project-id
GCP_STORAGE_BUCKET=your-actual-storage-bucket-name
GCP_STORAGE_FOLDER=images
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-actual-service-account-key.json

# 외부 API 키
UNSPLASH_ACCESS_KEY=your-actual-unsplash-access-key
```

### 2. JWT Secret 생성

안전한 JWT Secret을 생성하세요:

```bash
# 방법 1: OpenSSL 사용
openssl rand -base64 32

# 방법 2: Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 방법 3: Python 사용
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. GCP 서비스 계정 설정

1. GCP Console에서 새 서비스 계정 생성
2. 필요한 권한만 부여:
   - Cloud SQL Client
   - Storage Object Admin (해당 버킷에만)
3. 키 파일을 안전한 위치에 저장
4. `GOOGLE_APPLICATION_CREDENTIALS` 환경변수를 키 파일 경로로 설정

### 4. 데이터베이스 보안

1. 강력한 비밀번호 사용
2. 필요한 IP에서만 접근 허용
3. SSL 연결 강제
4. 정기적인 백업 설정

## 🚫 절대 하지 말아야 할 것들

### ❌ Git에 커밋하면 안 되는 파일들:
- `.env` 파일
- `service-account-key.json` 등 GCP 키 파일
- 실제 비밀번호나 API 키가 포함된 파일
- 프로덕션 설정 파일

### ❌ 코드에 하드코딩하면 안 되는 것들:
- 비밀번호
- API 키
- JWT Secret
- 데이터베이스 연결 정보
- GCP 프로젝트 ID나 서비스 계정 정보

## ✅ 배포 환경별 설정

### Development 환경
```bash
NODE_ENV=development
# 로컬 개발용 설정 사용
```

### Production 환경
```bash
NODE_ENV=production
# 실제 프로덕션 값들로 모든 환경변수 설정
# 더 강력한 보안 설정 적용
```

## 🔍 보안 체크리스트

배포 전에 다음 사항들을 확인하세요:

- [ ] `.env` 파일이 git에 포함되지 않았는지 확인
- [ ] 모든 환경변수가 실제 값으로 설정되었는지 확인
- [ ] JWT Secret이 강력한 무작위 문자열인지 확인
- [ ] GCP 서비스 계정에 최소 권한만 부여되었는지 확인
- [ ] 데이터베이스 접근이 필요한 IP에서만 허용되는지 확인
- [ ] HTTPS를 사용하는지 확인
- [ ] 로그에 민감정보가 출력되지 않는지 확인

## 🚨 보안 사고 대응

만약 실수로 민감정보가 git에 커밋된 경우:

1. 즉시 해당 키/비밀번호 변경
2. Git 히스토리에서 민감정보 제거:
   ```bash
   git filter-branch --force --index-filter \
   'git rm --cached --ignore-unmatch sensitive-file.txt' \
   --prune-empty --tag-name-filter cat -- --all
   ```
3. 모든 팀원에게 새로운 키/비밀번호 공유
4. 영향 범위 분석 및 대응

## 📞 문의

보안 관련 문의사항이 있으면 개발팀에 연락하세요.
