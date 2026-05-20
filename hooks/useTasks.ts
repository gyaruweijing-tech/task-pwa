'use client'

import { useState, useEffect } from 'react'
import { Task, Category } from '@/types/task'

const STORAGE_KEY = 'task-pwa-tasks'

function loadFromStorage(): Task[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
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

  function addTask(input: { title: string; detail?: string; dueDate?: string; category: Category }) {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      detail: input.detail,
      dueDate: input.dueDate,
      completed: false,
      category: input.category,
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

  return { tasks, addTask, updateTask, toggleComplete, deleteTask, clearCompleted }
}
