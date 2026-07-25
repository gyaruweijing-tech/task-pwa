'use client'

import { useEffect, useRef, useState } from 'react'
import { Category, Task } from '@/types/task'
import { useTasks } from '@/hooks/useTasks'
import CategoryTabs from '@/components/CategoryTabs'
import TaskList from '@/components/TaskList'
import TaskModal from '@/components/TaskModal'
import DateTimePicker from '@/components/DateTimePicker'

type ModalState =
  | { type: 'add' }
  | { type: 'edit'; task: Task }
  | null

export default function Home() {
  const [view, setView] = useState<Category>('task')
  const [modal, setModal] = useState<ModalState>(null)
  const [datePickerTask, setDatePickerTask] = useState<Task | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const { tasks, addTask, updateTask, toggleComplete, deleteTask, clearCompleted, reorderTasks, exportTasks, importTasks } = useTasks()

  // 通知許可状態を確認
  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifStatus(Notification.permission)
    }
  }, [])

  // 期限切れ・今日締め切りのタスクを通知（起動時1回）
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const now = new Date()
    const notifiedKey = 'task-pwa-notified-' + new Date().toDateString()
    if (sessionStorage.getItem(notifiedKey)) return

    const due = tasks.filter(t => !t.completed && t.dueDate)
    const overdue = due.filter(t => {
      const d = new Date(t.dueDate!.includes('T') ? t.dueDate! : t.dueDate! + 'T00:00:00')
      return d <= now
    })
    if (overdue.length > 0) {
      new Notification('期限のタスクがあります', {
        body: overdue.map(t => t.title).join('\n'),
        icon: '/icons/icon-192.png',
      })
      sessionStorage.setItem(notifiedKey, '1')
    }
  }, [tasks])

  async function requestNotification() {
    if (typeof Notification === 'undefined') return
    const result = await Notification.requestPermission()
    setNotifStatus(result)
    setMenuOpen(false)
  }

  function handleExport() {
    const json = exportTasks()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenuOpen(false)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const json = ev.target?.result as string
      const ok = importTasks(json)
      alert(ok ? 'インポートしました' : 'インポートに失敗しました')
    }
    reader.readAsText(file)
    e.target.value = ''
    setMenuOpen(false)
  }

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-white">
      <header className="px-4 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">わたしのタスク管理</h1>

        {/* メニューボタン */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="メニュー"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-48 text-sm">
                {notifStatus !== 'granted' && (
                  <button
                    onClick={requestNotification}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    通知を有効にする
                  </button>
                )}
                <button
                  onClick={handleExport}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  データをエクスポート
                </button>
                <button
                  onClick={() => importRef.current?.click()}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-gray-700"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  データをインポート
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      <CategoryTabs active={view} onChange={setView} />

      <TaskList
        tasks={tasks}
        view={view}
        onToggle={toggleComplete}
        onTap={task => setModal({ type: 'edit', task })}
        onDateTap={task => setDatePickerTask(task)}
        onClearCompleted={clearCompleted}
        onReorder={reorderTasks}
      />

      {/* FAB */}
      <button
        onClick={() => setModal({ type: 'add' })}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center z-40"
        aria-label="追加"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {modal?.type === 'add' && (
        <TaskModal
          mode="add"
          category={view}
          onClose={() => setModal(null)}
          onSave={data => addTask({ ...data, category: view })}
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

      {/* 日付直接タップで開くDateTimePicker */}
      {datePickerTask && (() => {
        const hasTime = datePickerTask.dueDate?.includes('T') ?? false
        const [initDate, initTime] = hasTime
          ? datePickerTask.dueDate!.split('T')
          : [datePickerTask.dueDate ?? '', '']
        return (
          <DateTimePicker
            date={initDate}
            time={initTime}
            onConfirm={(d, t) => {
              const dueDate = d && t ? `${d}T${t}` : d || undefined
              updateTask(datePickerTask.id, { dueDate })
              setDatePickerTask(null)
            }}
            onClear={() => {
              updateTask(datePickerTask.id, { dueDate: undefined })
              setDatePickerTask(null)
            }}
            onClose={() => setDatePickerTask(null)}
          />
        )
      })()}
    </div>
  )
}
