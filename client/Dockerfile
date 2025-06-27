# --- Build Stage ---
FROM node:20-alpine as builder

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 전체 복사
COPY . .

# Vite build (환경 변수 NODE_ENV는 자동으로 production으로 감)
RUN npm run build:frontend

# --- Production Stage ---
FROM nginx:alpine

# 빌드된 정적 파일을 Nginx 경로로 복사
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Nginx 설정 복사 (선택)
COPY nginx.conf /etc/nginx/nginx.conf

# 포트 노출 및 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
