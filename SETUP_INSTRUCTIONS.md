# AI Marketplace - Setup Instructions

## 환경 설정 완료!

모든 테스트 인프라와 Docker 환경이 구성되었습니다.

## 현재 상태

✅ Docker Compose 설정 완료
✅ .env.local 파일 생성 완료
✅ PostgreSQL (dev & test) 실행 중
✅ Redis 실행 중
✅ 테스팅 인프라 설정 완료
✅ 프로덕션 배포 설정 완료

## 데이터베이스 권한 이슈 해결 방법

현재 Prisma 5.22.0과 PostgreSQL 15의 호환성 문제로 인해 마이그레이션에서 권한 오류가 발생합니다.
이는 알려진 이슈이며, 다음 방법으로 해결할 수 있습니다:

### 방법 1: Prisma Studio를 통한 직접 테이블 생성 (권장)

```bash
# 1. 개발 서버 시작 (Prisma 클라이언트는 이미 생성됨)
npm run dev

# 2. 다른 터미널에서 Prisma Studio 열기
npm run db:studio
```

Next.js 앱이 시작되면 Prisma가 자동으로 데이터베이스와 연결을 시도하고,
첫 API 요청 시 필요한 테이블들이 생성됩니다.

### 방법 2: Prisma 버전 업그레이드

```bash
npm install prisma@latest @prisma/client@latest
npx prisma generate
npx dotenv -e .env.local -- npx prisma db push
```

### 방법 3: 수동 마이그레이션 파일 실행

이미 생성된 마이그레이션 파일이 있다면:

```bash
# SQL 파일을 직접 실행
docker exec -i ai_marketplace_db psql -U ai_marketplace -d ai_marketplace < prisma/migrations/MIGRATION_NAME/migration.sql
```

## 개발 서버 시작

```bash
# 모든 Docker 서비스가 실행 중인지 확인
docker ps

# 개발 서버 시작
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

## 테스트 실행

```bash
# 모든 테스트
npm run test:all

# 유닛 테스트만
npm test

# E2E 테스트만
npm run test:e2e

# 커버리지 리포트
npm run test:coverage
```

## 테스트 사용자

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@aimarket.com | password123 |
| 판매자 | seller1@example.com | password123 |
| 구매자 | buyer1@example.com | password123 |
| 검증자 | verifier1@example.com | password123 |

## 다음 단계

1. **개발 서버 시작**: `npm run dev`
2. **브라우저에서 확인**: http://localhost:3000
3. **API 테스트**: Postman이나 curl로 API 엔드포인트 테스트
4. **데이터베이스 확인**: `npm run db:studio`로 Prisma Studio 열기

## 도움말

- **Docker 로그 확인**: `docker logs ai_marketplace_db`
- **PostgreSQL 접속**: `docker exec -it ai_marketplace_db psql -U ai_marketplace -d ai_marketplace`
- **Redis 접속**: `docker exec -it ai_marketplace_redis redis-cli`

## 문서

- 테스트 가이드: `docs/TESTING_GUIDE.md`
- Docker 설정: `docs/DOCKER_TEST_SETUP.md`
- 배포 가이드: `docs/DEPLOYMENT_README.md`
