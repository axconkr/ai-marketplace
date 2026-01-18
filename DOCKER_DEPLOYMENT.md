# 🐳 Docker 배포 가이드

AI Marketplace를 Docker로 배포하는 완전한 가이드입니다.

## 📋 목차

1. [사전 준비](#사전-준비)
2. [Docker 설치](#docker-설치)
3. [프로젝트 설정](#프로젝트-설정)
4. [배포 실행](#배포-실행)
5. [SSL 설정](#ssl-설정)
6. [관리 명령어](#관리-명령어)
7. [트러블슈팅](#트러블슈팅)

---

## 사전 준비

### 필요한 정보

- ✅ CentOS 서버 (SSH 접속 가능)
- ✅ Supabase 데이터베이스 연결 정보
- ✅ 도메인 (선택사항, SSL 인증서용)

---

## Docker 설치

### 1️⃣ SSH로 서버 접속

```bash
ssh username@YOUR_SERVER_IP
```

### 2️⃣ Docker 설치

```bash
# Docker 설치 스크립트 다운로드 및 실행
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER

# 설치 확인
docker --version
docker-compose --version
```

**중요**: `usermod` 명령 후 재로그인 필요!

```bash
exit
ssh username@YOUR_SERVER_IP
```

### 3️⃣ 방화벽 설정

```bash
# HTTP, HTTPS 포트 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

---

## 프로젝트 설정

### 1️⃣ 프로젝트 클론

```bash
# GitHub에서 클론
git clone https://github.com/axconkr/ai-marketplace.git
cd ai-marketplace
```

### 2️⃣ 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
vim .env
```

**필수 환경 변수:**

```bash
# Application
NEXT_PUBLIC_APP_NAME="AI Marketplace"
NEXT_PUBLIC_APP_URL="http://YOUR_SERVER_IP"  # 또는 https://yourdomain.com

# Database - Supabase
DATABASE_URL="postgresql://postgres.inirkqzhsicdwyqnpild:@!Chaos0805@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:@!Chaos0805@db.inirkqzhsicdwyqnpild.supabase.co:5432/postgres"

# Authentication - 새로운 SECRET 생성!
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN="7d"

# Payment (선택사항 - 나중에 설정 가능)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
TOSS_SECRET_KEY="test_sk_..."
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."

# Environment
NODE_ENV="production"
```

### 3️⃣ 업로드 디렉토리 생성

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

---

## 배포 실행

### 🚀 간편 배포 (권장)

```bash
# 배포 스크립트 실행
./deploy.sh start
```

### 📦 수동 배포

```bash
# Docker Compose로 빌드 및 시작
docker-compose -f docker-compose.prod.yml up -d --build

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f
```

### ✅ 배포 확인

```bash
# 서버에서 확인
curl http://localhost:3000/api/health

# 브라우저에서 접속
# http://YOUR_SERVER_IP
```

---

## SSL 설정 (도메인이 있는 경우)

### 1️⃣ 도메인 DNS 설정

먼저 도메인의 A 레코드를 서버 IP로 설정하세요.

### 2️⃣ SSL 인증서 발급

```bash
# Certbot 디렉토리 생성
mkdir -p certbot/conf certbot/www

# SSL 인증서 발급 (도메인을 실제 도메인으로 변경)
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### 3️⃣ Nginx 설정 업데이트

```bash
# nginx/conf.d/default.conf 파일 수정
vim nginx/conf.d/default.conf

# HTTPS 서버 블록 주석 해제 및 도메인 변경
# HTTP → HTTPS 리다이렉트 활성화
```

### 4️⃣ 서비스 재시작

```bash
./deploy.sh restart
```

### 5️⃣ 자동 갱신 확인

SSL 인증서는 docker-compose.prod.yml의 certbot 서비스가 자동으로 갱신합니다.

---

## 관리 명령어

### 배포 스크립트 사용

```bash
# 서비스 시작
./deploy.sh start

# 서비스 중지
./deploy.sh stop

# 서비스 재시작
./deploy.sh restart

# 로그 확인 (실시간)
./deploy.sh logs

# 상태 확인
./deploy.sh status

# 업데이트 (GitHub에서 최신 코드 가져오기)
./deploy.sh update
```

### Docker Compose 직접 사용

```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# 로그 확인
docker-compose -f docker-compose.prod.yml logs -f app

# 특정 서비스 재시작
docker-compose -f docker-compose.prod.yml restart app

# 컨테이너 접속
docker exec -it ai-marketplace-app sh

# 리소스 사용량 확인
docker stats
```

### 데이터베이스 마이그레이션

```bash
# 컨테이너 내부에서 실행
docker exec -it ai-marketplace-app sh

# Prisma 마이그레이션
npx prisma db push

# 시드 데이터 생성
npx prisma db seed
```

---

## 트러블슈팅

### 1. 컨테이너가 시작되지 않음

```bash
# 로그 확인
docker-compose -f docker-compose.prod.yml logs app

# 컨테이너 재빌드
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### 2. 포트 충돌

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :80
sudo lsof -i :3000

# 프로세스 종료
sudo kill -9 <PID>
```

### 3. 데이터베이스 연결 오류

```bash
# .env 파일 확인
cat .env | grep DATABASE_URL

# Supabase 연결 테스트
docker exec -it ai-marketplace-app sh
npx prisma db pull
```

### 4. Nginx 502 Bad Gateway

```bash
# app 컨테이너 상태 확인
docker-compose -f docker-compose.prod.yml ps

# app 컨테이너 로그 확인
docker-compose -f docker-compose.prod.yml logs app

# Nginx 로그 확인
docker-compose -f docker-compose.prod.yml logs nginx
```

### 5. 이미지 빌드 실패

```bash
# Docker 캐시 삭제
docker system prune -a

# 다시 빌드
docker-compose -f docker-compose.prod.yml build --no-cache
```

---

## 백업 및 복구

### 환경 변수 백업

```bash
# .env 파일 백업
cp .env .env.backup
```

### 업로드 파일 백업

```bash
# public/uploads 디렉토리 백업
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz public/uploads
```

### 복구

```bash
# .env 복구
cp .env.backup .env

# 업로드 파일 복구
tar -xzf uploads-backup-YYYYMMDD.tar.gz
```

---

## 모니터링

### 로그 확인

```bash
# 실시간 로그
./deploy.sh logs

# 최근 100줄
docker-compose -f docker-compose.prod.yml logs --tail=100 app
```

### 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
docker system df
```

---

## 성능 최적화

### 1. 이미지 최적화

Dockerfile은 멀티스테이지 빌드를 사용하여 최적화되어 있습니다.

### 2. 리소스 제한 (선택사항)

```yaml
# docker-compose.prod.yml에 추가
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

---

## 보안 체크리스트

- [ ] `.env` 파일에 프로덕션 비밀키 설정
- [ ] JWT_SECRET 강력한 값으로 변경
- [ ] Supabase RLS (Row Level Security) 활성화
- [ ] SSL 인증서 설정 (도메인 사용 시)
- [ ] 방화벽 설정 (필요한 포트만 열기)
- [ ] 정기적인 Docker 이미지 업데이트
- [ ] 로그 모니터링 설정

---

## 추가 리소스

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Supabase Documentation](https://supabase.com/docs)

---

**배포 완료!** 🚀

문의사항: [GitHub Issues](https://github.com/axconkr/ai-marketplace/issues)
