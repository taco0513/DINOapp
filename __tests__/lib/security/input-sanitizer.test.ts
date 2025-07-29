import { 
  InputSanitizer,
  sanitizeHTML,
  sanitizeSQL,
  sanitizeFileName,
  sanitizeEmail,
  sanitizeURL,
  sanitizeJSON,
  validateInput,
  InputValidationSchema,
  SanitizerConfig
} from '@/lib/security/input-sanitizer'
import DOMPurify from 'dompurify'

// Mock DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn(),
}))

const mockDOMPurify = DOMPurify as jest.Mocked<typeof DOMPurify>

describe('InputSanitizer', () => {
  let sanitizer: InputSanitizer

  beforeEach(() => {
    jest.clearAllMocks()
    sanitizer = new InputSanitizer()
    
    // Default DOMPurify mock behavior
    mockDOMPurify.sanitize.mockImplementation((input: string) => 
      input.replace(/<script[^>]*>.*?<\/script>/gi, '')
    )
  })

  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("xss")</script><p>World</p>'
      const result = sanitizeHTML(input)

      expect(result).toBe('<p>Hello</p><p>World</p>')
      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(
        input,
        expect.any(Object)
      )
    })

    it('should allow safe HTML tags by default', () => {
      mockDOMPurify.sanitize.mockReturnValue('<b>Bold</b> <i>Italic</i>')
      
      const input = '<b>Bold</b> <i>Italic</i>'
      const result = sanitizeHTML(input)

      expect(result).toBe('<b>Bold</b> <i>Italic</i>')
    })

    it('should handle custom allowed tags', () => {
      const input = '<div><span>Text</span></div>'
      const config = {
        ALLOWED_TAGS: ['span'],
        ALLOWED_ATTR: [],
      }

      sanitizeHTML(input, config)

      expect(mockDOMPurify.sanitize).toHaveBeenCalledWith(input, config)
    })

    it('should remove dangerous attributes', () => {
      mockDOMPurify.sanitize.mockImplementation((input: string) => 
        input.replace(/on\w+="[^"]*"/gi, '')
      )

      const input = '<button onclick="alert(1)">Click</button>'
      const result = sanitizeHTML(input)

      expect(result).not.toContain('onclick')
    })

    it('should handle empty input', () => {
      expect(sanitizeHTML('')).toBe('')
      expect(sanitizeHTML(null as any)).toBe('')
      expect(sanitizeHTML(undefined as any)).toBe('')
    })
  })

  describe('sanitizeSQL', () => {
    it('should escape single quotes', () => {
      const input = "'; DROP TABLE users; --"
      const result = sanitizeSQL(input)

      expect(result).toBe("''; DROP TABLE users; --")
    })

    it('should escape backslashes', () => {
      const input = 'path\\to\\file'
      const result = sanitizeSQL(input)

      expect(result).toBe('path\\\\to\\\\file')
    })

    it('should escape null bytes', () => {
      const input = 'data\x00injection'
      const result = sanitizeSQL(input)

      expect(result).toBe('data\\0injection')
    })

    it('should handle parameterized queries', () => {
      const params = ["user' OR '1'='1", 123, true]
      const sanitized = params.map(p => 
        typeof p === 'string' ? sanitizeSQL(p) : p
      )

      expect(sanitized[0]).toBe("user'' OR ''1''=''1")
      expect(sanitized[1]).toBe(123)
      expect(sanitized[2]).toBe(true)
    })

    it('should handle special SQL characters', () => {
      const input = '%; SELECT * FROM users; --'
      const result = sanitizeSQL(input)

      expect(result).not.toContain("'")
      expect(result).toContain("SELECT") // Doesn't remove keywords, just escapes
    })
  })

  describe('sanitizeFileName', () => {
    it('should remove path traversal attempts', () => {
      const input = '../../../etc/passwd'
      const result = sanitizeFileName(input)

      expect(result).toBe('etcpasswd')
    })

    it('should remove special characters', () => {
      const input = 'file<>:"|?*.txt'
      const result = sanitizeFileName(input)

      expect(result).toBe('file.txt')
    })

    it('should handle Unicode characters', () => {
      const input = 'файл_文件_file.txt'
      const result = sanitizeFileName(input)

      expect(result).toBe('файл_文件_file.txt')
    })

    it('should limit filename length', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFileName(longName, { maxLength: 255 })

      expect(result.length).toBeLessThanOrEqual(255)
      expect(result).toEndWith('.txt')
    })

    it('should handle reserved Windows filenames', () => {
      const reserved = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'LPT1']
      
      reserved.forEach(name => {
        const result = sanitizeFileName(name + '.txt')
        expect(result).toBe('_' + name + '.txt')
      })
    })

    it('should preserve file extensions', () => {
      const input = 'my.file.name.pdf'
      const result = sanitizeFileName(input)

      expect(result).toBe('my.file.name.pdf')
    })
  })

  describe('sanitizeEmail', () => {
    it('should validate and sanitize valid emails', () => {
      const validEmails = [
        'user@example.com',
        'test.user+tag@subdomain.example.co.uk',
        'user123@test-domain.com',
      ]

      validEmails.forEach(email => {
        const result = sanitizeEmail(email)
        expect(result).toBe(email.toLowerCase())
      })
    })

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        '<script>@example.com',
      ]

      invalidEmails.forEach(email => {
        const result = sanitizeEmail(email)
        expect(result).toBe('')
      })
    })

    it('should normalize email addresses', () => {
      const email = 'USER@EXAMPLE.COM'
      const result = sanitizeEmail(email)

      expect(result).toBe('user@example.com')
    })

    it('should handle special characters', () => {
      const email = 'user+tag@example.com'
      const result = sanitizeEmail(email)

      expect(result).toBe('user+tag@example.com')
    })
  })

  describe('sanitizeURL', () => {
    it('should allow valid URLs', () => {
      const validURLs = [
        'https://example.com',
        'http://localhost:3000',
        'https://sub.example.com/path?query=value#hash',
      ]

      validURLs.forEach(url => {
        const result = sanitizeURL(url)
        expect(result).toBe(url)
      })
    })

    it('should reject javascript URLs', () => {
      const dangerous = [
        'javascript:alert(1)',
        'Javascript:void(0)',
        'jAvAsCrIpT:eval("alert(1)")',
      ]

      dangerous.forEach(url => {
        const result = sanitizeURL(url)
        expect(result).toBe('')
      })
    })

    it('should reject data URLs by default', () => {
      const dataURL = 'data:text/html,<script>alert(1)</script>'
      const result = sanitizeURL(dataURL)

      expect(result).toBe('')
    })

    it('should allow data URLs when configured', () => {
      const dataURL = 'data:image/png;base64,iVBORw0KG...'
      const result = sanitizeURL(dataURL, { allowDataURLs: true })

      expect(result).toBe(dataURL)
    })

    it('should handle protocol-relative URLs', () => {
      const url = '//example.com/path'
      const result = sanitizeURL(url, { allowProtocolRelative: true })

      expect(result).toBe(url)
    })

    it('should enforce allowed protocols', () => {
      const result1 = sanitizeURL('ftp://example.com')
      const result2 = sanitizeURL('ftp://example.com', { 
        protocols: ['http', 'https', 'ftp'] 
      })

      expect(result1).toBe('') // Default doesn't allow FTP
      expect(result2).toBe('ftp://example.com')
    })
  })

  describe('sanitizeJSON', () => {
    it('should parse and sanitize valid JSON', () => {
      const input = '{"name": "Test", "value": 123}'
      const result = sanitizeJSON(input)

      expect(result).toEqual({ name: 'Test', value: 123 })
    })

    it('should handle invalid JSON', () => {
      const input = '{invalid json}'
      const result = sanitizeJSON(input)

      expect(result).toBeNull()
    })

    it('should remove dangerous keys', () => {
      const input = {
        name: 'Test',
        __proto__: { evil: true },
        constructor: { name: 'Evil' },
        prototype: { bad: true },
      }

      const result = sanitizeJSON(JSON.stringify(input))

      expect(result).toEqual({ name: 'Test' })
      expect(result).not.toHaveProperty('__proto__')
      expect(result).not.toHaveProperty('constructor')
      expect(result).not.toHaveProperty('prototype')
    })

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: 'Test',
          profile: {
            __proto__: { evil: true },
            bio: 'Hello',
          },
        },
      }

      const result = sanitizeJSON(JSON.stringify(input))

      expect(result).toEqual({
        user: {
          name: 'Test',
          profile: {
            bio: 'Hello',
          },
        },
      })
    })

    it('should preserve arrays', () => {
      const input = {
        items: [1, 2, 3],
        tags: ['a', 'b', 'c'],
      }

      const result = sanitizeJSON(JSON.stringify(input))

      expect(result).toEqual(input)
    })
  })

  describe('validateInput', () => {
    const schema: InputValidationSchema = {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        age: { type: 'number', minimum: 0, maximum: 150 },
        email: { type: 'string', format: 'email' },
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['name', 'email'],
    }

    it('should validate correct input', () => {
      const input = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        tags: ['user', 'active'],
      }

      const result = validateInput(input, schema)

      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject missing required fields', () => {
      const input = {
        age: 30,
      }

      const result = validateInput(input, schema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Missing required field: name')
      expect(result.errors).toContain('Missing required field: email')
    })

    it('should validate string constraints', () => {
      const input = {
        name: 'A'.repeat(51), // Too long
        email: 'john@example.com',
      }

      const result = validateInput(input, schema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('name exceeds maximum length of 50')
    })

    it('should validate number constraints', () => {
      const input = {
        name: 'John',
        email: 'john@example.com',
        age: -5, // Negative age
      }

      const result = validateInput(input, schema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('age is below minimum value of 0')
    })

    it('should validate email format', () => {
      const input = {
        name: 'John',
        email: 'not-an-email',
      }

      const result = validateInput(input, schema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('email has invalid format: email')
    })

    it('should validate nested objects', () => {
      const nestedSchema: InputValidationSchema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      }

      const input = {
        user: {
          name: 'John',
        },
      }

      const result = validateInput(input, nestedSchema)

      expect(result.isValid).toBe(true)
    })
  })

  describe('InputSanitizer class', () => {
    it('should apply custom configuration', () => {
      const config: SanitizerConfig = {
        stripNull: true,
        trimStrings: true,
        maxStringLength: 1000,
      }

      const customSanitizer = new InputSanitizer(config)
      
      const input = '  test string  \x00'
      const result = customSanitizer.sanitize(input)

      expect(result).toBe('test string') // Trimmed and null byte removed
    })

    it('should provide sanitize all method', () => {
      const input = {
        html: '<script>alert(1)</script>Hello',
        email: 'USER@EXAMPLE.COM',
        url: 'javascript:void(0)',
        filename: '../etc/passwd',
      }

      const result = sanitizer.sanitizeAll(input)

      expect(result.html).not.toContain('<script>')
      expect(result.email).toBe('user@example.com')
      expect(result.url).toBe('')
      expect(result.filename).toBe('etcpasswd')
    })

    it('should handle batch sanitization', () => {
      const inputs = [
        { type: 'html', value: '<b>Bold</b>' },
        { type: 'email', value: 'test@example.com' },
        { type: 'sql', value: "'; DROP TABLE --" },
      ]

      const results = sanitizer.sanitizeBatch(inputs)

      expect(results[0]).not.toContain('<script>')
      expect(results[1]).toBe('test@example.com')
      expect(results[2]).toContain("''")
    })
  })
})