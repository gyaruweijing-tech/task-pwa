export type Category = 'task' | 'want' | 'memo'
export type Priority = 'high' | 'medium' | 'low'
export type Difficulty = 'hard' | 'medium' | 'easy'

// 表示用のビュー（カテゴリ + 横断ビュー「今日」）
export type View = 'today' | Category

export interface Task {
  id: string
  title: string
  detail?: string
  dueDate?: string
  completed: boolean
  category: Category
  priority: Priority
  difficulty?: Difficulty
  today?: boolean      // 今日やる（横断フラグ）
  inProgress?: boolean // 進行中（長期プロジェクトのピン）
  order: number
  createdAt: string
}
