import { useState } from 'react'
import type { CreateSupportedCryptoAndAdminWalletRequestType } from '../../../../schemas/crypto.schema'
import { PillInput } from '../../../ui/input'
import { Switch } from '../../../ui/switch'
import { ChevronDown, Sliders } from 'lucide-react'

interface OptionalFieldsProps {
  onChangeInputField: (field: keyof CreateSupportedCryptoAndAdminWalletRequestType, value: any) => void
}

const OptionalFields = ({ onChangeInputField }: OptionalFieldsProps) => {
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
            <p className="text-2xs text-slate-500">
              Whitepaper, project links, coin description, and stablecoin flags
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
              <label className="block text-xs font-medium text-slate-700 mb-2">Stable Coin Classification</label>
              <Switch
                id="isStableCoin"
                label="Is this asset pegged as a fiat-backed stablecoin?"
                defaultChecked={false}
                onCheckedChange={(checked) => onChangeInputField("isStableCoin", checked)}
              />
            </div>

            <PillInput
              id="whitepaperUrl"
              onChange={(e) => onChangeInputField("whitepaperUrl", e.target.value)}
              label="Whitepaper URL"
              type="text"
            />

            <PillInput
              id="websiteUrl"
              onChange={(e) => onChangeInputField("websiteUrl", e.target.value)}
              label="Official Website URL"
              type="text"
            />

            <div className="sm:col-span-2">
              <PillInput
                id="description"
                onChange={(e) => onChangeInputField("description", e.target.value)}
                label="Coin Description / Overview"
                type="text"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OptionalFields
