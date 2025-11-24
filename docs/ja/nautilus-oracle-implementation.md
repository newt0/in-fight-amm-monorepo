# Nautilus Trust Oracle for Combat Sports Results

## 概要

格闘技の試合結果を検証可能な形で提供する **Nautilus Trust Oracle** の実装。
Polymarket の数日かかる紛争期間を解消し、試合終了後 10 分以内の即時決済を実現します。

## アーキテクチャ

### システム構成

```
┌──────────────┐
│   Frontend   │  ユーザーがBetを行う
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ LSMR AMM Market  │  予測市場（Sui Move）
│  - リアルタイム価格更新
│  - ポジション管理
└──────┬───────────┘
       │
       │ 試合終了後、結果を要求
       ▼
┌─────────────────────────┐
│ Nautilus Fight Oracle   │  AWS Nitro Enclave
│  - 試合結果API取得      │
│  - データ検証            │
│  - Ed25519署名           │
└──────┬──────────────────┘
       │
       │ 署名付き結果を返す
       ▼
┌──────────────────┐
│ Move Contract    │  署名検証 & 市場決済
│  - verify_signature()
│  - settle_market()
│  - claim_winnings()
└──────────────────┘
```

## 実装詳細

### 1. Rust Enclave Server

**ファイル**: `src/nautilus-server/src/apps/fight-oracle/mod.rs`

#### データ構造

```rust
pub struct FightResult {
    pub fight_id: String,        // 試合ID（例: "UFC308_001"）
    pub event_name: String,       // イベント名
    pub winner: String,           // 勝者名 or "Draw"
    pub method: String,           // 決着方法（KO/TKO/Submission/Decision）
    pub round: u8,                // 終了ラウンド
    pub timestamp_ms: u64,        // 結果のタイムスタンプ
}
```

#### プロセスフロー

1. **試合結果リクエスト受信**

   ```rust
   POST /process_data
   {
     "payload": {
       "fight_id": "UFC308_001",
       "event_name": "UFC 308"
     }
   }
   ```

2. **外部 API 統合**（本番環境）

   - UFC API / Sherdog / Tapology から結果取得
   - 複数ソースでクロスバリデーション
   - タイムスタンプの新鮮さチェック

3. **デモ実装**（ハッカソン用）

   ```rust
   // モックデータで即座に結果を返す
   let (winner, method, round) = match fight_id.as_str() {
       "UFC308_001" => ("Ilia Topuria", "KO", 3),
       "ONE169_001" => ("Anatoly Malykhin", "TKO", 1),
       _ => ("Fighter A", "Decision", 3)
   };
   ```

4. **署名生成**
   ```rust
   // Enclaveの一時的なEd25519鍵で署名
   Ok(Json(to_signed_response(
       &state.eph_kp,
       fight_result,
       current_timestamp,
       IntentScope::ProcessData,
   )))
   ```

### 2. Move Smart Contract

**ファイル**: `move/fight-oracle/sources/fight_oracle.move`

#### 署名検証

```move
public fun verify_fight_result<T>(
    fight_id: String,
    event_name: String,
    winner: String,
    method: String,
    round: u8,
    timestamp_ms: u64,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext,
): FightResultObject {
    // Nautilusのenclave::verify_signatureで検証
    let result = enclave.verify_signature(
        FIGHT_RESULT_INTENT,
        timestamp_ms,
        FightResult { fight_id, event_name, winner, method, round, timestamp_ms },
        sig,
    );

    assert!(result, EInvalidSignature);

    // 検証済み結果オブジェクトを作成
    FightResultObject { ... }
}
```

## BCS Serialization の一貫性

**重要**: Rust と Move の BCS シリアライゼーションが完全に一致する必要があります。

### Rust 側

```rust
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FightResult {
    pub fight_id: String,
    pub event_name: String,
    pub winner: String,
    pub method: String,
    pub round: u8,
    pub timestamp_ms: u64,
}
```

### Move 側

```move
public struct FightResult has copy, drop {
    fight_id: String,
    event_name: String,
    winner: String,
    method: String,
    round: u8,
    timestamp_ms: u64,
}
```

**検証**: 両側で`test_serde()`テストを実装し、同じデータの BCS 出力が一致することを確認。

## セキュリティ考慮事項

### 1. Enclave の信頼性

- **AWS Nitro Attestation**: 起動時に attestation document で検証
- **PCR 値の検証**: ビルドされたバイナリが公開ソースと一致することを保証
- **Ephemeral Keys**: Enclave 起動時に生成される一時的な鍵ペア

### 2. データの新鮮性

```rust
// タイムスタンプチェック（1時間以内）
if last_updated_timestamp_ms + 3_600_000 < current_timestamp {
    return Err(EnclaveError::GenericError("Timestamp too old"));
}
```

### 3. 複数ソース検証（本番環境）

```yaml
# allowed_endpoints.yaml
endpoints:
  - www.sherdog.com
  - www.tapology.com
  - site.api.espn.com
```

## デプロイメントフロー

### 1. Enclave ビルド

```bash
# fight-oracleアプリをビルド
make build ENCLAVE_APP=fight-oracle

# PCR値を確認
cat out/nitro.pcrs
```

### 2. Move Contract デプロイ

```bash
cd move/fight-oracle
sui move build
sui client publish --gas-budget 100000000
```

### 3. Enclave Config 更新

```move
// PCR値を実際のビルド結果で更新
config.update_pcrs(
    &cap,
    x"<PCR0_from_build>",
    x"<PCR1_from_build>",
    x"<PCR2_from_build>",
);
```

### 4. Enclave 登録

```bash
# Attestation documentを取得
curl http://<ENCLAVE_IP>:3000/get_attestation

# On-chainで登録
sui client call --function register_enclave \
  --args <CONFIG_ID> <ATTESTATION_HEX>
```

## 使用例

### フロントエンドからの利用

```typescript
// 1. Enclaveに試合結果をリクエスト
const response = await fetch("http://enclave-ip:3000/process_data", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    payload: {
      fight_id: "UFC308_001",
      event_name: "UFC 308",
    },
  }),
});

const { response: result, signature } = await response.json();

// 2. Move contractで署名検証 & 市場決済
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::fight_oracle::verify_fight_result`,
  arguments: [
    tx.pure(result.data.fight_id),
    tx.pure(result.data.event_name),
    tx.pure(result.data.winner),
    tx.pure(result.data.method),
    tx.pure(result.data.round),
    tx.pure(result.timestamp_ms),
    tx.pure(signature),
    tx.object(enclaveId),
  ],
});

await signAndExecuteTransaction({ transaction: tx });
```

## 利点

### vs. Polymarket

| 項目       | Polymarket         | Nautilus Oracle            |
| ---------- | ------------------ | -------------------------- |
| 決済時間   | 数日（紛争期間）   | < 10 分                    |
| 検証方法   | UMA 投票           | 暗号学的証明               |
| コスト     | ガス代 + 紛争 bond | ガス代のみ                 |
| 信頼モデル | 投票者の誠実性     | AWS Nitro + オープンソース |

### vs. Chainlink Oracle

| 項目       | Chainlink          | Nautilus                        |
| ---------- | ------------------ | ------------------------------- |
| 透明性     | ノードオペレーター | オープンソース + 再現可能ビルド |
| レイテンシ | 複数ノード集約     | 単一 Enclave（高速）            |
| コスト     | ノード報酬         | AWS EC2 コスト                  |
| 検証可能性 | 限定的             | PCR 値で完全検証可能            |

## 今後の拡張

### 1. マルチソース検証

```rust
// 複数のAPIから結果を取得し、多数決で決定
let sources = vec![
    fetch_from_sherdog(fight_id),
    fetch_from_tapology(fight_id),
    fetch_from_espn(fight_id),
];

let consensus = find_consensus(sources);
```

### 2. リアルタイムデータ配信

```rust
// 試合中の統計データをストリーミング
struct LiveStats {
    strikes_landed: HashMap<String, u32>,
    takedowns: HashMap<String, u32>,
    control_time: HashMap<String, u64>,
}
```

### 3. 自動決済トリガー

```rust
// 試合終了を検知して自動的に決済プロセスを開始
async fn watch_fight_end(fight_id: String) {
    loop {
        if is_fight_finished(fight_id).await {
            let result = fetch_official_result(fight_id).await;
            settle_market(result).await;
            break;
        }
        tokio::time::sleep(Duration::from_secs(60)).await;
    }
}
```

## まとめ

Nautilus Trust Oracle は、格闘技予測市場に以下を提供します：

1. **即時決済**: 試合終了後 10 分以内
2. **検証可能性**: PCR 値による再現可能ビルド
3. **透明性**: オープンソース + AWS Nitro Attestation
4. **低コスト**: 紛争メカニズムが不要

これにより、ユーザーは次の試合までに賞金を引き出して再 Bet できる、真のライブ型予測市場体験を実現します。
