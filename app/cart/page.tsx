'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  productId: number
  variantId?: number
  quantity: number
  product?: {
    name: string
    basePrice: number
    images: string
  }
  variant?: {
    name: string
    price: number
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCart = async () => {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      
      // Fetch product details
      const itemsWithDetails = await Promise.all(
        cartData.map(async (item: CartItem) => {
          try {
            const res = await fetch(`/api/products/${item.productId}`)
            if (res.ok) {
              const data = await res.json()
              item.product = data
              if (item.variantId) {
                item.variant = data.variants.find((v: any) => v.id === item.variantId)
              }
            }
          } catch (error) {
            console.error('Error loading product:', error)
          }
          return item
        })
      )
      
      setCart(itemsWithDetails)
      setLoading(false)
    }

    loadCart()
  }, [])

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return
    const newCart = [...cart]
    newCart[index].quantity = quantity
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart.map(({ product, variant, ...item }) => item)))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart.map(({ product, variant, ...item }) => item)))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.basePrice || 0
    return sum + price * item.quantity
  }, 0)

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading cart...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
        <div className="text-center py-16">
          <p className="text-lg mb-4">Your cart is empty.</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {cart.map((item, index) => {
              const images = item.product?.images ? JSON.parse(item.product.images) : []
              const price = item.variant?.price || item.product?.basePrice || 0
              const total = price * item.quantity

              return (
                <div key={index} className="border rounded-lg p-4 flex gap-4">
                  {images[0] && (
                    <img
                      src={images[0]}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.product?.name}</h3>
                    {item.variant && (
                      <p className="text-sm opacity-70">Variant: {item.variant.name}</p>
                    )}
                    <p className="font-bold mt-2">{formatPrice(price)}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          className="px-2 py-1 border rounded"
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(total)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-lg font-semibold text-white"
              style={{ backgroundColor: '#111827' }}
            >
              Proceed to Checkout
            </button>
            <Link
              href="/products"
              className="block text-center mt-4 text-blue-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

