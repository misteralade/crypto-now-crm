import {Fragment} from "react";

interface CryptoCurrencyInfoProps {
  logoUrl: string;
  symbol: string;
  name: string;
}

const CryptoCurrencyInfo = ({ logoUrl, symbol, name }: CryptoCurrencyInfoProps) => {
  return (
    <Fragment>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Cryptocurrency</h2>
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={name} className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
          
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-500">{symbol}</p>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default CryptoCurrencyInfo;

