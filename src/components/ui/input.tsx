import * as React from 'react'
import { cn } from '../../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, iconRight, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full mb-3.5">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-xs font-semibold text-slate-700 tracking-tight",
              error && "text-rose-600",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center">
              {icon}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            ref={ref}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className={cn(
              'flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 transition-all duration-150',
              'placeholder:text-slate-400 hover:border-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50',
              error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-600/15',
              icon && 'pl-9.5',
              iconRight && 'pr-9.5',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-slate-400 flex items-center justify-center">
              {iconRight}
            </span>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-[11px] text-rose-600 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
Input.displayName = 'Input'

/** Refined compact input for forms and dialogs */
export interface PillInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  iconRight?: React.ReactNode
}

const PillInput = React.forwardRef<HTMLInputElement, PillInputProps>(
  ({ label, error, iconRight, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5 w-full mb-3.5">
        <label
          htmlFor={inputId}
          className={cn(
            "text-xs font-semibold text-slate-700 tracking-tight",
            error && "text-rose-600",
          )}
        >
          {label}
        </label>
        <div className="relative flex items-center">
          <input
            id={inputId}
            ref={ref}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            onFocus={(e) => {
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              props.onBlur?.(e)
            }}
            className={cn(
              'w-full h-10 bg-white border border-slate-300 rounded-lg px-3.5 text-sm text-slate-900 transition-all duration-150 outline-none',
              'hover:border-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15',
              'placeholder:text-slate-400',
              error && 'border-rose-500 focus:border-rose-600 focus:ring-rose-600/15',
              props.disabled && 'opacity-50 bg-slate-50',
              iconRight && 'pr-9.5',
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-slate-400 flex items-center justify-center">
              {iconRight}
            </span>
          )}
        </div>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              className="text-[11px] text-rose-600 font-medium"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)
PillInput.displayName = 'PillInput'

export { Input, PillInput }
