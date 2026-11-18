import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
  mobileActionsRight?: boolean
}

const PageHeader = ({ title, subtitle, badge, actions, className, mobileActionsRight = false }: PageHeaderProps) => {
  return (
    <div className={`px-4 sm:px-6 pt-4 pb-3 ${className ?? ''}`}>
      <div className={`flex ${mobileActionsRight ? 'flex-row items-start' : 'flex-col'} sm:flex-row sm:items-center justify-between gap-3`}>
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 text-xs sm:text-sm leading-normal text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className={`flex items-center gap-2 flex-wrap shrink-0 ${mobileActionsRight ? 'justify-end' : ''}`}>
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

export default PageHeader
