'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  icon: string | null
  order: number
  isActive: boolean
}

interface CategoryFormProps {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    icon: category?.icon || '',
    order: category?.order || 0,
    isActive: category?.isActive ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories'
      const method = category ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/categories')
        router.refresh()
      } else {
        const error = await res.json()
        alert(error.error || 'Error saving category')
      }
    } catch (error) {
      alert('Error saving category')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: category?.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug *
        </label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) =>
            setFormData({ ...formData, slug: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          URL-friendly identifier (e.g., &quot;strapping&quot;)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Icon Name
        </label>
        <select
          value={formData.icon || ''}
          onChange={(e) =>
            setFormData({ ...formData, icon: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Default (Cube)</option>
          <option value="strapping">Strapping</option>
          <option value="stretch-film">Stretch Film</option>
          <option value="tape">Tape</option>
          <option value="packaging">Packaging</option>
          <option value="gloves">Gloves</option>
          <option value="safety">Safety</option>
          <option value="tools">Tools</option>
          <option value="paint">Paint</option>
          <option value="electrical">Electrical</option>
          <option value="chemicals">Chemicals</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Select an icon for this category
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Order
        </label>
        <input
          type="number"
          value={formData.order}
          onChange={(e) =>
            setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        <p className="mt-1 text-sm text-gray-500">
          Lower numbers appear first
        </p>
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Active</span>
        </label>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Category'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

