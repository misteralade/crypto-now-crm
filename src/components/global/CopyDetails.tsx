import { useState, type MouseEvent } from 'react'
import { Copy, Check } from 'lucide-react'
import ResponsiveText from './ResponsiveText.tsx'

interface CopyButtonProps {
  text: string
  className?: string
  iconClassName?: string
  ariaLabel?: string
}

export const CopyButton = ({ text, className = '', iconClassName = 'w-3.5 h-3.5', ariaLabel = 'Copy' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shrink-0 cursor-pointer inline-flex items-center justify-center ${className}`}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      aria-label={ariaLabel}
    >
      {copied ? (
        <Check className={`${iconClassName} text-emerald-600`} />
      ) : (
        <Copy className={iconClassName} />
      )}
    </button>
  )
}

interface CopyDetailsProps {
  text: string
  className?: string
  iconClassName?: string
  wrap?: boolean
}

const CopyDetails = ({ text, className = '', iconClassName, wrap }: CopyDetailsProps) => {
  return (
    <div
      className={`flex w-full min-w-0 max-w-full gap-2 items-center ${className}`}
      style={!wrap ? { maxWidth: 'min(400px, 100%)' } : undefined}
    >
      <p className={`text-slate-900 min-w-0 flex-1 ${wrap ? 'break-all' : ''}`}>
        {wrap ? text : <ResponsiveText text={text} />}
      </p>

      <CopyButton text={text} iconClassName={iconClassName || 'w-3.5 h-3.5'} />
    </div>
  )
}

interface ClickableDetailsProps {
  text: string
  onClick: (value: string) => void
  className?: string
}

export const ClickableDetails = ({ text, onClick, className = '' }: ClickableDetailsProps) => {
  const [clicked, setClicked] = useState(false)

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setClicked(true)
    onClick(text)
    setTimeout(() => setClicked(false), 1500)
  }

  return (
    <div className={`relative flex items-center gap-2 max-w-[200px] w-3/4 md:w-fit ${className}`}>
      <a
        href="#"
        onClick={handleClick}
        className="text-blue-600 overflow-hidden whitespace-nowrap text-ellipsis hover:underline cursor-pointer text-xs sm:text-sm font-medium"
      >
        {text}
      </a>

      {clicked && (
        <span className="text-emerald-600 text-xs absolute -top-5 left-0 transition-all duration-300 font-medium">
          Copied!
        </span>
      )}
    </div>
  )
}

export default CopyDetails
