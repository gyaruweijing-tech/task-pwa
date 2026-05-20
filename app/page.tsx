'use client'

import { useState } from 'react'
import { Category, Task } from '@/types/task'
import { useTasks } from '@/hooks/useTasks'
import CategoryTabs from '@/components/CategoryTabs'
import TaskList from '@/components/TaskList'
import TaskModal from '@/components/TaskModal'

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; task: Task }
  | null

export default function Home() {
  const [category, setCategory] = useState<Category>('task')
  const [modal, setModal] = useState<ModalState>(null)
  const { tasks, addTask, updateTask, toggleComplete, deleteTask, clearCompleted } = useTasks()

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-white">
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-xl font-bold text-gray-800">わたしのタスク管理</h1>
      </header>

      <CategoryTabs active={category} onChange={setCategory} />

      <TaskList
        tasks={tasks}
        category={category}
        onToggle={toggleComplete}
        onTap={task => setModal({ type: 'edit', task })}
        onClearCompleted={clearCompleted}
      />

      {/* Google Tasks風 FAB */}
      <button
        onClick={() => setModal({ type: 'add' })}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-40"
        aria-label="タスクを追加"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {modal?.type === 'add' && (
        <TaskModal
          mode="add"
          category={category}
          onClose={() => setModal(null)}
          onSave={data => addTask({ ...data, category })}
        />
      )}

      {modal?.type === 'edit' && (
        <TaskModal
          mode="edit"
          task={modal.task}
          onClose={() => setModal(null)}
          onSave={data => updateTask(modal.task.id, data)}
          onDelete={() => deleteTask(modal.task.id)}
        />
      )}
    </div>
  )
}
