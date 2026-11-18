import { useState } from 'react'
import type { EditSupportedCryptoAndAdminWalletRequestType } from '../../../../schemas/crypto.schema'
import { PillInput } from '../../../ui/input'
import { ChevronDown, Sliders } from 'lucide-react'

interface OptionalFieldsProps {
  whitePaper: string
  website: string
  description: string
  onChangeInputField: (field: keyof EditSupportedCryptoAndAdminWalletRequestType, value: any) => void
}

const EditOptionalFields = ({
  whitePaper,
  website,
  description,
  onChangeInputField,
}: OptionalFieldsProps) => {
  const [whitePaperUrl, setWhitePaperUrl] = useState<string>(whitePaper || '')
  const [websiteUrl, setWebsiteUrl] = useState<string>(website || '')
  const [desc, setDesc] = useState<string>(description || '')
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="mb-6 rounded-xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Sliders className="w-3.5 h-3.5" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Advanced Configuration & Optional Details
            </p>
            <p className="text-[11px] text-slate-500">
              Whitepaper, project links, and coin description
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span>{isExpanded ? 'Hide' : 'Show'}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/40 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <PillInput
                id="whitepaperUrl"
                value={whitePaperUrl}
                onChange={(e) => {
                  setWhitePaperUrl(e.target.value)
                  onChangeInputField('whitepaperUrl', e.target.value)
                }}
                label="Whitepaper URL"
                type="text"
              />
            </div>

            <PillInput
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => {
                setWebsiteUrl(e.target.value)
                onChangeInputField('websiteUrl', e.target.value)
              }}
              label="Official Website URL"
              type="text"
            />

            <PillInput
              id="description"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value)
                onChangeInputField('description', e.target.value)
              }}
              label="Description"
              type="text"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EditOptionalFields
