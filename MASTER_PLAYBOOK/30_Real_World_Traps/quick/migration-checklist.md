# Migration Checklist (180토큰)

## 🚨 시작 전 필수
- [ ] 전체 백업
- [ ] 롤백 계획
- [ ] 데이터 매핑 문서

## 단계별 진행
### 1. 준비 (Day 1)
```javascript
// 이중 저장 시작
const save = (data) => {
  localStorage.setItem(key, data)
  if (user) supabase.insert(data) // 새 저장소
}
```

### 2. 검증 (Day 2-3)
```javascript
// 데이터 일치 확인
const local = localStorage.getItem(key)
const remote = await supabase.get(key)
console.assert(local === remote)
```

### 3. 전환 (Day 4)
```javascript
// 읽기 전환
const load = () => {
  return supabase.get(key) || localStorage.getItem(key)
}
```

### 4. 정리 (Day 5+)
- [ ] 구 데이터 보관 (30일)
- [ ] 사용자 공지
- [ ] 모니터링

실패시 → @detailed/migration-recovery