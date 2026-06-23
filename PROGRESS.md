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

## TODO / アイデア
- 今日リストの自動リセット（日付が変わったら today を自動オフ）は未実装。今は手動「クリア」
- 難易度 × 時間帯のおすすめ表示は意図的に不採用（手動判断）
