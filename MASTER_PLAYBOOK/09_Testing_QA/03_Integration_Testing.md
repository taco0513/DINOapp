# 통합 테스트 완전 가이드

## 통합 테스트 전략

SuperClaude AI 워크플로우를 활용하여 시스템 간 상호작용을 효과적으로 검증하는 통합 테스트 구현 가이드입니다.

### 통합 테스트 유형

```yaml
integration_test_types:
  api_integration:
    description: "API 엔드포인트와 데이터베이스 통합"
    scope: ["RESTful APIs", "GraphQL", "gRPC"]
    tools: ["Supertest", "Newman", "Postman"]

  database_integration:
    description: "데이터베이스 연동 및 트랜잭션 테스트"
    scope: ["CRUD operations", "Transactions", "Migrations"]
    tools: ["Testcontainers", "In-memory DB", "Docker"]

  external_service_integration:
    description: "외부 서비스 및 API 연동 테스트"
    scope: ["Third-party APIs", "Payment gateways", "Email services"]
    tools: ["WireMock", "MSW", "Nock"]

  microservice_integration:
    description: "마이크로서비스 간 통신 테스트"
    scope: ["Service mesh", "Message queues", "Event streams"]
    tools: ["Testcontainers", "Docker Compose", "Kafka"]

  frontend_backend_integration:
    description: "프론트엔드와 백엔드 연동 테스트"
    scope: ["API calls", "Authentication", "Data flow"]
    tools: ["MSW", "Cypress", "Playwright"]
```

### SuperClaude를 활용한 통합 테스트 설계

```bash
# 1. API 통합 테스트 구현
/implement "REST API 통합 테스트" --supertest --database --auth

# 2. 데이터베이스 통합 테스트
/implement "DB 통합 테스트" --testcontainers --transactions --migrations

# 3. 외부 서비스 모킹
/implement "외부 API 모킹" --wiremock --contract-testing --scenarios

# 4. 마이크로서비스 테스트
/implement "서비스 간 통합 테스트" --docker-compose --message-queue --health-checks
```

## API 통합 테스트

### Supertest를 활용한 REST API 테스트

```typescript
// test/integration/api/auth.integration.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { DatabaseHelper } from '../../helpers/database.helper';
import { UserFactory } from '../../factories/user.factory';
import { EmailService } from '../../../src/services/email.service';

// Mock 외부 서비스
jest.mock('../../../src/services/email.service');

describe('Authentication API Integration Tests', () => {
  let dbHelper: DatabaseHelper;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeAll(async () => {
    // 테스트 데이터베이스 설정
    dbHelper = new DatabaseHelper();
    await dbHelper.setup();

    // 외부 서비스 모킹
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;
    mockEmailService.sendWelcomeEmail = jest.fn().mockResolvedValue(undefined);
    mockEmailService.sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
  });

  beforeEach(async () => {
    await dbHelper.cleanup();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await dbHelper.teardown();
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('새로운 사용자를 성공적으로 등록한다', async () => {
      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Assert
      expect(response.body).toEqual({
        success: true,
        message: '회원가입이 완료되었습니다. 이메일 인증을 확인해주세요.',
        user: {
          id: expect.any(String),
          email: validRegistrationData.email,
          firstName: validRegistrationData.firstName,
          lastName: validRegistrationData.lastName,
          isActive: false,
          createdAt: expect.any(String)
        }
      });

      // 데이터베이스 검증
      const user = await dbHelper.findUserByEmail(validRegistrationData.email);
      expect(user).toBeDefined();
      expect(user.email).toBe(validRegistrationData.email);
      expect(user.isActive).toBe(false);
      expect(user.verificationToken).toBeDefined();

      // 이메일 발송 검증
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        validRegistrationData.email,
        expect.objectContaining({
          firstName: validRegistrationData.firstName,
          verificationToken: expect.any(String)
        })
      );
    });

    it('중복된 이메일로 등록 시 409 오류를 반환한다', async () => {
      // Arrange
      await UserFactory.createInDb({ email: validRegistrationData.email });

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(409);

      // Assert
      expect(response.body).toEqual({
        success: false,
        error: 'DUPLICATE_EMAIL',
        message: '이미 사용 중인 이메일입니다.'
      });

      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
    });

    it('유효하지 않은 데이터로 등록 시 400 오류를 반환한다', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // 너무 약한 비밀번호
        firstName: '',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'VALIDATION_ERROR',
        message: '입력 데이터가 유효하지 않습니다.',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.stringContaining('이메일')
          }),
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('비밀번호')
          }),
          expect.objectContaining({
            field: 'firstName',
            message: expect.stringContaining('이름')
          })
        ])
      });
    });

    it('이메일 서비스 실패 시에도 사용자는 생성되고 오류를 기록한다', async () => {
      // Arrange
      mockEmailService.sendWelcomeEmail.mockRejectedValue(
        new Error('Email service unavailable')
      );

      // Act
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);

      // 사용자는 여전히 생성되어야 함
      const user = await dbHelper.findUserByEmail(validRegistrationData.email);
      expect(user).toBeDefined();

      // 이메일 발송 시도는 있었어야 함
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await UserFactory.createInDb({
        email: 'test@example.com',
        password: 'hashedPassword123',
        isActive: true
      });
    });

    it('유효한 자격증명으로 로그인을 성공한다', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123' // 원본 비밀번호
        })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '로그인에 성공했습니다.',
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
          isActive: true
        },
        tokens: {
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        }
      });

      // JWT 토큰 검증
      expect(response.body.tokens.accessToken).toMatch(/^eyJ/); // JWT 형식
      expect(response.body.tokens.refreshToken).toMatch(/^eyJ/);
    });

    it('잘못된 비밀번호로 로그인 시 401 오류를 반환한다', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    });

    it('존재하지 않는 이메일로 로그인 시 401 오류를 반환한다', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('INVALID_CREDENTIALS');
    });

    it('비활성화된 계정으로 로그인 시 403 오류를 반환한다', async () => {
      // Arrange
      const inactiveUser = await UserFactory.createInDb({
        email: 'inactive@example.com',
        isActive: false
      });

      // Act
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: inactiveUser.email,
          password: 'password123'
        })
        .expect(403);

      // Assert
      expect(response.body).toEqual({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: '계정이 비활성화되어 있습니다. 이메일 인증을 완료해주세요.'
      });
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let testUser: any;

    beforeEach(async () => {
      testUser = await UserFactory.createInDb({
        email: 'test@example.com',
        isActive: false,
        verificationToken: 'valid_token_123'
      });
    });

    it('유효한 토큰으로 이메일 인증을 성공한다', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: testUser.verificationToken })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '이메일 인증이 완료되었습니다.',
        user: {
          id: testUser.id,
          email: testUser.email,
          isActive: true,
          verifiedAt: expect.any(String)
        }
      });

      // 데이터베이스 상태 검증
      const updatedUser = await dbHelper.findUserById(testUser.id);
      expect(updatedUser.isActive).toBe(true);
      expect(updatedUser.verificationToken).toBeNull();
      expect(updatedUser.verifiedAt).toBeDefined();
    });

    it('유효하지 않은 토큰으로 인증 시 400 오류를 반환한다', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: 'invalid_token' })
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        error: 'INVALID_TOKEN',
        message: '유효하지 않은 인증 토큰입니다.'
      });
    });

    it('이미 인증된 사용자의 토큰으로 인증 시 400 오류를 반환한다', async () => {
      // Arrange
      await dbHelper.updateUser(testUser.id, {
        isActive: true,
        verificationToken: null
      });

      // Act
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: testUser.verificationToken })
        .expect(400);

      // Assert
      expect(response.body.error).toBe('INVALID_TOKEN');
    });
  });

  describe('인증된 엔드포인트 테스트', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      testUser = await UserFactory.createInDb({
        email: 'test@example.com',
        isActive: true
      });

      // 로그인하여 토큰 획득
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      accessToken = loginResponse.body.tokens.accessToken;
    });

    it('유효한 토큰으로 보호된 리소스에 접근할 수 있다', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        user: {
          id: testUser.id,
          email: testUser.email,
          firstName: testUser.firstName,
          lastName: testUser.lastName
        }
      });
    });

    it('토큰 없이 보호된 리소스에 접근 시 401 오류를 반환한다', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toEqual({
        success: false,
        error: 'UNAUTHORIZED',
        message: '인증이 필요합니다.'
      });
    });

    it('유효하지 않은 토큰으로 접근 시 401 오류를 반환한다', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.error).toBe('INVALID_TOKEN');
    });

    it('만료된 토큰으로 접근 시 401 오류를 반환한다', async () => {
      // 만료된 토큰 생성 (테스트용)
      const expiredToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2MDk0NTkwMDAsImV4cCI6MTYwOTQ1OTAwMCwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoidGVzdEBleGFtcGxlLmNvbSJ9';

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('TOKEN_EXPIRED');
    });
  });
});
```

## 데이터베이스 통합 테스트

### Testcontainers를 활용한 데이터베이스 테스트

```typescript
// test/integration/database/user-repository.integration.test.ts
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { Pool } from 'pg';
import { UserRepository } from '../../../src/repositories/user.repository';
import { User } from '../../../src/models/user.model';
import { DatabaseMigrator } from '../../../src/database/migrator';

describe('UserRepository Integration Tests', () => {
  let postgresContainer: StartedTestContainer;
  let pool: Pool;
  let userRepository: UserRepository;
  let migrator: DatabaseMigrator;

  beforeAll(async () => {
    // PostgreSQL 컨테이너 시작
    postgresContainer = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_DB: 'test_db',
        POSTGRES_USER: 'test_user',
        POSTGRES_PASSWORD: 'test_pass'
      })
      .withExposedPorts(5432)
      .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
      .start();

    // 데이터베이스 연결 설정
    pool = new Pool({
      host: postgresContainer.getHost(),
      port: postgresContainer.getMappedPort(5432),
      database: 'test_db',
      user: 'test_user',
      password: 'test_pass'
    });

    // 마이그레이션 실행
    migrator = new DatabaseMigrator(pool);
    await migrator.runMigrations();

    // 리포지토리 초기화
    userRepository = new UserRepository(pool);
  }, 60000); // 컨테이너 시작에 시간이 걸릴 수 있음

  beforeEach(async () => {
    // 각 테스트 전에 데이터 정리
    await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await pool.end();
    await postgresContainer.stop();
  });

  describe('create', () => {
    it('새로운 사용자를 데이터베이스에 저장한다', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed_password',
        verificationToken: 'token123'
      };

      // Act
      const createdUser = await userRepository.create(userData);

      // Assert
      expect(createdUser).toMatchObject({
        id: expect.any(Number),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date)
      });

      // 데이터베이스에서 직접 확인
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [userData.email]
      );

      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].email).toBe(userData.email);
    });

    it('중복된 이메일로 사용자 생성 시 오류를 발생시킨다', async () => {
      // Arrange
      const userData = {
        email: 'duplicate@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hashed_password'
      };

      await userRepository.create(userData);

      // Act & Assert
      await expect(userRepository.create(userData))
        .rejects.toThrow('duplicate key value violates unique constraint');
    });

    it('필수 필드 누락 시 오류를 발생시킨다', async () => {
      const incompleteData = {
        firstName: 'John',
        lastName: 'Doe'
        // email 누락
      };

      await expect(userRepository.create(incompleteData as any))
        .rejects.toThrow();
    });
  });

  describe('findByEmail', () => {
    beforeEach(async () => {
      // 테스트 데이터 준비
      await userRepository.create({
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        passwordHash: 'hashed_password'
      });
    });

    it('존재하는 이메일로 사용자를 찾는다', async () => {
      const user = await userRepository.findByEmail('existing@example.com');

      expect(user).toMatchObject({
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Smith'
      });
    });

    it('존재하지 않는 이메일로 조회 시 null을 반환한다', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('대소문자를 구분하지 않고 이메일을 검색한다', async () => {
      const user = await userRepository.findByEmail('EXISTING@EXAMPLE.COM');
      expect(user).not.toBeNull();
      expect(user.email).toBe('existing@example.com');
    });
  });

  describe('update', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userRepository.create({
        email: 'update@example.com',
        firstName: 'Update',
        lastName: 'Test',
        passwordHash: 'hashed_password'
      });
    });

    it('사용자 정보를 업데이트한다', async () => {
      // Act
      const updatedUser = await userRepository.update(testUser.id, {
        firstName: 'Updated',
        lastName: 'Name',
        isActive: true
      });

      // Assert
      expect(updatedUser).toMatchObject({
        id: testUser.id,
        email: testUser.email,
        firstName: 'Updated',
        lastName: 'Name',
        isActive: true,
        updatedAt: expect.any(Date)
      });

      // updatedAt이 변경되었는지 확인
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        testUser.updatedAt.getTime()
      );
    });

    it('존재하지 않는 사용자 업데이트 시 오류를 발생시킨다', async () => {
      await expect(userRepository.update(99999, { firstName: 'New Name' }))
        .rejects.toThrow('User not found');
    });

    it('부분 업데이트를 지원한다', async () => {
      const updatedUser = await userRepository.update(testUser.id, {
        isActive: true
      });

      expect(updatedUser.firstName).toBe(testUser.firstName);
      expect(updatedUser.lastName).toBe(testUser.lastName);
      expect(updatedUser.isActive).toBe(true);
    });
  });

  describe('delete', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await userRepository.create({
        email: 'delete@example.com',
        firstName: 'Delete',
        lastName: 'Test',
        passwordHash: 'hashed_password'
      });
    });

    it('사용자를 삭제한다', async () => {
      // Act
      const result = await userRepository.delete(testUser.id);

      // Assert
      expect(result).toBe(true);

      // 삭제 확인
      const deletedUser = await userRepository.findById(testUser.id);
      expect(deletedUser).toBeNull();
    });

    it('존재하지 않는 사용자 삭제 시 false를 반환한다', async () => {
      const result = await userRepository.delete(99999);
      expect(result).toBe(false);
    });
  });

  describe('트랜잭션 테스트', () => {
    it('트랜잭션 내에서 오류 발생 시 롤백된다', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        // 첫 번째 사용자 생성
        await client.query(
          'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4)',
          ['user1@example.com', 'User', 'One', 'hash1']
        );

        // 두 번째 사용자 생성 (의도적으로 오류 발생)
        await client.query(
          'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4)',
          ['user1@example.com', 'User', 'Two', 'hash2'] // 중복 이메일
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }

      // 롤백으로 인해 아무 사용자도 생성되지 않았어야 함
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(parseInt(result.rows[0].count)).toBe(0);
    });

    it('트랜잭션이 성공적으로 커밋된다', async () => {
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        await client.query(
          'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4)',
          ['user1@example.com', 'User', 'One', 'hash1']
        );

        await client.query(
          'INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4)',
          ['user2@example.com', 'User', 'Two', 'hash2']
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }

      // 두 사용자 모두 생성되었어야 함
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(parseInt(result.rows[0].count)).toBe(2);
    });
  });

  describe('복잡한 쿼리 테스트', () => {
    beforeEach(async () => {
      // 테스트 데이터 준비
      const users = [
        { email: 'active1@example.com', firstName: 'Active', lastName: 'One', isActive: true },
        { email: 'active2@example.com', firstName: 'Active', lastName: 'Two', isActive: true },
        { email: 'inactive1@example.com', firstName: 'Inactive', lastName: 'One', isActive: false },
        { email: 'inactive2@example.com', firstName: 'Inactive', lastName: 'Two', isActive: false }
      ];

      for (const userData of users) {
        await userRepository.create({
          ...userData,
          passwordHash: 'hashed_password'
        });
      }
    });

    it('활성 사용자만 조회한다', async () => {
      const activeUsers = await userRepository.findActiveUsers();

      expect(activeUsers).toHaveLength(2);
      expect(activeUsers.every(user => user.isActive)).toBe(true);
    });

    it('페이지네이션이 올바르게 작동한다', async () => {
      const page1 = await userRepository.findUsersWithPagination(1, 2);
      const page2 = await userRepository.findUsersWithPagination(2, 2);

      expect(page1.users).toHaveLength(2);
      expect(page2.users).toHaveLength(2);
      expect(page1.total).toBe(4);
      expect(page2.total).toBe(4);

      // 다른 사용자들이어야 함
      const page1Ids = page1.users.map(u => u.id);
      const page2Ids = page2.users.map(u => u.id);
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it('검색 기능이 올바르게 작동한다', async () => {
      const searchResults = await userRepository.searchUsers('Active');

      expect(searchResults).toHaveLength(2);
      expect(searchResults.every(user =>
        user.firstName.includes('Active') || user.lastName.includes('Active')
      )).toBe(true);
    });
  });

  describe('성능 테스트', () => {
    it('대량 데이터 삽입 성능을 테스트한다', async () => {
      const userCount = 1000;
      const users = Array.from({ length: userCount }, (_, i) => ({
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Test',
        passwordHash: 'hashed_password'
      }));

      const startTime = Date.now();

      // 배치 삽입
      await userRepository.createMany(users);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // 성능 검증 (1000개 사용자를 5초 내에 삽입)
      expect(duration).toBeLessThan(5000);

      // 데이터 확인
      const result = await pool.query('SELECT COUNT(*) FROM users');
      expect(parseInt(result.rows[0].count)).toBe(userCount);
    });

    it('대량 데이터 조회 성능을 테스트한다', async () => {
      // 테스트 데이터 준비
      const userCount = 10000;
      const users = Array.from({ length: userCount }, (_, i) => ({
        email: `perfuser${i}@example.com`,
        firstName: `User${i}`,
        lastName: 'Performance',
        passwordHash: 'hashed_password'
      }));

      await userRepository.createMany(users);

      // 조회 성능 테스트
      const startTime = Date.now();
      const allUsers = await userRepository.findAll();
      const endTime = Date.now();

      const duration = endTime - startTime;

      expect(allUsers).toHaveLength(userCount);
      expect(duration).toBeLessThan(1000); // 1초 내에 조회
    });
  });
});
```

## 외부 서비스 통합 테스트

### WireMock을 활용한 외부 API 모킹

```typescript
// test/integration/external/payment-service.integration.test.ts
import { WireMockApi } from '@wiremock/api';
import { PaymentService } from '../../../src/services/payment.service';
import { PaymentRequest, PaymentStatus } from '../../../src/types/payment.types';

describe('PaymentService Integration Tests', () => {
  let wireMock: WireMockApi;
  let paymentService: PaymentService;

  beforeAll(async () => {
    // WireMock 서버 시작
    wireMock = new WireMockApi('http://localhost:8080');

    // PaymentService 초기화 (WireMock URL 사용)
    paymentService = new PaymentService({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-api-key',
      timeout: 5000
    });
  });

  beforeEach(async () => {
    // 각 테스트 전에 모든 스텁 제거
    await wireMock.global.resetAll();
  });

  afterAll(async () => {
    await wireMock.global.shutdown();
  });

  describe('processPayment', () => {
    const validPaymentRequest: PaymentRequest = {
      amount: 10000, // 100.00 KRW
      currency: 'KRW',
      cardNumber: '4111111111111111',
      expiryMonth: 12,
      expiryYear: 2025,
      cvv: '123',
      orderId: 'order_12345'
    };

    it('성공적인 결제를 처리한다', async () => {
      // Arrange - WireMock 스텁 설정
      await wireMock.register({
        request: {
          method: 'POST',
          url: '/api/v1/payments',
          headers: {
            'Authorization': { equalTo: 'Bearer test-api-key' },
            'Content-Type': { equalTo: 'application/json' }
          },
          bodyPatterns: [
            {
              matchesJsonPath: '$.amount',
              equalToJson: 10000
            },
            {
              matchesJsonPath: '$.currency',
              equalTo: 'KRW'
            }
          ]
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            id: 'payment_67890',
            status: 'success',
            amount: 10000,
            currency: 'KRW',
            orderId: 'order_12345',
            transactionId: 'txn_abcdef',
            createdAt: '2024-01-15T10:30:00Z'
          }
        }
      });

      // Act
      const result = await paymentService.processPayment(validPaymentRequest);

      // Assert
      expect(result).toEqual({
        id: 'payment_67890',
        status: PaymentStatus.SUCCESS,
        amount: 10000,
        currency: 'KRW',
        orderId: 'order_12345',
        transactionId: 'txn_abcdef',
        createdAt: new Date('2024-01-15T10:30:00Z')
      });

      // WireMock 호출 검증
      const requests = await wireMock.getRequests();
      expect(requests.requests).toHaveLength(1);

      const request = requests.requests[0];
      expect(request.request.method).toBe('POST');
      expect(request.request.url).toBe('/api/v1/payments');
      expect(JSON.parse(request.request.body)).toMatchObject({
        amount: 10000,
        currency: 'KRW',
        orderId: 'order_12345'
      });
    });

    it('결제 실패 시 적절한 오류를 반환한다', async () => {
      // Arrange
      await wireMock.register({
        request: {
          method: 'POST',
          url: '/api/v1/payments'
        },
        response: {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'INVALID_CARD',
            message: '유효하지 않은 카드 정보입니다.',
            code: 'CARD_VALIDATION_FAILED'
          }
        }
      });

      // Act & Assert
      await expect(paymentService.processPayment(validPaymentRequest))
        .rejects.toThrow('유효하지 않은 카드 정보입니다.');
    });

    it('결제 게이트웨이 타임아웃을 처리한다', async () => {
      // Arrange
      await wireMock.register({
        request: {
          method: 'POST',
          url: '/api/v1/payments'
        },
        response: {
          status: 200,
          fixedDelayMilliseconds: 6000, // 6초 지연 (timeout보다 길게)
          jsonBody: {
            id: 'payment_timeout',
            status: 'success'
          }
        }
      });

      // Act & Assert
      await expect(paymentService.processPayment(validPaymentRequest))
        .rejects.toThrow('Request timeout');
    });

    it('일시적 서버 오류에 대해 재시도한다', async () => {
      // Arrange - 첫 번째 호출은 실패, 두 번째 호출은 성공
      await wireMock.register({
        request: {
          method: 'POST',
          url: '/api/v1/payments'
        },
        response: {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'INTERNAL_SERVER_ERROR',
            message: '일시적인 서버 오류입니다.'
          }
        }
      });

      await wireMock.register({
        request: {
          method: 'POST',
          url: '/api/v1/payments'
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            id: 'payment_retry_success',
            status: 'success',
            amount: 10000,
            currency: 'KRW'
          }
        },
        priority: 2 // 높은 우선순위로 두 번째 응답 설정
      });

      // Act
      const result = await paymentService.processPayment(validPaymentRequest);

      // Assert
      expect(result.id).toBe('payment_retry_success');
      expect(result.status).toBe(PaymentStatus.SUCCESS);

      // 재시도 확인 (총 2번 호출되어야 함)
      const requests = await wireMock.getRequests();
      expect(requests.requests).toHaveLength(2);
    });

    it('다양한 결제 시나리오를 테스트한다', async () => {
      const scenarios = [
        {
          name: '부족한 잔액',
          request: { ...validPaymentRequest, amount: 1000000 },
          response: {
            status: 402,
            jsonBody: {
              error: 'INSUFFICIENT_FUNDS',
              message: '잔액이 부족합니다.'
            }
          },
          expectedError: '잔액이 부족합니다.'
        },
        {
          name: '만료된 카드',
          request: { ...validPaymentRequest, expiryYear: 2020 },
          response: {
            status: 400,
            jsonBody: {
              error: 'EXPIRED_CARD',
              message: '만료된 카드입니다.'
            }
          },
          expectedError: '만료된 카드입니다.'
        },
        {
          name: '블록된 카드',
          request: { ...validPaymentRequest, cardNumber: '4000000000000002' },
          response: {
            status: 403,
            jsonBody: {
              error: 'CARD_BLOCKED',
              message: '카드가 블록되었습니다.'
            }
          },
          expectedError: '카드가 블록되었습니다.'
        }
      ];

      for (const scenario of scenarios) {
        // Arrange
        await wireMock.global.resetAll();
        await wireMock.register({
          request: {
            method: 'POST',
            url: '/api/v1/payments'
          },
          response: scenario.response
        });

        // Act & Assert
        await expect(paymentService.processPayment(scenario.request))
          .rejects.toThrow(scenario.expectedError);
      }
    });
  });

  describe('getPaymentStatus', () => {
    it('결제 상태를 조회한다', async () => {
      // Arrange
      const paymentId = 'payment_12345';

      await wireMock.register({
        request: {
          method: 'GET',
          url: `/api/v1/payments/${paymentId}`
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            id: paymentId,
            status: 'completed',
            amount: 10000,
            currency: 'KRW',
            orderId: 'order_12345',
            completedAt: '2024-01-15T10:35:00Z'
          }
        }
      });

      // Act
      const status = await paymentService.getPaymentStatus(paymentId);

      // Assert
      expect(status).toEqual({
        id: paymentId,
        status: PaymentStatus.COMPLETED,
        amount: 10000,
        currency: 'KRW',
        orderId: 'order_12345',
        completedAt: new Date('2024-01-15T10:35:00Z')
      });
    });

    it('존재하지 않는 결제 ID 조회 시 404 오류를 반환한다', async () => {
      // Arrange
      await wireMock.register({
        request: {
          method: 'GET',
          urlPattern: '/api/v1/payments/.*'
        },
        response: {
          status: 404,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'PAYMENT_NOT_FOUND',
            message: '결제 정보를 찾을 수 없습니다.'
          }
        }
      });

      // Act & Assert
      await expect(paymentService.getPaymentStatus('nonexistent'))
        .rejects.toThrow('결제 정보를 찾을 수 없습니다.');
    });
  });

  describe('refundPayment', () => {
    it('부분 환불을 처리한다', async () => {
      // Arrange
      const paymentId = 'payment_12345';
      const refundAmount = 5000;

      await wireMock.register({
        request: {
          method: 'POST',
          url: `/api/v1/payments/${paymentId}/refund`,
          bodyPatterns: [
            {
              matchesJsonPath: '$.amount',
              equalToJson: refundAmount
            }
          ]
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            id: 'refund_67890',
            paymentId: paymentId,
            amount: refundAmount,
            status: 'processed',
            processedAt: '2024-01-15T11:00:00Z'
          }
        }
      });

      // Act
      const refund = await paymentService.refundPayment(paymentId, refundAmount);

      // Assert
      expect(refund).toEqual({
        id: 'refund_67890',
        paymentId: paymentId,
        amount: refundAmount,
        status: 'processed',
        processedAt: new Date('2024-01-15T11:00:00Z')
      });
    });

    it('이미 환불된 결제에 대해 중복 환불 오류를 반환한다', async () => {
      // Arrange
      await wireMock.register({
        request: {
          method: 'POST',
          urlPattern: '/api/v1/payments/.*/refund'
        },
        response: {
          status: 409,
          headers: {
            'Content-Type': 'application/json'
          },
          jsonBody: {
            error: 'ALREADY_REFUNDED',
            message: '이미 환불된 결제입니다.'
          }
        }
      });

      // Act & Assert
      await expect(paymentService.refundPayment('payment_12345', 5000))
        .rejects.toThrow('이미 환불된 결제입니다.');
    });
  });
});
```

이 통합 테스트 가이드는 SuperClaude AI 워크플로우를 활용하여 시스템 간의 상호작용을 효과적으로 검증하는 방법을 제시합니다. 다음 파일에서는 E2E 테스트에 대해 다루겠습니다.