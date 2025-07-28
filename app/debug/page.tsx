'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [envVars, setEnvVars] = useState<any>({})
  const [cookies, setCookies] = useState('')

  useEffect(() => {
    // Get environment info
    fetch('/api/debug')
      .then(res => res.json())
      .then(data => setEnvVars(data))
      .catch(err => setEnvVars({ error: 'Failed to load debug info' }))

    // Get cookies
    setCookies(document.cookie)
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
      
      <section className="mb-8 card">
        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
        <pre className="text-sm overflow-auto">
          Status: {status}
          {'\n'}
          Session: {JSON.stringify(session, null, 2)}
        </pre>
      </section>

      <section className="mb-8 card">
        <h2 className="text-xl font-semibold mb-2">Current URL</h2>
        <pre className="text-sm overflow-auto">
          Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
          {'\n'}
          Pathname: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}
          {'\n'}
          Full URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}
        </pre>
      </section>

      <section className="mb-8 card">
        <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(envVars, null, 2)}
        </pre>
      </section>

      <section className="mb-8 card">
        <h2 className="text-xl font-semibold mb-2">Cookies</h2>
        <pre className="text-sm overflow-auto">
          {cookies || 'No cookies found'}
        </pre>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Actions</h2>
        <div className="space-y-2">
          <a href="/auth/signin" className="inline-block btn btn-primary">
            Go to Sign In
          </a>
          <br />
          <a href="/dashboard" className="inline-block btn btn-success">
            Go to Dashboard
          </a>
          <br />
          <a href="/" className="inline-block btn btn-ghost">
            Go to Home
          </a>
        </div>
      </section>
    </div>
  )
}