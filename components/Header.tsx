import Link from 'next/link'
import { getStoreSettings } from '@/lib/settings'
import { getCurrentUser } from '@/lib/auth'
import { CartButton } from './CartButton'
import { SearchButton } from './SearchButton'
import { prisma } from '@/lib/db'

export async function Header() {
  const settings = await getStoreSettings()
  const user = await getCurrentUser()

  const primaryColor = settings.primaryColor || '#111827'
  const accentColor = settings.secondaryColor || '#2563eb'

  // Get active categories for navigation (gracefully handle if table doesn't exist yet)
  let categories: Array<{ id: number; name: string; slug: string }> = []
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 10,
    })
  } catch (error: any) {
    // Category table might not exist yet if migrations haven't run
    console.warn('Categories table not available:', error.message)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {settings.businessPhone && (
                <a 
                  href={`tel:${settings.businessPhone}`}
                  className="font-semibold hover:opacity-70 transition-opacity"
                  style={{ color: primaryColor }}
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
                      className="hover:opacity-70 transition-opacity font-medium"
                      style={{ color: primaryColor }}
                    >
                      My Account
                    </Link>
                  ) : (
                    <>
                      <Link 
                        href="/auth/login" 
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
                      >
                        Sign In
                      </Link>
                      <span className="text-gray-400">/</span>
                      <Link 
                        href="/auth/register" 
                        className="hover:opacity-70 transition-opacity"
                        style={{ color: primaryColor }}
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
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.businessName || 'Store'} 
                className="h-12 w-auto"
              />
            ) : (
              <h1 
                className="text-3xl font-bold"
                style={{ color: primaryColor }}
              >
                {settings.businessName || 'My Store'}
              </h1>
            )}
          </Link>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {settings.showLocationPage && (
              <Link 
                href="/location" 
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: primaryColor }}
              >
                Locations
              </Link>
            )}
            {settings.showContactPage && (
              <Link 
                href="/contact" 
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: primaryColor }}
              >
                Contact Us
              </Link>
            )}
            {settings.showHomepage && (
              <Link 
                href="/" 
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: primaryColor }}
              >
                About Us
              </Link>
            )}
            {settings.showProductList && (
              <div className="relative group">
                <Link 
                  href="/products" 
                  className="font-medium hover:opacity-70 transition-opacity flex items-center gap-1"
                  style={{ color: primaryColor }}
                >
                  Products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                {categories.length > 0 && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/products?category=${category.slug}`}
                          className="block px-4 py-2 hover:bg-gray-50 rounded transition-colors"
                          style={{ color: primaryColor }}
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        href="/products"
                        className="block px-4 py-2 hover:bg-gray-50 rounded transition-colors font-semibold border-t border-gray-200 mt-2 pt-2"
                        style={{ color: accentColor }}
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
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: primaryColor }}
              >
                Resource Hub
              </Link>
            )}
            {user?.isAdmin && (
              <Link 
                href="/admin" 
                className="font-medium hover:opacity-70 transition-opacity"
                style={{ color: primaryColor }}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2" style={{ color: primaryColor }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

