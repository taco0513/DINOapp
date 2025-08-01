/**
 * Unified spacing utility system
 * Maps Tailwind-style spacing to CSS variables
 */

// Spacing scale mapping
export const spacingScale = {
  '0': '0',
  '1': 'var(--space-1)',   // 0.25rem
  '2': 'var(--space-2)',   // 0.5rem
  '3': 'var(--space-3)',   // 0.75rem
  '4': 'var(--space-4)',   // 1rem
  '5': 'var(--space-5)',   // 1.25rem
  '6': 'var(--space-6)',   // 1.5rem
  '8': 'var(--space-8)',   // 2rem
  '10': 'var(--space-10)', // 2.5rem
  '12': 'var(--space-12)', // 3rem
  '16': 'var(--space-16)', // 4rem
  '20': 'var(--space-20)', // 5rem
} as const

export type SpacingKey = keyof typeof spacingScale

// Spacing utility functions
export function spacing(key: SpacingKey): string {
  return spacingScale[key] || '0'
}

export function px(key: SpacingKey): { paddingLeft: string; paddingRight: string } {
  const value = spacing(key)
  return { paddingLeft: value, paddingRight: value }
}

export function py(key: SpacingKey): { paddingTop: string; paddingBottom: string } {
  const value = spacing(key)
  return { paddingTop: value, paddingBottom: value }
}

export function p(key: SpacingKey): { padding: string } {
  return { padding: spacing(key) }
}

export function mx(key: SpacingKey): { marginLeft: string; marginRight: string } {
  const value = spacing(key)
  return { marginLeft: value, marginRight: value }
}

export function my(key: SpacingKey): { marginTop: string; marginBottom: string } {
  const value = spacing(key)
  return { marginTop: value, marginBottom: value }
}

export function m(key: SpacingKey): { margin: string } {
  return { margin: spacing(key) }
}

export function gap(key: SpacingKey): { gap: string } {
  return { gap: spacing(key) }
}

// Individual side utilities
export function pt(key: SpacingKey): { paddingTop: string } {
  return { paddingTop: spacing(key) }
}

export function pb(key: SpacingKey): { paddingBottom: string } {
  return { paddingBottom: spacing(key) }
}

export function pl(key: SpacingKey): { paddingLeft: string } {
  return { paddingLeft: spacing(key) }
}

export function pr(key: SpacingKey): { paddingRight: string } {
  return { paddingRight: spacing(key) }
}

export function mt(key: SpacingKey): { marginTop: string } {
  return { marginTop: spacing(key) }
}

export function mb(key: SpacingKey): { marginBottom: string } {
  return { marginBottom: spacing(key) }
}

export function ml(key: SpacingKey): { marginLeft: string } {
  return { marginLeft: spacing(key) }
}

export function mr(key: SpacingKey): { marginRight: string } {
  return { marginRight: spacing(key) }
}

// Compound spacing utilities
export function spaceX(key: SpacingKey): string {
  return `& > * + * { margin-left: ${spacing(key)}; }`
}

export function spaceY(key: SpacingKey): string {
  return `& > * + * { margin-top: ${spacing(key)}; }`
}

// Helper to combine multiple spacing utilities
export function combine(...styles: Record<string, string>[]): Record<string, string> {
  return Object.assign({}, ...styles)
}

// Migration helper: converts Tailwind classes to CSS variables
export function migrateSpacing(className: string): string {
  let result = className
  
  // Replace padding classes
  result = result.replace(/\bp-(\d+)\b/g, (match, num) => {
    return spacingScale[num as SpacingKey] ? `[padding:${spacingScale[num as SpacingKey]}]` : match
  })
  
  // Replace padding-x classes
  result = result.replace(/\bpx-(\d+)\b/g, (match, num) => {
    return spacingScale[num as SpacingKey] ? `[padding-left:${spacingScale[num as SpacingKey]}] [padding-right:${spacingScale[num as SpacingKey]}]` : match
  })
  
  // Replace padding-y classes
  result = result.replace(/\bpy-(\d+)\b/g, (match, num) => {
    return spacingScale[num as SpacingKey] ? `[padding-top:${spacingScale[num as SpacingKey]}] [padding-bottom:${spacingScale[num as SpacingKey]}]` : match
  })
  
  // Replace margin classes
  result = result.replace(/\bm-(\d+)\b/g, (match, num) => {
    return spacingScale[num as SpacingKey] ? `[margin:${spacingScale[num as SpacingKey]}]` : match
  })
  
  // Replace gap classes
  result = result.replace(/\bgap-(\d+)\b/g, (match, num) => {
    return spacingScale[num as SpacingKey] ? `[gap:${spacingScale[num as SpacingKey]}]` : match
  })
  
  return result
}