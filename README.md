## Cashflow Steps（オリジナル金融教育ゲーム / MVP）

初心者向けの「キャッシュフロー型」教育ゲームです。  
給与・固定費・投資（オファー）・イベントを30分程度で体験し、**不労所得（パッシブ収入）≥ 固定費**を目指します。

### 本格ゲームUI版（おすすめ）
Next.js + Phaserで「ゲームっぽい見た目（シーン遷移/カードUI）」のWeb版を同梱しました。

```bash
cd web
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

### 目的（勝利条件）
- **パッシブ収入 ≥ 固定費** になったら勝ち

### 特徴
- **ソロ**対応（1人プレイ）
- ルールはシンプル（毎月：収入/支出 → イベント → オファー購入）
- 職業・カードは `data/*.json` で編集可能

### 起動方法

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

### データの編集
- `data/roles.json`: 職業（給与・固定費など）
- `data/offers.json`: 投資/副業/学習などのオファー
- `data/events.json`: トラブル/支出/収入変動などのイベント

### 注意
本作は特定の既存ボードゲームの複製ではなく、**ルール/文言/データをオリジナルで設計**した教育用MVPです。
