'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CartButton } from './CartButton'
import { SearchButton } from './SearchButton'
import { MobileMenu } from './MobileMenu'
import { LogoBrand } from './LogoBrand'

interface HeaderClientProps {
  settings: any
  user: any
  categories: Array<{ id: number; name: string; slug: string; icon: string | null }>
}

export function HeaderClient({ settings, user, categories }: HeaderClientProps) {
  const [shrunk, setShrunk] = useState(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setShrunk(window.scrollY > 10)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const mainPadding = shrunk ? 'py-0' : 'py-5'
  const topPadding = shrunk ? 'py-0.5' : 'py-3'
  const horizontalPadding = shrunk ? 'px-3' : 'px-4'

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className={`container mx-auto px-4 ${topPadding}`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {settings.businessPhone && (
                <a 
                  href={`tel:${settings.businessPhone}`}
                  className="font-semibold hover:opacity-70 transition-opacity text-black"
                >
                  {settings.businessPhone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {settings.showSearch && <SearchButton />}
              <CartButton />
              {settings.showAccountArea && (
                <>
                  {user ? (
                    <Link 
                      href="/account" 
                      className="hover:opacity-70 transition-opacity font-medium text-black"
                    >
                      My Account
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/auth/login" 
                        className="hover:opacity-70 transition-opacity text-black"
                      >
                        Sign In
                      </Link>
                      <span className="text-gray-400">/</span>
                      <Link 
                        href="/auth/register" 
                        className="hover:opacity-70 transition-opacity text-black"
                      >
                        Register
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className={`bg-black text-white`}>
        <div className={`container mx-auto ${horizontalPadding} ${mainPadding} transition-all duration-300 ease-in-out`}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            {settings.logoUrl ? (
              <LogoBrand
                src={settings.logoUrl}
                alt={settings.businessName || 'Store'}
                largeHeight={5}
                smallHeight={2.75} // smaller when shrunk, good for mobile
                shrunk={shrunk}
              />
            ) : (
              <h1 
                className="text-3xl font-bold text-white"
              >
                {settings.businessName || 'My Store'}
              </h1>
            )}
            </Link>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
            {settings.showLocationPage && (
              <Link 
                href="/location" 
                className="font-semibold hover:text-gray-200 transition-colors text-white text-base"
              >
                Locations
              </Link>
            )}
            {settings.showContactPage && (
              <Link 
                href="/contact" 
                className="font-semibold hover:text-gray-200 transition-colors text-white text-base"
              >
                Contact Us
              </Link>
            )}
            {settings.showHomepage && (
              <Link 
                href="/" 
                className="font-semibold hover:text-gray-200 transition-colors text-white text-base"
              >
                About Us
              </Link>
            )}
            {settings.showProductList && (
              <div className="relative group">
                <Link 
                  href="/products" 
                  className="font-semibold hover:text-gray-200 transition-colors flex items-center gap-1 text-white text-base"
                >
                  Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {categories.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          className="block px-4 py-2 hover:bg-gray-800 rounded transition-colors text-white"
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="block px-4 py-2 hover:bg-gray-800 rounded transition-colors font-semibold border-t border-gray-800 mt-2 pt-2 text-white"
                      >
                        View All Products
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            {settings.showBlog && (
              <Link 
                href="/blog" 
                className="font-semibold hover:text-gray-200 transition-colors text-white text-base"
              >
                Resource Hub
              </Link>
            )}
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className="font-semibold hover:text-gray-200 transition-colors text-white text-base"
              >
                Admin
              </Link>
            )}
            </nav>

            {/* Mobile Menu */}
            <MobileMenu
              settings={{
                showLocationPage: settings.showLocationPage,
                showContactPage: settings.showContactPage,
                showHomepage: settings.showHomepage,
                showProductList: settings.showProductList,
                showBlog: settings.showBlog,
                showAccountArea: settings.showAccountArea,
              }}
              user={user}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

