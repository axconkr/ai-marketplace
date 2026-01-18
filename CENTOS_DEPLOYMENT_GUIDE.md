# CentOS 서버 배포 가이드

AI Marketplace를 CentOS 서버에 배포하는 완전한 가이드입니다.

## 📋 목차

1. [시스템 요구사항](#시스템-요구사항)
2. [사전 준비](#사전-준비)
3. [서버 초기 설정](#서버-초기-설정)
4. [Node.js 설치](#nodejs-설치)
5. [프로젝트 배포](#프로젝트-배포)
6. [PM2로 프로세스 관리](#pm2로-프로세스-관리)
7. [Nginx 리버스 프록시 설정](#nginx-리버스-프록시-설정)
8. [SSL 인증서 설정 (Let's Encrypt)](#ssl-인증서-설정)
9. [자동 배포 설정 (GitHub Actions)](#자동-배포-설정)

---

## 시스템 요구사항

- **OS**: CentOS 7/8/9 또는 Rocky Linux 8/9
- **CPU**: 2 Core 이상 권장
- **RAM**: 2GB 이상 (4GB 권장)
- **Disk**: 20GB 이상
- **Node.js**: 20.x LTS
- **외부 서비스**:
  - Supabase (PostgreSQL Database)
  - Redis (선택사항)

---

## 사전 준비

### 1. Supabase 프로젝트 설정

1. [Supabase Dashboard](https://supabase.com) 로그인
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **Settings** → **Database** → **Connection string** 복사
   - `DATABASE_URL` (Connection pooling)
   - `DIRECT_URL` (Direct connection)

### 2. GitHub 저장소 설정

```bash
# 로컬에서 Git 저장소 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 원격 저장소 추가
git remote add origin https://github.com/YOUR_USERNAME/ai-marketplace.git
git branch -M main
git push -u origin main
```

---

## 서버 초기 설정

### 1. SSH 접속

```bash
ssh root@YOUR_SERVER_IP
```

### 2. 시스템 업데이트

```bash
# CentOS 7/8
sudo yum update -y

# CentOS 9 / Rocky Linux
sudo dnf update -y
```

### 3. 필수 패키지 설치

```bash
# CentOS 7/8
sudo yum install -y git curl wget vim

# CentOS 9 / Rocky Linux
sudo dnf install -y git curl wget vim
```

### 4. 방화벽 설정

```bash
# HTTP, HTTPS 포트 열기
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 특정 포트 열기 (필요시)
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

---

## Node.js 설치

### NodeSource 저장소를 통한 설치 (권장)

```bash
# Node.js 20.x LTS 설치
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# CentOS 7/8
sudo yum install -y nodejs

# CentOS 9 / Rocky Linux
sudo dnf install -y nodejs

# 설치 확인
node --version  # v20.x.x
npm --version   # 10.x.x
```

### NVM을 통한 설치 (대안)

```bash
# NVM 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Node.js 20 설치
nvm install 20
nvm use 20
nvm alias default 20
```

---

## 프로젝트 배포

### 1. 애플리케이션 사용자 생성

```bash
# 전용 사용자 생성
sudo useradd -m -s /bin/bash aimarket
sudo passwd aimarket

# sudo 권한 부여 (필요시)
sudo usermod -aG wheel aimarket

# 사용자 전환
su - aimarket
```

### 2. 프로젝트 클론

```bash
# 홈 디렉토리로 이동
cd ~

# GitHub에서 클론
git clone https://github.com/YOUR_USERNAME/ai-marketplace.git
cd ai-marketplace
```

### 3. 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
vim .env
```

**필수 환경 변수 설정:**

```bash
# Application
NEXT_PUBLIC_APP_NAME="AI Marketplace"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Database - Supabase
DATABASE_URL="postgresql://postgres.YOUR_PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"

# Authentication
JWT_SECRET="GENERATE_STRONG_SECRET_HERE"
JWT_EXPIRES_IN="7d"

# Environment
NODE_ENV="production"
```

**JWT Secret 생성:**

```bash
openssl rand -base64 32
```

### 4. 의존성 설치 및 빌드

```bash
# npm 의존성 설치
npm ci --production=false

# Prisma 클라이언트 생성
npm run db:generate

# 프로덕션 빌드
npm run build
```

### 5. 데이터베이스 마이그레이션

```bash
# Prisma 스키마를 Supabase에 동기화
npm run db:push

# 시드 데이터 생성 (선택사항)
npm run subscription:seed
```

---

## PM2로 프로세스 관리

### 1. PM2 설치

```bash
sudo npm install -g pm2
```

### 2. PM2 설정 파일 생성

```bash
# ecosystem.config.js 파일 생성
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ai-marketplace',
    script: 'npm',
    args: 'start',
    cwd: '/home/aimarket/ai-marketplace',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
}
EOF
```

### 3. PM2로 앱 시작

```bash
# 로그 디렉토리 생성
mkdir -p logs

# PM2로 앱 시작
pm2 start ecosystem.config.js

# 상태 확인
pm2 status
pm2 logs ai-marketplace

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

### 4. PM2 명령어

```bash
# 상태 확인
pm2 status
pm2 list

# 로그 보기
pm2 logs
pm2 logs ai-marketplace --lines 100

# 재시작
pm2 restart ai-marketplace

# 중지
pm2 stop ai-marketplace

# 삭제
pm2 delete ai-marketplace

# 모니터링
pm2 monit
```

---

## Nginx 리버스 프록시 설정

### 1. Nginx 설치

```bash
# CentOS 7/8
sudo yum install -y nginx

# CentOS 9 / Rocky Linux
sudo dnf install -y nginx

# Nginx 시작 및 자동 시작 설정
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. Nginx 설정

```bash
# Nginx 설정 파일 생성
sudo vim /etc/nginx/conf.d/ai-marketplace.conf
```

**설정 내용:**

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Let's Encrypt용 임시 설정
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # 나머지는 HTTPS로 리다이렉트
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 서버 (SSL 설정 후 활성화)
# server {
#     listen 443 ssl http2;
#     server_name yourdomain.com www.yourdomain.com;
#
#     ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
#
#     # SSL 보안 설정
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers HIGH:!aNULL:!MD5;
#     ssl_prefer_server_ciphers on;
#
#     # Next.js 앱으로 프록시
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
#
#     # 정적 파일 캐싱
#     location /_next/static {
#         proxy_pass http://localhost:3000;
#         proxy_cache_valid 200 365d;
#         add_header Cache-Control "public, immutable";
#     }
#
#     # 파일 업로드 크기 제한
#     client_max_body_size 100M;
# }
```

### 3. Nginx 설정 테스트 및 재시작

```bash
# 설정 파일 문법 검사
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

---

## SSL 인증서 설정

### 1. Certbot 설치

```bash
# CentOS 7/8
sudo yum install -y certbot

# CentOS 9 / Rocky Linux
sudo dnf install -y certbot
```

### 2. SSL 인증서 발급

```bash
# Let's Encrypt 인증서 발급
sudo certbot certonly --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com

# 이메일 입력 및 약관 동의
```

### 3. Nginx HTTPS 설정 활성화

```bash
# Nginx 설정 파일 수정
sudo vim /etc/nginx/conf.d/ai-marketplace.conf

# 위의 HTTPS server 블록 주석 해제
# 설정 테스트
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx
```

### 4. 자동 갱신 설정

```bash
# Cron 작업 추가
sudo crontab -e

# 매일 자정에 인증서 갱신 확인
0 0 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

---

## 자동 배포 설정

### 1. 서버에서 SSH 키 생성 (GitHub Actions용)

```bash
# root 또는 sudo 권한으로 실행
sudo -i

# SSH 키 생성
ssh-keygen -t ed25519 -C "github-actions@yourdomain.com"

# 공개키 출력
cat ~/.ssh/id_ed25519.pub

# 비밀키 출력 (GitHub Secrets에 저장)
cat ~/.ssh/id_ed25519
```

### 2. SSH 키 등록

```bash
# aimarket 사용자의 authorized_keys에 추가
sudo -u aimarket mkdir -p /home/aimarket/.ssh
sudo cat ~/.ssh/id_ed25519.pub | sudo tee -a /home/aimarket/.ssh/authorized_keys
sudo chown -R aimarket:aimarket /home/aimarket/.ssh
sudo chmod 700 /home/aimarket/.ssh
sudo chmod 600 /home/aimarket/.ssh/authorized_keys
```

### 3. GitHub Secrets 설정

**GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret**

- `SSH_PRIVATE_KEY`: 위에서 출력한 비밀키 전체
- `SSH_HOST`: 서버 IP 또는 도메인
- `SSH_USER`: `aimarket`
- `SSH_PORT`: `22`

### 4. GitHub Actions 워크플로우 생성

```bash
# 로컬에서 워크플로우 파일 생성
mkdir -p .github/workflows
```

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to CentOS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SSH_HOST }}
        username: ${{ secrets.SSH_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        port: ${{ secrets.SSH_PORT }}
        script: |
          cd ~/ai-marketplace
          git pull origin main
          npm ci --production=false
          npm run db:generate
          npm run build
          pm2 restart ai-marketplace
```

### 5. 배포 테스트

```bash
# 로컬에서 커밋 및 푸시
git add .
git commit -m "Add deployment workflow"
git push origin main

# GitHub Actions 탭에서 배포 상태 확인
```

---

## 유지보수

### 로그 확인

```bash
# PM2 로그
pm2 logs ai-marketplace

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# 시스템 로그
sudo journalctl -u nginx -f
```

### 애플리케이션 업데이트

```bash
cd ~/ai-marketplace

# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
npm ci --production=false

# 데이터베이스 마이그레이션
npm run db:push

# 빌드
npm run build

# PM2 재시작
pm2 restart ai-marketplace
```

### 데이터베이스 백업

```bash
# Supabase 대시보드에서 자동 백업 활성화
# Settings → Database → Backups

# 또는 pg_dump를 사용한 수동 백업
PGPASSWORD="YOUR_PASSWORD" pg_dump -h db.YOUR_PROJECT.supabase.co \
  -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

---

## 트러블슈팅

### 포트 충돌

```bash
# 3000번 포트 사용 중인 프로세스 확인
sudo lsof -i :3000
sudo kill -9 PID
```

### Nginx 502 Bad Gateway

```bash
# Next.js 앱이 실행 중인지 확인
pm2 status

# 방화벽 확인
sudo firewall-cmd --list-all

# SELinux 설정 (CentOS)
sudo setsebool -P httpd_can_network_connect 1
```

### Prisma 연결 오류

```bash
# .env 파일의 DATABASE_URL 확인
cat .env | grep DATABASE_URL

# Supabase 연결 테스트
npm run db:push
```

---

## 보안 체크리스트

- [ ] `.env` 파일에 프로덕션 비밀키 설정
- [ ] JWT_SECRET 강력한 값으로 변경
- [ ] Supabase RLS (Row Level Security) 활성화
- [ ] HTTPS (SSL) 인증서 설정
- [ ] 방화벽 설정 (필요한 포트만 열기)
- [ ] SSH 키 기반 인증 사용
- [ ] 루트 로그인 비활성화
- [ ] 정기적인 시스템 업데이트
- [ ] fail2ban 설치 (브루트포스 방지)

---

## 참고 자료

- [Next.js Production Deployment](https://nextjs.org/docs/deployment)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Let's Encrypt](https://letsencrypt.org/getting-started/)

---

**배포 완료!** 🚀

문의사항: [GitHub Issues](https://github.com/YOUR_USERNAME/ai-marketplace/issues)
