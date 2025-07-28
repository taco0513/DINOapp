'use client'

interface BackButtonProps {
  className?: string
}

export default function BackButton({ className = "btn btn-secondary" }: BackButtonProps) {
  return (
    <button 
      onClick={() => window.history.back()} 
      className={className}
    >
      뒤로 가기
    </button>
  )
}