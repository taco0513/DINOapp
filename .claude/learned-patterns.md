# Learned Patterns - DINO Project

## 2024-07-28

### Pattern: Server/Client Component Separation
- Server Components cannot have onClick handlers
- Extract interactive elements to separate Client Components
- Use 'use client' directive for interactive components

### Pattern: Database Environment Management  
- Use SQLite for development (simple, file-based)
- Use PostgreSQL for production (scalable)
- Prisma abstracts differences, but watch for schema compatibility

### Pattern: Minimal Design System
- All styling through CSS variables (--color-*, --space-*)
- Use utility classes from base.css
- Never hardcode values - always reference style guide

### Pattern: API Error Handling
- Always use Zod for input validation
- Return consistent error responses
- Include request IDs for debugging
- Rate limit all endpoints

### Pattern: TypeScript Import/Export
- Check if export is default or named before importing
- Use `export default` for components
- Use named exports for utilities and types

### Pattern: Schengen Calculation
- Always work with UTC dates
- 180-day rolling window calculation
- Include legal disclaimer - reference only
- Handle edge cases (same day entry/exit)