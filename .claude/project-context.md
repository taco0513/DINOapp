# Project Context for Claude - DINO

## What This Project Does
DINO는 디지털 노마드와 장기 여행자를 위한 스마트 여행 관리 플랫폼입니다. 복잡한 비자 규정을 자동으로 추적하고, 특히 셰겐 지역의 90/180일 규칙을 정확히 계산하여 법적 문제를 예방합니다.

## Architecture Overview
- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js with Google OAuth
- **State**: React Context API + React Query
- **Deployment**: Vercel Platform

## Key Technologies
- Framework: Next.js 15.4.4
- Database: Prisma + SQLite/PostgreSQL
- Auth: NextAuth.js + Google OAuth 2.0
- Styling: Tailwind CSS + Minimal Design System
- API Integration: Google Gmail/Calendar APIs
- Deployment: Vercel

## Important Patterns

### API Pattern
- Zod validation for all inputs
- Consistent error responses
- Rate limiting on all endpoints
- CSRF protection

### Component Pattern
- Minimal design system (base.css)
- Client/Server component separation
- Loading/Error states for all async operations
- Mobile-first responsive design

### Data Pattern
- Country codes (ISO 3166-1 alpha-3)
- 14 visa types (TOURIST, BUSINESS, etc.)
- Schengen calculation with 180-day rolling window

## Common Gotchas
- ⚠️ SQLite in dev, PostgreSQL in prod - check schema compatibility
- ⚠️ Google API rate limits - implement proper caching
- ⚠️ Schengen calculations are reference only - legal disclaimer required
- ⚠️ Date timezone handling - always use UTC for storage
- ⚠️ Mobile bottom nav overlaps content - padding-bottom: 60px required

## File Organization
```
app/                    # Next.js 15 App Router
├── (auth)/            # Authentication pages
├── (dashboard)/       # Main application pages
├── api/               # API Routes
└── legal/             # Legal pages (terms, privacy, faq)

components/            # Reusable UI components
├── auth/             # Authentication components
├── dashboard/        # Dashboard specific
├── layout/           # Layout components (Header, Footer)
├── mobile/           # Mobile specific (BottomNav)
├── schengen/         # Schengen calculator
└── ui/               # Generic UI components

lib/                   # Core business logic
├── auth.ts           # NextAuth configuration
├── db.ts             # Database client
├── google/           # Google API integrations
├── schengen/         # Calculation logic
└── utils/            # Utility functions

types/                 # TypeScript definitions
data/                  # Static data (countries, visas)
docs/                  # Living documentation
```

## Current Status
- ✅ Core functionality complete
- ✅ UI unification with minimal design system
- ✅ Legal documents (terms, privacy, FAQ)
- ✅ Build passing
- 🔄 Day 17 Launch checklist in progress
- ⏳ Security review pending
- ⏳ Deployment preparation pending
- ⏳ Launch strategy pending

## Next Steps
1. Complete security review
2. Prepare production deployment
3. Establish launch strategy
4. Begin Day 18-21 monitoring phase

## Key Files Reference
- `/lib/auth.ts` - NextAuth configuration
- `/lib/schengen/calculator.ts` - Core Schengen logic
- `/app/api/trips/route.ts` - Trip management API
- `/components/schengen/SchengenCalculator.tsx` - Main calculator UI
- `/prisma/schema.prisma` - Database schema

## Recent Important Changes
- 2024-07-28: Added legal pages (terms, privacy, FAQ)
- 2024-07-28: Unified UI with minimal design system
- 2024-07-28: Fixed database configuration for dev
- 2024-07-28: Applied 17-day journey methodology