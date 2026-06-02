export type Category = 'task' | 'want' | 'memo'
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  detail?: string
  dueDate?: string
  completed: boolean
  category: Category
  priority: Priority
  order: number
  createdAt: string
}
