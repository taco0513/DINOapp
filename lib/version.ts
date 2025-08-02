export const VERSION_INFO = {
  major: 3,
  minor: 0,
  patch: 0,
  stage: 'alpha' as const,
  build: 1,
  fullVersion: '3.0.0-alpha.1',
  codename: 'Dashboard Revolution',
  releaseDate: '2025-08-02',
  features: [
    'Real-time Dashboard',
    'Widget System', 
    'PWA Support',
    'WebSocket Integration',
    'Advanced Analytics'
  ],
  previousVersion: {
    version: '2.0.0',
    archived: true,
    branch: 'archive/v2.0-final'
  }
} as const;

export type VersionInfo = typeof VERSION_INFO;