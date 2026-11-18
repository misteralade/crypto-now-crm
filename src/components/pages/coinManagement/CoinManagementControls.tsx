import { Plus } from 'lucide-react'

interface ControlsProps {
  onAddCoin: () => void
}

const CoinManagementControls = ({ onAddCoin }: ControlsProps) => {
  return (
    <div className="flex items-center justify-end my-3">
      <button
        onClick={onAddCoin}
        className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add New Coin</span>
      </button>
    </div>
  )
}

export default CoinManagementControls
