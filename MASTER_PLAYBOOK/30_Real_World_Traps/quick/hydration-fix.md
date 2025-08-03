# Hydration Fix (150토큰)

## 즉시 확인 (30초)
❌ window/document 직접 사용
❌ Date() 렌더링
❌ 조건부 렌더링
❌ localStorage 초기값

## 해결 (2분)
```tsx
// Before ❌
if (window) { ... }
const time = new Date()

// After ✅
useEffect(() => { ... }, [])
suppressHydrationWarning
```

## 패턴
```tsx
// Dynamic Import
const Component = dynamic(() => import('./Component'), {
  ssr: false
})

// Safe Browser API
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

해결 안되면 → @detailed/hydration