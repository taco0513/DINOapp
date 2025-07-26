'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`])
  }

  const handleSignIn = async () => {
    addLog('Starting sign in...')
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard'
      })
      addLog(`Sign in result: ${JSON.stringify(result)}`)
    } catch (error) {
      addLog(`Sign in error: ${error}`)
    }
  }

  const handleSignOut = async () => {
    addLog('Starting sign out...')
    try {
      await signOut({ redirect: false })
      addLog('Sign out successful')
    } catch (error) {
      addLog(`Sign out error: ${error}`)
    }
  }

  const checkEnvironment = async () => {
    try {
      const res = await fetch('/api/debug')
      const data = await res.json()
      addLog(`Environment: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      addLog(`Environment check error: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Session Status</h2>
        <p>Status: <span className="font-mono">{status}</span></p>
        <p>Session: <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre></p>
      </div>

      <div className="mb-8 space-y-4">
        <button
          onClick={handleSignIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Sign In with Google (No Redirect)
        </button>

        <button
          onClick={() => signIn('google')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ml-4"
        >
          Sign In with Google (With Redirect)
        </button>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-4"
        >
          Sign Out
        </button>

        <button
          onClick={checkEnvironment}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 ml-4"
        >
          Check Environment
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Logs</h2>
        <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-auto">
          {logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Current URL Info</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p>Origin: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p>Pathname: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
          <p>Search: {typeof window !== 'undefined' ? window.location.search : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}