'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Task, Category } from '@/types/task'
import TaskItem from './TaskItem'

interface Props {
  tasks: Task[]
  category: Category
  onToggle: (id: string) => void
  onTap: (task: Task) => void
  onClearCompleted: (cat: Category) => void
  onReorder: (category: Category, orderedIds: string[]) => void
}

export default function TaskList({ tasks, category, onToggle, onTap, onClearCompleted, onReorder }: Props) {
  const [showCompleted, setShowCompleted] = useState(false)

  const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }
  const active = tasks
    .filter(t => t.category === category && !t.completed)
    .sort((a, b) => {
      const pd = PRIORITY_ORDER[a.priority ?? 'medium'] - PRIORITY_ORDER[b.priority ?? 'medium']
      if (pd !== 0) return pd
      return (a.order ?? 0) - (b.order ?? 0)
    })
  const completed = tasks.filter(t => t.category === category && t.completed)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active: dragActive, over } = event
    if (!over || dragActive.id === over.id) return

    const ids = active.map(t => t.id)
    const oldIndex = ids.indexOf(dragActive.id as string)
    const newIndex = ids.indexOf(over.id as string)
    const reordered = [...ids]
    reordered.splice(oldIndex, 1)
    reordered.splice(newIndex, 0, dragActive.id as string)
    onReorder(category, reordered)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-28">
      {active.length === 0 && completed.length === 0 && (
        <p className="text-center text-gray-400 text-sm mt-20">
          {category === 'task' ? 'タスクがありません' : 'やりたいことがありません'}
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={active.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-gray-100">
            {active.map(task => (
              <TaskItem key={task.id} task={task} onToggle={onToggle} onTap={onTap} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
