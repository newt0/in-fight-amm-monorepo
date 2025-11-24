'use client'

import { useState } from 'react'
import PriceChart from './PriceChart'

interface FighterCardProps {
  fighter: {
    name: string
    price: number
    priceChange: number
    color: string
    chartData: { time: number; price: number }[]
  }
  userHolding?: {
    tickets: number
    cost: number
  }
  balance: number
  onTransaction: (type: 'buy' | 'sell', quantity: number) => void
}

export default function FighterCard({ fighter, userHolding, balance, onTransaction }: FighterCardProps) {
  const [mode, setMode] = useState<'buy' | 'sell'>(userHolding && userHolding.tickets > 0 ? 'sell' : 'buy')
  const [quantity, setQuantity] = useState(1)

  const total = quantity * fighter.price
  const marketValue = userHolding ? userHolding.tickets * fighter.price : 0

  const handleQuantityChange = (value: number) => {
    const newQuantity = Math.max(1, quantity + value)
    setQuantity(newQuantity)
  }

  return (
    <div className="bg-dark-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Fighter Avatar */}
        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0">
          <img 
            src={fighter.name.includes('Dragon') ? '/fighter-a.jpg' : '/fighter-b.jpg'}
            alt={fighter.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.classList.remove('hidden');
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center text-lg">🥊</div>
        </div>
        
        {/* Fighter Info */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white mb-1">{fighter.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">{fighter.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500">USDC / Ticket</span>
            <div className={`text-xs px-1.5 py-0.5 rounded ${
              fighter.priceChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {fighter.priceChange >= 0 ? '+' : ''}{fighter.priceChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('buy')}
          className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
            mode === 'buy'
              ? 'bg-green-500/80 text-white hover:bg-green-500'
              : 'bg-transparent border border-dark-border text-gray-400 hover:border-gray-500'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode('sell')}
          className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
            mode === 'sell'
              ? 'bg-red-500/80 text-white hover:bg-red-500'
              : 'bg-transparent border border-dark-border text-gray-400 hover:border-gray-500'
          }`}
        >
          Sell
        </button>
      </div>

      {/* Price Chart */}
      <PriceChart data={fighter.chartData} color={fighter.color} />

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuantityChange(-1)}
            className="w-8 h-8 flex items-center justify-center bg-dark-border hover:bg-gray-700 rounded text-white transition-colors text-lg"
          >
            −
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 text-center bg-dark-bg border border-dark-border rounded py-2 text-sm text-white focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => handleQuantityChange(1)}
            className="w-8 h-8 flex items-center justify-center bg-dark-border hover:bg-gray-700 rounded text-white transition-colors text-lg"
          >
            +
          </button>
          <span className="text-xs text-gray-400">Tickets</span>
        </div>
        <div className="flex-1 text-right">
          <div className="text-xs text-gray-500">Total</div>
          <div className="text-sm font-semibold text-white">{total.toFixed(2)} USDC</div>
        </div>
      </div>

      {/* Balance */}
      <div className="text-xs text-gray-400">
        {mode === 'buy' ? (
          <>Available Balance: <span className="text-white">{balance.toFixed(2)} USDC</span></>
        ) : (
          <>Available to Sell: <span className="text-white">{userHolding?.tickets || 0} Tickets</span></>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          onTransaction(mode, quantity)
          setQuantity(1) // Reset quantity after transaction
        }}
        disabled={
          (mode === 'buy' && balance < total) ||
          (mode === 'sell' && (!userHolding || userHolding.tickets < quantity))
        }
        className={`w-full py-2.5 font-medium rounded transition-colors text-sm ${
          mode === 'buy'
            ? 'bg-green-500/80 hover:bg-green-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
            : 'bg-red-500/80 hover:bg-red-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed'
        }`}
      >
        {mode === 'buy' ? 'Confirm Buy' : 'Confirm Sell'}
      </button>

      {/* Market Value (if holding) */}
      {userHolding && userHolding.tickets > 0 && (
        <div className="pt-2 border-t border-dark-border text-xs">
          <div className="flex justify-between text-gray-400">
            <span>Current Market Value:</span>
            <span className={`font-semibold ${
              marketValue >= userHolding.cost ? 'text-green-400' : 'text-red-400'
            }`}>
              {marketValue.toFixed(2)} USDC
              <span className="ml-1">
                ({marketValue >= userHolding.cost ? '+' : ''}
                {((marketValue - userHolding.cost) / userHolding.cost * 100).toFixed(1)}%)
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

