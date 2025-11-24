'use client'

import { useState, useEffect } from 'react'
import MarketOverview from './MarketOverview'
import FighterCard from './FighterCard'
import MyAccount from './MyAccount'

interface Order {
  id: string
  type: 'buy' | 'sell'
  fighter: string
  tickets: number
  price: number
  total: number
  time: string
}

interface ChartDataPoint {
  time: number
  price: number
}

interface FighterData {
  name: string
  percentage: number
  change: number
  price: number
  priceChange: number
  color: string
  chartData: ChartDataPoint[]
}

interface Holding {
  tickets: number
  avgPrice: number
}

// LMSR (Logarithmic Market Scoring Rule) Implementation
class LMSR {
  b: number // Liquidity parameter

  constructor(b: number = 100) {
    this.b = b
  }

  // Calculate cost function: C(q) = b * ln(sum(e^(q_i/b)))
  cost(quantities: number[]): number {
    const sum = quantities.reduce((acc, q) => acc + Math.exp(q / this.b), 0)
    return this.b * Math.log(sum)
  }

  // Calculate price for outcome i: p_i = e^(q_i/b) / sum(e^(q_j/b))
  price(quantities: number[], index: number): number {
    const expValues = quantities.map(q => Math.exp(q / this.b))
    const sum = expValues.reduce((acc, val) => acc + val, 0)
    return expValues[index] / sum
  }

  // Calculate all prices
  prices(quantities: number[]): number[] {
    const expValues = quantities.map(q => Math.exp(q / this.b))
    const sum = expValues.reduce((acc, val) => acc + val, 0)
    return expValues.map(exp => exp / sum)
  }

  // Calculate cost to buy `amount` shares of outcome `index`
  buyCost(quantities: number[], index: number, amount: number): number {
    const newQuantities = [...quantities]
    newQuantities[index] += amount
    return this.cost(newQuantities) - this.cost(quantities)
  }

  // Calculate revenue from selling `amount` shares of outcome `index`
  sellRevenue(quantities: number[], index: number, amount: number): number {
    const newQuantities = [...quantities]
    newQuantities[index] -= amount
    return this.cost(quantities) - this.cost(newQuantities)
  }
}

export default function PredictionMarket() {
  // LMSR market maker with liquidity parameter b=100
  const [lmsr] = useState(() => new LMSR(100))
  
  // Market state: quantities of shares outstanding
  const [quantityA, setQuantityA] = useState(100) // Initial: 100 shares each (50/50 market)
  const [quantityB, setQuantityB] = useState(100)
  
  // User state
  const [balance, setBalance] = useState(2500)
  const [totalPool, setTotalPool] = useState(125000)
  const [orderHistory, setOrderHistory] = useState<Order[]>([])
  
  // User holdings
  const [holdingA, setHoldingA] = useState<Holding>({ tickets: 0, avgPrice: 0 })
  const [holdingB, setHoldingB] = useState<Holding>({ tickets: 0, avgPrice: 0 })
  
  // Fighter display data
  const [fighterA, setFighterA] = useState<FighterData>({
    name: 'Mike "Dragon"',
    percentage: 50,
    change: 0,
    price: 0.50,
    priceChange: 0,
    color: '#3b82f6',
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: Date.now() - (20 - i) * 60000,
      price: 0.50
    }))
  })
  
  const [fighterB, setFighterB] = useState<FighterData>({
    name: 'John "Thunder"',
    percentage: 50,
    change: 0,
    price: 0.50,
    priceChange: 0,
    color: '#f59e0b',
    chartData: Array.from({ length: 20 }, (_, i) => ({
      time: Date.now() - (20 - i) * 60000,
      price: 0.50
    }))
  })

  // Update prices based on current quantities using LMSR
  useEffect(() => {
    const quantities = [quantityA, quantityB]
    const [priceA, priceB] = lmsr.prices(quantities)
    
    // Convert to percentage (LMSR prices already sum to 1)
    const percentageA = Math.round(priceA * 100)
    const percentageB = Math.round(priceB * 100)
    
    // Scale prices to USDC (multiply by 100 for display)
    const scaledPriceA = priceA * 100
    const scaledPriceB = priceB * 100
    
    setFighterA(prev => {
      const priceChange = prev.chartData.length > 0
        ? ((scaledPriceA - prev.chartData[0].price) / prev.chartData[0].price) * 100
        : 0
      
      return {
        ...prev,
        percentage: percentageA,
        price: scaledPriceA,
        priceChange,
        chartData: [
          ...prev.chartData.slice(1),
          { time: Date.now(), price: scaledPriceA }
        ]
      }
    })
    
    setFighterB(prev => {
      const priceChange = prev.chartData.length > 0
        ? ((scaledPriceB - prev.chartData[0].price) / prev.chartData[0].price) * 100
        : 0
      
      return {
        ...prev,
        percentage: percentageB,
        price: scaledPriceB,
        priceChange,
        chartData: [
          ...prev.chartData.slice(1),
          { time: Date.now(), price: scaledPriceB }
        ]
      }
    })
  }, [quantityA, quantityB, lmsr])

  // Simulate other users trading - every second
  useEffect(() => {
    const simulateTrade = () => {
      // Random: which fighter (50% chance each)
      const targetFighter = Math.random() > 0.5 ? 'A' : 'B'
      
      // Random: buy or sell (65% buy, 35% sell to simulate market growth)
      const isBuy = Math.random() > 0.35
      
      // Random quantity: 1-3 shares
      const quantity = Math.floor(Math.random() * 3) + 1
      
      const quantities = [quantityA, quantityB]
      const fighterIndex = targetFighter === 'A' ? 0 : 1
      
      if (isBuy) {
        // Calculate cost using LMSR
        const cost = lmsr.buyCost(quantities, fighterIndex, quantity)
        const scaledCost = cost * 100 // Scale to USDC
        
        // Update quantities
        if (targetFighter === 'A') {
          setQuantityA(prev => prev + quantity)
        } else {
          setQuantityB(prev => prev + quantity)
        }
        
        // Update pool
        setTotalPool(prev => prev + scaledCost)
        
      } else {
        // Calculate revenue using LMSR
        const revenue = lmsr.sellRevenue(quantities, fighterIndex, quantity)
        const scaledRevenue = revenue * 100 // Scale to USDC
        
        // Update quantities
        if (targetFighter === 'A') {
          setQuantityA(prev => Math.max(prev - quantity, 10)) // Keep minimum quantity
        } else {
          setQuantityB(prev => Math.max(prev - quantity, 10))
        }
        
        // Update pool
        setTotalPool(prev => Math.max(prev - scaledRevenue, 80000))
      }
    }
    
    // Execute trade every second
    const tradeInterval = setInterval(() => {
      simulateTrade()
    }, 1000)
    
    return () => clearInterval(tradeInterval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Handle user Buy/Sell transactions
  const handleTransaction = (
    fighter: 'A' | 'B',
    type: 'buy' | 'sell',
    quantity: number
  ) => {
    const quantities = [quantityA, quantityB]
    const fighterIndex = fighter === 'A' ? 0 : 1
    const currentFighter = fighter === 'A' ? fighterA : fighterB
    const currentHolding = fighter === 'A' ? holdingA : holdingB
    const setHolding = fighter === 'A' ? setHoldingA : setHoldingB
    
    if (type === 'buy') {
      // Calculate cost using LMSR
      const cost = lmsr.buyCost(quantities, fighterIndex, quantity)
      const totalCost = cost * 100 // Scale to USDC
      
      // Check if user has enough balance
      if (balance < totalCost) {
        alert('Insufficient balance!')
        return
      }
      
      // Update user balance and holdings
      setBalance(prev => prev - totalCost)
      setHolding(prev => ({
        tickets: prev.tickets + quantity,
        avgPrice: ((prev.avgPrice * prev.tickets) + totalCost) / (prev.tickets + quantity)
      }))
      
      // Update market quantities
      if (fighter === 'A') {
        setQuantityA(prev => prev + quantity)
      } else {
        setQuantityB(prev => prev + quantity)
      }
      
      // Update total pool
      setTotalPool(prev => prev + totalCost)
      
      // Add to order history
      const newOrder: Order = {
        id: Date.now().toString(),
        type: 'buy',
        fighter: currentFighter.name,
        tickets: quantity,
        price: parseFloat(currentFighter.price.toFixed(2)),
        total: parseFloat(totalCost.toFixed(2)),
        time: 'Just now'
      }
      setOrderHistory(prev => [newOrder, ...prev.slice(0, 9)])
      
    } else {
      // Sell
      // Check if user has enough tickets
      if (currentHolding.tickets < quantity) {
        alert('Insufficient tickets!')
        return
      }
      
      // Calculate revenue using LMSR
      const revenue = lmsr.sellRevenue(quantities, fighterIndex, quantity)
      const totalRevenue = revenue * 100 // Scale to USDC
      
      // Update user balance and holdings
      setBalance(prev => prev + totalRevenue)
      setHolding(prev => ({
        tickets: prev.tickets - quantity,
        avgPrice: prev.tickets === quantity ? 0 : prev.avgPrice
      }))
      
      // Update market quantities
      if (fighter === 'A') {
        setQuantityA(prev => prev - quantity)
      } else {
        setQuantityB(prev => prev - quantity)
      }
      
      // Update total pool
      setTotalPool(prev => prev - totalRevenue)
      
      // Add to order history
      const newOrder: Order = {
        id: Date.now().toString(),
        type: 'sell',
        fighter: currentFighter.name,
        tickets: quantity,
        price: parseFloat(currentFighter.price.toFixed(2)),
        total: parseFloat(totalRevenue.toFixed(2)),
        time: 'Just now'
      }
      setOrderHistory(prev => [newOrder, ...prev.slice(0, 9)])
    }
  }

  // Handle Sell All
  const handleSellAll = () => {
    if (holdingA.tickets > 0) {
      handleTransaction('A', 'sell', holdingA.tickets)
    }
    if (holdingB.tickets > 0) {
      handleTransaction('B', 'sell', holdingB.tickets)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-0">
        {/* Market Overview */}
        <MarketOverview
          totalPool={totalPool}
          fighterA={{
            name: fighterA.name,
            percentage: fighterA.percentage,
            change: fighterA.change
          }}
          fighterB={{
            name: fighterB.name,
            percentage: fighterB.percentage,
            change: fighterB.change
          }}
        />

        {/* Divider */}
        <div className="h-px bg-dark-border"></div>

        {/* Fighter A Card */}
        <FighterCard
          fighter={fighterA}
          userHolding={{ tickets: holdingA.tickets, cost: holdingA.avgPrice * holdingA.tickets }}
          balance={balance}
          onTransaction={(type, quantity) => handleTransaction('A', type, quantity)}
        />

        {/* Divider */}
        <div className="h-px bg-dark-border"></div>

        {/* Fighter B Card */}
        <FighterCard
          fighter={fighterB}
          userHolding={{ tickets: holdingB.tickets, cost: holdingB.avgPrice * holdingB.tickets }}
          balance={balance}
          onTransaction={(type, quantity) => handleTransaction('B', type, quantity)}
        />

        {/* Divider */}
        <div className="h-px bg-dark-border"></div>

        {/* My Account */}
        <MyAccount
          balance={balance}
          holdings={[
            {
              fighter: fighterA.name,
              tickets: holdingA.tickets,
              marketValue: holdingA.tickets * fighterA.price
            },
            {
              fighter: fighterB.name,
              tickets: holdingB.tickets,
              marketValue: holdingB.tickets * fighterB.price
            }
          ].filter(h => h.tickets > 0)}
          orderHistory={orderHistory}
          onSellAll={handleSellAll}
        />
      </div>
    </div>
  )
}
