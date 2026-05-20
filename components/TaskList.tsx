'use client'

import { useState } from 'react'
import { Task, Category } from '@/types/task'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  category: Category
  onToggle: (id: string) => void
  onTap: (task: Task) => void
  onClearCompleted: (cat: Category) => void
}

export default function TaskList({ tasks, category, onToggle, onTap, onClearCompleted }: Props) {
  const [showCompleted, setShowCompleted] = useState(false)

  const active = tasks.filter(t => t.category === category && !t.completed)
  const completed = tasks.filter(t => t.category === category && t.completed)

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {active.length === 0 && completed.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-20">
          {category === 'task' ? 'タスクがありません' : 'やりたいことがありません'}
        </p>
      )}

      {/* アクティブなタスク */}
      <div className="divide-y divide-gray-100">
        {active.map(task => (
          <TaskItem key={task.id} task={task} onToggle={onToggle} onTap={onTap} />
        ))}
      </div>

      {/* 完了済みセクション（一番下） */}
      {completed.length > 0 && (
        <div className="mt-4 border-t border-gray-100">
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="w-full flex items-center gap-2 px-4 py-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className={`w-3 h-3 transition-transform ${showCompleted ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            完了済み（{completed.length}件）
          </button>

          {showCompleted && (
            <>
              <div className="divide-y divide-gray-100">
                {completed.map(task => (
                  <TaskItem key={task.id} task={task} onToggle={onToggle} onTap={onTap} />
                ))}
              </div>
              <button
                onClick={() => onClearCompleted(category)}
                className="w-full text-xs text-red-400 hover:text-red-600 py-3 transition-colors"
              >
                完了済みをすべて削除
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
