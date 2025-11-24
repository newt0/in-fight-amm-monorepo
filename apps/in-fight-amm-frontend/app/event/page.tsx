'use client'

import Navbar from '@/components/Navbar'
import VideoPlayer from '@/components/VideoPlayer'
import StreamInfo from '@/components/StreamInfo'
import PredictionMarket from '@/components/PredictionMarket'

export default function EventPage() {
  return (
    <div className="h-screen flex flex-col bg-dark-bg">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Video + Stream Info */}
        <div className="flex-1 flex flex-col overflow-y-auto border-r border-dark-border">
          {/* Video Player - takes up more space */}
          <div className="min-h-[600px] h-[70vh] flex-shrink-0">
            <VideoPlayer />
          </div>
          
          {/* Divider */}
          <div className="h-px bg-dark-border flex-shrink-0"></div>
          
          {/* Stream Info - takes up less space */}
          <div className="flex-shrink-0">
            <StreamInfo />
          </div>
        </div>

        {/* Right Side: Prediction Market */}
        <div className="w-[420px] flex-shrink-0">
          <PredictionMarket />
        </div>
      </div>
    </div>
  )
}

