'use client'

import Navbar from '@/components/Navbar'
import HomePage from '@/components/HomePage'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      {/* Navbar */}
      <Navbar />

      {/* Home Page Content */}
      <HomePage />
    </div>
  )
}

