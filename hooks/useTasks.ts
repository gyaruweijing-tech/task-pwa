'use client'

import { useState, useEffect } from 'react'
import { Task, Category, Priority } from '@/types/task'

const STORAGE_KEY = 'task-pwa-tasks'

function loadFromStorage(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const tasks: Task[] = raw ? JSON.parse(raw) : []
    // 古いデータにpriority/orderがない場合のマイグレーション
    return tasks.map((t, i) => ({
      ...t,
      priority: t.priority ?? ('medium' as Priority),
      order: t.order ?? i,
    }))
  } catch {
    return []
  }
}

function saveToStorage(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
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

  function deleteTask(id: string) {
    persist(tasks.filter(t => t.id !== id))
  }

  function clearCompleted(category: Category) {
    persist(tasks.filter(t => !(t.category === category && t.completed)))
  }

  function reorderTasks(category: Category, orderedIds: string[]) {
    const others = tasks.filter(t => t.category !== category || t.completed)
    const reordered = orderedIds.map((id, index) => {
      const task = tasks.find(t => t.id === id)!
      return { ...task, order: index }
    })
    persist([...others, ...reordered])
  }

  return { tasks, addTask, updateTask, toggleComplete, deleteTask, clearCompleted, reorderTasks }
}
