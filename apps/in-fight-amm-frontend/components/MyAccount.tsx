'use client'

import { useState } from 'react'

interface Holding {
  fighter: string
  tickets: number
  marketValue: number
}

interface Order {
  id: string
  type: 'buy' | 'sell'
  fighter: string
  tickets: number
  price: number
  total: number
  time: string
}

interface MyAccountProps {
  balance: number
  holdings: Holding[]
  orderHistory: Order[]
  onSellAll: () => void
}

export default function MyAccount({ balance, holdings, orderHistory, onSellAll }: MyAccountProps) {
  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0)
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)

  return (
    <div className="bg-dark-card p-6 space-y-5">
      <h3 className="text-base font-bold text-white">My Account</h3>
      
      {/* Balance Card */}
      <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
        <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Available Balance</div>
        <div className="text-2xl font-bold text-white">
          {balance.toFixed(2)} <span className="text-sm text-gray-400">USDC</span>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="space-y-3">
        <div className="text-xs text-gray-500 uppercase tracking-wide">My Holdings</div>
        
        {holdings.length > 0 ? (
          <div className="space-y-2">
            {holdings.map((holding, index) => (
              <div 
                key={index}
                className="bg-dark-bg rounded-lg p-4 border border-dark-border hover:border-gray-600 transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">{holding.fighter}</span>
                  <span className="text-xs text-gray-400">{holding.tickets} Tickets</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Market Value</span>
                  <span className="text-base font-bold text-white">
                    {holding.marketValue.toFixed(2)} <span className="text-xs text-gray-400">USDC</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-dark-bg rounded-lg p-6 border border-dark-border text-center">
            <div className="text-gray-500 text-sm">No Holdings</div>
            <div className="text-xs text-gray-600 mt-1">Start trading to see your positions</div>
          </div>
        )}

        {/* Total Market Value */}
        {holdings.length > 0 && (
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4 border border-primary/30 mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-white">Total Market Value</span>
              <span className="text-xl font-bold text-primary">
                {totalValue.toFixed(2)} <span className="text-sm">USDC</span>
              </span>
            </div>
            <button
              onClick={onSellAll}
              className="w-full py-2 bg-red-500/80 hover:bg-red-500 text-white font-medium rounded transition-colors text-sm"
            >
              Sell All Holdings
            </button>
          </div>
        )}
      </div>

      {/* Order History */}
      <div className="border-t border-dark-border pt-5">
        <button
          onClick={() => setIsOrderHistoryOpen(!isOrderHistoryOpen)}
          className="w-full flex items-center justify-between text-sm font-semibold text-white hover:text-primary transition-colors"
        >
          <span>Order History</span>
          <svg 
            className={`w-4 h-4 transition-transform ${isOrderHistoryOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOrderHistoryOpen && (
          <div className="mt-4 space-y-2">
            {orderHistory.length > 0 ? orderHistory.map((order) => (
              <div 
                key={order.id}
                className="bg-dark-bg rounded-lg p-3 border border-dark-border hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      order.type === 'buy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-white font-medium">{order.fighter}</span>
                  </div>
                  <span className="text-xs text-gray-500">{order.time}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Tickets</div>
                    <div className="text-white font-medium">{order.tickets}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Price</div>
                    <div className="text-white font-medium">{order.price.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Total</div>
                    <div className="text-white font-medium">{order.total.toFixed(2)} USDC</div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-dark-bg rounded-lg p-6 border border-dark-border text-center">
                <div className="text-gray-500 text-sm">No order history</div>
                <div className="text-xs text-gray-600 mt-1">Your transactions will appear here</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

