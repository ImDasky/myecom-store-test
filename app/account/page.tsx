import { getStoreSettings } from '@/lib/settings'
export const dynamic = 'force-dynamic'
import { getCurrentUser, requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ChangePasswordForm } from '@/components/account/ChangePasswordForm'

export default async function AccountPage() {
  const settings = await getStoreSettings()

  if (!settings.showAccountArea) {
    redirect('/')
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const recentOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  const primaryColor = settings.primaryColor || '#111827'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8" style={{ color: primaryColor }}>
        My Account
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: primaryColor }}>
            Recent Orders
          </h2>
          {recentOrders.length === 0 ? (
            <p className="opacity-70">No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm opacity-70">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm opacity-70">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(order.totalCents / 100).toFixed(2)}</p>
                      <p className={`text-sm ${
                        order.status === 'paid' ? 'text-green-600' :
                        order.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            href="/account/orders"
            className="inline-block mt-4 text-blue-600 hover:underline"
          >
            View All Orders
          </Link>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: primaryColor }}>
            Account Info
          </h2>
          <div className="border rounded-lg p-4 space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Change Password</h3>
            <ChangePasswordForm />
          </div>
          <form action="/account/logout" method="POST" className="mt-4">
            <button
              type="submit"
              className="w-full py-2 border rounded-lg hover:bg-gray-50"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

