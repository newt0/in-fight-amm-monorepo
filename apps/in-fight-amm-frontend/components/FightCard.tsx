'use client'

interface Fighter {
  name: string
  record: string
  image?: string
}

interface FightCardProps {
  fightNumber?: number
  isLive?: boolean
  weightClass: string
  matchType?: string
  fighterA: Fighter
  fighterB: Fighter
}

export default function FightCard({
  fightNumber,
  isLive = false,
  weightClass,
  matchType,
  fighterA,
  fighterB
}: FightCardProps) {
  return (
    <div className="relative">
      {/* Live Indicator (only for live fights) */}
      {isLive && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-lg z-10">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          LIVE NOW
        </div>
      )}
      
      <div className={`border-2 ${isLive ? 'border-red-600 from-red-950/30' : 'border-gray-600 from-gray-950/30'} rounded-xl overflow-hidden bg-gradient-to-br via-dark-card to-dark-card h-64`}>
        <div className="relative flex items-center h-full">
          {/* Fighter A - Left Side */}
          <div className="flex items-center gap-4 flex-1 h-full">
            <div className="relative w-64 h-full flex-shrink-0">
              <div className="relative w-full h-full overflow-hidden bg-gray-900 shadow-2xl">
                {fighterA.image ? (
                  <img 
                    src={fighterA.image} 
                    alt={fighterA.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={fighterA.image ? 'hidden' : ''}>
                  <div className="w-full h-full flex items-center justify-center text-5xl">🥊</div>
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center pr-4">
              <div className="font-bold text-white text-2xl mb-2 truncate">{fighterA.name}</div>
              <div className="text-gray-500 text-sm mb-1">Record</div>
              <div className="text-white text-xl font-semibold">{fighterA.record}</div>
            </div>
          </div>
          
          {/* Center - VS and Match Info */}
          <div className="flex flex-col items-center justify-center px-6 flex-shrink-0">
            {fightNumber && !isLive && (
              <div className="text-xs text-gray-600 mb-1">Fight {fightNumber}</div>
            )}
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1 whitespace-nowrap">{weightClass}</div>
            {matchType && (
              <div className="text-xs text-gray-600 mb-2 whitespace-nowrap">{matchType}</div>
            )}
            <div className="relative">
              <div className="text-gray-400 font-bold text-5xl">VS</div>
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-transparent to-amber-500/20 blur-xl -z-10"></div>
            </div>
          </div>
          
          {/* Fighter B - Right Side */}
          <div className="flex items-center gap-4 flex-1 justify-end h-full">
            <div className="flex-1 min-w-0 text-right flex flex-col justify-center pl-4">
              <div className="font-bold text-white text-2xl mb-2 truncate">{fighterB.name}</div>
              <div className="text-gray-500 text-sm mb-1">Record</div>
              <div className="text-white text-xl font-semibold">{fighterB.record}</div>
            </div>
            <div className="relative w-64 h-full flex-shrink-0">
              <div className="relative w-full h-full overflow-hidden bg-gray-900 shadow-2xl">
                {fighterB.image ? (
                  <img 
                    src={fighterB.image} 
                    alt={fighterB.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={fighterB.image ? 'hidden' : ''}>
                  <div className="w-full h-full flex items-center justify-center text-5xl">🥊</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

