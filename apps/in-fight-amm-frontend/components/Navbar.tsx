'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

export default function Navbar() {
  const pathname = usePathname()
  const account = useCurrentAccount()
  
  return (
    <nav className="h-14 bg-dark-card border-b border-dark-border flex items-center px-6">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-primary font-bold text-lg hover:text-primary-light transition-colors">
          FIGHT PREDICTION
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link 
            href="/" 
            className={`transition-colors ${pathname === '/' ? 'text-primary font-semibold' : 'text-gray-300 hover:text-white'}`}
          >
            Home
          </Link>

          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Markets
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            Leaderboard
          </a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">
            History
          </a>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="sui-connect-button">
          <ConnectButton />
        </div>
        {account && (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold">
            {account.address.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    </nav>
  )
}

