# Meta Pixel Conversions API (CAPI)

Meta Pixel Conversions API（CAPI）を実装したNext.jsアプリケーションです。
サーバーサイドでイベントトラッキングを行い、データの正確性とプライバシー保護を強化します。

## 特徴

- 🔐 SHA256によるPII（個人識別情報）のハッシュ化
- 🌐 CORS対応
- 🔄 重複排除（event_id使用）
- 🧪 テストイベント対応
- 📱 クライアントIP・UAの自動取得

## セットアップ

1. **依存関係をインストール:**
```bash
npm install
```

2. **環境変数を設定:**
```bash
# .envファイルを作成
META_PIXEL_ID=your_pixel_id_here
META_ACCESS_TOKEN=your_access_token_here
META_API_VERSION=v21.0
ALLOWED_ORIGIN=https://yourdomain.com
TEST_EVENT_CODE=your_test_event_code_here
```

3. **開発サーバーを起動:**
```bash
npm run dev
```

4. **ブラウザで確認:**
`http://localhost:3000` を開いてアプリケーションを確認

## API使用方法

### Conversions API エンドポイント
`POST /api/capi`

```javascript
const response = await fetch('/api/capi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    event_id: 'unique_event_id_' + Date.now(),
    action_source: 'website',
    user: {
      email: 'user@example.com',
      phone: '+1234567890',
      fbp: '_fbp_cookie_value',
      fbc: '_fbc_cookie_value'
    },
    custom_data: {
      currency: 'USD',
      value: 99.99,
      content_ids: ['product_123'],
      content_type: 'product'
    },
    test_event_code: 'TEST12345' // テスト時のみ
  })
});
```

## ファイル構造

```
meta-pixel-capi/
├─ .gitignore           # Git除外ファイル
├─ package.json         # 依存関係とスクリプト
├─ next.config.js       # Next.js設定
├─ README.md           # このファイル
└─ pages/
   ├─ index.js         # メインページ
   └─ api/
      └─ capi.js       # Meta Conversions API エンドポイント
```

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `META_PIXEL_ID` | Meta Pixelの ID | ✅ |
| `META_ACCESS_TOKEN` | Meta API アクセストークン | ✅ |
| `META_API_VERSION` | Meta API バージョン（デフォルト: v21.0） | ❌ |
| `ALLOWED_ORIGIN` | CORS許可オリジン（デフォルト: *） | ❌ |
| `TEST_EVENT_CODE` | テストイベントコード | ❌ |

## デプロイ

### Vercel
```bash
npm run build
vercel --prod
```

### その他のプラットフォーム
```bash
npm run build
npm start
```

## 開発

Meta Businessマネージャーでイベントの受信状況を確認できます。
テスト環境では `test_event_code` を使用してテストイベントを送信してください。
