import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { prisma } from '@/lib/db'
import { calculateShipping } from '@/lib/shipping'
import { getCurrentUser } from '@/lib/auth'

interface CartItem {
  productId: number
  variantId?: number
  quantity: number
}

export async function POST(request: NextRequest) {
  try {
    const { items, email, shipping } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const stripe = await getStripeClient()

    // Validate and fetch all products/variants
    const lineItems: any[] = []
    let subtotalCents = 0

    for (const item of items as CartItem[]) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      })

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        )
      }

      let variant = null
      if (item.variantId) {
        variant = product.variants.find(v => v.id === item.variantId)
        if (!variant || !variant.isActive) {
          return NextResponse.json(
            { error: `Variant ${item.variantId} not found or inactive` },
            { status: 400 }
          )
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for variant ${variant.name}` },
            { status: 400 }
          )
        }
      }

      const priceCents = variant?.price ?? product.basePrice
      const unitPrice = priceCents
      subtotalCents += unitPrice * item.quantity

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name + (variant ? ` - ${variant.name}` : ''),
            description: product.description || undefined,
            images: product.images ? JSON.parse(product.images).slice(0, 1) : undefined,
          },
          unit_amount: unitPrice,
        },
        quantity: item.quantity,
      })
    }

    // Calculate shipping
    const shipping = await calculateShipping(subtotalCents)
    const totalCents = subtotalCents + shipping.amountCents

    if (shipping.amountCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: shipping.label,
          },
          unit_amount: shipping.amountCents,
        },
        quantity: 1,
      })
    }

    const user = await getCurrentUser()

    // Calculate prices for order items
    const orderItemsData = []
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      })
      const variant = item.variantId 
        ? product?.variants.find(v => v.id === item.variantId)
        : null
      const priceCents = variant?.price ?? product?.basePrice ?? 0

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPriceCents: priceCents,
      })
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user?.id,
        email,
        totalCents,
        currency: 'usd',
        status: 'pending',
        stripeSessionId: '', // Will update after session creation
        items: {
          create: orderItemsData,
        },
      },
    })

    // Create Stripe Checkout Session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout`,
      customer_email: email,
    }

    // If shipping info is provided, pre-fill it
    if (shipping) {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      }
      // Pre-fill shipping if provided
      if (shipping.address) {
        sessionConfig.shipping_address_collection = undefined
        sessionConfig.shipping_address = shipping.address
      }
    } else {
      sessionConfig.shipping_address_collection = {
        allowed_countries: ['US'],
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

