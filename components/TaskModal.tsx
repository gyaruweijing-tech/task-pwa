'use client'

import { useEffect, useRef, useState } from 'react'
import { Task, Category, Priority } from '@/types/task'
import DateTimePicker from './DateTimePicker'

interface AddMode {
  mode: 'add'
  category: Category
}
interface EditMode {
  mode: 'edit'
  task: Task
}

type Props = (AddMode | EditMode) & {
  onClose: () => void
  onSave: (data: {
    title: string
    detail?: string
    dueDate?: string
    priority: Priority
  }) => void
  onDelete?: () => void
}

const TASK_PRIORITIES: { value: Priority; label: string; color: string; active: string }[] = [
  { value: 'high',   label: '高',  color: 'border-red-200 text-red-500',       active: 'bg-red-500 text-white border-red-500' },
  { value: 'medium', label: '中',  color: 'border-yellow-200 text-yellow-500', active: 'bg-yellow-400 text-white border-yellow-400' },
  { value: 'low',    label: '低',  color: 'border-gray-200 text-gray-400',     active: 'bg-gray-400 text-white border-gray-400' },
]

const WANT_PRIORITIES: { value: Priority; label: string; color: string; active: string }[] = [
  { value: 'high',   label: '超気になる', color: 'border-purple-200 text-purple-500', active: 'bg-purple-500 text-white border-purple-500' },
  { value: 'medium', label: '気になる',   color: 'border-blue-200 text-blue-500',     active: 'bg-blue-500 text-white border-blue-500' },
  { value: 'low',    label: 'なんとなく', color: 'border-gray-200 text-gray-400',     active: 'bg-gray-400 text-white border-gray-400' },
]

function splitDueDate(dueDate?: string): { date: string; time: string } {
  if (!dueDate) return { date: '', time: '' }
  if (dueDate.includes('T')) {
    const [date, time] = dueDate.split('T')
    return { date, time }
  }
  return { date: dueDate, time: '' }
}

function formatDateTimeLabel(date: string, time: string): string {
  const d = new Date(date + 'T00:00:00')
  const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  return time ? `${label} ${time}` : label
}

export default function TaskModal(props: Props) {
  const isEdit = props.mode === 'edit'
  const initial = isEdit ? props.task : null
  const category = isEdit ? props.task.category : props.category
  const { date: initDate, time: initTime } = splitDueDate(initial?.dueDate)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [detail, setDetail] = useState(initial?.detail ?? '')
  const [date, setDate] = useState(initDate)
  const [time, setTime] = useState(initTime)
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [showPicker, setShowPicker] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  function handleSave() {
    if (!title.trim()) return
    let dueDate: string | undefined
    if (date && time) dueDate = `${date}T${time}`
    else if (date) dueDate = date
    props.onSave({ title: title.trim(), detail: detail.trim() || undefined, dueDate, priority })
    props.onClose()
  }

  const priorities = category === 'want' ? WANT_PRIORITIES : TASK_PRIORITIES

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
        onClick={e => { if (e.target === e.currentTarget) props.onClose() }}
      >
        <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {isEdit ? '編集' : category === 'task' ? 'タスクを追加' : 'やると決めたことを追加'}
            </h2>
            <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            <input
              ref={titleRef}
              type="text"
              placeholder="タイトル"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSave() }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="詳細（任意）"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            />

            <div>
              <p className="text-xs text-gray-400 mb-1.5">
                {category === 'want' ? '好奇心の度合い' : '優先順位'}
              </p>
              <div className="flex gap-2">
                {priorities.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                      priority === p.value ? p.active : p.color + ' hover:opacity-70'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowPicker(true)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                date
                  ? 'border-blue-300 bg-blue-50 text-blue-600'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {date ? formatDateTimeLabel(date, time) : '日時を追加'}
            </button>
          </div>

          <div className="flex gap-2 mt-5">
            {isEdit && props.onDelete && (
              <button
                onClick={() => { props.onDelete!(); props.onClose() }}
                className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isEdit ? '保存' : '追加'}
            </button>
          </div>
        </div>
      </div>

      {showPicker && (
        <DateTimePicker
          date={date}
          time={time}
          onConfirm={(d, t) => { setDate(d); setTime(t) }}
          onClear={() => { setDate(''); setTime('') }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
