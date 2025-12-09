import { requireAdmin } from '@/lib/auth'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export default async function AdminOrdersPage() {
  await requireAdmin()

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Orders</h1>

      {/* Desktop table */}
      <div className="border rounded-lg overflow-hidden hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold">#{order.id}</td>
                <td className="px-4 py-3">{order.email}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(order.totalCents)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${
                    order.status === 'paid' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-4 md:hidden">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start gap-3">
              <div>
                <p className="font-semibold text-black">Order #{order.id}</p>
                <p className="text-sm text-gray-600 break-all">{order.email}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                order.status === 'paid' ? 'bg-green-100 text-green-800' :
                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-black">
              <span className="font-semibold">{formatPrice(order.totalCents)}</span>
              <span className="text-gray-600">Items: {order.items.length}</span>
              <span className="text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-4">
              <Link
                href={`/admin/orders/${order.id}`}
                className="text-blue-600 hover:underline font-semibold"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

