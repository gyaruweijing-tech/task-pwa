'use client'

import { Category } from '@/types/task'

interface Props {
  active: Category
  onChange: (cat: Category) => void
}

const TABS: { value: Category; label: string }[] = [
  { value: 'task', label: 'タスク' },
  { value: 'want', label: 'やりたいこと' },
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
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
