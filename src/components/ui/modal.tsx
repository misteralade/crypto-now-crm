import { useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const Modal = ({ open, onClose, title, description, size = 'md', children }: ModalProps) => {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(open)

  const sizeClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      if (isClosing) setIsClosing(false)
    } else if (shouldRender) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open, shouldRender])

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!shouldRender) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}>
      <div role="dialog" aria-modal="true" aria-label={title} className={cn(
        'bg-white rounded-t-2xl sm:rounded-xl border border-slate-200/80 shadow-2xl w-full p-5 sm:p-6 max-h-[92vh] overflow-y-auto transition-all',
        sizeClasses[size] || 'max-w-md',
        isClosing ? 'animate-modal-content-out' : 'animate-modal-content-in'
      )}>
        <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </div>

        <div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
