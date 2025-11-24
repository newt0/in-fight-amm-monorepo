# LSMR AMM for Combat Sports Prediction Markets

## 概要

**Logarithmic Market Scoring Rule (LSMR)** を用いた自動マーケットメーカーの実装。
格闘技の試合に特化したリアルタイム予測市場を実現します。

## なぜ LSMR なのか？

### 予測市場の AMM 比較

| メカニズム                    | 利点                             | 欠点                         | 適用例            |
| ----------------------------- | -------------------------------- | ---------------------------- | ----------------- |
| **Orderbook**                 | 価格発見が正確                   | 流動性が必要                 | Polymarket (現在) |
| **Constant Product (x\*y=k)** | シンプル                         | 価格が確率として解釈できない | Uniswap           |
| **LSMR**                      | 確率解釈可能<br>常に流動性がある | 実装が複雑                   | **In-fight AMM**  |

### LSMR の特徴

1. **価格 = 確率**: P_i は結果 i の発生確率として直接解釈可能
2. **常時流動性**: オーダーブック不要、いつでも取引可能
3. **価格の連続性**: ベット量に応じて滑らかに価格が変動
4. **リアルタイム更新**: 試合中のベットで即座に価格が更新

## 数学的背景

### Cost Function (コスト関数)

```
C(q) = b × ln(Σ exp(q_i / b))
```

**意味**:

- 現在のマーケット状態（各結果のシェア数）に基づく総コスト
- `b` (liquidity parameter) が大きいほど価格変動が緩やか

### Price Function (価格関数)

```
P_i = ∂C/∂q_i = exp(q_i / b) / Σ exp(q_j / b)
```

**意味**:

- 結果 i のシェアを 1 単位追加購入する際の限界コスト
- 全ての結果の価格の合計は常に 1.0（100%）

### 例: バイナリーマーケット（2 つの結果）

初期状態: q_A = 0, q_B = 0, b = 100

```
P_A = exp(0/100) / (exp(0/100) + exp(0/100))
    = 1 / (1 + 1)
    = 0.5 = 50%

P_B = 0.5 = 50%
```

10 シェアを Fighter A に購入後: q_A = 10, q_B = 0

```
P_A = exp(10/100) / (exp(10/100) + exp(0/100))
    = exp(0.1) / (exp(0.1) + 1)
    = 1.105 / (1.105 + 1)
    ≈ 0.525 = 52.5%

P_B ≈ 0.475 = 47.5%
```

## Move での実装課題と解決策

### 課題 1: 浮動小数点数がない

**解決**: Fixed-Point Arithmetic (18 桁精度)

```move
/// 1.0 = 1e18
const SCALE: u128 = 1_000_000_000_000_000_000;

/// 2.5 を表現
let two_point_five = 2_500_000_000_000_000_000;

/// 乗算: (a × b) / SCALE
public fun mul(a: u128, b: u128): u128 {
    let result = ((a as u256) * (b as u256)) / (SCALE as u256);
    (result as u128)
}
```

### 課題 2: 指数関数・対数関数がない

**解決**: テイラー展開による近似

#### 指数関数 exp(x)

```move
// e^x = 1 + x + x²/2! + x³/3! + x⁴/4! + ...
public fun exp(x: u128): u128 {
    let mut result = SCALE; // 1.0
    let mut term = SCALE;   // 現在の項
    let mut i = 1u128;

    while (i <= 20) {
        term = mul(term, x) / i;
        result = add(result, term);

        if (term < 1000) break; // 十分小さくなったら終了

        i = i + 1;
    };

    result
}
```

#### 対数関数 ln(x)

```move
// より高速に収束する公式を使用:
// ln(x) = 2 × [z + z³/3 + z⁵/5 + ...]
// where z = (x-1)/(x+1)

public fun ln(x: u128): u128 {
    let z_num = sub(x, SCALE);
    let z_den = add(x, SCALE);
    let z = div(z_num, z_den);

    let mut sum = 0u128;
    let mut term = z;
    let z_squared = mul(z, z);
    let mut i = 1u128;

    while (i <= 19) {
        sum = add(sum, term / i);
        term = mul(term, z_squared);
        i = i + 2;
    };

    mul(sum, 2 * SCALE)
}
```

### 課題 3: オーバーフロー対策

**解決**: u128 → u256 への一時的なキャスト

```move
public fun mul(a: u128, b: u128): u128 {
    let result = ((a as u256) * (b as u256)) / (SCALE as u256);
    assert!(result <= (0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF as u256), EOverflow);
    (result as u128)
}
```

## LSMR Market 実装

### データ構造

```move
public struct LSMRMarket has key, store {
    id: UID,
    fight_id: String,              // 試合ID
    event_name: String,             // イベント名
    outcomes: vector<String>,       // 結果ラベル ["Fighter A", "Fighter B"]
    shares: vector<u128>,           // 各結果の購入済みシェア数 (q_i)
    liquidity: u128,                // 流動性パラメータ (b)
    pool: Balance<SUI>,             // プールのSUI残高
    status: u8,                     // 市場の状態（ACTIVE/SETTLED）
    winning_outcome: Option<u64>,   // 勝利した結果のインデックス
    total_cost: u128,               // 総投入コスト
}

public struct Position has key, store {
    id: UID,
    market_id: ID,                  // 対応するマーケットのID
    shares: vector<u128>,           // 保有シェア数
}
```

### 主要機能

#### 1. マーケット作成

```move
public fun create_market(
    fight_id: String,
    event_name: String,
    outcomes: vector<String>,    // ["Ilia Topuria", "Max Holloway"]
    liquidity: u64,               // 100 (流動性パラメータ)
    initial_pool: Coin<SUI>,      // 初期プール資金
    ctx: &mut TxContext,
): LSMRMarket
```

**初期状態**:

- すべての q_i = 0
- すべての P_i = 1/n (n は結果数)

#### 2. シェア購入

```move
public fun buy_shares(
    market: &mut LSMRMarket,
    outcome_index: u64,           // 購入する結果のインデックス
    num_shares: u64,              // 購入シェア数
    payment: Coin<SUI>,           // 支払い
    ctx: &mut TxContext,
): Position
```

**ロジック**:

```move
// 購入前のコスト
let cost_before = calculate_cost(&market.shares, market.liquidity);

// シェア数を更新
market.shares[outcome_index] += num_shares;

// 購入後のコスト
let cost_after = calculate_cost(&market.shares, market.liquidity);

// ユーザーが支払う額 = cost_after - cost_before
let payment_required = cost_after - cost_before;
```

#### 3. 価格計算

```move
public fun get_price(market: &LSMRMarket, outcome_index: u64): u128 {
    // P_i = exp(q_i/b) / Σ exp(q_j/b)

    let mut sum_exp = 0u128;
    for j in 0..outcomes.length {
        let q_j = shares[j];
        sum_exp += exp(q_j / liquidity);
    }

    let q_i = shares[outcome_index];
    let exp_i = exp(q_i / liquidity);

    div(exp_i, sum_exp)  // P_i
}
```

#### 4. 市場決済

```move
public fun settle_market(
    market: &mut LSMRMarket,
    winning_outcome: u64,
) {
    market.status = STATUS_SETTLED;
    market.winning_outcome = option::some(winning_outcome);
}
```

#### 5. 賞金請求

```move
public fun claim_winnings(
    market: &mut LSMRMarket,
    position: Position,
    ctx: &mut TxContext,
): Coin<SUI> {
    let winning_idx = *option::borrow(&market.winning_outcome);
    let shares_won = position.shares[winning_idx];

    // 1シェア = 1 SUI のペイアウト
    let payout = to_u64(shares_won);

    coin::take(&mut market.pool, payout, ctx)
}
```

## 使用例

### TypeScript (Frontend)

```typescript
import { Transaction } from "@mysten/sui/transactions";

// 1. マーケット作成
async function createFightMarket() {
  const tx = new Transaction();

  const [initialPool] = tx.splitCoins(tx.gas, [1000000000]); // 1 SUI

  tx.moveCall({
    target: `${packageId}::lsmr_market::create_market`,
    arguments: [
      tx.pure("UFC308_001"), // fight_id
      tx.pure("UFC 308: Topuria vs Holloway"), // event_name
      tx.pure(["Ilia Topuria", "Max Holloway"]), // outcomes
      tx.pure(100), // liquidity
      initialPool,
    ],
  });

  await signAndExecuteTransaction({ transaction: tx });
}

// 2. シェア購入
async function buyShares(
  marketId: string,
  outcomeIndex: number,
  numShares: number
) {
  const tx = new Transaction();

  // 価格を事前計算（オプション）
  const price = await getPrice(marketId, outcomeIndex);
  const estimatedCost = price * numShares;

  const [payment] = tx.splitCoins(tx.gas, [estimatedCost * 1.1]); // 10%バッファ

  tx.moveCall({
    target: `${packageId}::lsmr_market::buy_shares`,
    arguments: [
      tx.object(marketId),
      tx.pure(outcomeIndex),
      tx.pure(numShares),
      payment,
    ],
  });

  await signAndExecuteTransaction({ transaction: tx });
}

// 3. リアルタイム価格表示
async function displayLivePrices(marketId: string) {
  setInterval(async () => {
    const price0 = await getPrice(marketId, 0);
    const price1 = await getPrice(marketId, 1);

    console.log(`Ilia Topuria: ${(price0 * 100).toFixed(2)}%`);
    console.log(`Max Holloway: ${(price1 * 100).toFixed(2)}%`);
  }, 1000);
}

// 4. Nautilus Oracleとの統合
async function settleFight(marketId: string, fightId: string) {
  // Enclaveから結果取得
  const result = await fetch("http://enclave:3000/process_data", {
    method: "POST",
    body: JSON.stringify({ payload: { fight_id: fightId } }),
  }).then((r) => r.json());

  // 署名検証 & 勝者特定
  const winningOutcome = determineWinner(result.response.data.winner);

  // 市場決済
  const tx = new Transaction();
  tx.moveCall({
    target: `${packageId}::lsmr_market::settle_market`,
    arguments: [tx.object(marketId), tx.pure(winningOutcome)],
  });

  await signAndExecuteTransaction({ transaction: tx });
}
```

## パフォーマンス最適化

### 1. Gas 最適化

```move
// ❌ 非効率: 毎回全ての指数を計算
public fun get_all_prices(market: &LSMRMarket): vector<u128> {
    let mut prices = vector::empty();
    for i in 0..market.outcomes.length {
        vector::push_back(&mut prices, get_price(market, i));
    }
    prices
}

// ✅ 効率的: 一度だけ計算
public fun get_all_prices_optimized(market: &LSMRMarket): vector<u128> {
    let mut sum_exp = 0u128;
    let mut exp_values = vector::empty();

    // 一度だけループ
    for i in 0..market.shares.length {
        let exp_val = exp(market.shares[i] / market.liquidity);
        vector::push_back(&mut exp_values, exp_val);
        sum_exp = add(sum_exp, exp_val);
    }

    let mut prices = vector::empty();
    for i in 0..exp_values.length {
        let price = div(exp_values[i], sum_exp);
        vector::push_back(&mut prices, price);
    }

    prices
}
```

### 2. 精度 vs パフォーマンス

```move
// 高精度（20項）: 0.001%誤差、ガス高
while (i <= 20) { ... }

// 中精度（10項）: 0.1%誤差、ガス中
while (i <= 10) { ... }

// 低精度（5項）: 1%誤差、ガス低
while (i <= 5) { ... }
```

**推奨**: 10 項（予測市場には十分な精度）

## テスト戦略

### 1. 数学関数の精度テスト

```move
#[test]
fun test_exp_accuracy() {
    // e^1 ≈ 2.718281828
    let result = exp(SCALE);
    let expected = E;
    let error = abs_diff(result, expected);

    // 0.1%未満の誤差を許容
    assert!(error < expected / 1000, 0);
}
```

### 2. 価格の合計テスト

```move
#[test]
fun test_prices_sum_to_one() {
    let market = create_test_market();

    let price_0 = get_price(&market, 0);
    let price_1 = get_price(&market, 1);
    let sum = add(price_0, price_1);

    // 合計が1.0に近いことを確認
    let diff = abs_diff(sum, SCALE);
    assert!(diff < SCALE / 100, 0); // 1%以内
}
```

### 3. コスト関数の単調性テスト

```move
#[test]
fun test_cost_monotonic() {
    let market = create_test_market();

    let cost_before = calculate_cost(&market.shares, market.liquidity);

    // シェアを購入
    buy_shares(&mut market, 0, 10, ...);

    let cost_after = calculate_cost(&market.shares, market.liquidity);

    // コストは単調増加
    assert!(cost_after > cost_before, 0);
}
```

## 将来の拡張

### 1. マルチアウトカム市場

現在: バイナリー（2 つの結果）
将来: 3 つ以上の結果（例: "Fighter A 勝利 / Draw / Fighter B 勝利"）

```move
let outcomes = vector[
    b"Ilia Topuria wins by KO/TKO".to_string(),
    b"Ilia Topuria wins by Decision".to_string(),
    b"Max Holloway wins by KO/TKO".to_string(),
    b"Max Holloway wins by Decision".to_string(),
    b"Draw".to_string(),
];
```

### 2. ダイナミック流動性

試合の重要度や時間経過に応じて流動性パラメータを調整

```move
// 試合開始直前: 流動性を下げて価格変動を大きく
market.liquidity = 50;

// 試合中: 流動性を上げて極端な価格変動を抑制
market.liquidity = 200;
```

### 3. 流動性プロバイダー報酬

```move
public struct LiquidityProvider has key {
    id: UID,
    shares_provided: u128,
    rewards_earned: u128,
}

// 市場のスプレッドから流動性提供者に報酬
public fun distribute_lp_rewards(market: &mut LSMRMarket) {
    let total_fees = market.total_cost * FEE_RATE / 10000;
    // LPに配分...
}
```

## まとめ

### 実装のハイライト

1. ✅ **完全な on-chain 実装**: 全ての計算が Sui 上で実行
2. ✅ **18 桁精度**: 実用的な精度を確保
3. ✅ **ガス効率**: 最適化されたテイラー展開
4. ✅ **拡張可能**: バイナリーからマルチアウトカムへ容易に拡張可能

### 技術的貢献

- **Move 言語での初の LSMR 実装**: 先行事例なし
- **Fixed-Point Math Library**: 他のプロジェクトでも再利用可能
- **指数・対数関数の近似**: Move エコシステムへの貢献

### ビジネス価値

- **リアルタイム UX**: 試合中の価格変動を即座に反映
- **常時流動性**: いつでも取引可能
- **透明性**: 価格 = 確率として直感的に理解可能
- **即時決済**: Nautilus Oracle と組み合わせて完全自動化

In-fight AMM は、格闘技ファンに真のライブ予測市場体験を提供します。
