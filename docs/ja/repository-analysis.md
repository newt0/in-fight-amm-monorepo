# Nautilus リポジトリ解説レポート

## 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [Nautilus とは](#nautilusとは)
3. [アーキテクチャと設計](#アーキテクチャと設計)
4. [技術スタック](#技術スタック)
5. [ディレクトリ構造](#ディレクトリ構造)
6. [主要コンポーネント](#主要コンポーネント)
7. [ワークフロー](#ワークフロー)
8. [サンプルアプリケーション](#サンプルアプリケーション)
9. [セキュリティとトラストモデル](#セキュリティとトラストモデル)
10. [ビルドと開発環境](#ビルドと開発環境)
11. [まとめ](#まとめ)

## プロジェクト概要

**Nautilus**は、**Sui ブロックチェーン上での安全で検証可能なオフチェーン計算**を実現するためのフレームワークです。

- **開発元**: Mysten Labs
- **ライセンス**: Apache 2.0
- **リポジトリ**: https://github.com/MystenLabs/nautilus
- **目的**: AWS Nitro Enclaves を活用した Trusted Execution Environment (TEE) により、オフチェーンで複雑な計算を安全に実行し、その結果をブロックチェーン上で検証可能にする

このリポジトリには、再現可能なビルドテンプレート、ハイブリッドアプリケーション開発のためのパターン、および具体的な実装例が含まれています。

## Nautilus とは

### 解決する課題

ブロックチェーン上で直接実行するには、以下のような制約があります:

- **計算コストが高い**: 複雑な処理をオンチェーンで実行すると Gas 費用が膨大になる
- **プライバシーの懸念**: すべてのデータが公開される
- **外部データアクセスの制限**: ブロックチェーンから直接外部 API を呼び出すことは困難

### Nautilus のソリューション

Nautilus は、**Trusted Execution Environment (TEE)** を使用してオフチェーンで計算を実行し、その結果を暗号学的に検証可能な形でブロックチェーンに提供します。

**主な特徴:**

1. **検証可能性**: エンクレーブ内で実行されるコードが改ざんされていないことを PCR (Platform Configuration Register) 値で検証
2. **再現可能なビルド**: 同じソースコードから同じバイナリが生成されることを保証
3. **オンチェーン検証**: エンクレーブからの応答がブロックチェーン上で検証可能
4. **透明性**: ソースコードを公開し、誰でもビルドして PCR 値を確認可能

## アーキテクチャと設計

### システムアーキテクチャ

```
┌─────────────────┐
│  Dapp Frontend  │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
┌─────────┐  ┌──────────────────────┐
│   Sui   │  │  AWS Nitro Enclave   │
│ Smart   │  │  ┌────────────────┐  │
│Contract │  │  │ Nautilus Server│  │
│         │  │  │  (Rust)        │  │
│  - PCR  │  │  │  - Generate    │  │
│    登録 │  │  │    Ephemeral   │  │
│  - 署名 │  │  │    Key Pair    │  │
│    検証 │  │  │  - Fetch Data  │  │
│         │  │  │  - Sign Result │  │
└─────────┘  │  └────────────────┘  │
             │          ▲            │
             │          │            │
             │  ┌───────┴─────────┐ │
             │  │ Traffic         │ │
             │  │ Forwarder       │ │
             └──┴─────────────────┴─┘
                        │
                        ▼
                ┌───────────────┐
                │  External API │
                │ (e.g., Weather│
                │   Twitter)    │
                └───────────────┘
```

### 主要な設計原則

1. **信頼の最小化**: エンクレーブ内で生成された鍵ペアはエフェメラルで、外部に漏洩しない
2. **検証可能性**: すべての計算結果は暗号署名され、オンチェーンで検証される
3. **再現性**: ビルドプロセスが完全に再現可能で、誰でも PCR 値を確認できる
4. **透明性**: ソースコードが公開され、監査可能

## 技術スタック

### バックエンド (Rust)

- **言語**: Rust (Edition 2021)
- **Web フレームワーク**: Axum 0.7
- **非同期ランタイム**: Tokio 1.43.0
- **暗号ライブラリ**: fastcrypto (Mysten Labs 製、Ed25519 署名)
- **シリアライゼーション**: BCS (Binary Canonical Serialization), serde, serde_json
- **AWS Nitro**: nsm_api (Nitro Secure Module API)
- **HTTP クライアント**: reqwest 0.11

### スマートコントラクト (Move)

- **言語**: Move
- **ブロックチェーン**: Sui
- **主要モジュール**:
  - `enclave::enclave`: エンクレーブの登録と検証ロジック
  - サンプルアプリケーションモジュール (weather, twitter)

### インフラストラクチャ

- **コンテナ化**: Docker (Containerfile)
- **ビルドツールチェーン**: StageX (完全にソースからブートストラップされた決定論的ビルド環境)
- **TEE**: AWS Nitro Enclaves
- **ビルドツール**: Make
- **CI/CD**: GitHub Actions (rust.yml, move.yml)

## ディレクトリ構造

```
nautilus-research/
├── .cargo/
│   └── config.toml                 # Cargo設定
├── .github/
│   ├── workflows/
│   │   ├── rust.yml                # Rustビルド・テストワークフロー
│   │   └── move.yml                # Moveビルド・テストワークフロー
│   └── CODEOWNERS                  # コード所有者設定
├── src/
│   └── nautilus-server/            # エンクレーブ内で実行されるRustサーバー
│       ├── src/
│       │   ├── main.rs             # メインエントリポイント
│       │   ├── lib.rs              # ライブラリルート
│       │   ├── common.rs           # 共通ユーティリティ(attestation, healthcheck)
│       │   └── apps/               # アプリケーション実装
│       │       ├── weather-example/  # 天気APIの例
│       │       ├── twitter-example/  # Twitter検証の例
│       │       └── seal-example/     # Sealプロトコルの例
│       ├── Cargo.toml              # Rust依存関係
│       ├── run.sh                  # エンクレーブ起動スクリプト
│       └── traffic_forwarder.py    # トラフィック転送設定
├── move/
│   ├── enclave/                    # エンクレーブ登録・検証コントラクト
│   │   └── sources/
│   │       └── enclave.move
│   ├── weather-example/            # 天気アプリのMoveコントラクト
│   │   └── sources/
│   │       └── weather.move
│   ├── twitter-example/            # Twitter検証アプリのMoveコントラクト
│   │   └── sources/
│   │       └── twitter.move
│   └── seal-policy/                # Sealポリシー関連
│       └── sources/
│           ├── seal_policy.move
│           └── weather.move
├── scripts/
│   ├── license_check.sh            # ライセンスチェック
│   └── changed-files.sh            # 変更ファイル検出
├── Containerfile                   # エンクレーブイメージビルド定義
├── Makefile                        # ビルド自動化
├── configure_enclave.sh            # エンクレーブ設定スクリプト
├── expose_enclave.sh               # エンクレーブ公開スクリプト
├── register_enclave.sh             # オンチェーン登録スクリプト
├── update_weather.sh               # 天気データ更新スクリプト
├── reset_enclave.sh                # エンクレーブリセット
├── update.sh                       # 依存関係更新
├── README.md                       # プロジェクト概要
├── Design.md                       # 設計ドキュメント
├── UsingNautilus.md                # 使用方法ガイド
├── LICENSE                         # Apache 2.0ライセンス
└── rust-toolchain.toml             # Rustツールチェーン設定
```

## 主要コンポーネント

### 1. Nautilus Server (Rust)

#### `src/nautilus-server/src/main.rs`

エンクレーブ内で実行される HTTP サーバーのエントリポイント。

**主要機能:**

- **エフェメラルキーペアの生成**: 起動時に Ed25519 キーペアを生成
- **API エンドポイント**:
  - `GET /`: Ping エンドポイント
  - `GET /get_attestation`: Nitro attestation document を返す
  - `POST /process_data`: アプリケーション固有のデータ処理
  - `GET /health_check`: エンクレーブの健全性チェック
- **CORS 設定**: クロスオリジンリクエストの許可
- **シークレット管理**: AWS Secrets Manager から API キーを取得 (環境変数 `API_KEY`)

```rust
// キーペア生成
let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

// ステート管理
let state = Arc::new(AppState { eph_kp, api_key });

// ルーティング
let app = Router::new()
    .route("/", get(ping))
    .route("/get_attestation", get(get_attestation))
    .route("/process_data", post(process_data))
    .route("/health_check", get(health_check))
    .with_state(state)
    .layer(cors);
```

#### `src/nautilus-server/src/common.rs`

共通ユーティリティ関数群。

**主要構造体:**

- `IntentMessage<T>`: 署名対象のメッセージ構造
- `ProcessedDataResponse<T>`: 署名付きレスポンス
- `GetAttestationResponse`: attestation document を返すレスポンス
- `HealthCheckResponse`: ヘルスチェック結果

**主要関数:**

- `get_attestation()`: NSM (Nitro Secure Module) から attestation document を取得
- `health_check()`: 許可されたエンドポイントへの接続性をテスト
- `to_signed_response()`: データに署名を付与

#### `src/nautilus-server/src/apps/weather-example/mod.rs`

天気 API を呼び出してデータを取得し、署名して返すサンプル実装。

**データフロー:**

1. クライアントから location を受け取る
2. `api.weatherapi.com` から天気データを取得
3. タイムスタンプの新鮮性をチェック (1 時間以内)
4. `WeatherResponse` に location と temperature を格納
5. エフェメラルキーペアで署名
6. 署名付きレスポンスを返す

```rust
pub async fn process_data(
    State(state): State<Arc<AppState>>,
    Json(request): Json<ProcessDataRequest<WeatherRequest>>,
) -> Result<Json<ProcessedDataResponse<IntentMessage<WeatherResponse>>>, EnclaveError> {
    // 外部APIからデータ取得
    let url = format!("https://api.weatherapi.com/v1/current.json?key={}&q={}", ...);
    let response = reqwest::get(url).await?;

    // データ抽出と検証
    let temperature = json["current"]["temp_c"].as_f64().unwrap_or(0.0) as u64;

    // 署名して返す
    Ok(Json(to_signed_response(&state.eph_kp, WeatherResponse { ... }, ...)))
}
```

### 2. Move スマートコントラクト

#### `move/enclave/sources/enclave.move`

エンクレーブの登録と検証を行う中核的なスマートコントラクト。

**主要構造体:**

- **`Pcrs`**: Platform Configuration Register (PCR) 値を保持

  - PCR0: エンクレーブイメージファイル
  - PCR1: エンクレーブカーネル
  - PCR2: エンクレーブアプリケーション

- **`EnclaveConfig<phantom T>`**: エンクレーブの期待される PCR 値を定義

  - `name`: エンクレーブの名前
  - `pcrs`: 期待される PCR 値
  - `capability_id`: 更新権限を持つ Cap の ID
  - `version`: PCR のバージョン番号

- **`Enclave<phantom T>`**: 登録されたエンクレーブインスタンス

  - `pk`: エンクレーブの公開鍵
  - `config_version`: 対応する EnclaveConfig のバージョン
  - `owner`: エンクレーブの所有者アドレス

- **`Cap<phantom T>`**: EnclaveConfig を更新する権限

**主要関数:**

```move
// EnclaveConfigの作成
public fun create_enclave_config<T: drop>(
    cap: &Cap<T>,
    name: String,
    pcr0: vector<u8>,
    pcr1: vector<u8>,
    pcr2: vector<u8>,
    ctx: &mut TxContext,
)

// エンクレーブの登録
public fun register_enclave<T>(
    enclave_config: &EnclaveConfig<T>,
    document: NitroAttestationDocument,
    ctx: &mut TxContext,
)

// 署名の検証
public fun verify_signature<T, P: drop>(
    enclave: &Enclave<T>,
    intent_scope: u8,
    timestamp_ms: u64,
    payload: P,
    signature: &vector<u8>,
): bool

// PCRの更新
public fun update_pcrs<T: drop>(
    config: &mut EnclaveConfig<T>,
    cap: &Cap<T>,
    pcr0: vector<u8>,
    pcr1: vector<u8>,
    pcr2: vector<u8>,
)
```

#### `move/weather-example/sources/weather.move`

天気データを検証して NFT を発行するアプリケーション例。

**主要関数:**

```move
public fun update_weather(
    name: vector<u8>,
    timestamp_ms: u64,
    location: vector<u8>,
    temperature: u64,
    sig: &vector<u8>,
    enclave: &Enclave<WEATHER>,
    ctx: &mut TxContext
): WeatherNFT
```

この関数は:

1. `enclave::verify_signature()` で署名を検証
2. 検証成功時に `WeatherNFT` を発行
3. NFT には location と temperature が記録される

#### `move/twitter-example/sources/twitter.move`

Twitter アカウントと Sui アドレスを紐付ける検証アプリケーション。

**主要関数:**

```move
public fun mint_nft<T>(
    twitter_name: vector<u8>,
    timestamp_ms: u64,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext
): Twitter
```

エンクレーブが Twitter の投稿を検証し、その結果を署名。スマートコントラクトで署名を検証して NFT を発行。

### 3. ビルドシステム

#### `Containerfile`

再現可能なビルド環境を定義する Docker ファイル。

**特徴:**

- **StageX イメージ使用**: 完全にソースからブートストラップされた決定論的ビルドツールチェーン
- **マルチステージビルド**:
  1. `base`: 基本的なツールチェーン (binutils, gcc, rust, openssl など)
  2. `build`: Rust プロジェクトのビルドと initramfs の作成
  3. `install`: EIF (Enclave Image Format) ファイルの生成
  4. `package`: 最終成果物のパッケージング

**ビルドプロセス:**

```dockerfile
# Rustバイナリのビルド (静的リンク)
ENV RUSTFLAGS="-C target-feature=+crt-static -C relocation-model=static"
RUN cargo build --locked --no-default-features --features $ENCLAVE_APP --release --target x86_64-unknown-linux-musl

# initramfsの作成 (再現可能)
RUN find . -exec touch -hcd "@0" "{}" + -print0 \
    | sort -z \
    | cpio --reproducible --format=newc \
    | gzip --best > /build_cpio/rootfs.cpio

# EIFファイルの生成
RUN eif_build \
    --kernel /bzImage \
    --ramdisk /build_cpio/rootfs.cpio \
    --pcrs_output /nitro.pcrs \
    --output /nitro.eif
```

#### `Makefile`

ビルドプロセスを自動化。

**主要ターゲット:**

- `make out/nitro.eif`: エンクレーブイメージをビルド (デフォルトターゲット)
- `make run`: エンクレーブを実行
- `make run-debug`: デバッグモードでエンクレーブを実行
- `make update`: 依存関係を更新

```makefile
out/nitro.eif: $(shell git ls-files src) | out
    docker build \
        --tag $(REGISTRY)/enclaveos \
        --progress=plain \
        --platform linux/amd64 \
        --output type=local,rewrite-timestamp=true,dest=out \
        -f Containerfile \
        --build-arg ENCLAVE_APP=$(ENCLAVE_APP) \
        .
```

## ワークフロー

### 開発者側のワークフロー

```
1. アプリケーション開発
   ├─ Rustでエンクレーブロジック実装
   │  └─ src/nautilus-server/src/apps/my-app/mod.rs
   └─ Moveでスマートコントラクト実装
      └─ move/my-app/sources/my_app.move

2. ローカルビルドとテスト
   ├─ make ENCLAVE_APP=my-app
   └─ cat out/nitro.pcrs  # PCR値を確認

3. ソースコード公開
   └─ GitHubなどに公開リポジトリを作成

4. EnclaveConfigの登録
   ├─ Moveパッケージをデプロイ
   └─ PCR値をオンチェーンに登録

5. AWS Nitro Enclaveにデプロイ
   ├─ EC2インスタンスを起動
   ├─ リポジトリをクローン
   ├─ エンクレーブイメージをビルド
   └─ エンクレーブを起動

6. エンクレーブの登録
   ├─ /get_attestation で attestation document取得
   ├─ register_enclave()をオンチェーンで実行
   └─ エンクレーブの公開鍵を登録
```

### ユーザー側のワークフロー

```
1. (オプション) 検証
   ├─ ソースコードを取得
   ├─ ローカルでビルド
   └─ PCR値がオンチェーンの値と一致するか確認

2. エンクレーブにリクエスト
   └─ POST /process_data { payload: {...} }
      ↓
      {"response": {...}, "signature": "..."}

3. オンチェーンで検証
   ├─ スマートコントラクトに署名付きレスポンスを送信
   ├─ verify_signature()で検証
   └─ 検証成功時にアプリケーションロジックを実行
      (例: NFT発行、ステート更新など)
```

## サンプルアプリケーション

### 1. Weather Example

**目的**: 外部の天気 API からデータを取得し、検証可能な形で提供

**Rust 側の実装** (`src/nautilus-server/src/apps/weather-example/mod.rs`):

```rust
pub struct WeatherRequest {
    pub location: String,
}

pub struct WeatherResponse {
    pub location: String,
    pub temperature: u64,
}
```

**Move 側の実装** (`move/weather-example/sources/weather.move`):

```move
public struct WeatherNFT has key, store {
    id: UID,
    location: String,
    temperature: u64,
}
```

**使用例**:

```bash
# エンクレーブにリクエスト
curl -X POST http://<ENCLAVE_IP>:3000/process_data \
  -H "Content-Type: application/json" \
  -d '{"payload": {"location": "San Francisco"}}'

# レスポンス
{
  "response": {
    "intent": 0,
    "timestamp_ms": 1744683300000,
    "data": {
      "location": "San Francisco",
      "temperature": 13
    }
  },
  "signature": "77b6d8be225440d00f3d6eb52e91076a..."
}

# オンチェーンで検証してNFT発行
sui client call --function update_weather \
  --args <ENCLAVE_OBJECT_ID> <SIGNATURE> <TIMESTAMP> "San Francisco" 13
```

### 2. Twitter Example

**目的**: Twitter アカウントの所有権を証明し、Sui アドレスと紐付ける

**フロー**:

1. ユーザーが Twitter に特定のフォーマットで投稿
2. エンクレーブが Twitter API を使って投稿を検証
3. エンクレーブが `{twitter_name, sui_address}` に署名
4. スマートコントラクトで署名を検証し、Twitter NFT を発行

**Move 側の実装**:

```move
public struct Twitter has key, store {
    id: UID,
    twitter_name: String,
    sui_address: vector<u8>,
}

public fun mint_nft<T>(
    twitter_name: vector<u8>,
    timestamp_ms: u64,
    sig: &vector<u8>,
    enclave: &Enclave<T>,
    ctx: &mut TxContext
): Twitter
```

### 3. Seal Example

**目的**: SEAL (Secure Enclave Attestation Layer) プロトコルとの統合例

**特徴**:

- 2 フェーズブートストラップ
- ホスト専用の初期化サーバー
- より高度なシークレット管理

## セキュリティとトラストモデル

### トラストの基盤

Nautilus のセキュリティは以下の要素に依存しています:

#### 1. AWS Nitro Enclaves の信頼性

- **ハードウェアベースの分離**: エンクレーブは親 EC2 インスタンスから完全に分離
- **Attestation**: Nitro Secure Module (NSM) が attestation document を生成
- **ルート証明書**: AWS の証明書チェーンで検証可能

**AWS ルート証明書の検証**:

```bash
# Sui フレームワークに組み込まれた証明書
curl https://raw.githubusercontent.com/MystenLabs/sui/refs/heads/main/crates/sui-types/src/nitro_root_certificate.pem -o cert_sui.pem
sha256sum cert_sui.pem
# 6eb9688305e4bbca67f44b59c29a0661ae930f09b5945b5d1d9ae01125c8d6c0

# AWS 公式の証明書
curl https://aws-nitro-enclaves.amazonaws.com/AWS_NitroEnclaves_Root-G1.zip -o cert_aws.zip
unzip cert_aws.zip
sha256sum root.pem
# 6eb9688305e4bbca67f44b59c29a0661ae930f09b5945b5d1d9ae01125c8d6c0
```

#### 2. 再現可能なビルド

- **決定論的ビルド**: 同じソースコードから常に同じバイナリを生成
- **PCR 値**: ビルド成果物のハッシュ値がオンチェーンに登録される
- **検証可能性**: 誰でもソースコードからビルドして PCR 値を確認可能

**ビルドの再現性を保証する仕組み**:

```dockerfile
# タイムスタンプを固定
RUN find . -exec touch -hcd "@0" "{}" + -print0

# ソート済みファイルリスト
| sort -z

# 再現可能なアーカイブ作成
| cpio --reproducible --format=newc
```

#### 3. エフェメラルキーペア

- **起動時生成**: エンクレーブ起動時に新しいキーペアを生成
- **外部アクセス不可**: 秘密鍵はエンクレーブ内でのみ存在
- **Attestation でバインド**: 公開鍵が attestation document に含まれる

```rust
// main.rsでキーペア生成
let eph_kp = Ed25519KeyPair::generate(&mut rand::thread_rng());

// attestation documentに公開鍵を含める
let request = NsmRequest::Attestation {
    public_key: Some(ByteBuf::from(pk.as_bytes().to_vec())),
    ...
};
```

#### 4. オンチェーン検証

- **Attestation 検証**: AWS の証明書チェーンを使って attestation document を検証
- **PCR マッチング**: attestation に含まれる PCR 値が登録値と一致するか確認
- **署名検証**: エンクレーブからのレスポンスの署名を検証

```move
// enclave.move
fun load_pk<T>(enclave_config: &EnclaveConfig<T>, document: &NitroAttestationDocument): vector<u8> {
    // PCR値が一致するか確認
    assert!(document.to_pcrs() == enclave_config.pcrs, EInvalidPCRs);

    // attestationから公開鍵を取得
    (*document.public_key()).destroy_some()
}

// 署名検証
public fun verify_signature<T, P: drop>(
    enclave: &Enclave<T>,
    intent_scope: u8,
    timestamp_ms: u64,
    payload: P,
    signature: &vector<u8>,
): bool {
    let intent_message = create_intent_message(intent_scope, timestamp_ms, payload);
    let payload = bcs::to_bytes(&intent_message);
    return ed25519::ed25519_verify(signature, &enclave.pk, &payload)
}
```

### セキュリティ上の考慮事項

#### 1. トラフィック転送

- **制限されたアクセス**: エンクレーブは直接インターネットにアクセスできない
- **ホワイトリスト方式**: `allowed_endpoints.yaml` で許可するドメインを明示的に定義
- **親インスタンスによる転送**: EC2 インスタンスが socat を使って特定のドメインへのトラフィックのみ転送

```yaml
# allowed_endpoints.yaml
endpoints:
  - api.weatherapi.com
  - api.twitter.com
```

#### 2. シークレット管理

- **AWS Secrets Manager**: API キーなどのシークレットを安全に管理
- **環境変数**: エンクレーブ起動時にシークレットを注入
- **コードに含めない**: ソースコードにシークレットを直接記述しない

```bash
# configure_enclave.sh
Enter secret value: <API_KEY>
# → AWS Secrets Managerに保存
# → エンクレーブ起動時に環境変数として注入
```

#### 3. タイムスタンプ検証

- **新鮮性チェック**: 古いデータを拒否する仕組み
- **リプレイ攻撃対策**: タイムスタンプを含めて署名

```rust
// weather-example
if last_updated_timestamp_ms + 3_600_000 < current_timestamp {
    return Err(EnclaveError::GenericError(
        "Weather API timestamp is too old".to_string(),
    ));
}
```

#### 4. BCS シリアライゼーション

- **一貫性**: Rust と Move で同じ BCS シリアライゼーションを使用
- **テストによる検証**: 両側でシリアライゼーション結果をテスト

```rust
// Rust側テスト (weather-example/mod.rs)
#[test]
fn test_serde() {
    let payload = WeatherResponse { location: "San Francisco".to_string(), temperature: 13 };
    let intent_msg = IntentMessage::new(payload, 1744038900000, IntentScope::ProcessData);
    let signing_payload = bcs::to_bytes(&intent_msg).expect("should not fail");
    assert!(signing_payload == Hex::decode("0020b1d110960100000d53616e204672616e636973636f0d00000000000000").unwrap());
}
```

```move
// Move側テスト (enclave.move)
#[test]
fun test_serde() {
    let signing_payload = create_intent_message(0, 1744038900000, SigningPayload { ... });
    let bytes = bcs::to_bytes(&signing_payload);
    assert!(bytes == x"0020b1d110960100000d53616e204672616e636973636f0d00000000000000", 0);
}
```

### 潜在的な制限事項

1. **AWS への依存**: AWS Nitro Enclaves の可用性とセキュリティに依存
2. **再現可能ビルドの複雑性**: ビルド環境の完全な再現には技術的な知識が必要
3. **パフォーマンス**: エンクレーブのリソースは制限されている (CPU, メモリ)
4. **コスト**: EC2 インスタンスの運用コスト

## ビルドと開発環境

### ローカル開発

#### Rust サーバーのテスト

```bash
cd src/nautilus-server/

# 環境変数を設定
export RUST_LOG=debug
export API_KEY=045a27812dbe456392913223221306

# weather-exampleをビルド・実行
cargo run --features=weather-example --bin nautilus-server

# テスト
curl -X POST http://localhost:3000/process_data \
  -H "Content-Type: application/json" \
  -d '{"payload": {"location": "San Francisco"}}'
```

**注意**: `get_attestation` エンドポイントは NSM ドライバーを必要とするため、ローカルでは動作しません。

#### Move コントラクトのテスト

```bash
cd move/enclave
sui move build
sui move test

cd ../weather-example
sui move build
sui move test
```

### エンクレーブのビルド

```bash
# ビルド (ローカルで再現可能)
make ENCLAVE_APP=weather-example

# PCR値を確認
cat out/nitro.pcrs
# PCR0=14245f411c034ca453c7afcc666007919ca618da943e5a78823819e9bcee2084c4d9f582a3d4c99beb80ad1c3ea290f7
# PCR1=14245f411c034ca453c7afcc666007919ca618da943e5a78823819e9bcee2084c4d9f582a3d4c99beb80ad1c3ea290f7
# PCR2=21b9efbc184807662e966d34f390821309eeac6802309798826296bf3e8bec7c10edb30948c90ba67310f7b964fc500a

# 生成されるファイル
ls out/
# nitro.eif       # Enclave Image Format
# nitro.pcrs      # PCR値
# rootfs.cpio     # initramfs
```

### AWS での展開

```bash
# 1. AWS設定
export KEY_PAIR=<your-key-pair>
export AWS_ACCESS_KEY_ID=<your-key>
export AWS_SECRET_ACCESS_KEY=<your-secret>
export AWS_SESSION_TOKEN=<your-token>

# 2. エンクレーブの設定
sh configure_enclave.sh weather-example

# 3. EC2インスタンスに接続
ssh -i ~/.ssh/<KEY_PAIR>.pem ec2-user@<PUBLIC_IP>

# 4. リポジトリをクローン
git clone <YOUR_REPO_URL>
cd nautilus/

# 5. ビルドと実行
make ENCLAVE_APP=weather-example
make run
sh expose_enclave.sh

# 6. ヘルスチェック
curl http://<PUBLIC_IP>:3000/health_check
```

### デバッグモード

```bash
# デバッグモードで実行 (PCR値はすべて0になる)
make run-debug

# ログが表示される
# 注意: 本番環境では使用しないこと
```

### エンクレーブのリセット

```bash
sh reset_enclave.sh
# エンクレーブを停止して再起動
```

## まとめ

### Nautilus の強み

1. **検証可能性**: オフチェーン計算が暗号学的に検証可能
2. **透明性**: ソースコードとビルドプロセスが公開され、監査可能
3. **柔軟性**: さまざまなユースケースに対応できる拡張可能なアーキテクチャ
4. **セキュリティ**: AWS Nitro Enclaves による強固な分離とハードウェアベースの証明
5. **開発者体験**: テンプレートとサンプルにより、迅速なプロトタイピングが可能

### 適用可能なユースケース

1. **外部データオラクル**: 天気、株価、スポーツスコアなどの信頼できるデータソース
2. **プライベート計算**: センシティブなデータを扱う計算 (医療データ分析など)
3. **ID 検証**: ソーシャルメディアアカウントの所有権証明
4. **複雑な計算**: オンチェーンで実行するにはコストが高い計算
5. **API 統合**: Web2 サービスとブロックチェーンの橋渡し

### 今後の展開

- **他の TEE プロバイダー対応**: Intel SGX、AMD SEV などへの拡張可能性
- **より多くのサンプルアプリケーション**: コミュニティによる実装例の増加
- **セキュリティ監査**: 本番環境での利用に向けた監査の実施
- **パフォーマンス最適化**: より大規模な計算への対応

### 技術的洞察

Nautilus は、以下の技術的課題を解決する優れた例です:

1. **ブロックチェーンのスケーラビリティ**: オフチェーン計算により Gas コストを削減
2. **外部データの信頼性**: TEE により外部データソースを信頼できる形で利用
3. **プライバシー**: センシティブな計算をエンクレーブ内で実行
4. **相互運用性**: Web2 と Web3 の架け橋

### 参考リンク

- **公式ドキュメント**: https://docs.sui.io/concepts/cryptography/nautilus
- **GitHub リポジトリ**: https://github.com/MystenLabs/nautilus
- **サンプルアプリケーション**: https://github.com/MystenLabs/nautilus-twitter
- **Sui Discord**: https://discord.com/channels/916379725201563759/1361500579603546223
- **AWS Nitro Enclaves**: https://aws.amazon.com/ec2/nitro/nitro-enclaves/

**分析対象**: nautilus-research リポジトリ
