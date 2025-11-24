'use client'

interface EventCardProps {
  event: {
    id: number
    title: string
    date: string
    time: string
    location: string
    category: string
    isLive: boolean
    poster: string
    prizePool: number
    fighters: {
      a: { name: string; record: string }
      b: { name: string; record: string }
    }
  }
  onClick?: () => void
  isWalletConnected?: boolean
}

export default function EventCard({ event, onClick, isWalletConnected }: EventCardProps) {
  return (
    <div 
      className={`bg-dark-card rounded-xl overflow-hidden border border-dark-border hover:border-primary transition-all group ${
        isWalletConnected ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
      }`}
      onClick={onClick}
    >
      {/* Poster Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <img 
          src={event.poster}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling!.classList.remove('hidden');
          }}
        />
        {/* Fallback */}
        <div className="hidden w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-2">🥊</div>
            <div className="text-gray-400 text-sm">{event.category}</div>
          </div>
        </div>
        
        {/* Live Badge */}
        {event.isLive && (
          <div className="absolute top-3 right-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </div>
        )}
      </div>
      
      {/* Event Info */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        
        {/* Meta Info */}
        <div className="flex items-center gap-1 text-xs text-gray-400 pt-2 border-t border-dark-border">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
          </svg>
          <span>{event.date} {event.time}</span>
        </div>
      </div>
    </div>
  )
}

