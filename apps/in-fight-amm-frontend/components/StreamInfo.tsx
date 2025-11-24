'use client'

import FightCard from './FightCard'

// Mock fight data
const mockFights = [
  {
    id: 1,
    isLive: true,
    weightClass: 'Lightweight',
    matchType: 'Title Match',
    fighterA: {
      name: 'Mike "Dragon"',
      record: '20-3-0',
      image: '/fighter-a.jpg'
    },
    fighterB: {
      name: 'John "Thunder"',
      record: '18-5-0',
      image: '/fighter-b.jpg'
    }
  },
  {
    id: 2,
    weightClass: 'Welterweight',
    fighterA: {
      name: 'Alex "Storm"',
      record: '18-2-0',
      image: '/fighter-2a.jpg'
    },
    fighterB: {
      name: 'Ryan "Beast"',
      record: '16-4-0',
      image: '/fighter-2b.jpg'
    }
  },
  {
    id: 3,
    weightClass: 'Bantamweight',
    fighterA: {
      name: 'Sarah "Viper"',
      record: '12-1-0',
      image: '/fighter-3a.jpg'
    },
    fighterB: {
      name: 'Lisa "Titan"',
      record: '14-2-0',
      image: '/fighter-3b.jpg'
    }
  },
  {
    id: 4,
    weightClass: 'Featherweight',
    fighterA: {
      name: 'Carlos "Blade"',
      record: '15-3-0',
      image: '/fighter-4a.jpg'
    },
    fighterB: {
      name: 'Tom "Hammer"',
      record: '13-5-0',
      image: '/fighter-4b.jpg'
    }
  },
  {
    id: 5,
    weightClass: 'Middleweight',
    fighterA: {
      name: 'Jake "Wolf"',
      record: '10-6-0',
      image: '/fighter-5a.jpg'
    },
    fighterB: {
      name: 'Matt "Eagle"',
      record: '11-4-0',
      image: '/fighter-5b.jpg'
    }
  }
]

export default function StreamInfo() {
  return (
    <div className="bg-dark-card p-4">
      <div className="space-y-4">
        {/* Event title */}
        <div>
          <h2 className="text-base font-bold text-white mb-1">
            UFC 300: Mike &quot;The Dragon&quot; vs John &quot;Thunder&quot; - Lightweight Championship
          </h2>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              Nov 20, 2025 21:00
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Las Vegas T-Mobile Arena
            </span>
          </div>
        </div>

        {/* Fighters - Live Battle Card */}
        <FightCard
          isLive={mockFights[0].isLive}
          weightClass={mockFights[0].weightClass}
          matchType={mockFights[0].matchType}
          fighterA={mockFights[0].fighterA}
          fighterB={mockFights[0].fighterB}
        />

        {/* Description */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">Event Description</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            This highly anticipated lightweight championship bout features two elite fighters. Mike &quot;The Dragon&quot; is known for his precise striking and exceptional ground game, currently ranked #1. John &quot;Thunder&quot; is the renowned &quot;KO King&quot; with devastating power and lightning-fast movement. This showdown will determine the new lightweight champion.
          </p>
        </div>

        {/* Fight Card */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Fight Card</h3>
          <div className="space-y-4">
            {mockFights.map((fight) => (
              <FightCard
                key={fight.id}
                fightNumber={fight.id}
                isLive={false}
                weightClass={fight.weightClass}
                matchType={fight.matchType}
                fighterA={fight.fighterA}
                fighterB={fight.fighterB}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

