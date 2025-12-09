import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  const stripe = await getStripeClient()

  // Verify webhook signature if secret is configured
  let event: Stripe.Event
  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      )
    }
  } else {
    // If no webhook secret configured, parse event without verification (not recommended for production)
    try {
      event = JSON.parse(body) as Stripe.Event
    } catch (err: any) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }
  }

  // Acknowledge quickly to avoid timeouts
  const ok = NextResponse.json({ received: true })

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      console.log('[stripe] session.completed', {
        sessionId: session.id,
        paymentIntent: session.payment_intent,
        email: session.customer_details?.email,
      })

      const order = await prisma.order.findUnique({
        where: { stripeSessionId: session.id },
        include: { items: true },
      })

      if (!order) {
        console.error('[stripe] order not found for session', session.id)
        return ok
      }

      if (order.status === 'paid') {
        return ok
      }

      // Update order status
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'paid',
          stripePaymentIntentId: session.payment_intent as string,
          shippingName: session.shipping_details?.name || null,
          shippingAddress: session.shipping_details?.address 
            ? JSON.stringify(session.shipping_details.address)
            : null,
        },
      })

      console.log('[stripe] order updated to paid', { orderId: order.id })

      // Decrement stock for each item
      for (const item of order.items) {
        if (item.variantId) {
          await prisma.variant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }
      }

      return ok
    } catch (error) {
      console.error('Error processing webhook:', error)
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }
  }

  if (event.type === 'checkout.session.async_payment_failed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      await prisma.order.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'failed' },
      })

      return ok
    } catch (error) {
      console.error('Error processing failed payment:', error)
      return NextResponse.json(
        { error: 'Error processing webhook' },
        { status: 500 }
      )
    }
  }

  return ok
}

