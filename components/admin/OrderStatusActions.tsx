'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrderStatusActionsProps {
  orderId: number
  currentStatus: string
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to update status')
      }
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">Update Status</label>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-black"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Status'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

