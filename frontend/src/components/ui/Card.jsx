import React from 'react'

export default function Card({
  children,
  title,
  subtitle,
  icon,
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  footer,
  headerAction
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }

  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer' : ''

  return (
    <div className={`bg-white rounded-2xl ${shadowClasses[shadow]} ${paddingClasses[padding]} ${hoverClasses} ${className}`}>
      {(title || icon || headerAction) && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && <span className="text-2xl">{icon}</span>}
            <div>
              {title && <h3 className="text-lg font-bold text-gray-800">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={children ? '' : ''}>
        {children}
      </div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  )
}
