import Link from 'next/link'
import { getStoreSettings } from '@/lib/settings'
import { prisma } from '@/lib/db'

export async function Footer() {
  const settings = await getStoreSettings()
  // Get categories (gracefully handle if table doesn't exist yet)
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

  const primaryColor = settings.primaryColor || '#111827'
  const accentColor = settings.secondaryColor || '#2563eb'

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {settings.businessName || 'My Store'}
            </h3>
            {settings.aboutText && (
              <p className="text-sm text-gray-400 mb-4">
                {settings.aboutText.substring(0, 150)}...
              </p>
            )}
            <div className="flex gap-4">
              {settings.facebookUrl && (
                <a 
                  href={settings.facebookUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Facebook
                </a>
              )}
              {settings.instagramUrl && (
                <a 
                  href={settings.instagramUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
              )}
              {settings.twitterUrl && (
                <a 
                  href={settings.twitterUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
              )}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {settings.showHomepage && (
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              )}
              {settings.showContactPage && (
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
              )}
              {settings.showLocationPage && (
                <li>
                  <Link href="/location" className="text-gray-400 hover:text-white transition-colors">
                    Locations
                  </Link>
                </li>
              )}
              <li>
                <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors">
                  Site Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold mb-4">Customer Support</h4>
            <ul className="space-y-2 text-sm">
              {settings.showAccountArea && (
                <li>
                  <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors">
                    Register
                  </Link>
                </li>
              )}
              {settings.showAccountArea && (
                <li>
                  <Link href="/account" className="text-gray-400 hover:text-white transition-colors">
                    My Account
                  </Link>
                </li>
              )}
              <li>
                <Link href="/policies/cancellation" className="text-gray-400 hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/returns" className="text-gray-400 hover:text-white transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/warranty" className="text-gray-400 hover:text-white transition-colors">
                  Limited Warranty
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/products?category=${category.slug}`}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {settings.showProductList && (
                <li>
                  <Link href="/products" className="text-gray-400 hover:text-white transition-colors font-semibold">
                    View All Products
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>Copyright © {new Date().getFullYear()} {settings.businessName || 'My Store'}. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

