'use client'

import { useEffect, useState } from 'react'

interface LogoBrandProps {
  src: string
  alt: string
  largeHeight?: number // rem units
  smallHeight?: number // rem units
  shrunk?: boolean
}

export function LogoBrand({
  src,
  alt,
  largeHeight = 5, // ~h-20
  smallHeight = 2.4, // smaller for tight mobile shrink
  shrunk,
}: LogoBrandProps) {
  const [internalShrunk, setInternalShrunk] = useState(false)

  useEffect(() => {
    if (shrunk === undefined) {
      const onScroll = () => {
        setInternalShrunk(window.scrollY > 10)
      }
      window.addEventListener('scroll', onScroll, { passive: true })
      return () => window.removeEventListener('scroll', onScroll)
    }
  }, [shrunk])

  const isShrunk = shrunk !== undefined ? shrunk : internalShrunk
  const scale = Math.min(1, Math.max(0.4, smallHeight / largeHeight))

  return (
    <div
      style={{ height: `${largeHeight}rem` }}
      className="flex items-center"
    >
      <img
        src={src}
        alt={alt}
        style={{
          height: `${largeHeight}rem`,
          transform: `scale(${isShrunk ? scale : 1})`,
          transformOrigin: 'left center',
        }}
        className="w-auto transition-transform duration-300 ease-in-out will-change-transform"
      />
    </div>
  )
}

