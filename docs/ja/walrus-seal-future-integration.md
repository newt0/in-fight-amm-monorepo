# Walrus & SEAL 統合アイディア（将来構想）

## 概要

現在の実装では **Nautilus** を中心に使用していますが、Walrus Haulout Hackathon の 3 つのテーマ（Walrus / Nautilus / SEAL）すべてを活用した将来的な拡張アイディアをまとめます。

## 1. Walrus 統合アイディア

### 1.1 試合映像の分散ストレージ

**課題**:

- 格闘技の試合映像は数 GB〜数十 GB と大容量
- 中央集権的なストレージはコストが高く、検閲リスクがある
- 紛争時の証拠として永続的に保存する必要がある

**解決策: Walrus**

```typescript
// 試合映像をWalrusに保存
const fightVideo = await fetch(liveStreamUrl).then((r) => r.blob());

const blobId = await walrusClient.store(fightVideo, {
  epochs: 100, // 長期保存
  metadata: {
    fightId: "UFC308_001",
    eventName: "UFC 308",
    date: "2024-10-26",
    fighters: ["Ilia Topuria", "Max Holloway"],
  },
});

// Sui上にメタデータを記録
await suiClient.moveCall({
  target: `${packageId}::fight_archive::store_fight_video`,
  arguments: [tx.pure(fightId), tx.pure(blobId), tx.pure(videoHash)],
});
```

**ユースケース**:

1. **紛争解決**: 判定に異議がある場合、映像を確認
2. **トレーニング**: AI モデルのトレーニングデータとして利用
3. **アーカイブ**: 歴史的な試合映像の永続保存

### 1.2 ライブストリーミング with Walrus

**構想**:

- 試合のライブ配信を分散化
- HLS セグメントを Walrus に保存
- 検閲耐性のあるライブストリーミング

```typescript
// HLSセグメントを順次Walrusにアップロード
async function streamToWalrus(streamUrl: string) {
  const hlsParser = new HLSParser(streamUrl);

  hlsParser.on("segment", async (segment) => {
    const blobId = await walrusClient.store(segment.data, {
      epochs: 10, // 短期保存
    });

    // セグメントのblobIdをSui上で公開
    await publishSegment(segment.sequenceNumber, blobId);
  });
}

// 視聴者はblobIdから取得
async function watchFight(fightId: string) {
  const segments = await getSegments(fightId);

  for (const seg of segments) {
    const data = await walrusClient.read(seg.blobId);
    videoPlayer.append(data);
  }
}
```

### 1.3 試合統計データの保存

```move
// Walrusに保存された試合統計データへの参照
public struct FightStats has key, store {
    id: UID,
    fight_id: String,
    walrus_blob_id: vector<u8>,    // 詳細統計のWalrus blob ID
    summary: FightStatsSummary,     // On-chainサマリー
}

public struct FightStatsSummary has store {
    total_strikes: u64,
    takedowns: u64,
    control_time_seconds: u64,
}
```

**メリット**:

- 大量の統計データを Walrus に保存してコスト削減
- On-chain にはサマリーのみ保存
- データの永続性と検証可能性を両立

## 2. SEAL 統合アイディア

### 2.1 秘密鍵管理 with SEAL

**課題**:

- 予測市場の運営者が API key などの秘密情報を安全に管理する必要がある
- Enclave の再起動時に秘密情報を再注入する必要がある

**解決策: SEAL (Secure Enclave Attestation Layer)**

```rust
// SEAL経由で秘密鍵を取得
use seal_sdk::{SealClient, SecretRequest};

async fn initialize_with_seal() -> Result<AppState, EnclaveError> {
    let seal_client = SealClient::new()?;

    // SEAL経由でAPI keyを取得
    let api_key = seal_client.get_secret(SecretRequest {
        secret_id: "fight-oracle-api-key".to_string(),
        policy: "only-registered-enclaves".to_string(),
    }).await?;

    // 一時的な鍵ペアを生成
    let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

    Ok(AppState { eph_kp, api_key })
}
```

**フロー**:

1. Enclave 起動時に SEAL に attestation document を提示
2. SEAL が検証後、API key を提供
3. Enclave はメモリ内でのみ使用（外部に流出しない）

### 2.2 Multi-Party Computation (MPC) Oracle

**構想**: 複数の Enclave で結果を検証し、合意形成

```rust
// SEAL Policyで複数Enclaveの合意を要求
public struct SEALPolicy has key {
    id: UID,
    required_confirmations: u64,  // 必要な確認数
    registered_enclaves: vector<ID>,
}

public fun settle_with_mpc(
    market: &mut LSMRMarket,
    results: vector<FightResultObject>,  // 複数Enclaveからの結果
    policy: &SEALPolicy,
) {
    // すべての結果が一致することを確認
    assert!(vector::length(&results) >= policy.required_confirmations, EMPCFailed);

    let first_winner = results[0].winner;
    for result in results {
        assert!(result.winner == first_winner, EMPCFailed);
    }

    // 合意が得られたので決済
    settle_market(market, determine_winner_index(&first_winner));
}
```

**メリット**:

- 単一 Enclave の障害に対する耐性
- さらに高い信頼性
- 分散化の度合いを向上

### 2.3 プライベートベット with SEAL

**構想**: ベット内容を秘匿したまま取引

```rust
// SEAL経由で暗号化されたベット
public struct PrivateBet has key {
    id: UID,
    market_id: ID,
    encrypted_position: vector<u8>,  // SEAL Enclaveでのみ復号可能
    commitment: vector<u8>,           // ポジションのコミットメント
}

// 決済時にのみ公開
public fun reveal_and_settle(
    bet: PrivateBet,
    decryption_proof: vector<u8>,
    enclave: &Enclave<SEAL>,
) {
    // SEAL Enclaveが復号してポジションを検証
    let position = enclave.decrypt_and_verify(
        bet.encrypted_position,
        decryption_proof
    );

    // 通常の決済プロセス
    settle_position(position);
}
```

**ユースケース**:

- VIP ユーザーの大口ベットを秘匿
- マーケットメイカーのポジションを隠す
- プライバシー保護

## 3. Nautilus + Walrus + SEAL の統合アーキテクチャ

### 完全統合システム

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (dApp)                       │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Nautilus │  │  Walrus  │  │   SEAL   │
│  Oracle  │  │ Storage  │  │ Secrets  │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   ▼
         ┌──────────────────┐
         │   Sui Blockchain  │
         │  - LSMR AMM       │
         │  - Fight Archive  │
         │  - User Positions │
         └──────────────────┘
```

### データフロー

```typescript
// 1. 試合開始 - Walrusに映像保存開始
const streamBlobIds = await startWalrusStream(fightId);

// 2. ベット - Nautilus Oracleで現在の統計取得
const liveStats = await nautilusOracle.getLiveStats(fightId);
updateMarketPrices(liveStats);

// 3. 秘密情報 - SEALで管理
const apiKey = await sealClient.getSecret("oracle-api-key");

// 4. 試合終了 - Nautilus Oracleで結果検証
const result = await nautilusOracle.verifyResult(fightId);

// 5. 映像アーカイブ - Walrusに永続保存
await walrusClient.archive(streamBlobIds, {
  epochs: 1000, // 長期保存
  metadata: { result },
});

// 6. 決済 - Sui上で実行
await settlementContract.settle(result);
```

## 4. 技術的な課題と解決策

### 4.1 Walrus のコスト最適化

**課題**: 大容量の映像保存コストが高い

**解決策**:

- HLS セグメントの適切な粒度（10 秒単位）
- 重要なシーンのみ長期保存
- ユーザー投票で保存期間を決定

```move
public struct VideoArchiveVote has key {
    id: UID,
    blob_id: vector<u8>,
    votes_for_archive: u64,
    votes_against: u64,
}

// 投票で保存期間を延長
public fun vote_to_archive(vote: &mut VideoArchiveVote) {
    if (vote.votes_for_archive > THRESHOLD) {
        // Walrusのepochを延長
        extend_walrus_storage(vote.blob_id, 100);
    }
}
```

### 4.2 SEAL のレイテンシ

**課題**: SEAL 経由の秘密取得に時間がかかる可能性

**解決策**:

- Enclave 起動時に一度だけ取得してキャッシュ
- 定期的なローテーション（24 時間ごと）

```rust
lazy_static! {
    static ref API_KEY_CACHE: RwLock<Option<(String, Instant)>> = RwLock::new(None);
}

async fn get_api_key() -> Result<String, Error> {
    let cache = API_KEY_CACHE.read().unwrap();

    if let Some((key, timestamp)) = cache.as_ref() {
        if timestamp.elapsed() < Duration::from_secs(86400) {
            return Ok(key.clone());
        }
    }

    drop(cache);

    // キャッシュ期限切れ or 未初期化 - SEALから取得
    let new_key = seal_client.get_secret("api-key").await?;
    let mut cache = API_KEY_CACHE.write().unwrap();
    *cache = Some((new_key.clone(), Instant::now()));

    Ok(new_key)
}
```

### 4.3 3 つのコンポーネントの整合性

**課題**: Nautilus / Walrus / SEAL のデータ整合性を保つ

**解決策**: Sui 上でメタデータを統合管理

```move
public struct FightRecord has key {
    id: UID,
    fight_id: String,

    // Nautilus Oracle
    result: FightResultObject,
    oracle_enclave_id: ID,

    // Walrus Storage
    video_blob_id: vector<u8>,
    stats_blob_id: vector<u8>,

    // SEAL Policy
    seal_policy_id: ID,
    verified_enclaves: vector<ID>,

    // Metadata
    timestamp: u64,
    verified: bool,
}
```

## 5. ビジネス価値の向上

### 5.1 完全分散型プラットフォーム

| コンポーネント | 役割              | 分散化レベル        |
| -------------- | ----------------- | ------------------- |
| **Sui**        | 決済・状態管理    | ⭐⭐⭐⭐⭐          |
| **Nautilus**   | 信頼できる Oracle | ⭐⭐⭐⭐ (AWS 依存) |
| **Walrus**     | 映像・データ保存  | ⭐⭐⭐⭐⭐          |
| **SEAL**       | 秘密管理          | ⭐⭐⭐⭐            |

### 5.2 ユーザー体験の向上

1. **透明性**: すべてのデータが Walrus + Sui で検証可能
2. **プライバシー**: SEAL でプライベートベット可能
3. **信頼性**: Nautilus で即時決済
4. **永続性**: Walrus で映像を永久保存

### 5.3 収益モデル

```typescript
// プラットフォーム手数料の配分
const platformFee = totalVolume * 0.02; // 2%

const allocation = {
  walrusStorage: platformFee * 0.3, // 映像保存コスト
  nautilusOperator: platformFee * 0.3, // Oracle運営コスト
  liquidityProviders: platformFee * 0.3, // LP報酬
  development: platformFee * 0.1, // 開発資金
};
```

## 6. 実装ロードマップ

### Phase 1 (現在) - Nautilus + LSMR AMM

✅ Nautilus Trust Oracle 実装
✅ LSMR AMM 実装
✅ 基本的な予測市場機能

### Phase 2 (3 ヶ月後) - Walrus 統合

- [ ] 試合映像の Walrus 保存
- [ ] 統計データの Walrus 保存
- [ ] アーカイブ機能

### Phase 3 (6 ヶ月後) - SEAL 統合

- [ ] SEAL 経由の秘密管理
- [ ] MPC Oracle（複数 Enclave）
- [ ] プライベートベット機能

### Phase 4 (9 ヶ月後) - 完全統合

- [ ] ライブストリーミング機能
- [ ] AI 解析統合
- [ ] クロスチェーン対応

## まとめ

### 現在の実装（Hackathon Scope）

- ✅ **Nautilus**: Trust Oracle for fight results
- ✅ **LSMR AMM**: Real-time prediction market

### 将来の拡張

- 🔮 **Walrus**: 映像・データの分散ストレージ
- 🔮 **SEAL**: 秘密管理と MPC Oracle
- 🔮 **Complete Integration**: 完全分散型プラットフォーム

Walrus Haulout Hackathon の 3 つのテーマすべてを活用することで、格闘技予測市場は次世代の分散型スポーツプラットフォームへと進化します。
