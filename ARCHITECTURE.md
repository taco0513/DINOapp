# DINO v2.0 Component Architecture Guidelines

## 🏗️ Component Architecture Principles

### 1. Server vs Client Components

**Server Components (Default)**
```typescript
// app/page.tsx - Server Component (default)
import { getServerSession } from 'next-auth';
import { ClientWrapper } from './ClientWrapper';

export default async function Page() {
  const session = await getServerSession();
  const data = await fetchData();
  
  return <ClientWrapper session={session} data={data} />;
}
```

**Client Components**
```typescript
// components/ClientWrapper.tsx
'use client';

import { useState } from 'react';

interface Props {
  session: Session | null;
  data: Data;
}

export function ClientWrapper({ session, data }: Props) {
  const [state, setState] = useState();
  
  return (
    <div onClick={() => setState(prev => !prev)}>
      {/* Interactive content */}
    </div>
  );
}
```

### 2. Image Optimization

**Always use Next.js Image component**
```typescript
// ✅ Correct
import Image from 'next/image';

<Image 
  src={user.image} 
  alt={user.name || '사용자'} 
  width={32} 
  height={32}
  className="rounded-full"
/>

// ❌ Wrong
<img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
```

### 3. React Hooks Best Practices

**Function Dependencies**
```typescript
// ✅ Correct - wrap functions in useCallback
const processData = useCallback((data: Data) => {
  return data.filter(item => item.active);
}, []);

const result = useMemo(() => {
  return processData(rawData);
}, [rawData, processData]);

// ❌ Wrong - function recreated every render
const processData = (data: Data) => data.filter(item => item.active);
const result = useMemo(() => processData(rawData), [rawData, processData]);
```

### 4. Intentional Unused Variables

**Use underscore prefix for placeholder parameters**
```typescript
// ✅ Correct - ESLint will ignore these
interface Props {
  data: Data;
  onSave: (data: Data) => void;
  onDelete: (id: string) => void; // Future implementation
}

function Component({ 
  data, 
  onSave, 
  onDelete: _onDelete // Placeholder for future use
}: Props) {
  return <div>{data.title}</div>;
}
```

### 5. Type Safety

**Strict TypeScript patterns**
```typescript
// ✅ Correct - strict types
interface UserProfile {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly image?: string; // Optional but defined
}

// Array access with safety
const firstItem = items[0]; // Could be undefined
if (firstItem) {
  console.log(firstItem.name); // Safe access
}

// ❌ Wrong - loose types
const user: any = getUser();
const name = user.name; // No type safety
```

## 🔧 Development Workflow

### Pre-commit Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes  
- [ ] No console errors in browser
- [ ] Images use Next.js Image component
- [ ] Functions in hook dependencies use useCallback

### File Organization
```
components/
├── ui/           # Basic UI components
├── layout/       # Layout components  
├── forms/        # Form components
├── [domain]/     # Domain-specific components
│   ├── Client.tsx    # Client wrapper
│   └── Server.tsx    # Server component
└── shared/       # Shared utilities
```

### Import Order
```typescript
// 1. External libraries
import { useState } from 'react';
import Image from 'next/image';

// 2. Internal imports
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import type { User } from '@/types/user';
```

## 🚫 Common Anti-patterns to Avoid

### 1. Mixing Server and Client Logic
```typescript
// ❌ Wrong - event handlers in server component
export default function Page() {
  return <button onClick={() => alert('click')}>Click</button>;
}

// ✅ Correct - separate concerns
export default function Page() {
  return <ClientButton />;
}
```

### 2. Missing Image Optimization
```typescript
// ❌ Wrong
<img src="/logo.png" alt="Logo" />

// ✅ Correct  
<Image src="/logo.png" alt="Logo" width={100} height={50} />
```

### 3. Unstable Hook Dependencies
```typescript
// ❌ Wrong
const fetchData = () => api.get('/data');
useEffect(() => {
  fetchData();
}, [fetchData]); // fetchData changes every render

// ✅ Correct
const fetchData = useCallback(() => api.get('/data'), []);
useEffect(() => {
  fetchData();
}, [fetchData]);
```

## 📝 Code Review Checklist

### TypeScript
- [ ] No `any` types used
- [ ] All props properly typed
- [ ] Optional properties handled safely
- [ ] Return types explicit for complex functions

### React
- [ ] Components have single responsibility
- [ ] Props are readonly interfaces
- [ ] Event handlers in client components only
- [ ] Hooks follow rules of hooks

### Performance
- [ ] Images optimized with Next.js Image
- [ ] Functions memoized when used in dependencies
- [ ] Expensive calculations wrapped in useMemo
- [ ] Components memoized when appropriate

### Accessibility
- [ ] Alt text for images
- [ ] Aria labels for interactive elements
- [ ] Keyboard navigation support
- [ ] Color contrast compliance

This architecture ensures maintainable, performant, and error-free code that follows Next.js 13+ App Router best practices.