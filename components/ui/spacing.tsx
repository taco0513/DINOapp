'use client'

import { CSSProperties, ReactNode } from 'react'
import { spacingScale, SpacingKey } from '@/lib/spacing'

interface SpacingProps {
  children: ReactNode
  // Padding
  p?: SpacingKey
  px?: SpacingKey
  py?: SpacingKey
  pt?: SpacingKey
  pb?: SpacingKey
  pl?: SpacingKey
  pr?: SpacingKey
  // Margin
  m?: SpacingKey
  mx?: SpacingKey
  my?: SpacingKey
  mt?: SpacingKey
  mb?: SpacingKey
  ml?: SpacingKey
  mr?: SpacingKey
  // Gap
  gap?: SpacingKey
  gapX?: SpacingKey
  gapY?: SpacingKey
  // Other props
  className?: string
  style?: CSSProperties
}

export function Spacing({
  children,
  p, px, py, pt, pb, pl, pr,
  m, mx, my, mt, mb, ml, mr,
  gap, gapX, gapY,
  className = '',
  style = {},
  ...props
}: SpacingProps) {
  const spacingStyles: CSSProperties = {}
  
  // Padding
  if (p) spacingStyles.padding = spacingScale[p]
  if (px) {
    spacingStyles.paddingLeft = spacingScale[px]
    spacingStyles.paddingRight = spacingScale[px]
  }
  if (py) {
    spacingStyles.paddingTop = spacingScale[py]
    spacingStyles.paddingBottom = spacingScale[py]
  }
  if (pt) spacingStyles.paddingTop = spacingScale[pt]
  if (pb) spacingStyles.paddingBottom = spacingScale[pb]
  if (pl) spacingStyles.paddingLeft = spacingScale[pl]
  if (pr) spacingStyles.paddingRight = spacingScale[pr]
  
  // Margin
  if (m) spacingStyles.margin = spacingScale[m]
  if (mx) {
    spacingStyles.marginLeft = spacingScale[mx]
    spacingStyles.marginRight = spacingScale[mx]
  }
  if (my) {
    spacingStyles.marginTop = spacingScale[my]
    spacingStyles.marginBottom = spacingScale[my]
  }
  if (mt) spacingStyles.marginTop = spacingScale[mt]
  if (mb) spacingStyles.marginBottom = spacingScale[mb]
  if (ml) spacingStyles.marginLeft = spacingScale[ml]
  if (mr) spacingStyles.marginRight = spacingScale[mr]
  
  // Gap
  if (gap) spacingStyles.gap = spacingScale[gap]
  if (gapX) spacingStyles.columnGap = spacingScale[gapX]
  if (gapY) spacingStyles.rowGap = spacingScale[gapY]
  
  return (
    <div 
      className={className}
      style={{ ...spacingStyles, ...style }}
      {...props}
    >
      {children}
    </div>
  )
}

// Utility components for common spacing patterns
export function Container({ children, className = '', ...props }: SpacingProps) {
  return (
    <Spacing 
      className={`container mx-auto ${className}`} 
      px="4" 
      py="8"
      {...props}
    >
      {children}
    </Spacing>
  )
}

export function Stack({ children, spacing = '4', className = '', ...props }: SpacingProps & { spacing?: SpacingKey }) {
  return (
    <Spacing 
      className={`flex flex-col ${className}`} 
      gap={spacing}
      {...props}
    >
      {children}
    </Spacing>
  )
}

export function Row({ children, spacing = '4', className = '', ...props }: SpacingProps & { spacing?: SpacingKey }) {
  return (
    <Spacing 
      className={`flex flex-row ${className}`} 
      gap={spacing}
      {...props}
    >
      {children}
    </Spacing>
  )
}

export function Grid({ 
  children, 
  cols = 1, 
  spacing = '4', 
  className = '', 
  ...props 
}: SpacingProps & { 
  cols?: number | { sm?: number; md?: number; lg?: number }
  spacing?: SpacingKey 
}) {
  const colsClass = typeof cols === 'number' 
    ? `grid-cols-${cols}`
    : `grid-cols-${cols.sm || 1} ${cols.md ? `md:grid-cols-${cols.md}` : ''} ${cols.lg ? `lg:grid-cols-${cols.lg}` : ''}`
    
  return (
    <Spacing 
      className={`grid ${colsClass} ${className}`} 
      gap={spacing}
      {...props}
    >
      {children}
    </Spacing>
  )
}