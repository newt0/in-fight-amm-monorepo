'use client'

import { useState } from 'react'
import EventCard from './EventCard'
import { useRouter } from 'next/navigation'
import { useCurrentAccount, ConnectModal } from '@mysten/dapp-kit'

// Mock events data
const mockEvents = [
  {
    id: 1,
    title: 'UFC 300: Mike "The Dragon" vs John "Thunder" - Lightweight Championship',
    date: 'Nov 20, 2025',
    time: '21:00',
    location: 'Las Vegas T-Mobile Arena',
    category: 'Kickboxing',
    isLive: true,
    poster: '/event-poster-1.jpg',
    prizePool: 125000,
    fighters: {
      a: { name: 'Mike "Dragon"', record: '20-3-0' },
      b: { name: 'John "Thunder"', record: '18-5-0' }
    }
  },
  {
    id: 2,
    title: 'Boxing Championship: "Iron Fist" Rodriguez vs "The Hammer" Johnson',
    date: 'Nov 22, 2025',
    time: '19:00',
    location: 'Madison Square Garden',
    category: 'Boxing',
    isLive: false,
    poster: '/event-poster-2.jpg',
    prizePool: 85000,
    fighters: {
      a: { name: 'Carlos Rodriguez', record: '28-2-0' },
      b: { name: 'Mike Johnson', record: '24-3-0' }
    }
  },
  {
    id: 3,
    title: 'Kickboxing Grand Prix: Silva vs Petrov - Heavyweight Showdown',
    date: 'Nov 25, 2025',
    time: '20:00',
    location: 'Tokyo Dome',
    category: 'Kickboxing',
    isLive: false,
    poster: '/event-poster-3.jpg',
    prizePool: 95000,
    fighters: {
      a: { name: 'Anderson Silva', record: '32-5-0' },
      b: { name: 'Ivan Petrov', record: '29-4-0' }
    }
  },
  {
    id: 4,
    title: 'Muay Thai Championship: "Golden Tiger" vs "Iron Knee" - Title Defense',
    date: 'Nov 28, 2025',
    time: '18:30',
    location: 'Bangkok Stadium',
    category: 'Muaythai',
    isLive: false,
    poster: '/event-poster-4.jpg',
    prizePool: 72000,
    fighters: {
      a: { name: 'Saenchai "Golden Tiger"', record: '45-8-1' },
      b: { name: 'Buakaw "Iron Knee"', record: '42-10-2' }
    }
  },
  {
    id: 5,
    title: 'ONE Championship: Zhang vs Lee - Featherweight Elimination',
    date: 'Dec 1, 2025',
    time: '21:30',
    location: 'Singapore Indoor Stadium',
    category: 'MMA',
    isLive: false,
    poster: '/event-poster-5.jpg',
    prizePool: 110000,
    fighters: {
      a: { name: 'Zhang "The Warrior"', record: '22-4-0' },
      b: { name: 'Lee "Dragon King"', record: '25-3-0' }
    }
  }
]

type CategoryFilter = 'Live' | 'Boxing' | 'Kickboxing' | 'Muaythai' | 'MMA'

export default function HomePage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('Live')
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)

  // Filter events based on selected category
  const filteredEvents = activeFilter === 'Live' 
    ? mockEvents.filter(event => event.isLive)
    : mockEvents.filter(event => event.category === activeFilter)

  const liveEvent = mockEvents.find(event => event.isLive)

  const handleEventClick = (eventId: number) => {
    // Check if user is connected
    if (!account) {
      // Open wallet connect modal
      setIsConnectModalOpen(true)
      return
    }
    // Navigate to event page
    router.push('/event')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Wallet Connect Modal */}
      <ConnectModal
        trigger={<button style={{ display: 'none' }} />}
        open={isConnectModalOpen}
        onOpenChange={(open) => setIsConnectModalOpen(open)}
      />
      
      {/* Hero Section - Live Event Banner */}
      {liveEvent && (
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-dark-card">
          {/* Background Image */}
          <img 
            src={liveEvent.poster}
            alt={liveEvent.title}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
            }}
          />
          {/* Fallback */}
          <div className="hidden w-full h-full bg-gradient-to-br from-gray-800 to-gray-900"></div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          
          {/* Content */}
          <div className="absolute inset-0 flex items-end">
            <div className="container mx-auto px-6 pb-12">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-full mb-4">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                LIVE NOW
              </div>
              
              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">
                {liveEvent.title}
              </h1>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                  <span>{liveEvent.date} {liveEvent.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                  <span>{liveEvent.location}</span>
                </div>
                <div className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                  {liveEvent.category}
                </div>
              </div>
              
              {/* Watch Button */}
              <button 
                onClick={() => handleEventClick(liveEvent.id)}
                className="px-8 py-3 bg-primary hover:bg-primary-dark text-black font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                Watch Live & Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Filter Bar */}
        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-dark-border">
          <button
            onClick={() => setActiveFilter('Live')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
              activeFilter === 'Live'
                ? 'bg-red-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Now
          </button>
          
          <div className="h-6 w-px bg-dark-border"></div>
          
          {(['Boxing', 'Kickboxing', 'Muaythai', 'MMA'] as CategoryFilter[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                activeFilter === category
                  ? 'bg-primary text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
                onClick={() => handleEventClick(event.id)}
                isWalletConnected={!!account}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🥊</div>
            <div className="text-gray-400 text-lg">No events found in this category</div>
            <div className="text-gray-500 text-sm mt-2">Check back later for upcoming matches</div>
          </div>
        )}
      </div>
    </div>
  )
}

