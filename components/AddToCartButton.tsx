'use client'

import { useState } from 'react'

interface AddToCartButtonProps {
  productId: number
  variantId?: number
  disabled?: boolean
  accentColor?: string
}

export function AddToCartButton({ productId, variantId, disabled, accentColor = '#2563eb' }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  const addToCart = () => {
    if (disabled || adding) return

    try {
      setAdding(true)
      
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined' || !window.localStorage) {
        console.error('localStorage is not available')
        alert('Unable to add to cart. Please try again.')
        setAdding(false)
        return
      }

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      
      const existingIndex = cart.findIndex(
        (item: any) => item.productId === productId && 
                      (item.variantId === variantId || (!item.variantId && !variantId))
      )

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity
      } else {
        cart.push({ productId, variantId: variantId || null, quantity })
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      
      // Dispatch custom event for cart button update
      window.dispatchEvent(new Event('cartUpdated'))
      
      setAdding(false)
      setQuantity(1)
      
      // Show feedback
      alert('Added to cart!')
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Error adding to cart. Please try again.')
      setAdding(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
        className="w-16 px-2 py-1 border rounded text-center"
        disabled={disabled}
      />
      <button
        onClick={addToCart}
        disabled={disabled || adding}
        className="px-6 py-2 rounded font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        style={{
          backgroundColor: disabled ? '#9ca3af' : (accentColor || '#2563eb'),
          border: 'none',
        }}
      >
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  )
}

