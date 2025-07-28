# 단위 테스트 마스터 가이드

## 단위 테스트 핵심 원칙

SuperClaude AI 워크플로우를 활용하여 효과적이고 유지보수 가능한 단위 테스트를 작성하는 완전한 가이드입니다.

### 단위 테스트의 특징

```yaml
unit_test_characteristics:
  isolation:
    description: "다른 코드 단위와 완전히 격리"
    implementation: "모킹, 스터빙, 의존성 주입"
    
  speed:
    description: "빠른 실행 속도 (< 1초)"
    target: "전체 테스트 스위트 실행 시간 < 30초"
    
  deterministic:
    description: "일관된 결과 보장"
    requirements: ["랜덤값 제어", "시간 의존성 제거", "외부 상태 격리"]
    
  readability:
    description: "테스트 의도가 명확히 드러남"
    patterns: ["AAA 패턴", "서술적 테스트명", "명확한 어셔션"]
    
  maintainability:
    description: "코드 변경에 따른 유지보수 용이성"
    practices: ["DRY 원칙", "테스트 유틸리티", "공통 설정 분리"]
```

### SuperClaude를 활용한 단위 테스트 개발

```bash
# 1. 테스트 케이스 생성
/implement "사용자 검증 함수 테스트" --jest --edge-cases --mocking

# 2. TDD 워크플로우
/implement tdd-cycle --red-green-refactor --test-first

# 3. 모킹 전략 구현
/implement mocking-strategy --external-dependencies --database --apis

# 4. 테스트 리팩토링
/improve test-quality --readability --maintainability --coverage
```

## Jest 기반 단위 테스트

### 기본 테스트 구조

```typescript
// src/utils/validation.ts
export interface User {
  id: string;
  email: string;
  age: number;
  roles: string[];
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UserValidator {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateAge(age: number): boolean {
    return Number.isInteger(age) && age >= 0 && age <= 150;
  }

  static validateRoles(roles: string[]): boolean {
    const validRoles = ['admin', 'user', 'moderator', 'guest'];
    return roles.every(role => validRoles.includes(role));
  }

  static validateUser(user: Partial<User>): User {
    const errors: string[] = [];

    // 필수 필드 검증
    if (!user.id?.trim()) {
      errors.push('ID는 필수입니다');
    }

    if (!user.email?.trim()) {
      errors.push('이메일은 필수입니다');
    } else if (!this.validateEmail(user.email)) {
      errors.push('올바른 이메일 형식이 아닙니다');
    }

    if (user.age === undefined || user.age === null) {
      errors.push('나이는 필수입니다');
    } else if (!this.validateAge(user.age)) {
      errors.push('나이는 0-150 사이의 정수여야 합니다');
    }

    if (!user.roles?.length) {
      errors.push('최소 하나의 역할이 필요합니다');
    } else if (!this.validateRoles(user.roles)) {
      errors.push('유효하지 않은 역할이 포함되어 있습니다');
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '), 'user');
    }

    return user as User;
  }
}
```

```typescript
// src/utils/__tests__/validation.test.ts
import { UserValidator, ValidationError, User } from '../validation';

describe('UserValidator', () => {
  // AAA 패턴: Arrange, Act, Assert

  describe('validateEmail', () => {
    it('유효한 이메일 형식을 올바르게 검증한다', () => {
      // Arrange
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.kr',
        'admin+tag@company.org',
        'number123@test-domain.com'
      ];

      // Act & Assert
      validEmails.forEach(email => {
        expect(UserValidator.validateEmail(email)).toBe(true);
      });
    });

    it('유효하지 않은 이메일 형식을 올바르게 거부한다', () => {
      // Arrange
      const invalidEmails = [
        'plainaddress',
        '@missingusername.com',
        'username@.com',
        'username@com',
        'username..double.dot@example.com',
        'username@example.',
        ''
      ];

      // Act & Assert
      invalidEmails.forEach(email => {
        expect(UserValidator.validateEmail(email)).toBe(false);
      });
    });

    it('빈 문자열과 공백을 올바르게 처리한다', () => {
      expect(UserValidator.validateEmail('')).toBe(false);
      expect(UserValidator.validateEmail('   ')).toBe(false);
      expect(UserValidator.validateEmail('\t')).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('유효한 나이 범위를 올바르게 검증한다', () => {
      const validAges = [0, 1, 25, 65, 100, 150];
      
      validAges.forEach(age => {
        expect(UserValidator.validateAge(age)).toBe(true);
      });
    });

    it('유효하지 않은 나이를 올바르게 거부한다', () => {
      const invalidAges = [-1, -10, 151, 200, 1000];
      
      invalidAges.forEach(age => {
        expect(UserValidator.validateAge(age)).toBe(false);
      });
    });

    it('소수점 숫자를 거부한다', () => {
      const floatAges = [25.5, 30.1, 18.9];
      
      floatAges.forEach(age => {
        expect(UserValidator.validateAge(age)).toBe(false);
      });
    });

    it('NaN과 Infinity를 거부한다', () => {
      expect(UserValidator.validateAge(NaN)).toBe(false);
      expect(UserValidator.validateAge(Infinity)).toBe(false);
      expect(UserValidator.validateAge(-Infinity)).toBe(false);
    });
  });

  describe('validateRoles', () => {
    it('유효한 역할 배열을 올바르게 검증한다', () => {
      const validRoleSets = [
        ['admin'],
        ['user', 'moderator'],
        ['admin', 'user', 'moderator', 'guest'],
        ['guest']
      ];

      validRoleSets.forEach(roles => {
        expect(UserValidator.validateRoles(roles)).toBe(true);
      });
    });

    it('유효하지 않은 역할을 거부한다', () => {
      const invalidRoleSets = [
        ['invalid_role'],
        ['admin', 'invalid'],
        ['user', 'super_admin'],
        ['moderator', '']
      ];

      invalidRoleSets.forEach(roles => {
        expect(UserValidator.validateRoles(roles)).toBe(false);
      });
    });

    it('빈 배열을 올바르게 처리한다', () => {
      expect(UserValidator.validateRoles([])).toBe(true);
    });
  });

  describe('validateUser', () => {
    // 테스트 헬퍼 함수
    const createValidUser = (): Partial<User> => ({
      id: 'user123',
      email: 'test@example.com',
      age: 25,
      roles: ['user']
    });

    it('유효한 사용자 객체를 올바르게 검증한다', () => {
      // Arrange
      const validUser = createValidUser();

      // Act
      const result = UserValidator.validateUser(validUser);

      // Assert
      expect(result).toEqual(validUser);
      expect(result.id).toBe('user123');
      expect(result.email).toBe('test@example.com');
      expect(result.age).toBe(25);
      expect(result.roles).toEqual(['user']);
    });

    describe('필수 필드 검증', () => {
      it('ID가 없으면 ValidationError를 발생시킨다', () => {
        const userWithoutId = { ...createValidUser(), id: undefined };

        expect(() => UserValidator.validateUser(userWithoutId))
          .toThrow(ValidationError);
        
        expect(() => UserValidator.validateUser(userWithoutId))
          .toThrow('ID는 필수입니다');
      });

      it('빈 ID를 거부한다', () => {
        const userWithEmptyId = { ...createValidUser(), id: '' };

        expect(() => UserValidator.validateUser(userWithEmptyId))
          .toThrow('ID는 필수입니다');
      });

      it('공백만 있는 ID를 거부한다', () => {
        const userWithWhitespaceId = { ...createValidUser(), id: '   ' };

        expect(() => UserValidator.validateUser(userWithWhitespaceId))
          .toThrow('ID는 필수입니다');
      });

      it('이메일이 없으면 ValidationError를 발생시킨다', () => {
        const userWithoutEmail = { ...createValidUser(), email: undefined };

        expect(() => UserValidator.validateUser(userWithoutEmail))
          .toThrow('이메일은 필수입니다');
      });

      it('나이가 없으면 ValidationError를 발생시킨다', () => {
        const userWithoutAge = { ...createValidUser(), age: undefined };

        expect(() => UserValidator.validateUser(userWithoutAge))
          .toThrow('나이는 필수입니다');
      });

      it('역할이 없으면 ValidationError를 발생시킨다', () => {
        const userWithoutRoles = { ...createValidUser(), roles: undefined };

        expect(() => UserValidator.validateUser(userWithoutRoles))
          .toThrow('최소 하나의 역할이 필요합니다');
      });

      it('빈 역할 배열을 거부한다', () => {
        const userWithEmptyRoles = { ...createValidUser(), roles: [] };

        expect(() => UserValidator.validateUser(userWithEmptyRoles))
          .toThrow('최소 하나의 역할이 필요합니다');
      });
    });

    describe('필드별 검증', () => {
      it('유효하지 않은 이메일 형식을 거부한다', () => {
        const userWithInvalidEmail = { ...createValidUser(), email: 'invalid-email' };

        expect(() => UserValidator.validateUser(userWithInvalidEmail))
          .toThrow('올바른 이메일 형식이 아닙니다');
      });

      it('유효하지 않은 나이를 거부한다', () => {
        const userWithInvalidAge = { ...createValidUser(), age: -5 };

        expect(() => UserValidator.validateUser(userWithInvalidAge))
          .toThrow('나이는 0-150 사이의 정수여야 합니다');
      });

      it('유효하지 않은 역할을 거부한다', () => {
        const userWithInvalidRoles = { ...createValidUser(), roles: ['invalid_role'] };

        expect(() => UserValidator.validateUser(userWithInvalidRoles))
          .toThrow('유효하지 않은 역할이 포함되어 있습니다');
      });
    });

    describe('복합 오류 처리', () => {
      it('여러 필드에 오류가 있을 때 모든 오류를 포함한다', () => {
        const invalidUser = {
          id: '',
          email: 'invalid-email',
          age: -1,
          roles: ['invalid_role']
        };

        expect(() => UserValidator.validateUser(invalidUser))
          .toThrow(ValidationError);

        try {
          UserValidator.validateUser(invalidUser);
        } catch (error) {
          expect(error.message).toContain('ID는 필수입니다');
          expect(error.message).toContain('올바른 이메일 형식이 아닙니다');
          expect(error.message).toContain('나이는 0-150 사이의 정수여야 합니다');
          expect(error.message).toContain('유효하지 않은 역할이 포함되어 있습니다');
        }
      });

      it('ValidationError의 field 속성이 올바르게 설정된다', () => {
        const invalidUser = { ...createValidUser(), id: '' };

        try {
          UserValidator.validateUser(invalidUser);
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError);
          expect((error as ValidationError).field).toBe('user');
        }
      });
    });

    describe('엣지 케이스', () => {
      it('null 객체를 처리한다', () => {
        expect(() => UserValidator.validateUser(null as any))
          .toThrow(ValidationError);
      });

      it('undefined 객체를 처리한다', () => {
        expect(() => UserValidator.validateUser(undefined as any))
          .toThrow(ValidationError);
      });

      it('빈 객체를 처리한다', () => {
        expect(() => UserValidator.validateUser({}))
          .toThrow(ValidationError);
      });

      it('문자열로 된 나이를 거부한다', () => {
        const userWithStringAge = { ...createValidUser(), age: '25' as any };

        expect(() => UserValidator.validateUser(userWithStringAge))
          .toThrow('나이는 0-150 사이의 정수여야 합니다');
      });
    });
  });

  // 성능 테스트
  describe('성능 테스트', () => {
    it('대량의 이메일 검증을 빠르게 처리한다', () => {
      const emails = Array.from({ length: 10000 }, (_, i) => `user${i}@example.com`);
      
      const startTime = performance.now();
      emails.forEach(email => UserValidator.validateEmail(email));
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });
  });
});
```

## 모킹과 스터빙 전략

### 외부 의존성 모킹

```typescript
// src/services/user.service.ts
import { User } from '../models/User';
import { EmailService } from './email.service';
import { DatabaseService } from './database.service';
import { Logger } from '../utils/logger';

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export class UserService {
  constructor(
    private emailService: EmailService,
    private databaseService: DatabaseService,
    private logger: Logger
  ) {}

  async createUser(request: CreateUserRequest): Promise<User> {
    this.logger.info('Creating new user', { email: request.email });

    try {
      // 이메일 중복 확인
      const existingUser = await this.databaseService.findUserByEmail(request.email);
      if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다');
      }

      // 사용자 생성
      const user = await this.databaseService.createUser({
        email: request.email,
        firstName: request.firstName,
        lastName: request.lastName,
        passwordHash: await this.hashPassword(request.password),
        createdAt: new Date(),
        isActive: false,
        verificationToken: this.generateVerificationToken()
      });

      // 환영 이메일 발송
      await this.emailService.sendWelcomeEmail(user.email, {
        firstName: user.firstName,
        verificationToken: user.verificationToken
      });

      this.logger.info('User created successfully', { userId: user.id });
      return user;

    } catch (error) {
      this.logger.error('Failed to create user', { 
        email: request.email, 
        error: error.message 
      });
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.databaseService.findUserByVerificationToken(token);
    
    if (!user) {
      throw new Error('유효하지 않은 인증 토큰입니다');
    }

    if (user.isActive) {
      throw new Error('이미 인증된 사용자입니다');
    }

    const updatedUser = await this.databaseService.updateUser(user.id, {
      isActive: true,
      verificationToken: null,
      verifiedAt: new Date()
    });

    this.logger.info('Email verified successfully', { userId: user.id });
    return updatedUser;
  }

  private async hashPassword(password: string): Promise<string> {
    // 실제 구현에서는 bcrypt 등을 사용
    return `hashed_${password}`;
  }

  private generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
```

```typescript
// src/services/__tests__/user.service.test.ts
import { UserService } from '../user.service';
import { EmailService } from '../email.service';
import { DatabaseService } from '../database.service';
import { Logger } from '../../utils/logger';
import { User } from '../../models/User';

// Mock 설정
jest.mock('../email.service');
jest.mock('../database.service');
jest.mock('../../utils/logger');

describe('UserService', () => {
  let userService: UserService;
  let mockEmailService: jest.Mocked<EmailService>;
  let mockDatabaseService: jest.Mocked<DatabaseService>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(() => {
    // Mock 인스턴스 생성
    mockEmailService = new EmailService() as jest.Mocked<EmailService>;
    mockDatabaseService = new DatabaseService() as jest.Mocked<DatabaseService>;
    mockLogger = new Logger() as jest.Mocked<Logger>;

    // Mock 메서드 설정
    mockEmailService.sendWelcomeEmail = jest.fn();
    mockDatabaseService.findUserByEmail = jest.fn();
    mockDatabaseService.createUser = jest.fn();
    mockDatabaseService.findUserByVerificationToken = jest.fn();
    mockDatabaseService.updateUser = jest.fn();
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();

    userService = new UserService(
      mockEmailService,
      mockDatabaseService,
      mockLogger
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const validRequest = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    };

    it('새로운 사용자를 성공적으로 생성한다', async () => {
      // Arrange
      const expectedUser: User = {
        id: 'user123',
        email: validRequest.email,
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        passwordHash: 'hashed_password123',
        isActive: false,
        verificationToken: 'token123',
        createdAt: new Date(),
        verifiedAt: null
      };

      mockDatabaseService.findUserByEmail.mockResolvedValue(null);
      mockDatabaseService.createUser.mockResolvedValue(expectedUser);
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      // Act
      const result = await userService.createUser(validRequest);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockDatabaseService.findUserByEmail).toHaveBeenCalledWith(validRequest.email);
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: validRequest.email,
          firstName: validRequest.firstName,
          lastName: validRequest.lastName,
          passwordHash: 'hashed_password123',
          isActive: false
        })
      );
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        validRequest.email,
        expect.objectContaining({
          firstName: validRequest.firstName
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Creating new user',
        { email: validRequest.email }
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'User created successfully',
        { userId: expectedUser.id }
      );
    });

    it('중복된 이메일이 있을 때 오류를 발생시킨다', async () => {
      // Arrange
      const existingUser: User = {
        id: 'existing123',
        email: validRequest.email,
        firstName: 'Jane',
        lastName: 'Smith',
        passwordHash: 'hash',
        isActive: true,
        verificationToken: null,
        createdAt: new Date(),
        verifiedAt: new Date()
      };

      mockDatabaseService.findUserByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(userService.createUser(validRequest))
        .rejects.toThrow('이미 존재하는 이메일입니다');

      expect(mockDatabaseService.createUser).not.toHaveBeenCalled();
      expect(mockEmailService.sendWelcomeEmail).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          email: validRequest.email,
          error: '이미 존재하는 이메일입니다'
        })
      );
    });

    it('데이터베이스 오류 시 적절히 처리한다', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      mockDatabaseService.findUserByEmail.mockRejectedValue(dbError);

      // Act & Assert
      await expect(userService.createUser(validRequest))
        .rejects.toThrow('Database connection failed');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          email: validRequest.email,
          error: 'Database connection failed'
        })
      );
    });

    it('이메일 발송 실패 시 오류를 전파한다', async () => {
      // Arrange
      const user: User = {
        id: 'user123',
        email: validRequest.email,
        firstName: validRequest.firstName,
        lastName: validRequest.lastName,
        passwordHash: 'hashed_password123',
        isActive: false,
        verificationToken: 'token123',
        createdAt: new Date(),
        verifiedAt: null
      };

      const emailError = new Error('Email service unavailable');

      mockDatabaseService.findUserByEmail.mockResolvedValue(null);
      mockDatabaseService.createUser.mockResolvedValue(user);
      mockEmailService.sendWelcomeEmail.mockRejectedValue(emailError);

      // Act & Assert
      await expect(userService.createUser(validRequest))
        .rejects.toThrow('Email service unavailable');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create user',
        expect.objectContaining({
          email: validRequest.email,
          error: 'Email service unavailable'
        })
      );
    });
  });

  describe('verifyEmail', () => {
    it('유효한 토큰으로 이메일을 성공적으로 인증한다', async () => {
      // Arrange
      const token = 'valid_token';
      const user: User = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hash',
        isActive: false,
        verificationToken: token,
        createdAt: new Date(),
        verifiedAt: null
      };

      const updatedUser: User = {
        ...user,
        isActive: true,
        verificationToken: null,
        verifiedAt: new Date()
      };

      mockDatabaseService.findUserByVerificationToken.mockResolvedValue(user);
      mockDatabaseService.updateUser.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.verifyEmail(token);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockDatabaseService.findUserByVerificationToken).toHaveBeenCalledWith(token);
      expect(mockDatabaseService.updateUser).toHaveBeenCalledWith(
        user.id,
        expect.objectContaining({
          isActive: true,
          verificationToken: null
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Email verified successfully',
        { userId: user.id }
      );
    });

    it('유효하지 않은 토큰에 대해 오류를 발생시킨다', async () => {
      // Arrange
      const invalidToken = 'invalid_token';
      mockDatabaseService.findUserByVerificationToken.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.verifyEmail(invalidToken))
        .rejects.toThrow('유효하지 않은 인증 토큰입니다');

      expect(mockDatabaseService.updateUser).not.toHaveBeenCalled();
    });

    it('이미 인증된 사용자에 대해 오류를 발생시킨다', async () => {
      // Arrange
      const token = 'valid_token';
      const activeUser: User = {
        id: 'user123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: 'hash',
        isActive: true, // 이미 활성화됨
        verificationToken: token,
        createdAt: new Date(),
        verifiedAt: new Date()
      };

      mockDatabaseService.findUserByVerificationToken.mockResolvedValue(activeUser);

      // Act & Assert
      await expect(userService.verifyEmail(token))
        .rejects.toThrow('이미 인증된 사용자입니다');

      expect(mockDatabaseService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('private 메서드 테스트 (간접적)', () => {
    it('비밀번호 해싱이 올바르게 작동한다', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'mypassword'
      };

      mockDatabaseService.findUserByEmail.mockResolvedValue(null);
      mockDatabaseService.createUser.mockImplementation(async (userData) => ({
        id: 'user123',
        ...userData,
        createdAt: new Date(),
        verifiedAt: null
      } as User));
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      // Act
      await userService.createUser(request);

      // Assert
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: 'hashed_mypassword'
        })
      );
    });

    it('인증 토큰이 생성된다', async () => {
      // Arrange
      const request = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123'
      };

      mockDatabaseService.findUserByEmail.mockResolvedValue(null);
      mockDatabaseService.createUser.mockImplementation(async (userData) => ({
        id: 'user123',
        ...userData,
        createdAt: new Date(),
        verifiedAt: null
      } as User));
      mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);

      // Act
      await userService.createUser(request);

      // Assert
      expect(mockDatabaseService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          verificationToken: expect.any(String)
        })
      );

      const createUserCall = mockDatabaseService.createUser.mock.calls[0][0];
      expect(createUserCall.verificationToken).toHaveLength(28); // 두 개의 15자리 - 2 = 28
    });
  });
});
```

### 시간 의존성 모킹

```typescript
// src/utils/__tests__/time-dependent.test.ts
import { DateUtils, TimeRange } from '../date-utils';

describe('DateUtils with time mocking', () => {
  const FIXED_DATE = new Date('2024-01-15T10:30:00.000Z');

  beforeEach(() => {
    // 시간 고정
    jest.useFakeTimers();
    jest.setSystemTime(FIXED_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCurrentTimestamp', () => {
    it('현재 시간을 올바르게 반환한다', () => {
      const timestamp = DateUtils.getCurrentTimestamp();
      expect(timestamp).toBe(FIXED_DATE.getTime());
    });
  });

  describe('isBusinessHour', () => {
    it('업무 시간 내 시간을 올바르게 판단한다', () => {
      // 평일 오전 10:30 (업무 시간)
      expect(DateUtils.isBusinessHour()).toBe(true);
    });

    it('주말을 업무 시간 외로 판단한다', () => {
      // 토요일로 변경
      const saturday = new Date('2024-01-13T10:30:00.000Z');
      jest.setSystemTime(saturday);
      
      expect(DateUtils.isBusinessHour()).toBe(false);
    });

    it('업무 시간 외를 올바르게 판단한다', () => {
      // 평일 오후 7시 (업무 시간 외)
      const afterHours = new Date('2024-01-15T19:00:00.000Z');
      jest.setSystemTime(afterHours);
      
      expect(DateUtils.isBusinessHour()).toBe(false);
    });
  });

  describe('getTimeUntilDeadline', () => {
    it('마감일까지 남은 시간을 올바르게 계산한다', () => {
      const deadline = new Date('2024-01-15T15:30:00.000Z'); // 5시간 후
      const timeLeft = DateUtils.getTimeUntilDeadline(deadline);
      
      expect(timeLeft).toEqual({
        days: 0,
        hours: 5,
        minutes: 0,
        seconds: 0
      });
    });

    it('과거 마감일에 대해 음수 시간을 반환한다', () => {
      const pastDeadline = new Date('2024-01-15T08:30:00.000Z'); // 2시간 전
      const timeLeft = DateUtils.getTimeUntilDeadline(pastDeadline);
      
      expect(timeLeft.hours).toBe(-2);
    });
  });

  describe('시간 진행 테스트', () => {
    it('타이머 진행에 따른 상태 변화를 테스트한다', () => {
      let callbackCount = 0;
      
      // 5초마다 호출되는 콜백 설정
      setInterval(() => {
        callbackCount++;
      }, 5000);

      // 10초 진행
      jest.advanceTimersByTime(10000);
      
      expect(callbackCount).toBe(2); // 5초, 10초에 호출
      
      // 추가로 15초 진행 (총 25초)
      jest.advanceTimersByTime(15000);
      
      expect(callbackCount).toBe(5); // 5초, 10초, 15초, 20초, 25초에 호출
    });
  });
});
```

## Test-Driven Development (TDD)

### TDD 사이클 실습

```typescript
// TDD 예제: 쇼핑카트 기능 구현

// 1단계: RED - 실패하는 테스트 작성
describe('ShoppingCart', () => {
  describe('addItem', () => {
    it('새로운 상품을 카트에 추가한다', () => {
      // Arrange
      const cart = new ShoppingCart();
      const item = { id: '1', name: 'Book', price: 10.99 };

      // Act
      cart.addItem(item, 2);

      // Assert
      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0]).toEqual({
        ...item,
        quantity: 2
      });
    });
  });
});

// 2단계: GREEN - 최소한의 구현으로 테스트 통과
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export class ShoppingCart {
  private items: CartItem[] = [];

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number): void {
    this.items.push({ ...item, quantity });
  }

  getItems(): CartItem[] {
    return this.items;
  }
}

// 3단계: 추가 테스트 케이스 작성
describe('ShoppingCart', () => {
  let cart: ShoppingCart;

  beforeEach(() => {
    cart = new ShoppingCart();
  });

  describe('addItem', () => {
    it('새로운 상품을 카트에 추가한다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      cart.addItem(item, 2);

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0]).toEqual({ ...item, quantity: 2 });
    });

    it('동일한 상품을 추가하면 수량이 합쳐진다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      
      cart.addItem(item, 2);
      cart.addItem(item, 3);

      expect(cart.getItems()).toHaveLength(1);
      expect(cart.getItems()[0].quantity).toBe(5);
    });

    it('다른 상품들은 별도로 관리된다', () => {
      const book = { id: '1', name: 'Book', price: 10.99 };
      const pen = { id: '2', name: 'Pen', price: 1.99 };
      
      cart.addItem(book, 1);
      cart.addItem(pen, 3);

      expect(cart.getItems()).toHaveLength(2);
      expect(cart.getItemById('1')?.quantity).toBe(1);
      expect(cart.getItemById('2')?.quantity).toBe(3);
    });

    it('수량이 0 이하면 오류를 발생시킨다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      
      expect(() => cart.addItem(item, 0)).toThrow('수량은 1 이상이어야 합니다');
      expect(() => cart.addItem(item, -1)).toThrow('수량은 1 이상이어야 합니다');
    });
  });

  describe('removeItem', () => {
    it('상품을 카트에서 제거한다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      cart.addItem(item, 2);
      
      cart.removeItem('1');
      
      expect(cart.getItems()).toHaveLength(0);
    });

    it('존재하지 않는 상품 제거 시 오류를 발생시킨다', () => {
      expect(() => cart.removeItem('nonexistent'))
        .toThrow('상품을 찾을 수 없습니다');
    });
  });

  describe('updateQuantity', () => {
    it('상품 수량을 업데이트한다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      cart.addItem(item, 2);
      
      cart.updateQuantity('1', 5);
      
      expect(cart.getItemById('1')?.quantity).toBe(5);
    });

    it('수량을 0으로 설정하면 상품이 제거된다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      cart.addItem(item, 2);
      
      cart.updateQuantity('1', 0);
      
      expect(cart.getItems()).toHaveLength(0);
    });
  });

  describe('getTotal', () => {
    it('카트의 총 금액을 계산한다', () => {
      const book = { id: '1', name: 'Book', price: 10.99 };
      const pen = { id: '2', name: 'Pen', price: 1.99 };
      
      cart.addItem(book, 2);  // 21.98
      cart.addItem(pen, 3);   // 5.97
      
      expect(cart.getTotal()).toBe(27.97);
    });

    it('빈 카트의 총 금액은 0이다', () => {
      expect(cart.getTotal()).toBe(0);
    });
  });

  describe('clear', () => {
    it('카트의 모든 상품을 제거한다', () => {
      const item = { id: '1', name: 'Book', price: 10.99 };
      cart.addItem(item, 2);
      
      cart.clear();
      
      expect(cart.getItems()).toHaveLength(0);
      expect(cart.getTotal()).toBe(0);
    });
  });
});

// 4단계: REFACTOR - 완전한 구현
export class ShoppingCart {
  private items: CartItem[] = [];

  addItem(item: Omit<CartItem, 'quantity'>, quantity: number): void {
    if (quantity <= 0) {
      throw new Error('수량은 1 이상이어야 합니다');
    }

    const existingItemIndex = this.items.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // 기존 상품의 수량 증가
      this.items[existingItemIndex].quantity += quantity;
    } else {
      // 새로운 상품 추가
      this.items.push({ ...item, quantity });
    }
  }

  removeItem(id: string): void {
    const itemIndex = this.items.findIndex(item => item.id === id);
    
    if (itemIndex === -1) {
      throw new Error('상품을 찾을 수 없습니다');
    }
    
    this.items.splice(itemIndex, 1);
  }

  updateQuantity(id: string, quantity: number): void {
    if (quantity < 0) {
      throw new Error('수량은 0 이상이어야 합니다');
    }

    if (quantity === 0) {
      this.removeItem(id);
      return;
    }

    const item = this.getItemById(id);
    if (!item) {
      throw new Error('상품을 찾을 수 없습니다');
    }

    item.quantity = quantity;
  }

  getItems(): CartItem[] {
    return [...this.items]; // 복사본 반환으로 불변성 보장
  }

  getItemById(id: string): CartItem | undefined {
    return this.items.find(item => item.id === id);
  }

  getTotal(): number {
    return this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  clear(): void {
    this.items = [];
  }

  getItemCount(): number {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
```

## 고급 테스트 패턴

### 파라미터화 테스트

```typescript
// src/utils/__tests__/math-utils.test.ts
import { MathUtils } from '../math-utils';

describe('MathUtils', () => {
  describe('isPrime - 파라미터화 테스트', () => {
    // 테스트 케이스를 배열로 정의
    const primeTestCases = [
      { input: 2, expected: true, description: '2는 소수다' },
      { input: 3, expected: true, description: '3은 소수다' },
      { input: 5, expected: true, description: '5는 소수다' },
      { input: 7, expected: true, description: '7은 소수다' },
      { input: 11, expected: true, description: '11은 소수다' },
      { input: 13, expected: true, description: '13은 소수다' },
      { input: 17, expected: true, description: '17은 소수다' },
      { input: 19, expected: true, description: '19는 소수다' },
      { input: 97, expected: true, description: '97은 소수다' }
    ];

    const nonPrimeTestCases = [
      { input: 1, expected: false, description: '1은 소수가 아니다' },
      { input: 4, expected: false, description: '4는 소수가 아니다' },
      { input: 6, expected: false, description: '6은 소수가 아니다' },
      { input: 8, expected: false, description: '8은 소수가 아니다' },
      { input: 9, expected: false, description: '9는 소수가 아니다' },
      { input: 10, expected: false, description: '10은 소수가 아니다' },
      { input: 15, expected: false, description: '15는 소수가 아니다' },
      { input: 21, expected: false, description: '21은 소수가 아니다' },
      { input: 25, expected: false, description: '25는 소수가 아니다' },
      { input: 100, expected: false, description: '100은 소수가 아니다' }
    ];

    // each 메서드를 사용한 파라미터화 테스트
    test.each(primeTestCases)('$description', ({ input, expected }) => {
      expect(MathUtils.isPrime(input)).toBe(expected);
    });

    test.each(nonPrimeTestCases)('$description', ({ input, expected }) => {
      expect(MathUtils.isPrime(input)).toBe(expected);
    });

    // 음수와 0에 대한 테스트
    test.each([
      [-5, false],
      [-1, false],
      [0, false]
    ])('음수와 0은 소수가 아니다: %i → %s', (input, expected) => {
      expect(MathUtils.isPrime(input)).toBe(expected);
    });
  });

  describe('factorial - 경계값 테스트', () => {
    const factorialTestCases = [
      { input: 0, expected: 1, description: '0! = 1' },
      { input: 1, expected: 1, description: '1! = 1' },
      { input: 2, expected: 2, description: '2! = 2' },
      { input: 3, expected: 6, description: '3! = 6' },
      { input: 4, expected: 24, description: '4! = 24' },
      { input: 5, expected: 120, description: '5! = 120' },
      { input: 10, expected: 3628800, description: '10! = 3,628,800' }
    ];

    test.each(factorialTestCases)('$description', ({ input, expected }) => {
      expect(MathUtils.factorial(input)).toBe(expected);
    });

    test.each([
      [-1, '음수에 대한 팩토리얼은 정의되지 않음'],
      [-5, '음수에 대한 팩토리얼은 정의되지 않음'],
      [1.5, '소수에 대한 팩토리얼은 지원하지 않음'],
      [3.14, '소수에 대한 팩토리얼은 지원하지 않음']
    ])('유효하지 않은 입력 %f에 대해 오류를 발생시킨다', (input, description) => {
      expect(() => MathUtils.factorial(input)).toThrow();
    });
  });
});
```

### 속성 기반 테스트 (Property-based Testing)

```typescript
// npm install --save-dev fast-check
import fc from 'fast-check';
import { MathUtils } from '../math-utils';

describe('MathUtils - Property-based Testing', () => {
  describe('add 함수의 속성', () => {
    it('덧셈은 교환법칙을 만족한다: a + b = b + a', () => {
      fc.assert(fc.property(
        fc.integer(), 
        fc.integer(), 
        (a, b) => {
          expect(MathUtils.add(a, b)).toBe(MathUtils.add(b, a));
        }
      ));
    });

    it('덧셈은 결합법칙을 만족한다: (a + b) + c = a + (b + c)', () => {
      fc.assert(fc.property(
        fc.integer(),
        fc.integer(),
        fc.integer(),
        (a, b, c) => {
          const left = MathUtils.add(MathUtils.add(a, b), c);
          const right = MathUtils.add(a, MathUtils.add(b, c));
          expect(left).toBe(right);
        }
      ));
    });

    it('0은 덧셈의 항등원이다: a + 0 = a', () => {
      fc.assert(fc.property(
        fc.integer(),
        (a) => {
          expect(MathUtils.add(a, 0)).toBe(a);
          expect(MathUtils.add(0, a)).toBe(a);
        }
      ));
    });
  });

  describe('multiply 함수의 속성', () => {
    it('곱셈은 교환법칙을 만족한다: a × b = b × a', () => {
      fc.assert(fc.property(
        fc.integer(),
        fc.integer(),
        (a, b) => {
          expect(MathUtils.multiply(a, b)).toBe(MathUtils.multiply(b, a));
        }
      ));
    });

    it('1은 곱셈의 항등원이다: a × 1 = a', () => {
      fc.assert(fc.property(
        fc.integer(),
        (a) => {
          expect(MathUtils.multiply(a, 1)).toBe(a);
          expect(MathUtils.multiply(1, a)).toBe(a);
        }
      ));
    });

    it('0과의 곱은 항상 0이다: a × 0 = 0', () => {
      fc.assert(fc.property(
        fc.integer(),
        (a) => {
          expect(MathUtils.multiply(a, 0)).toBe(0);
          expect(MathUtils.multiply(0, a)).toBe(0);
        }
      ));
    });

    it('곱셈의 분배법칙: a × (b + c) = (a × b) + (a × c)', () => {
      fc.assert(fc.property(
        fc.integer({ min: -100, max: 100 }), // 오버플로우 방지
        fc.integer({ min: -100, max: 100 }),
        fc.integer({ min: -100, max: 100 }),
        (a, b, c) => {
          const left = MathUtils.multiply(a, MathUtils.add(b, c));
          const right = MathUtils.add(
            MathUtils.multiply(a, b),
            MathUtils.multiply(a, c)
          );
          expect(left).toBe(right);
        }
      ));
    });
  });

  describe('sort 함수의 속성', () => {
    it('정렬된 배열의 길이는 원본과 같다', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = MathUtils.sort([...arr]);
          expect(sorted).toHaveLength(arr.length);
        }
      ));
    });

    it('정렬된 배열은 오름차순이다', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = MathUtils.sort([...arr]);
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i]).toBeLessThanOrEqual(sorted[i + 1]);
          }
        }
      ));
    });

    it('정렬은 배열의 모든 원소를 보존한다', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = MathUtils.sort([...arr]);
          const originalSorted = [...arr].sort((a, b) => a - b);
          expect(sorted).toEqual(originalSorted);
        }
      ));
    });

    it('이미 정렬된 배열을 정렬해도 변하지 않는다', () => {
      fc.assert(fc.property(
        fc.array(fc.integer()),
        (arr) => {
          const sorted = MathUtils.sort([...arr]);
          const doubleSorted = MathUtils.sort([...sorted]);
          expect(sorted).toEqual(doubleSorted);
        }
      ));
    });
  });
});
```

이 단위 테스트 가이드는 SuperClaude AI 워크플로우를 활용하여 고품질의 테스트 코드를 작성하는 방법을 제시합니다. 다음 파일에서는 통합 테스트에 대해 다루겠습니다.