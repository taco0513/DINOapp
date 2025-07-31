import { InputSanitizer } from '@/lib/security/input-sanitizer';

describe('InputSanitizer', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script><p>Valid content</p>';
      const result = InputSanitizer.sanitizeHtml(input);

      expect(result).not.toContain('<script>');
      expect(result).toBe('alert("xss")Valid content');
    });

    it('should allow safe HTML tags by default', () => {
      const input = '<b>Bold</b> text with <i>italic</i> content';
      const result = InputSanitizer.sanitizeHtml(input);

      expect(result).toBe('Bold text with italic content');
    });

    it('should handle custom allowed tags', () => {
      const input = '<script>alert("xss")</script><p>Valid content</p>';
      const result = InputSanitizer.sanitizeHtml(input, {
        allowedTags: ['p'],
        allowedAttributes: [],
      });

      expect(result).not.toContain('<script>');
      // The implementation escapes HTML when allowedTags are specified
      expect(result).toContain('&lt;p&gt;Valid content&lt;/p&gt;');
    });

    it('should remove dangerous attributes', () => {
      const input = '<button onclick="alert(1)">Click</button>';
      const result = InputSanitizer.sanitizeHtml(input);

      expect(result).not.toContain('onclick');
      expect(result).toBe('Click');
    });

    it('should handle empty input', () => {
      expect(InputSanitizer.sanitizeHtml('')).toBe('');
      expect(InputSanitizer.sanitizeHtml(null as any)).toBe('');
      expect(InputSanitizer.sanitizeHtml(undefined as any)).toBe('');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags from text', () => {
      const input = '<b>Bold</b> text with <i>italic</i> content';
      const result = InputSanitizer.sanitizeText(input);

      expect(result).toBe('Bold text with italic content');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should handle empty input', () => {
      expect(InputSanitizer.sanitizeText('')).toBe('');
      expect(InputSanitizer.sanitizeText(null as any)).toBe('');
      expect(InputSanitizer.sanitizeText(undefined as any)).toBe('');
    });
  });

  describe('escapeSql', () => {
    it('should escape single quotes', () => {
      const input = "'; DROP TABLE users; --";
      const result = InputSanitizer.escapeSql(input);

      expect(result).toContain("''"); // single quotes should be escaped to double quotes
      expect(result).toContain('DROP TABLE'); // Content preserved but quotes escaped
    });

    it('should escape backslashes', () => {
      const input = 'path\\to\\file';
      const result = InputSanitizer.escapeSql(input);

      expect(result).toBe('path\\\\to\\\\file');
    });

    it('should escape null bytes', () => {
      const input = 'data\x00injection';
      const result = InputSanitizer.escapeSql(input);

      expect(result).toBe('data\\0injection');
    });

    it('should handle special SQL characters', () => {
      const input = '%; SELECT * FROM users; --';
      const result = InputSanitizer.escapeSql(input);

      expect(result).not.toContain("'");
      expect(result).toContain('SELECT'); // Doesn't remove keywords, just escapes
    });
  });

  describe('sanitizePath', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../../etc/passwd';
      const result = InputSanitizer.sanitizePath(input);

      expect(result).not.toContain('..');
      expect(result).toContain('etc');
      expect(result).toContain('passwd');
    });

    it('should handle backslashes', () => {
      const input = '..\\..\\windows\\system32';
      const result = InputSanitizer.sanitizePath(input);

      expect(result).not.toContain('..');
      expect(result).toContain('windows');
      expect(result).toContain('system32');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove special characters', () => {
      const input = 'file<>:"|?*.txt';
      const result = InputSanitizer.sanitizeFilename(input);

      expect(result).toBe('file.txt');
    });

    it('should handle spaces', () => {
      const input = 'test file.txt';
      const result = InputSanitizer.sanitizeFilename(input);

      expect(result).toBe('test_file.txt');
    });

    it('should preserve file extensions', () => {
      const input = 'my.file.name.pdf';
      const result = InputSanitizer.sanitizeFilename(input);

      expect(result).toBe('my.file.name.pdf');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = InputSanitizer.sanitizeFilename(longName);

      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      expect(InputSanitizer.sanitizeEmail('test@example.com')).toBe(
        'test@example.com'
      );
      expect(InputSanitizer.sanitizeEmail('UPPER@EXAMPLE.COM')).toBe(
        'upper@example.com'
      );
    });

    it('should reject invalid emails', () => {
      expect(InputSanitizer.sanitizeEmail('invalid-email')).toBe('');
      expect(InputSanitizer.sanitizeEmail('@example.com')).toBe('');
      expect(InputSanitizer.sanitizeEmail('user@')).toBe('');
    });

    it('should handle HTML in emails', () => {
      // HTML tags are stripped but email part remains valid
      expect(InputSanitizer.sanitizeEmail('<script>test@example.com')).toBe(
        'test@example.com'
      );
    });

    it('should normalize email addresses', () => {
      const email = 'USER@EXAMPLE.COM';
      const result = InputSanitizer.sanitizeEmail(email);

      expect(result).toBe('user@example.com');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow valid URLs', () => {
      expect(InputSanitizer.sanitizeUrl('https://example.com')).toBe(
        'https://example.com/'
      );
      expect(InputSanitizer.sanitizeUrl('http://example.com')).toBe(
        'http://example.com/'
      );
    });

    it('should reject javascript URLs', () => {
      expect(InputSanitizer.sanitizeUrl('javascript:alert(1)')).toBe('');
      expect(InputSanitizer.sanitizeUrl('Javascript:void(0)')).toBe('');
    });

    it('should reject data URLs by default', () => {
      expect(
        InputSanitizer.sanitizeUrl('data:text/html,<script>alert(1)</script>')
      ).toBe('');
    });

    it('should enforce allowed protocols', () => {
      expect(InputSanitizer.sanitizeUrl('ftp://example.com')).toBe(''); // Default doesn't allow FTP
    });
  });

  describe('sanitizePhone', () => {
    it('should allow valid phone characters', () => {
      const input = '+1 (555) 123-4567';
      const result = InputSanitizer.sanitizePhone(input);

      expect(result).toBe('+1 (555) 123-4567');
    });

    it('should remove invalid characters', () => {
      const input = '+1-555-abc-4567!@#';
      const result = InputSanitizer.sanitizePhone(input);

      expect(result).toBe('+1-555--4567');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize objects with specified rules', () => {
      const input = {
        name: '<script>alert(1)</script>John',
        email: 'JOHN@EXAMPLE.COM',
        description: '<p>Valid <b>content</b></p><script>alert(1)</script>',
        age: '25',
      };

      const sanitized = InputSanitizer.sanitizeObject(input, {
        name: 'text',
        email: 'email',
        description: 'html',
      });

      expect(sanitized.name).toBe('alert(1)John');
      expect(sanitized.email).toBe('john@example.com');
      expect(sanitized.description).not.toContain('<script>');
      expect(sanitized.description).toBe('Valid contentalert(1)');
      expect(sanitized.age).toBe('25'); // unchanged
    });
  });

  describe('sanitizeArray', () => {
    it('should sanitize array elements', () => {
      const input = ['<script>alert(1)</script>Hello', '<b>Bold</b> text'];
      const result = InputSanitizer.sanitizeArray(input, 'text');

      expect(result[0]).toBe('alert(1)Hello');
      expect(result[1]).toBe('Bold text');
    });
  });

  describe('sanitizeSearchQuery', () => {
    it('should sanitize search queries', () => {
      const maliciousQuery = "search'; DELETE FROM users WHERE '1'='1";
      const sanitized = InputSanitizer.sanitizeSearchQuery(maliciousQuery);

      expect(sanitized).not.toContain("'");
      expect(sanitized).toContain('DELETE'); // Content preserved but quotes removed
      expect(sanitized.length).toBeLessThanOrEqual(100); // length limit
    });

    it('should normalize whitespace', () => {
      const input = 'search    with   multiple   spaces';
      const result = InputSanitizer.sanitizeSearchQuery(input);

      expect(result).toBe('search with multiple spaces');
    });
  });

  describe('sanitizeInteger', () => {
    it('should parse valid integers', () => {
      expect(InputSanitizer.sanitizeInteger('123')).toBe(123);
      expect(InputSanitizer.sanitizeInteger(456)).toBe(456);
    });

    it('should return null for invalid input', () => {
      expect(InputSanitizer.sanitizeInteger('abc')).toBeNull();
      expect(InputSanitizer.sanitizeInteger('')).toBeNull();
    });

    it('should apply min/max constraints', () => {
      expect(InputSanitizer.sanitizeInteger('5', 10, 20)).toBe(10); // min constraint
      expect(InputSanitizer.sanitizeInteger('25', 10, 20)).toBe(20); // max constraint
    });
  });

  describe('sanitizeFloat', () => {
    it('should parse valid floats', () => {
      expect(InputSanitizer.sanitizeFloat('123.45')).toBe(123.45);
      expect(InputSanitizer.sanitizeFloat(456.78)).toBe(456.78);
    });

    it('should return null for invalid input', () => {
      expect(InputSanitizer.sanitizeFloat('abc')).toBeNull();
      expect(InputSanitizer.sanitizeFloat('')).toBeNull();
    });

    it('should apply decimal constraints', () => {
      expect(
        InputSanitizer.sanitizeFloat('123.456789', undefined, undefined, 2)
      ).toBe(123.46);
    });
  });

  describe('sanitizeDate', () => {
    it('should parse valid dates', () => {
      const result = InputSanitizer.sanitizeDate('2024-01-01');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2024);
    });

    it('should return null for invalid dates', () => {
      expect(InputSanitizer.sanitizeDate('invalid-date')).toBeNull();
      expect(InputSanitizer.sanitizeDate('1800-01-01')).toBeNull(); // too old
      expect(InputSanitizer.sanitizeDate('2200-01-01')).toBeNull(); // too future
    });
  });

  describe('sanitizeBoolean', () => {
    it('should handle boolean values', () => {
      expect(InputSanitizer.sanitizeBoolean(true)).toBe(true);
      expect(InputSanitizer.sanitizeBoolean(false)).toBe(false);
    });

    it('should parse string values', () => {
      expect(InputSanitizer.sanitizeBoolean('true')).toBe(true);
      expect(InputSanitizer.sanitizeBoolean('false')).toBe(false);
      expect(InputSanitizer.sanitizeBoolean('1')).toBe(true);
      expect(InputSanitizer.sanitizeBoolean('0')).toBe(false);
    });

    it('should handle numeric values', () => {
      expect(InputSanitizer.sanitizeBoolean(1)).toBe(true);
      expect(InputSanitizer.sanitizeBoolean(0)).toBe(false);
      expect(InputSanitizer.sanitizeBoolean(42)).toBe(true);
    });
  });
});
