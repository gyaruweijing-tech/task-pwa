'use client'

import { useState, useEffect } from 'react'
import { Task, Category, Priority, Difficulty } from '@/types/task'

const STORAGE_KEY = 'task-pwa-tasks'
const BACKUP_KEY = 'task-pwa-tasks-backup'

function migrate(tasks: Task[]): Task[] {
  return tasks.map((t, i) => ({
    ...t,
    priority: t.priority ?? ('medium' as Priority),
    order: t.order ?? i,
    today: t.today ?? false,
    inProgress: t.inProgress ?? false,
    // difficulty は任意。古いデータは未設定（undefined）のままでOK
    // 古いデータに memo カテゴリがない場合は変換不要
  }))
}

function loadFromStorage(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    let raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) raw = localStorage.getItem(BACKUP_KEY) // バックアップから復元
    return raw ? migrate(JSON.parse(raw)) : []
  } catch {
    return []
  }
}

function saveToStorage(tasks: Task[]) {
  const json = JSON.stringify(tasks)
  localStorage.setItem(STORAGE_KEY, json)
  localStorage.setItem(BACKUP_KEY, json) // 常に2重保存
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTasks(loadFromStorage())
  }, [])

  function persist(next: Task[]) {
    setTasks(next)
    saveToStorage(next)
  }

  function addTask(input: {
    title: string
    detail?: string
    dueDate?: string
    category: Category
    priority?: Priority
    difficulty?: Difficulty
    today?: boolean
    inProgress?: boolean
  }) {
    const categoryTasks = tasks.filter(t => t.category === input.category)
    const minOrder = categoryTasks.length > 0 ? Math.min(...categoryTasks.map(t => t.order)) : 0
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      detail: input.detail,
      dueDate: input.dueDate,
      completed: false,
      category: input.category,
      priority: input.priority ?? 'medium',
      difficulty: input.difficulty,
      today: input.today ?? false,
      inProgress: input.inProgress ?? false,
      order: minOrder - 1,
      createdAt: new Date().toISOString(),
    }
    persist([task, ...tasks])
  }

  function updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
    persist(tasks.map(t => (t.id === id ? { ...t, ...patch } : t)))
  }

  function toggleComplete(id: string) {
    persist(tasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t)))
  }

  function toggleToday(id: string) {
    persist(tasks.map(t => (t.id === id ? { ...t, today: !t.today } : t)))
  }

  function toggleInProgress(id: string) {
    persist(tasks.map(t => (t.id === id ? { ...t, inProgress: !t.inProgress } : t)))
  }

  function deleteTask(id: string) {
    persist(tasks.filter(t => t.id !== id))
  }

  function clearCompleted(category: Category) {
    persist(tasks.filter(t => !(t.category === category && t.completed)))
  }

  // 今日のタスクをすべて外す（毎朝のリセット用）
  function clearToday() {
    persist(tasks.map(t => (t.today ? { ...t, today: false } : t)))
  }

  function reorderTasks(category: Category, orderedIds: string[]) {
    const others = tasks.filter(t => t.category !== category || t.completed)
    const reordered = orderedIds.map((id, index) => {
      const task = tasks.find(t => t.id === id)!
      return { ...task, order: index }
    })
    persist([...others, ...reordered])
  }

  // 今日ビュー内の並び替え（カテゴリ横断なので order を直接振り直す）
  function reorderToday(orderedIds: string[]) {
    const idx = new Map(orderedIds.map((id, i) => [id, i]))
    persist(tasks.map(t => (idx.has(t.id) ? { ...t, order: idx.get(t.id)! } : t)))
  }

  function exportTasks(): string {
    return JSON.stringify(tasks, null, 2)
  }

  function importTasks(json: string): boolean {
    try {
      const imported: Task[] = JSON.parse(json)
      if (!Array.isArray(imported)) return false
      const migrated = migrate(imported)
      // 既存IDと重複しないものだけ追加（マージ）
      const existingIds = new Set(tasks.map(t => t.id))
      const merged = [...tasks, ...migrated.filter(t => !existingIds.has(t.id))]
      persist(merged)
      return true
    } catch {
      return false
    }
  }

  return {
    tasks,
    addTask,
    updateTask,
    toggleComplete,
    toggleToday,
    toggleInProgress,
    deleteTask,
    clearCompleted,
    clearToday,
    reorderTasks,
    reorderToday,
    exportTasks,
    importTasks,
  }
}
