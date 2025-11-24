'use client'

interface MarketOverviewProps {
  totalPool: number
  fighterA: {
    name: string
    percentage: number
    change: number
  }
  fighterB: {
    name: string
    percentage: number
    change: number
  }
}

export default function MarketOverview({ totalPool, fighterA, fighterB }: MarketOverviewProps) {
  return (
    <div className="bg-dark-card p-6 space-y-6">
      {/* Total Pool */}
      <div className="text-center py-2">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Total Prize Pool</div>
        <div className="text-3xl font-bold text-white mb-1">
          ${totalPool.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
        </div>
        <div className="text-xs text-gray-400">USDC</div>
      </div>

      {/* Divider */}
      <div className="h-px bg-dark-border"></div>

      {/* Market Prediction Bar */}
      <div className="space-y-3">
        <div className="text-xs text-gray-500 text-center uppercase tracking-wide mb-3">
          Market Prediction
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex flex-col items-start">
            <span className="text-sm text-white font-semibold mb-1">{fighterA.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xl text-blue-400 font-bold">{fighterA.percentage}%</span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${fighterA.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {fighterA.change >= 0 ? '+' : ''}{fighterA.change.toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-sm text-white font-semibold mb-1">{fighterB.name}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-1.5 py-0.5 rounded ${fighterB.change >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {fighterB.change >= 0 ? '+' : ''}{fighterB.change.toFixed(2)}%
              </span>
              <span className="text-xl text-amber-500 font-bold">{fighterB.percentage}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Fighter A Photo */}
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
            <img 
              src="/fighter-a.jpg"
              alt={fighterA.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-2xl">🥊</div>
          </div>
          
          {/* Progress Bar */}
          <div className="flex-1 flex h-4 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-blue-600 transition-all duration-300"
              style={{ width: `${fighterA.percentage}%` }}
            ></div>
            <div 
              className="bg-amber-500 transition-all duration-300"
              style={{ width: `${fighterB.percentage}%` }}
            ></div>
          </div>
          
          {/* Fighter B Photo */}
          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
            <img 
              src="/fighter-b.jpg"
              alt={fighterB.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="hidden w-full h-full flex items-center justify-center text-2xl">🥊</div>
          </div>
        </div>
      </div>
    </div>
  )
}

