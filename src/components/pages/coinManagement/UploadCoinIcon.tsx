import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import type { UseMutationResult } from '@tanstack/react-query'

interface UploadCoinIconProps {
  oldImgUrl?: string
  onChangeInputField: (field: any, value: any) => void
  uploadCryptoLogoIcon: UseMutationResult<string | undefined, Error, FormData, unknown>
}

const UploadCoinIcon = ({
  oldImgUrl,
  onChangeInputField,
  uploadCryptoLogoIcon,
}: UploadCoinIconProps) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(oldImgUrl)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setError('')
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, SVG)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    try {
      const url = await uploadCryptoLogoIcon.mutateAsync(formData)
      if (url) {
        setImageUrl(url)
        onChangeInputField('logoUrl', url)
      }
    } catch {
      setError('Failed to upload image. Please try again.')
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImageUrl(undefined)
    onChangeInputField('logoUrl', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Small Logo Avatar Preview & Metadata */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Coin logo"
                className="w-full h-full object-contain p-1"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Currency Logo
            </p>
            <p className="text-2xs text-slate-500 mt-0.5">
              PNG, SVG, or JPG (max 2MB). Displayed across trading feeds.
            </p>
            {error && <p className="text-2xs text-rose-600 mt-1">{error}</p>}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadCryptoLogoIcon.isPending}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{uploadCryptoLogoIcon.isPending ? 'Uploading...' : imageUrl ? 'Change Logo' : 'Upload Logo'}</span>
          </button>

          {imageUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remove logo"
              aria-label="Remove logo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UploadCoinIcon
