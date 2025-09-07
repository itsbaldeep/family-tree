"use client"

import { PartialDate } from '@/data/familyTree'
import { getMonthAbbrev } from '@/lib/utils'
import { useState } from 'react'

interface PartialDateInputProps {
  value?: PartialDate
  onChange: (val: PartialDate | undefined) => void
  label?: string
  placeholder?: string
}

export default function PartialDateInput({
  value,
  onChange,
  label
}: PartialDateInputProps) {
  const [isRangeMode, setIsRangeMode] = useState(Boolean(value?.range))

  const handleClear = () => {
    onChange(undefined)
  }

  const updateValue = (updates: Partial<PartialDate>) => {
    const newValue = { ...value, ...updates }

    // Clean up conflicting fields
    if (updates.range) {
      delete newValue.year
      delete newValue.month
      delete newValue.day
    } else if (updates.year !== undefined || updates.month !== undefined || updates.day !== undefined) {
      delete newValue.range
    }

    // If all fields are empty/undefined, set to undefined
    const isEmpty = !newValue.year && !newValue.month && !newValue.day &&
      !newValue.range?.from && !newValue.range?.to &&
      !newValue.notes && !newValue.approximate

    onChange(isEmpty ? undefined : newValue)
  }

  const handleRangeModeToggle = (enabled: boolean) => {
    setIsRangeMode(enabled)
    if (enabled) {
      updateValue({ range: { from: '', to: '' } })
    } else {
      updateValue({ range: undefined })
    }
  }

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {/* Mode Toggle */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`date-mode-${label}`}
              checked={!isRangeMode}
              onChange={() => handleRangeModeToggle(false)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700">Specific Date</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name={`date-mode-${label}`}
              checked={isRangeMode}
              onChange={() => handleRangeModeToggle(true)}
              className="w-4 h-4 text-primary-600"
            />
            <span className="text-sm text-gray-700">Date Range</span>
          </label>
        </div>

        {!isRangeMode ? (
          /* Specific Date Fields */
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Year"
              min="1000"
              max="9999"
              value={value?.year ?? ""}
              onChange={(e) => updateValue({
                year: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <select
              value={value?.month ?? ""}
              onChange={(e) => updateValue({
                month: parseInt(e.target.value)
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="" disabled>Month</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{getMonthAbbrev(i + 1)}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Day"
              min="1"
              max="31"
              value={value?.day ?? ""}
              onChange={(e) => updateValue({
                day: e.target.value ? parseInt(e.target.value) : undefined
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        ) : (
          /* Date Range Fields */
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">From</label>
              <input
                type="text"
                placeholder="e.g. 1985 or 1985-06"
                value={value?.range?.from ?? ""}
                onChange={(e) => updateValue({
                  range: { ...value?.range, from: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">To</label>
              <input
                type="text"
                placeholder="e.g. 1987 or 1987-12"
                value={value?.range?.to ?? ""}
                onChange={(e) => updateValue({
                  range: { ...value?.range, to: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        )}

        {/* Approximate Checkbox */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value?.approximate ?? false}
            onChange={(e) => updateValue({ approximate: e.target.checked })}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Approximate date</span>
        </label>

        {/* Notes Field */}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Notes</label>
          <input
            type="text"
            placeholder="Additional notes about this date"
            value={value?.notes ?? ""}
            onChange={(e) => updateValue({ notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Clear date
          </button>
        )}
      </div>
    </div>
  )
}
