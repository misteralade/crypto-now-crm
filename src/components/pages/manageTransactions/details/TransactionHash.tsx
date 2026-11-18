import {Fragment, useEffect, useState} from "react";
import {ExternalLink, Link2} from "lucide-react";
import CopyDetails from "../../../global/CopyDetails.tsx";
import type {CryptoNetworkType} from "../../../../schemas/enum.schema.ts";
import {getExplorerLinks} from "../../../../util/blockchain.util.ts";

interface TransactionHashProps {
  cryptoTxHash: string;
  network: CryptoNetworkType;
  walletAddress: string;
}

const TransactionHash = ({ cryptoTxHash, network, walletAddress }: TransactionHashProps) => {
  const [chainUrl, setChainUrl] = useState('')
  
  useEffect(() => {
    const { txUrl } = getExplorerLinks(cryptoTxHash, network, walletAddress)
    setChainUrl(txUrl || '')
  }, [cryptoTxHash, network, walletAddress]);
  
  return (
    <Fragment>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="crm-section-heading font-bold text-slate-900 tracking-tight">On-Chain Transaction</h2>

            </div>
          </div>
          {chainUrl && (
            <a
              href={chainUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80 space-y-1.5">
          <p className="crm-label font-semibold text-slate-500 uppercase tracking-wider">Transaction Hash</p>
          <div className="flex items-center gap-2 w-full">
            <CopyDetails
              text={cryptoTxHash}
              wrap={true}
              className="!max-w-full font-mono text-xs font-semibold text-slate-900"
              iconClassName="!w-4 !h-4"
            />
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default TransactionHash;


