# 🛡️ DINO v2.0 Development Prevention Framework

## ⚡ Quick Commands (Use These!)

```bash
# Start development safely
npm run dev:safe

# Fix lint issues automatically  
npm run lint:fix

# Before any deployment
npm run pre-deploy

# Individual checks
npm run type-check
npm run lint
```

## 🚨 Common Error Patterns & Prevention

### 1. Image Issues
```typescript
// ❌ Will cause ESLint error
<img src={user.image} alt="Profile" />

// ✅ Correct way
<Image src={user.image} alt="Profile" width={32} height={32} />
```

### 2. React Hook Dependencies
```typescript
// ❌ Will cause exhaustive-deps error
const fetchData = () => api.get('/data');
useEffect(() => fetchData(), [fetchData]);

// ✅ Correct way
const fetchData = useCallback(() => api.get('/data'), []);
useEffect(() => fetchData(), [fetchData]);
```

### 3. Unused Variables
```typescript
// ✅ Prefix with _ for intentional unused
function Component({ data, onSave: _onSave }) {
  return <div>{data.title}</div>;
}
```

### 4. Client/Server Components
```typescript
// ❌ Event handlers in Server Component
export default function Page() {
  return <button onClick={() => alert('hi')}>Click</button>;
}

// ✅ Separate Client Component
'use client';
export function ClientButton() {
  return <button onClick={() => alert('hi')}>Click</button>;
}
```

## 🔍 Pre-commit Checklist

**Automatic (runs on git commit):**
- ✅ ESLint --fix
- ✅ Prettier formatting
- ✅ Type checking

**Manual verification:**
- [ ] No console errors in browser
- [ ] Images use Next.js Image component
- [ ] Functions in hook dependencies use useCallback
- [ ] Client/Server components properly separated

## 📁 Architecture Reminders

```
components/
├── ui/           # Basic UI components
├── layout/       # Layout components  
├── [domain]/     # Domain-specific components
│   ├── Client.tsx    # 'use client' wrapper
│   └── Server.tsx    # Server component
```

## 🚀 Development Workflow

1. **Start**: `npm run dev:safe`
2. **Code**: Follow patterns in `ARCHITECTURE.md`
3. **Fix**: `npm run lint:fix` when needed
4. **Commit**: Pre-commit hooks run automatically
5. **Deploy**: `npm run pre-deploy`

## 🆘 When You See Errors

- **TypeScript errors**: Run `npm run type-check` to see all issues
- **Lint errors**: Run `npm run lint:fix` to auto-fix many issues
- **Import order**: ESLint will enforce consistent import organization
- **Image optimization**: ESLint will catch `<img>` tag usage
- **Hook dependencies**: ESLint will catch missing useCallback

**Remember**: The framework prevents errors before they become problems!