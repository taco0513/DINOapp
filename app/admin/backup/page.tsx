'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Database,
  FileArchive,
  Calendar,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive,
  Shield,
  Play,
  RefreshCw
} from 'lucide-react'

interface BackupInfo {
  databaseBackups: any[]
  fileBackups: any[]
  schedules: any[]
  status: {
    totalSchedules: number
    enabledSchedules: number
    runningSchedules: number
    lastBackup?: string
    nextBackup?: string
  }
}

export default function BackupManagement() {
  const { data: session } = useSession()
  const router = useRouter()
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [activeTab, setActiveTab] = useState<'backups' | 'schedules' | 'recovery'>('backups')

  // Check if user is admin
  useEffect(() => {
    if (session && session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/dashboard')
    }
  }, [session, router])

  // Fetch backup information
  const fetchBackupInfo = async () => {
    try {
      const response = await fetch('/api/backup')
      if (response.ok) {
        const data = await response.json()
        setBackupInfo(data)
      }
    } catch (error) {
      console.error('Failed to fetch backup info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBackupInfo()
  }, [])

  // Create manual backup
  const createBackup = async (type: 'database' | 'files' | 'both') => {
    setIsCreatingBackup(true)
    
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          options: {
            compress: true,
            encrypt: true,
            retentionDays: 30
          }
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Backup created:', result)
        
        // Refresh backup list
        await fetchBackupInfo()
        
        // Show success message
        alert(`✅ ${type} backup created successfully!`)
      } else {
        alert('❌ Backup creation failed')
      }
    } catch (error) {
      console.error('Backup error:', error)
      alert('❌ Backup creation failed')
    } finally {
      setIsCreatingBackup(false)
    }
  }

  // Test recovery plan
  const testRecovery = async (scenario: string) => {
    try {
      const response = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          scenario
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.valid 
          ? `✅ Recovery plan "${scenario}" is valid and ready`
          : `❌ Recovery plan "${scenario}" validation failed`
        )
      }
    } catch (error) {
      console.error('Recovery test error:', error)
      alert('❌ Recovery test failed')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backup & Recovery</h1>
        <p className="text-secondary">Manage system backups and disaster recovery</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Schedules</h3>
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-bold">{backupInfo?.status.enabledSchedules || 0}</p>
            <p className="text-sm text-secondary">of {backupInfo?.status.totalSchedules || 0} active</p>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Last Backup</h3>
              <Clock className="h-6 w-6 text-success" />
            </div>
            <p className="text-sm">
              {backupInfo?.status.lastBackup 
                ? new Date(backupInfo.status.lastBackup).toLocaleString()
                : 'Never'
              }
            </p>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Next Backup</h3>
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <p className="text-sm">
              {backupInfo?.status.nextBackup 
                ? new Date(backupInfo.status.nextBackup).toLocaleString()
                : 'Not scheduled'
              }
            </p>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Total Backups</h3>
              <HardDrive className="h-6 w-6 text-info" />
            </div>
            <p className="text-2xl font-bold">
              {(backupInfo?.databaseBackups?.length || 0) + (backupInfo?.fileBackups?.length || 0)}
            </p>
            <p className="text-sm text-secondary">stored</p>
          </div>
        </div>
      </div>

      {/* Manual Backup Actions */}
      <div className="card mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Backup</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => createBackup('database')}
              disabled={isCreatingBackup}
              className="btn btn-primary"
            >
              <Database className="h-4 w-4 mr-2" />
              Backup Database
            </button>
            <button
              onClick={() => createBackup('files')}
              disabled={isCreatingBackup}
              className="btn btn-primary"
            >
              <FileArchive className="h-4 w-4 mr-2" />
              Backup Files
            </button>
            <button
              onClick={() => createBackup('both')}
              disabled={isCreatingBackup}
              className="btn btn-accent"
            >
              <Shield className="h-4 w-4 mr-2" />
              Full Backup
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === 'backups' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('backups')}
        >
          Backups
        </button>
        <button
          className={`tab ${activeTab === 'schedules' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          Schedules
        </button>
        <button
          className={`tab ${activeTab === 'recovery' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('recovery')}
        >
          Recovery
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          {/* Database Backups */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                Database Backups
              </h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupInfo?.databaseBackups?.map((backup, index) => (
                      <tr key={index}>
                        <td>{new Date(backup.timestamp).toLocaleString()}</td>
                        <td className="capitalize">{backup.type}</td>
                        <td>{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                        <td>
                          <span className={`badge ${backup.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                            {backup.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* File Backups */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileArchive className="h-5 w-5 mr-2" />
                File Backups
              </h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Files</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupInfo?.fileBackups?.map((backup, index) => (
                      <tr key={index}>
                        <td>{new Date(backup.timestamp).toLocaleString()}</td>
                        <td>{backup.totalFiles || 'N/A'}</td>
                        <td>{(backup.totalSize / 1024 / 1024).toFixed(2)} MB</td>
                        <td>
                          <span className={`badge ${backup.status === 'success' ? 'badge-success' : 'badge-error'}`}>
                            {backup.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Backup Schedules</h3>
            <div className="space-y-4">
              {backupInfo?.schedules?.map((schedule) => (
                <div key={schedule.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{schedule.name}</h4>
                      <p className="text-sm text-secondary">
                        Schedule: {schedule.schedule} | Type: {schedule.type}
                      </p>
                      <p className="text-sm text-secondary">
                        Next run: {schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${schedule.enabled ? 'badge-success' : 'badge-ghost'}`}>
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                      <button className="btn btn-ghost btn-sm">
                        <Play className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recovery' && (
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Disaster Recovery Plans</h3>
            <div className="space-y-4">
              <div className="alert alert-warning">
                <AlertTriangle className="h-4 w-4" />
                <span>Recovery operations should only be performed during maintenance windows</span>
              </div>

              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Database Corruption</h4>
                  <p className="text-sm text-secondary mb-3">
                    Restore database from most recent backup
                  </p>
                  <button
                    onClick={() => testRecovery('database-corruption')}
                    className="btn btn-sm btn-ghost"
                  >
                    Test Plan
                  </button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">File Loss</h4>
                  <p className="text-sm text-secondary mb-3">
                    Restore missing files from backup
                  </p>
                  <button
                    onClick={() => testRecovery('file-loss')}
                    className="btn btn-sm btn-ghost"
                  >
                    Test Plan
                  </button>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Complete Disaster</h4>
                  <p className="text-sm text-secondary mb-3">
                    Full system recovery including infrastructure
                  </p>
                  <button
                    onClick={() => testRecovery('complete-disaster')}
                    className="btn btn-sm btn-ghost"
                  >
                    Test Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}