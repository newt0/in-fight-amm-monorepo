# Fight Prediction Market

A Next.js-based fight live streaming and prediction trading platform.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Custom Canvas Implementation
- **Prediction Market**: LMSR (Logarithmic Market Scoring Rule)

## Features

### Layout Structure

- **Top Navigation Bar**: Brand logo, navigation menu, wallet connection
- **Left Area**:
  - Upper: Video player (4/5 of height)
  - Lower: Stream information (1/5 of height)
- **Right Area**: Prediction market interface (fixed width 420px)

### Prediction Market Features

1. **LMSR Automated Market Maker**
   - Logarithmic Market Scoring Rule for automatic pricing
   - Liquidity parameter b=100 for optimal market depth
   - Prices automatically adjust based on supply and demand
   - Guaranteed liquidity for all trades
   - Mathematical foundation ensures fair pricing

2. **Market Overview**
   - Total prize pool display
   - Real-time market prediction bar
   - Price change indicators

3. **Fighter Cards** (A/B sides)
   - Real-time LMSR-calculated price display
   - Buy/Sell mode toggle
   - Price trend chart showing live market movements
   - Quantity selector with instant cost calculation
   - User holdings information
   - Market value ROI calculation

4. **My Account**
   - Balance display
   - Holdings detailed table
   - Total market value statistics
   - "Sell All Holdings" button
   - Collapsible order history

5. **Simulated Trading Activity**
   - Automated market participants trading every second
   - Realistic price movements based on LMSR
   - Visible market activity and liquidity

## Design Features

- **Dark Theme**: Main background #0a0a0a, card background #141414
- **Modular**: Sections separated with dividers, no gaps
- **Compact Layout**: Smaller fonts, high information density
- **Full Screen**: Maximize screen space utilization
- **Primary Color**: Lime green (#c8f028)

## Getting Started

### Install Dependencies

\`\`\`bash
npm install
\`\`\`

### Add Video File

Place a video file named `fight-video.mp4` in the `/public` folder. See `/public/README.md` for video specifications.

### Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Open your browser and visit [http://localhost:3000](http://localhost:3000)

### Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Project Structure

\`\`\`
prediction/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main page
├── components/
│   ├── Navbar.tsx           # Navigation bar
│   ├── VideoPlayer.tsx      # Video player with play/pause controls
│   ├── StreamInfo.tsx       # Event info with fight card list
│   ├── FightCard.tsx        # Reusable fight card component (NEW)
│   ├── PredictionMarket.tsx # Prediction market container
│   ├── MarketOverview.tsx   # Market overview with prize pool
│   ├── FighterCard.tsx      # Fighter prediction card (trading interface)
│   ├── PriceChart.tsx       # Real-time price chart with live indicator
│   └── MyAccount.tsx        # User account with holdings and order history
├── public/
│   ├── fight-video.mp4      # Video file (add your own)
│   ├── fighter-a.jpg        # Fighter A main event (add your own)
│   ├── fighter-b.jpg        # Fighter B main event (add your own)
│   ├── fighter-2a.jpg       # Fight 2 - Fighter A (add your own)
│   ├── fighter-2b.jpg       # Fight 2 - Fighter B (add your own)
│   ├── fighter-3a.jpg       # Fight 3 - Fighter A (add your own)
│   ├── fighter-3b.jpg       # Fight 3 - Fighter B (add your own)
│   ├── fighter-4a.jpg       # Fight 4 - Fighter A (add your own)
│   ├── fighter-4b.jpg       # Fight 4 - Fighter B (add your own)
│   ├── fighter-5a.jpg       # Fight 5 - Fighter A (add your own)
│   ├── fighter-5b.jpg       # Fight 5 - Fighter B (add your own)
│   └── README.md            # Instructions for adding media files
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
\`\`\`

## Mock Data

Currently all data is mocked:

### Market Data
- Total Prize Pool: 125,000 USDC
- Fighter A (Mike "Dragon"): Price 105 USDC, Market Share 62%
- Fighter B (John "Thunder"): Price 82 USDC, Market Share 38%

### User Data
- User Balance: 2,500 USDC
- User Holdings: Fighter A 10 tickets, Fighter B 5 tickets
- Order History: 5 recent transactions (Buy/Sell records)

### Fight Card Data
- Fight 1 (LIVE): Mike "Dragon" (20-3-0) vs John "Thunder" (18-5-0) - Lightweight Title Match
- Fight 2: Alex "Storm" (18-2-0) vs Ryan "Beast" (16-4-0) - Welterweight
- Fight 3: Sarah "Viper" (12-1-0) vs Lisa "Titan" (14-2-0) - Bantamweight
- Fight 4: Carlos "Blade" (15-3-0) vs Tom "Hammer" (13-5-0) - Featherweight
- Fight 5: Jake "Wolf" (10-6-0) vs Matt "Eagle" (11-4-0) - Middleweight

## Future Development

- [ ] Integrate advanced charting library (TradingView Lightweight Charts)
- [ ] Connect blockchain wallets (MetaMask, WalletConnect)
- [ ] Implement real trading logic
- [ ] WebSocket real-time data updates
- [ ] Live video streaming integration
- [ ] User authentication system
- [ ] Transaction history
- [ ] Leaderboard functionality

## Recent Changes

### UI/UX Updates
- ✅ Updated primary color from purple (#7c3aed) to lime green (#c8f028)
- ✅ Translated all interface text to English
- ✅ Increased video player height (70vh) with play/pause controls
- ✅ Made left section scrollable to view complete event information
- ✅ Removed redundant sections (Fight Stats, Event Information)

### Video Player Enhancements
- ✅ Support for real video files from /public folder (fight-video.mp4)
- ✅ Added play/pause button with icon toggle
- ✅ Video auto-plays on load

### Fighter Card Optimizations
- ✅ Simplified price display: "xxx USDC / Ticket"
- ✅ Moved price change percentage next to real-time price
- ✅ Added square, rounded fighter avatars to fighter prediction cards
- ✅ Removed "You Hold" section for cleaner UI
- ✅ Removed internal quantity adjustment buttons (centered input display)

### Prediction Interface Improvements
- ✅ Buy/Sell buttons change to light green/light red based on mode
- ✅ Confirm buttons dynamically styled (green for Buy, red for Sell)
- ✅ Centered ticket quantity input display

### Price Chart Updates
- ✅ Removed time range selector (1m/5m/Live buttons)
- ✅ Display real-time data only
- ✅ Added pulsing dot at end of price line
- ✅ Added "LIVE" indicator on chart

### Market Overview Enhancements
- ✅ Increased spacing and font sizes for better readability
- ✅ Enlarged prize pool display with better visual hierarchy
- ✅ Added divider between sections
- ✅ Redesigned market prediction bar

### My Account Improvements
- ✅ Card-based layout for balance and holdings
- ✅ Added "Sell All Holdings" button below Total Market Value
- ✅ Added collapsible "Order History" section (default: collapsed)
- ✅ Mock order data with Buy/Sell transactions

### Color Scheme Optimization
- ✅ Changed Fighter B color from red to amber (#f59e0b) to avoid visual confusion
- ✅ Blue for Fighter A, Amber for Fighter B throughout the app
- ✅ Red/Green reserved for price changes and Buy/Sell actions

### Event Information Redesign
- ✅ Enlarged fighter battle card with full-width square images
- ✅ Repositioned fighter names and records beside images
- ✅ Added match type above "VS" (e.g., "Lightweight Title Match")
- ✅ Images fill card with no padding, square dimensions
- ✅ Enhanced visual effects with glow and shadows
- ✅ Added LIVE NOW indicator with pulsing animation

### Fight Card Section (NEW)
- ✅ Created reusable FightCard.tsx component
- ✅ Refactored code: Moved fight data to mockFights array
- ✅ Added 5-fight card list below Event Description
- ✅ Fight cards display fight number (Fight 1, Fight 2, etc.)
- ✅ LIVE card shows prominently at top of page
- ✅ Fight Card list shows all fights without LIVE indicator
- ✅ Support for multiple fighter photos (fighter-2a.jpg through fighter-5b.jpg)
- ✅ Removed image glow effects for cleaner appearance
- ✅ Unified fighter record color to white across all cards

### Code Improvements
- ✅ Component-based architecture with reusable FightCard component
- ✅ Centralized mock data management
- ✅ Reduced code duplication (300+ lines → 130+ lines in StreamInfo)
- ✅ Easier to maintain and extend fight card list

### LMSR Implementation (NEW)
- ✅ Complete LMSR (Logarithmic Market Scoring Rule) implementation
- ✅ Mathematical pricing model replacing simple percentage-based system
- ✅ Automatic market making with guaranteed liquidity
- ✅ Cost function: C(q) = b × ln(Σ e^(qi/b))
- ✅ Price function: pi = e^(qi/b) / Σ(e^(qj/b))
- ✅ Liquidity parameter b=100 for optimal market depth
- ✅ Real-time price calculation based on outstanding shares
- ✅ Accurate buy/sell cost calculation
- ✅ Every-second simulated trading using LMSR
- ✅ Market prices converge to collective predictions

## Documentation

- **[PROJECT_README.md](PROJECT_README.md)** - Project overview and features
- **[LMSR_IMPLEMENTATION.md](LMSR_IMPLEMENTATION.md)** - Detailed LMSR algorithm explanation
- **[INTERACTIVE_SYSTEM.md](INTERACTIVE_SYSTEM.md)** - Dynamic interaction system documentation
- **[HOMEPAGE.md](HOMEPAGE.md)** - Homepage features and design
- **[WALLET_INTEGRATION.md](WALLET_INTEGRATION.md)** - Sui wallet integration guide

## License

MIT

