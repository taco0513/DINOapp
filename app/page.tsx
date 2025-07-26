export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
          DINO
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
          Digital Nomad
        </p>
        <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: '1.6' }}>
          복잡한 비자 규정을 자동으로 추적하고 여행 기록을 체계적으로 관리하는 
          스마트 여행 관리 플랫폼입니다.
        </p>
      </div>
    </main>
  )
}