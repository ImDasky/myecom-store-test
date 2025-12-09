import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    const status = body.status as string

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const allowed = ['pending', 'paid', 'cancelled']
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: parseInt(params.id) },
      data: { status },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Order status update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

