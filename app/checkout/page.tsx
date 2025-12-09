'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadCart = async () => {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      
      if (cartData.length === 0) {
        router.push('/cart')
        return
      }
      
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
  }, [router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.firstName) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required'
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required'
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required'
    }
    
    if (!formData.zip) {
      newErrors.zip = 'ZIP code is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
      newErrors.zip = 'Please enter a valid ZIP code'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setProcessing(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(({ product, variant, ...item }) => item),
          email: formData.email,
          shipping: {
            name: `${formData.firstName} ${formData.lastName}`,
            address: {
              line1: formData.address,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zip,
              country: formData.country,
            },
          },
        }),
      })

      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Error starting checkout: ' + (data.error || 'Unknown error'))
        setProcessing(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error starting checkout')
      setProcessing(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => {
    const price = item.variant?.price || item.product?.basePrice || 0
    return sum + price * item.quantity
  }, 0)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-black">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Information */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-black">Contact Information</h2>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg text-black ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-black">Shipping Address</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg text-black ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg text-black ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg text-black ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123 Main St"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg text-black ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg text-black ${
                      errors.state ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.state && (
                    <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg text-black ${
                      errors.zip ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="12345"
                  />
                  {errors.zip && (
                    <p className="mt-1 text-sm text-red-600">{errors.zip}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/cart"
                className="px-6 py-3 border border-gray-300 rounded-lg text-black hover:bg-gray-50 transition-colors"
              >
                Back to Cart
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 sticky top-4">
            <h2 className="text-2xl font-bold mb-4 text-black">Order Summary</h2>
            <div className="space-y-4 mb-4">
              {cart.map((item, index) => {
                const images = item.product?.images ? JSON.parse(item.product.images) : []
                const price = item.variant?.price || item.product?.basePrice || 0
                const total = price * item.quantity

                return (
                  <div key={index} className="flex gap-3">
                    {images[0] && (
                      <img
                        src={images[0]}
                        alt={item.product?.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-black">{item.product?.name}</p>
                      {item.variant && (
                        <p className="text-xs text-gray-600">{item.variant.name}</p>
                      )}
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="font-semibold text-sm text-black mt-1">{formatPrice(total)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-black">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span>
                <span>Calculated at payment</span>
              </div>
              <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg text-black">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

