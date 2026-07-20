'use client'

import { View } from '@/types/task'

interface Props {
  active: View
  onChange: (view: View) => void
}

const TABS: { value: View; label: string }[] = [
  { value: 'today', label: '今日' },
  { value: 'task', label: 'タスク' },
  { value: 'want', label: 'やると決めた' },
  { value: 'memo', label: 'メモ' },
]

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {TABS.map(tab => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            active === tab.value
              ? tab.value === 'today'
                ? 'text-amber-600 border-b-2 border-amber-500'
                : 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
