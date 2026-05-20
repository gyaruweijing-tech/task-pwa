'use client'

import { useState } from 'react'

interface Props {
  date: string   // "YYYY-MM-DD" or ""
  time: string   // "HH:mm" or ""
  onConfirm: (date: string, time: string) => void
  onClear: () => void
  onClose: () => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function firstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function DateTimePicker({ date, time, onConfirm, onClear, onClose }: Props) {
  const today = new Date()

  const initDate = date ? new Date(date + 'T00:00:00') : today
  const [viewYear, setViewYear] = useState(initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initDate.getMonth())
  const [selectedDate, setSelectedDate] = useState(date)     // "YYYY-MM-DD"
  const [timeEnabled, setTimeEnabled] = useState(!!time)
  const [selectedTime, setSelectedTime] = useState(time || '09:00')

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function selectDay(day: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    setSelectedDate(`${viewYear}-${mm}-${dd}`)
  }

  function handleConfirm() {
    if (!selectedDate) { onClose(); return }
    onConfirm(selectedDate, timeEnabled ? selectedTime : '')
    onClose()
  }

  const totalDays = daysInMonth(viewYear, viewMonth)
  const startOffset = firstWeekday(viewYear, viewMonth)
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ]
  // pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">

        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {viewYear}年 {viewMonth + 1}月
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 px-3 mb-1">
          {WEEKDAYS.map((w, i) => (
            <div
              key={w}
              className={`text-center text-xs font-medium py-1 ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 px-3 pb-3">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />
            const mm = String(viewMonth + 1).padStart(2, '0')
            const dd = String(day).padStart(2, '0')
            const cellStr = `${viewYear}-${mm}-${dd}`
            const isSelected = cellStr === selectedDate
            const isToday = cellStr === todayStr
            const weekday = (idx % 7)

            return (
              <button
                key={idx}
                onClick={() => selectDay(day)}
                className={`aspect-square flex items-center justify-center text-sm rounded-full mx-auto w-9 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : isToday
                    ? 'text-blue-600 font-semibold hover:bg-blue-50'
                    : weekday === 0
                    ? 'text-red-400 hover:bg-red-50'
                    : weekday === 6
                    ? 'text-blue-400 hover:bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>

        {/* 区切り */}
        <div className="border-t border-gray-100" />

        {/* 時刻セクション */}
        <button
          onClick={() => setTimeEnabled(v => !v)}
          className="w-full px-5 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M12 2a10 10 0 110 20A10 10 0 0112 2z" />
          </svg>
          <span className={`text-sm flex-1 text-left ${timeEnabled ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            時刻を設定
          </span>
          {timeEnabled && (
            <span className="text-sm text-blue-600 font-medium">{selectedTime}</span>
          )}
        </button>

        {timeEnabled && (
          <div className="px-5 pb-4 flex justify-center">
            <input
              type="time"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
              className="text-2xl font-medium text-blue-600 border-b-2 border-blue-400 bg-transparent text-center focus:outline-none w-36"
              onClick={e => e.stopPropagation()}
            />
          </div>
        )}

        {/* ボタン */}
        <div className="flex gap-2 px-5 pb-5">
          {date && (
            <button
              onClick={() => { onClear(); onClose() }}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              クリア
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!selectedDate}
            className="flex-1 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-40 transition-colors"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  )
}
