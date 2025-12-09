import { requireAdmin } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default async function AdminProductsPage() {
  await requireAdmin()

  const products = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
        >
          Add Product
        </Link>
      </div>

      {/* Desktop table */}
      <div className="border rounded-lg overflow-hidden hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Variants</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-sm text-gray-600">{product.slug}</div>
                </td>
                <td className="px-4 py-3">{formatPrice(product.basePrice)}</td>
                <td className="px-4 py-3">{product.variants.length}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="font-semibold text-black">{product.name}</p>
                <p className="text-sm text-gray-600 break-all">{product.slug}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-black">
              <span className="font-semibold">{formatPrice(product.basePrice)}</span>
              <span className="text-gray-600">Variants: {product.variants.length}</span>
            </div>
            <div className="mt-4">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="text-blue-600 hover:underline font-semibold"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

