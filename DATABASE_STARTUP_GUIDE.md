# 데이터베이스 시작 가이드

## 🚨 로그인 에러 해결

"POST /api/auth/login 500 (Internal Server Error)" 에러가 발생하는 경우:

### 원인
데이터베이스(PostgreSQL)가 실행되지 않고 있어 연결할 수 없습니다.

### 해결 방법

#### 1. Docker Desktop 실행
1. Docker Desktop 애플리케이션을 실행합니다
2. Docker가 완전히 시작될 때까지 기다립니다 (상태바의 Docker 아이콘이 안정화될 때까지)

#### 2. 데이터베이스 시작

**방법 A: 자동 스크립트 사용 (권장)**
```bash
npm run db:start
```

**방법 B: Docker Compose 직접 사용**
```bash
docker-compose up -d postgres redis
```

**방법 C: 수동 시작 (이미 생성된 경우)**
```bash
docker start ai_marketplace_db ai_marketplace_redis
```

#### 3. 데이터베이스 상태 확인
```bash
docker ps | grep ai_marketplace
```

정상 출력 예시:
```
ai_marketplace_db      postgres:14-alpine   Up 2 minutes   0.0.0.0:5434->5432/tcp
ai_marketplace_redis   redis:7-alpine       Up 2 minutes   0.0.0.0:6379->6379/tcp
```

#### 4. 연결 테스트
```bash
docker exec ai_marketplace_db pg_isready -U ai_marketplace -d ai_marketplace
```

성공 시: `localhost:5432 - accepting connections`

---

## 🚀 완전 자동 시작

개발 서버와 데이터베이스를 동시에 시작:

```bash
npm run dev:full
```

이 명령은:
1. Docker 실행 확인
2. 데이터베이스 컨테이너 시작/생성
3. 데이터베이스 준비 대기
4. Next.js 개발 서버 시작

---

## 📊 유용한 명령어

### 데이터베이스 관리
```bash
# 데이터베이스 시작
npm run db:start

# 데이터베이스 중지
npm run db:stop

# 데이터베이스 재시작
npm run db:restart

# 데이터베이스 로그 보기 (실시간)
npm run db:logs

# 데이터베이스 UI 열기
docker-compose --profile tools up -d adminer
# 그 후 http://localhost:8080 접속
# 시스템: PostgreSQL
# 서버: postgres
# 사용자: ai_marketplace
# 비밀번호: dev_password_change_in_prod
# 데이터베이스: ai_marketplace
```

### Prisma 관리
```bash
# Prisma Studio 열기 (데이터베이스 GUI)
npm run db:studio

# 스키마 동기화
npm run db:push

# 마이그레이션 생성
npm run db:migrate

# Prisma Client 재생성
npm run db:generate

# 테스트 데이터 시드
npm run db:seed
```

---

## 🔧 트러블슈팅

### "Cannot connect to Docker daemon" 에러
**원인**: Docker Desktop이 실행되지 않음

**해결**:
1. Docker Desktop 애플리케이션을 실행
2. Docker가 완전히 시작될 때까지 대기
3. 다시 `npm run db:start` 실행

### "Port 5434 is already in use" 에러
**원인**: 다른 프로세스가 5434 포트를 사용 중

**해결**:
```bash
# 5434 포트를 사용 중인 프로세스 찾기
lsof -i :5434

# 또는 포트 변경
# docker-compose.yml에서 ports를 "5435:5432"로 변경
# .env.local에서 DATABASE_URL의 포트도 5435로 변경
```

### "Database is not ready" 에러
**원인**: 데이터베이스가 아직 초기화 중

**해결**:
```bash
# 10-15초 대기 후 다시 시도
sleep 10
npm run db:start
```

### 로그인 여전히 실패
**원인**: 데이터베이스에 사용자 데이터가 없음

**해결**:
```bash
# 테스트 데이터 시드
npm run db:seed

# 또는 회원가입 페이지에서 새 계정 생성
# http://localhost:3000/register
```

---

## 📝 기본 설정

### 데이터베이스 접속 정보
- **호스트**: localhost
- **포트**: 5434
- **사용자**: ai_marketplace
- **비밀번호**: dev_password_change_in_prod
- **데이터베이스**: ai_marketplace

### 환경 변수 (.env.local)
```env
DATABASE_URL="postgresql://ai_marketplace:dev_password_change_in_prod@localhost:5434/ai_marketplace"
```

---

## ✅ 체크리스트

개발 시작 전 확인사항:
- [ ] Docker Desktop이 실행 중인가?
- [ ] `docker ps`로 ai_marketplace_db 컨테이너가 보이는가?
- [ ] 데이터베이스 연결 테스트 성공했는가?
- [ ] 테스트 계정이 있는가? (또는 시드 데이터 로드했는가?)

---

## 🎯 빠른 시작 요약

```bash
# 1. Docker Desktop 실행 (GUI)

# 2. 터미널에서:
npm run db:start

# 3. 개발 서버 시작:
npm run dev

# 4. 브라우저에서 확인:
# http://localhost:3000
```

---

## 🆘 여전히 문제가 있나요?

1. **컨테이너 완전 재시작**:
   ```bash
   docker stop ai_marketplace_db
   docker rm ai_marketplace_db
   docker-compose up -d postgres
   npm run db:push
   npm run db:seed
   ```

2. **로그 확인**:
   ```bash
   docker logs ai_marketplace_db -f
   ```

3. **Docker 완전 초기화** (주의: 모든 데이터 삭제):
   ```bash
   docker-compose down -v
   docker-compose up -d postgres redis
   npm run db:push
   npm run db:seed
   ```

---

**이제 로그인 에러가 발생하지 않습니다!** 🎉

데이터베이스가 실행되면 모든 API가 정상 작동합니다.
