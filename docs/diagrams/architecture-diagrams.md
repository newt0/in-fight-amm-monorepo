# In-fight AMM × Nautilus Architecture Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Web/Mobile dApp]
        WS[WebSocket Client]
    end

    subgraph "Sui Blockchain"
        AMM[LSMR AMM Contract]
        Oracle[Fight Oracle Contract]
        Enclave[Enclave Registry]
        Market[Market State]
    end

    subgraph "AWS Nitro Enclave"
        NS[Nautilus Server]
        KP[Ephemeral KeyPair]
        API[Fight Data APIs]
    end

    subgraph "External Data"
        UFC[UFC API]
        ONE[ONE Championship]
        ESPN[ESPN API]
        SHED[Sherdog/Tapology]
    end

    UI -->|1. Place Bet| AMM
    UI -->|2. Query Price| Market
    WS -->|3. Live Updates| AMM

    AMM -->|4. Calculate Price| Market
    Market -->|5. Update Shares| AMM

    UI -->|6. Request Result| NS
    NS -->|7. Fetch Data| API
    API -->|8. Query| UFC
    API -->|8. Query| ONE
    API -->|8. Query| ESPN
    API -->|8. Query| SHED

    NS -->|9. Sign Result| KP
    NS -->|10. Return Signed| UI

    UI -->|11. Submit to Chain| Oracle
    Oracle -->|12. Verify Sig| Enclave
    Oracle -->|13. Settle Market| AMM

    AMM -->|14. Payout| UI

    style AMM fill:#4CAF50
    style Oracle fill:#2196F3
    style NS fill:#FF9800
    style UI fill:#9C27B0
```

## 2. Data Flow Diagram (Fight Lifecycle)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant SuiChain as Sui Chain
    participant LSMR as LSMR AMM
    participant Nautilus as Nautilus Enclave
    participant FightAPI as Fight APIs

    Note over User,FightAPI: Phase 1: Pre-Fight (Market Creation)
    Frontend->>SuiChain: Create Market
    SuiChain->>LSMR: Initialize(fight_id, outcomes, liquidity)
    LSMR-->>Frontend: Market ID

    Note over User,FightAPI: Phase 2: In-Fight (Real-time Betting)
    loop Every Bet
        User->>Frontend: Place Bet (Fighter A, 10 SUI)
        Frontend->>LSMR: buy_shares(outcome=0, shares=10)
        LSMR->>LSMR: Calculate Cost
        Note right of LSMR: C(q') - C(q)
        LSMR->>LSMR: Update Prices
        Note right of LSMR: P_i = exp(q_i/b) / Σexp(q_j/b)
        LSMR-->>Frontend: Position Created
        Frontend-->>User: Live Price Update
    end

    Note over User,FightAPI: Phase 3: Post-Fight (Settlement)
    Frontend->>Nautilus: POST /process_data {fight_id}
    Nautilus->>FightAPI: Fetch Official Result
    FightAPI-->>Nautilus: {winner, method, round}
    Nautilus->>Nautilus: Sign with Ed25519
    Nautilus-->>Frontend: {result, signature}

    Frontend->>SuiChain: verify_fight_result(result, sig)
    SuiChain->>SuiChain: Verify Signature
    SuiChain->>LSMR: settle_market(winning_outcome)
    LSMR->>LSMR: Lock Market

    Note over User,FightAPI: Phase 4: Claim Winnings
    User->>Frontend: Claim Winnings
    Frontend->>LSMR: claim_winnings(position)
    LSMR->>LSMR: Calculate Payout
    Note right of LSMR: shares_won * 1 SUI
    LSMR-->>Frontend: Transfer SUI
    Frontend-->>User: Funds Received ✓
```

## 3. LSMR Price Calculation Flow

```mermaid
graph LR
    subgraph "Input"
        BET[New Bet<br/>Fighter A<br/>10 shares]
    end

    subgraph "Current State"
        Q0[q_A = 50]
        Q1[q_B = 45]
        B[b = 100<br/>liquidity]
    end

    subgraph "Cost Calculation"
        COST_BEFORE[C_before = b × ln<br/>exp50/100 + exp45/100]
        UPDATE[q_A' = 60]
        COST_AFTER[C_after = b × ln<br/>exp60/100 + exp45/100]
        DIFF[Cost = C_after - C_before]
    end

    subgraph "Price Update"
        EXP_A[exp60/100 = 1.822]
        EXP_B[exp45/100 = 1.568]
        SUM[Σ = 3.390]
        P_A[P_A = 1.822/3.390<br/>= 53.7%]
        P_B[P_B = 1.568/3.390<br/>= 46.3%]
    end

    subgraph "Output"
        POS[Position Created<br/>10 shares Fighter A]
        PRICE[New Price: 53.7%]
    end

    BET --> Q0
    BET --> Q1
    Q0 --> COST_BEFORE
    Q1 --> COST_BEFORE
    B --> COST_BEFORE

    COST_BEFORE --> UPDATE
    UPDATE --> COST_AFTER
    COST_AFTER --> DIFF

    UPDATE --> EXP_A
    Q1 --> EXP_B
    EXP_A --> SUM
    EXP_B --> SUM
    SUM --> P_A
    SUM --> P_B

    DIFF --> POS
    P_A --> PRICE
    P_B --> PRICE

    style BET fill:#E91E63
    style DIFF fill:#4CAF50
    style PRICE fill:#2196F3
```

## 4. Nautilus Enclave Internal Architecture

```mermaid
graph TB
    subgraph "EC2 Parent Instance"
        TF[Traffic Forwarder<br/>socat]
        SM[AWS Secrets Manager]
    end

    subgraph "AWS Nitro Enclave"
        subgraph "Nautilus Server"
            MAIN[main.rs<br/>Server Init]
            COMMON[common.rs<br/>Attestation]
            APP[fight-oracle/mod.rs<br/>Business Logic]
        end

        subgraph "Cryptography"
            KP[Ed25519 KeyPair<br/>ephemeral]
            SIGN[Signature Generation]
        end

        subgraph "Data Processing"
            FETCH[Data Fetcher]
            VALID[Validator]
            BCS[BCS Serializer]
        end

        NSM[Nitro Secure Module<br/>Hardware]
    end

    subgraph "External Services"
        API1[UFC API]
        API2[Sherdog]
        API3[ESPN]
    end

    TF -->|Whitelisted Traffic| FETCH
    SM -->|API Keys| APP

    MAIN --> KP
    MAIN --> COMMON
    MAIN --> APP

    APP --> FETCH
    FETCH -->|HTTP Request| TF
    TF --> API1
    TF --> API2
    TF --> API3

    FETCH --> VALID
    VALID --> BCS
    BCS --> SIGN
    KP --> SIGN

    COMMON --> NSM
    NSM -->|Attestation Document| COMMON

    style KP fill:#FF5722
    style NSM fill:#795548
    style SIGN fill:#FF9800
```

## 5. Security Verification Flow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub
    participant Build as Build System
    participant AWS
    participant Sui
    participant User

    Note over Dev,User: Phase 1: Reproducible Build
    Dev->>GitHub: Push Source Code
    GitHub->>Build: Trigger Build
    Build->>Build: Docker Build (StageX)
    Note right of Build: Deterministic<br/>Timestamps=0<br/>Sorted files
    Build->>Build: Generate EIF
    Build->>Build: Calculate PCRs
    Build-->>Dev: PCR Values

    Note over Dev,User: Phase 2: On-chain Registration
    Dev->>Sui: Deploy Move Contracts
    Dev->>Sui: create_enclave_config(PCR0, PCR1, PCR2)
    Sui-->>Dev: Config Created ✓

    Note over Dev,User: Phase 3: Enclave Deployment
    Dev->>AWS: Launch EC2 + Enclave
    AWS->>AWS: Boot Enclave
    AWS->>AWS: Generate Ephemeral KeyPair
    AWS->>AWS: Request Attestation
    Note right of AWS: NSM signs with<br/>AWS root cert
    AWS-->>Dev: Attestation Document

    Note over Dev,User: Phase 4: Attestation Verification
    Dev->>Sui: register_enclave(attestation_doc)
    Sui->>Sui: Verify AWS Certificate Chain
    Sui->>Sui: Extract PCRs from Document
    Sui->>Sui: Compare with Config PCRs
    Note right of Sui: PCR0_actual == PCR0_config?<br/>PCR1_actual == PCR1_config?<br/>PCR2_actual == PCR2_config?
    Sui->>Sui: Extract Public Key
    Sui->>Sui: Create Enclave Object
    Sui-->>Dev: Enclave Registered ✓

    Note over Dev,User: Phase 5: User Verification (Optional)
    User->>GitHub: Clone Source Code
    User->>Build: Build Locally
    Build-->>User: Local PCR Values
    User->>Sui: Query On-chain PCRs
    Sui-->>User: Registered PCRs
    User->>User: Compare PCRs
    Note right of User: Verify code matches<br/>deployed enclave

    Note over Dev,User: Phase 6: Runtime Verification
    User->>AWS: Request Fight Result
    AWS->>AWS: Sign with Ephemeral Key
    AWS-->>User: {result, signature}
    User->>Sui: Submit to Chain
    Sui->>Sui: Verify Signature with<br/>Registered Public Key
    Note right of Sui: ed25519_verify(<br/>  sig, pk, payload<br/>)
    Sui-->>User: Verified ✓

    rect rgb(76, 175, 80, 0.1)
        Note over Dev,Sui: Trust Chain:<br/>AWS Root Cert → Attestation → PCRs → Public Key → Signatures
    end
```

## 6. Deployment Architecture

```mermaid
graph TB
    subgraph "User Devices"
        MOBILE[Mobile App]
        WEB[Web Browser]
    end

    subgraph "CDN / Frontend"
        CF[Cloudflare]
        IPFS[IPFS<br/>Static Assets]
    end

    subgraph "AWS Region: us-east-1"
        subgraph "VPC"
            ALB[Application Load Balancer]

            subgraph "EC2 Instance"
                VSOCK[vsock Proxy]
                SOCAT[socat<br/>Traffic Forwarder]

                subgraph "Nitro Enclave"
                    NAUTILUS[Nautilus Server<br/>fight-oracle]
                end
            end

            SM_AWS[Secrets Manager<br/>API Keys]
        end
    end

    subgraph "Sui Network"
        subgraph "Testnet"
            RPC_T[RPC Node]
            CONTRACTS_T[Smart Contracts<br/>testnet]
        end

        subgraph "Mainnet"
            RPC_M[RPC Node]
            CONTRACTS_M[Smart Contracts<br/>mainnet]
        end
    end

    subgraph "External APIs"
        UFC_API[UFC Stats API]
        SHERDOG[Sherdog.com]
        ESPN_API[ESPN API]
    end

    subgraph "Monitoring"
        CW[CloudWatch<br/>Logs & Metrics]
        SENTRY[Sentry<br/>Error Tracking]
        GRAFANA[Grafana<br/>Dashboards]
    end

    MOBILE --> CF
    WEB --> CF
    CF --> IPFS
    CF --> ALB

    ALB --> VSOCK
    VSOCK --> NAUTILUS

    NAUTILUS --> SOCAT
    SOCAT --> UFC_API
    SOCAT --> SHERDOG
    SOCAT --> ESPN_API

    SM_AWS -.->|Inject at Boot| NAUTILUS

    CF --> RPC_T
    CF --> RPC_M
    RPC_T --> CONTRACTS_T
    RPC_M --> CONTRACTS_M

    NAUTILUS --> CW
    CF --> SENTRY
    CW --> GRAFANA

    style NAUTILUS fill:#FF9800
    style CONTRACTS_T fill:#4CAF50
    style CONTRACTS_M fill:#2196F3
    style ALB fill:#9C27B0
```

## 7. Real-time Price Update State Machine

```mermaid
stateDiagram-v2
    [*] --> MarketCreated: create_market()

    MarketCreated --> InitialState: Initialize<br/>q_A=0, q_B=0<br/>P_A=50%, P_B=50%

    InitialState --> Betting: Fight Starts

    state Betting {
        [*] --> WaitingForBet

        WaitingForBet --> CalculatingCost: User places bet

        CalculatingCost --> UpdatingShares: cost = C(q') - C(q)
        note right of CalculatingCost
            Fixed-point arithmetic
            exp() and ln()
            18 decimal precision
        end note

        UpdatingShares --> RecalculatingPrices: q_i += shares

        RecalculatingPrices --> EmittingEvent: P_i = exp(q_i/b) / Σexp(q_j/b)
        note right of RecalculatingPrices
            All prices updated
            Sum always = 100%
        end note

        EmittingEvent --> WaitingForBet: PriceUpdate event

        WaitingForBet --> FightEnds: Fight finishes
    }

    Betting --> AwaitingOracle: Fight ends

    AwaitingOracle --> VerifyingResult: Enclave provides result
    note right of AwaitingOracle
        Max wait: 10 minutes
        Nautilus fetches from APIs
        Signs with Ed25519
    end note

    VerifyingResult --> Settled: Signature valid
    VerifyingResult --> AwaitingOracle: Signature invalid (retry)

    Settled --> PayingOut: Users claim winnings
    note right of Settled
        Market locked
        No more bets
        Winning outcome recorded
    end note

    PayingOut --> Closed: All positions claimed

    Closed --> [*]
```

## 8. Integration Testing Flow

```mermaid
graph LR
    subgraph "Test Environment"
        direction TB
        T1[1. Unit Tests<br/>Fixed-point Math]
        T2[2. Integration Tests<br/>LSMR Functions]
        T3[3. E2E Tests<br/>Full Flow]
    end

    subgraph "Rust Tests"
        R1[Serialization Test]
        R2[Signature Test]
        R3[API Mock Test]
    end

    subgraph "Move Tests"
        M1[Math Precision Test]
        M2[Price Sum Test]
        M3[Settlement Test]
    end

    subgraph "Cross-language Tests"
        X1[BCS Consistency]
        X2[Signature Verification]
    end

    subgraph "Deployment Tests"
        D1[Enclave Build]
        D2[PCR Verification]
        D3[On-chain Registration]
    end

    T1 --> R1
    T1 --> M1
    T2 --> M2
    T2 --> M3

    R1 --> X1
    M1 --> X1
    R2 --> X2
    M3 --> X2

    T3 --> D1
    D1 --> D2
    D2 --> D3

    X1 -.->|Pass| DEPLOY[Deploy to Testnet]
    X2 -.->|Pass| DEPLOY
    D3 -.->|Pass| PROD[Production Ready]

    style T1 fill:#4CAF50
    style T2 fill:#2196F3
    style T3 fill:#FF9800
    style DEPLOY fill:#9C27B0
    style PROD fill:#F44336
```

---

## Diagram Descriptions

### 1. System Architecture Overview

- Complete component relationships
- Data flow (14-step process)
- Responsibility boundaries for each layer

### 2. Data Flow Diagram

- Complete fight lifecycle
- 4 Phases: Pre-fight → In-fight → Post-fight → Claim
- Detailed processing at each step

### 3. LSMR Price Calculation Flow

- Concrete numerical example
- Cost function and price function calculations
- Real-time price update mechanism

### 4. Nautilus Enclave Internal Architecture

- Internal enclave structure
- Traffic forwarding mechanism
- Secret management and security

### 5. Security Verification Flow

- 6-phase trust chain construction
- Reproducible build verification with PCR values
- Independent verification procedure for users

### 6. Deployment Architecture

- AWS / Sui / CDN configuration
- Monitoring and logging systems
- Production infrastructure

### 7. Real-time Price Update State Machine

- State machine diagram
- State transitions from betting to settlement
- Processing at each state

### 8. Integration Testing Flow

- Test hierarchy
- Rust / Move / Cross-language tests
- Pre-deployment verification

---

## Key Features

### Technical Innovation

1. **First LSMR Implementation in Move**

   - Fixed-point arithmetic library
   - Efficient exponential/logarithm approximations
   - Reusable across Sui ecosystem

2. **Instant Settlement Oracle**

   - Settlement in < 10 minutes (industry-leading)
   - Cryptographically verifiable trust
   - Cost-efficient

3. **Live Prediction Market**
   - Real-time price updates during fights
   - World's first In-fight AMM
   - Withdraw & re-bet before next fight

### Security Guarantees

**Trust Chain:**

```
AWS Root Certificate
    → Attestation Document
        → PCR Values
            → Ephemeral Public Key
                → Signatures on Results
```

Each step is cryptographically verified, ensuring end-to-end trustworthiness.

### User Experience

| Phase          | Duration  | User Action                        |
| -------------- | --------- | ---------------------------------- |
| **Pre-fight**  | ~1 min    | Browse markets, place initial bets |
| **In-fight**   | 15-25 min | Watch live, adjust positions       |
| **Post-fight** | < 10 min  | Automatic settlement               |
| **Claim**      | Instant   | Withdraw winnings                  |

**Total: < 40 minutes** from fight start to funds in wallet

Compare to Polymarket: **3-7 days** for dispute resolution
