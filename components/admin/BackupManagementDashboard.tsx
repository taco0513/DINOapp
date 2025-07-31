'use client';

import { useState, useEffect } from 'react';
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
  RefreshCw,
} from 'lucide-react';

interface BackupInfo {
  databaseBackups: any[];
  fileBackups: any[];
  schedules: any[];
  status: {
    totalSchedules: number;
    enabledSchedules: number;
    runningSchedules: number;
    lastBackup?: string;
    nextBackup?: string;
  };
}

export default function BackupManagementDashboard() {
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'backups' | 'schedules' | 'recovery'
  >('backups');

  // Fetch backup information
  const fetchBackupInfo = async () => {
    try {
      const response = await fetch('/api/backup');
      if (response.ok) {
        const data = await response.json();
        setBackupInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch backup info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupInfo();
  }, []);

  // Create manual backup
  const _createBackup = async (type: 'database' | 'files' | 'both') => {
    setIsCreatingBackup(true);

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          options: {
            compress: true,
            encrypt: true,
            retentionDays: 30,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Backup created:', result);

        // Refresh backup list
        await fetchBackupInfo();

        // Show success message
        alert(`✅ ${type} 백업이 성공적으로 생성되었습니다!`);
      } else {
        console.error('❌ 백업 생성에 실패했습니다');
      }
    } catch (error) {
      console.error('Backup error:', error);
      alert('❌ 백업 생성에 실패했습니다');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Test recovery plan
  const _testRecovery = async (scenario: string) => {
    try {
      const response = await fetch('/api/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          scenario,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(
          result.valid
            ? `✅ 복구 계획 "${scenario}"이 유효하고 준비되었습니다`
            : `❌ 복구 계획 "${scenario}" 검증에 실패했습니다`
        );
      }
    } catch (error) {
      console.error('Recovery test error:', error);
      console.error('❌ 복구 테스트에 실패했습니다');
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <RefreshCw className='h-8 w-8 animate-spin' />
      </div>
    );
  }

  return (
    <>
      {/* Status Overview */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <div className='card'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold'>스케줄</h3>
              <Calendar className='h-6 w-6 text-primary' />
            </div>
            <p className='text-2xl font-bold'>
              {backupInfo?.status.enabledSchedules || 0}
            </p>
            <p className='text-sm text-secondary'>
              {backupInfo?.status.totalSchedules || 0}개 중 활성
            </p>
          </div>
        </div>

        <div className='card'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold'>마지막 백업</h3>
              <Clock className='h-6 w-6 text-success' />
            </div>
            <p className='text-sm'>
              {backupInfo?.status.lastBackup
                ? new Date(backupInfo.status.lastBackup).toLocaleString()
                : '없음'}
            </p>
          </div>
        </div>

        <div className='card'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold'>다음 백업</h3>
              <Clock className='h-6 w-6 text-warning' />
            </div>
            <p className='text-sm'>
              {backupInfo?.status.nextBackup
                ? new Date(backupInfo.status.nextBackup).toLocaleString()
                : '예약되지 않음'}
            </p>
          </div>
        </div>

        <div className='card'>
          <div className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold'>총 백업</h3>
              <HardDrive className='h-6 w-6 text-info' />
            </div>
            <p className='text-2xl font-bold'>
              {(backupInfo?.databaseBackups?.length || 0) +
                (backupInfo?.fileBackups?.length || 0)}
            </p>
            <p className='text-sm text-secondary'>저장됨</p>
          </div>
        </div>
      </div>

      {/* Manual Backup Actions */}
      <div className='card mb-8'>
        <div className='p-6'>
          <h2 className='text-xl font-semibold mb-4'>수동 백업</h2>
          <div className='flex flex-wrap gap-4'>
            <button
              onClick={() => createBackup('database')}
              disabled={isCreatingBackup}
              className='btn btn-primary'
            >
              <Database className='h-4 w-4 mr-2' />
              데이터베이스 백업
            </button>
            <button
              onClick={() => createBackup('files')}
              disabled={isCreatingBackup}
              className='btn btn-primary'
            >
              <FileArchive className='h-4 w-4 mr-2' />
              파일 백업
            </button>
            <button
              onClick={() => createBackup('both')}
              disabled={isCreatingBackup}
              className='btn btn-accent'
            >
              <Shield className='h-4 w-4 mr-2' />
              전체 백업
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className='tabs tabs-boxed mb-6'>
        <button
          className={`tab ${activeTab === 'backups' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('backups')}
        >
          백업
        </button>
        <button
          className={`tab ${activeTab === 'schedules' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('schedules')}
        >
          스케줄
        </button>
        <button
          className={`tab ${activeTab === 'recovery' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('recovery')}
        >
          복구
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'backups' && (
        <div className='space-y-6'>
          {/* Database Backups */}
          <div className='card'>
            <div className='p-6'>
              <h3 className='text-lg font-semibold mb-4 flex items-center'>
                <Database className='h-5 w-5 mr-2' />
                데이터베이스 백업
              </h3>
              <div className='overflow-x-auto'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>유형</th>
                      <th>크기</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupInfo?.databaseBackups?.map((backup, index) => (
                      <tr key={index}>
                        <td>{new Date(backup.timestamp).toLocaleString()}</td>
                        <td className='capitalize'>{backup.type}</td>
                        <td>{(backup.size / 1024 / 1024).toFixed(2)} MB</td>
                        <td>
                          <span
                            className={`badge ${backup.status === 'success' ? 'badge-success' : 'badge-error'}`}
                          >
                            {backup.status}
                          </span>
                        </td>
                        <td>
                          <button className='btn btn-ghost btn-sm'>
                            <Download className='h-4 w-4' />
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
          <div className='card'>
            <div className='p-6'>
              <h3 className='text-lg font-semibold mb-4 flex items-center'>
                <FileArchive className='h-5 w-5 mr-2' />
                파일 백업
              </h3>
              <div className='overflow-x-auto'>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>날짜</th>
                      <th>파일</th>
                      <th>크기</th>
                      <th>상태</th>
                      <th>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backupInfo?.fileBackups?.map((backup, index) => (
                      <tr key={index}>
                        <td>{new Date(backup.timestamp).toLocaleString()}</td>
                        <td>{backup.totalFiles || 'N/A'}</td>
                        <td>
                          {(backup.totalSize / 1024 / 1024).toFixed(2)} MB
                        </td>
                        <td>
                          <span
                            className={`badge ${backup.status === 'success' ? 'badge-success' : 'badge-error'}`}
                          >
                            {backup.status}
                          </span>
                        </td>
                        <td>
                          <button className='btn btn-ghost btn-sm'>
                            <Download className='h-4 w-4' />
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
        <div className='card'>
          <div className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>백업 스케줄</h3>
            <div className='space-y-4'>
              {backupInfo?.schedules?.map(schedule => (
                <div key={schedule.id} className='border rounded-lg p-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-semibold'>{schedule.name}</h4>
                      <p className='text-sm text-secondary'>
                        스케줄: {schedule.schedule} | 유형: {schedule.type}
                      </p>
                      <p className='text-sm text-secondary'>
                        다음 실행:{' '}
                        {schedule.nextRun
                          ? new Date(schedule.nextRun).toLocaleString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span
                        className={`badge ${schedule.enabled ? 'badge-success' : 'badge-ghost'}`}
                      >
                        {schedule.enabled ? '활성' : '비활성'}
                      </span>
                      <button className='btn btn-ghost btn-sm'>
                        <Play className='h-4 w-4' />
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
        <div className='card'>
          <div className='p-6'>
            <h3 className='text-lg font-semibold mb-4'>재해 복구 계획</h3>
            <div className='space-y-4'>
              <div className='alert alert-warning'>
                <AlertTriangle className='h-4 w-4' />
                <span>복구 작업은 유지보수 시간에만 수행해야 합니다</span>
              </div>

              <div className='space-y-3'>
                <div className='border rounded-lg p-4'>
                  <h4 className='font-semibold mb-2'>데이터베이스 손상</h4>
                  <p className='text-sm text-secondary mb-3'>
                    최신 백업에서 데이터베이스 복원
                  </p>
                  <button
                    onClick={() => testRecovery('database-corruption')}
                    className='btn btn-sm btn-ghost'
                  >
                    계획 테스트
                  </button>
                </div>

                <div className='border rounded-lg p-4'>
                  <h4 className='font-semibold mb-2'>파일 손실</h4>
                  <p className='text-sm text-secondary mb-3'>
                    백업에서 누락된 파일 복원
                  </p>
                  <button
                    onClick={() => testRecovery('file-loss')}
                    className='btn btn-sm btn-ghost'
                  >
                    계획 테스트
                  </button>
                </div>

                <div className='border rounded-lg p-4'>
                  <h4 className='font-semibold mb-2'>완전한 재해</h4>
                  <p className='text-sm text-secondary mb-3'>
                    인프라를 포함한 전체 시스템 복구
                  </p>
                  <button
                    onClick={() => testRecovery('complete-disaster')}
                    className='btn btn-sm btn-ghost'
                  >
                    계획 테스트
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
