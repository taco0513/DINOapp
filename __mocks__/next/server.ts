export class NextRequest {
  public url: string
  public method: string
  public headers: NextRequestHeaders
  public body: any

  constructor(url: string, init: RequestInit = {}) {
    this.url = url
    this.method = init.method || 'GET'
    this.headers = new NextRequestHeaders(init.headers)
    this.body = init.body
  }

  async json() {
    if (typeof this.body === 'string') {
      return JSON.parse(this.body)
    }
    return this.body
  }

  async formData() {
    return this.body
  }
}

class NextRequestHeaders {
  private headers: Map<string, string>

  constructor(init?: HeadersInit) {
    this.headers = new Map()
    
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => {
          this.headers.set(key.toLowerCase(), value)
        })
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), value)
        })
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.headers.set(key.toLowerCase(), String(value))
        })
      }
    }
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value)
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase())
  }

  forEach(callback: (value: string, key: string) => void): void {
    this.headers.forEach(callback)
  }
}

export class NextResponse extends Response {
  public cookies: Map<string, any>

  constructor(body?: any, init?: ResponseInit) {
    super(body, init)
    this.cookies = new Map()
  }

  static json(data: any, init?: ResponseInit) {
    return new NextResponse(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
  }

  get(name: string) {
    return this.headers.get(name)
  }
}

// Mock getServerSession
export function getServerSession() {
  return null
}