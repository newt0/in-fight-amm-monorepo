# in-fight-amm-monorepo

# In-fight AMM

A Real-time Prediction Market Platform Specialized for Combat Sports

## Project Overview

In-fight AMM is a new form of prediction market platform that allows users to change their prediction positions in real-time during combat sports matches. It is being developed for the Walrus Haulout Hackathon.

## Vision

While traditional prediction markets focus on pre-match predictions, In-fight AMM specializes in **live in-match experiences**. It provides a completely new prediction market experience where spectators can adjust their positions in real-time based on match developments while watching live streams.

## Key Features

### 1. In-fight Specialized Prediction Market

- **Betting from Right Before Match Start**: Prediction market begins from fighter entrance scenes
- **Real-time Trading During Matches**: Instantly change positions while watching match developments
- **Live Streaming Integration**: Trade seamlessly while watching the broadcast

### 2. Real-time Data Display

Display match statistics in real-time during the fight:

- Control rate
- Punch count
- Other match statistics

### 3. Ultra-fast Settlement System

- **Settlement Within 10 Minutes After Match End**: Verifiable automatic settlement via Nautilus Trust Oracle
- **Instant Claim**: Withdraw funds 10 minutes after the match ends
- **Ready for Next Match**: Reinvest funds before the next match begins

### 4. Price Mechanism via LSMR AMM

- Adopts LSMR (Logarithmic Market Scoring Rule) AMM from early Polymarket
- Prices automatically adjust in real-time based on user bets
- High liquidity AMM method instead of Orderbook

## Differentiation from Polymarket

| Feature           | Polymarket                         | In-fight AMM                   |
| ----------------- | ---------------------------------- | ------------------------------ |
| Trading Method    | Orderbook                          | LSMR AMM                       |
| Settlement Period | Several days (with dispute period) | Within 10 minutes              |
| Focus             | Pre-match predictions              | Live in-match predictions      |
| Fund Liquidity    | Locked until settlement            | Withdrawable before next match |

## Use Cases

### Example Scenario

1. User accesses platform 5 minutes before match start
2. Prediction market opens during fighter entrance
3. Adjust positions round by round while watching, predicting developments
4. After match ends, oracle automatically verifies results
5. Claim within 10 minutes and prepare for the next match

## Future Development

### Pre-fight AMM

A separate prediction market specialized for pre-match predictions will also be offered (this hackathon focuses on In-fight)

### Walrus Utilization

- Decentralized storage for match data
- Storage of live streaming content

### SEAL Utilization

- Privacy protection features
- User data encryption

## Tech Stack

- **Blockchain**: Sui
- **Oracle**: Nautilus Trust Oracle
- **AMM**: LSMR (Logarithmic Market Scoring Rule)
- **Future**: Walrus, SEAL

## Hackathon Information

- **Event**: Walrus Haulout Hackathon
- **Development Period**: 1 day (core functionality prototyping)
- **Key Technologies**: Nautilus, Sui Move

---

**Note**: This project aims to provide combat sports fans with a new entertainment experience and expand the possibilities of prediction markets.
