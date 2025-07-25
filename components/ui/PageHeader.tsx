interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export default function PageHeader({ 
  title, 
  description, 
  action, 
  className = '' 
}: PageHeaderProps) {
  return (
    <div className={`pb-8 border-b border-gray-200 mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-lg text-gray-600">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}