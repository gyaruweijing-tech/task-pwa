'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task, Difficulty } from '@/types/task'

interface Props {
  task: Task
  onToggle: (id: string) => void
  onTap: (task: Task) => void
  onDateTap: (task: Task) => void
  onToggleToday: (id: string) => void
}

const PRIORITY_STYLE = {
  high:   { dot: 'bg-red-500',    badge: 'text-red-500' },
  medium: { dot: 'bg-yellow-400', badge: 'text-yellow-500' },
  low:    { dot: 'bg-gray-300',   badge: 'text-gray-400' },
}

const WANT_PRIORITY_STYLE = {
  high:   { dot: 'bg-purple-500', badge: 'text-purple-500' },
  medium: { dot: 'bg-blue-400',   badge: 'text-blue-500' },
  low:    { dot: 'bg-gray-300',   badge: 'text-gray-400' },
}

// 難易度チップ：哲学（難=朝/中=昼/易=夜）を絵文字で表現
const DIFFICULTY_STYLE: Record<Difficulty, { label: string; chip: string }> = {
  hard:   { label: '🌅 難しい', chip: 'bg-orange-50 text-orange-600 border-orange-200' },
  medium: { label: '☀️ ふつう', chip: 'bg-amber-50 text-amber-600 border-amber-200' },
  easy:   { label: '🌙 簡単',   chip: 'bg-indigo-50 text-indigo-500 border-indigo-200' },
}

function dueDateLabel(dueDate: string): { text: string; color: string } {
  const hasTime = dueDate.includes('T')
  const due = new Date(hasTime ? dueDate : dueDate + 'T00:00:00')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(due)
  dueDay.setHours(0, 0, 0, 0)
  const diff = Math.floor((dueDay.getTime() - today.getTime()) / 86400000)

  const timeStr = hasTime
    ? due.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    : null

  const isPast = hasTime ? due < new Date() : diff < 0

  if (isPast) {
    const base = diff === 0 ? '今日' : diff === -1 ? '昨日' : `${due.getMonth() + 1}/${due.getDate()}`
    return { text: timeStr ? `${base} ${timeStr}` : '期限切れ', color: 'text-red-500' }
  }
  if (diff === 0) return { text: timeStr ? `今日 ${timeStr}` : '今日', color: 'text-red-500' }
  if (diff === 1) return { text: timeStr ? `明日 ${timeStr}` : '明日', color: 'text-yellow-500' }
  return {
    text: timeStr
      ? `${due.getMonth() + 1}/${due.getDate()} ${timeStr}`
      : `${due.getMonth() + 1}/${due.getDate()}`,
    color: 'text-gray-400',
  }
}

export default function TaskItem({ task, onToggle, onTap, onDateTap, onToggleToday }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  const styleMap = task.category === 'want' ? WANT_PRIORITY_STYLE : PRIORITY_STYLE
  const priority = styleMap[task.priority ?? 'medium']
  const diff = task.difficulty ? DIFFICULTY_STYLE[task.difficulty] : null

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-2 px-3 py-3 bg-white transition-opacity ${
        task.completed ? 'opacity-40' : 'opacity-100'
      } ${isDragging ? 'shadow-lg rounded-xl' : ''}`}
    >
      {/* ドラッグハンドル（memoカテゴリでも表示） */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5"
        aria-label="並び替え"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 4a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9 10.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM9 17a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm6 0a1.5 1.5 0 110 3 1.5 1.5 0 010-3z"/>
        </svg>
      </button>

      {task.category !== 'memo' && (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-2 ${priority.dot}`} />
      )}

      {/* チェックボタン */}
      <button
        onClick={() => onToggle(task.id)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
          task.completed
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-400 hover:border-blue-400'
        }`}
        aria-label={task.completed ? '未完了に戻す' : '完了にする'}
      >
        {task.completed && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <button onClick={() => onTap(task)} className="w-full text-left">
          <p className={`text-sm leading-snug ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {task.title}
          </p>
        </button>

        {/* バッジ類：進行中 / 難易度 */}
        {(task.inProgress || diff) && (
          <div className="flex flex-wrap items-center gap-1 mt-1">
            {task.inProgress && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                進行中
              </span>
            )}
            {diff && (
              <span className={`inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${diff.chip}`}>
                {diff.label}
              </span>
            )}
          </div>
        )}

        {task.detail && (
          <div>
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-full text-left"
            >
              <p className={`text-xs text-gray-400 mt-0.5 ${expanded ? 'whitespace-pre-wrap break-words' : 'truncate'}`}>
                {task.detail}
              </p>
            </button>
          </div>
        )}

        {task.dueDate && (
          <button
            onClick={() => onDateTap(task)}
            className={`text-xs mt-0.5 ${dueDateLabel(task.dueDate).color} hover:underline`}
          >
            {dueDateLabel(task.dueDate).text}
          </button>
        )}
      </div>

      {/* 今日に追加 / 外す クイックトグル（memoは対象外） */}
      {task.category !== 'memo' && !task.completed && (
        <button
          onClick={() => onToggleToday(task.id)}
          className={`flex-shrink-0 p-1.5 rounded-full transition-colors mt-0.5 ${
            task.today
              ? 'text-amber-500 bg-amber-50'
              : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
          }`}
          aria-label={task.today ? '今日から外す' : '今日に追加'}
          title={task.today ? '今日から外す' : '今日やる'}
        >
          <svg className="w-5 h-5" fill={task.today ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        </button>
      )}
    </div>
  )
}
