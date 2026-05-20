export type Category = 'task' | 'want'

export interface Task {
  id: string
  title: string
  detail?: string
  dueDate?: string // "YYYY-MM-DD"
  completed: boolean
  category: Category
  createdAt: string
}
