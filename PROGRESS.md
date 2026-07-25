# task-pwa 進捗

Next.js 16 製のタスク管理 PWA（localStorage 保存・通知・PWA対応）。

## データ保存の仕組み（重要）
- 保存先はブラウザの **localStorage**（ファイルではない）
  - `task-pwa-tasks` ＋ `task-pwa-tasks-backup` の 2 重保存（[hooks/useTasks.ts](hooks/useTasks.ts)）
- `migrate()` が古いデータに無いフィールドを自動補完 → **フィールド追加の更新では既存データは消えない**
- データが消えるのは localStorage 自体が消えたとき:
  - ブラウザのサイトデータ削除 / 別URL・別ポートで開く / 別ブラウザ・シークレット
- 保険: メニュー →「データをエクスポート」で JSON 保存。インポートでマージ復元可

## 2026-06-23 更新：今日タブ・進行中・難易度

### 追加した機能
1. **「今日」タブ**（タブ左端、横断ビュー）
   - 全カテゴリから `today` フラグの付いたタスクを集約
   - 各タスクの ☀️ ボタンで「今日やる分」をワンタップで追加／解除（既存タスクからの移動）
   - 「今日のリストをクリア」で毎朝まとめてリセット可能
   - 今日ビューでの追加は task カテゴリ＋today=true 扱い
2. **進行中（inProgress）**
   - タブではなくフラグ。編集モーダルでトグル
   - 各リストで最上部にピン留め＋緑の「進行中」バッジ（長期プロジェクト用）
3. **難易度タグ（difficulty）**
   - 🌅 難しい（朝向き）/ ☀️ ふつう（昼向き）/ 🌙 簡単（夜向き）
   - 哲学：難しい=朝、中くらい=昼、簡単=夜
   - 並べ替えはしない（自分で判断する方針）。タスクに色付きチップで表示

### 型の追加（types/task.ts）
- `difficulty?: 'hard' | 'medium' | 'easy'`
- `today?: boolean`
- `inProgress?: boolean`
- `View = 'today' | Category`（表示用ビュー）

### 変更ファイル
- types/task.ts / hooks/useTasks.ts / components/CategoryTabs.tsx
- components/TaskList.tsx / components/TaskItem.tsx / components/TaskModal.tsx
- app/page.tsx

### 検証
- `npx tsc --noEmit` パス
- `npm run build` 成功（型チェック込み）

## 2026-07-25 更新：項目の断捨離（今日 / メモ / 難易度 / 進行中 を削除）

「項目が多すぎる」ため、ほとんど使っていない機能を UI ごと削除。

### 削除したもの
1. **「今日」タブと ☀️ 今日やるトグル**（`today` フラグ、今日のリストをクリア、今日ビュー内の並び替え）
2. **「メモ」タブ**（`memo` カテゴリ）
3. **難易度タグ**（`difficulty`：🌅難しい / ☀️ふつう / 🌙簡単）
4. **進行中バッジ**（`inProgress` とピン留め）

### 残ったもの
- タブは **タスク / やると決めた** の 2 つ（初期表示はタスク）
- 優先順位、詳細、日時、ドラッグ並び替え、完了済み、エクスポート／インポート、通知

### 既存データの扱い（消さない方針）
- localStorage のデータはそのまま。デプロイでは消えない
- 既存の **メモは読み込み時に `task` カテゴリへ自動移動**（非表示になって行方不明にならないように）
- `today` / `inProgress` / `difficulty` の値は JSON 内に残るだけで、UI からは参照しない
  （将来復活させたくなったら値はそのまま使える）

### 検証
- `npx tsc --noEmit` パス
- `npm run build` 成功

## TODO / アイデア
- 難易度 × 時間帯のおすすめ表示は意図的に不採用（手動判断）
