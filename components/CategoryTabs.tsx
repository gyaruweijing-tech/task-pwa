'use client'

import { Category } from '@/types/task'

interface Props {
  active: Category
  onChange: (cat: Category) => void
}

export default function CategoryTabs({ active, onChange }: Props) {
  return (
    <div className="flex border-b border-gray-200">
      {(['task', 'want'] as Category[]).map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            active === cat
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {cat === 'task' ? 'タスク' : 'やりたいこと'}
        </button>
      ))}
    </div>
  )
}
