import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { OrderStatusActions } from '@/components/admin/OrderStatusActions'

export const dynamic = 'force-dynamic'

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  await requireAdmin()

  const order = await prisma.order.findUnique({
    where: { id: parseInt(params.id) },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Order #{order.id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
          <div className="border rounded-lg p-6 space-y-4">
            <div>
              <p className="font-semibold">Status</p>
              <p className={`${
                order.status === 'paid' ? 'text-green-600' :
                order.status === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {order.status}
              </p>
            </div>
            <OrderStatusActions orderId={order.id} currentStatus={order.status} />
            <div>
              <p className="font-semibold">Email</p>
              <p>{order.email}</p>
            </div>
            <div>
              <p className="font-semibold">Order Date</p>
              <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            {order.stripeSessionId && (
              <div>
                <p className="font-semibold">Stripe Session ID</p>
                <p className="text-sm font-mono">{order.stripeSessionId}</p>
              </div>
            )}
            {order.stripePaymentIntentId && (
              <div>
                <p className="font-semibold">Payment Intent ID</p>
                <p className="text-sm font-mono">{order.stripePaymentIntentId}</p>
              </div>
            )}
            {order.shippingName && (
              <div>
                <p className="font-semibold">Shipping To</p>
                <p>{order.shippingName}</p>
                {order.shippingAddress && (
                  <p className="text-sm opacity-70">
                    {JSON.parse(order.shippingAddress).line1}
                    {JSON.parse(order.shippingAddress).line2 && `, ${JSON.parse(order.shippingAddress).line2}`}
                    <br />
                    {JSON.parse(order.shippingAddress).city}, {JSON.parse(order.shippingAddress).state} {JSON.parse(order.shippingAddress).postal_code}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Items</h2>
          <div className="border rounded-lg p-6 space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between pb-4 border-b last:border-0">
                <div>
                  <p className="font-semibold">{item.product.name}</p>
                  <p className="text-sm opacity-70">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(item.unitPriceCents * item.quantity)}</p>
                  <p className="text-sm opacity-70">{formatPrice(item.unitPriceCents)} each</p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalCents)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

