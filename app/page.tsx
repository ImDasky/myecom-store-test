import { getStoreSettings } from '@/lib/settings'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'
import { BuildingOfficeIcon, UserGroupIcon, CubeIcon, TruckIcon } from '@heroicons/react/24/outline'
import { CategoryIcon } from '@/components/CategoryIcon'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const settings = await getStoreSettings()

  if (!settings.showHomepage) {
    redirect('/products')
  }

  // Get top selling products (for now, just get recent products)
  const topProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { variants: { where: { isActive: true } } },
    take: 5,
    orderBy: { createdAt: 'desc' },
  })

  // Get active categories (gracefully handle if table doesn't exist yet)
  let categories: Array<{ id: number; name: string; slug: string; description: string | null; icon: string | null; order: number; isActive: boolean }> = []
  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      take: 12,
    })
  } catch (error: any) {
    // Category table might not exist yet if migrations haven't run
    console.warn('Categories table not available:', error.message)
  }

  const primaryColor = settings.primaryColor || '#111827'
  const accentColor = settings.secondaryColor || '#2563eb'

  return (
    <div className="bg-white">
      {/* Top Selling Products Section */}
      {topProducts.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-black">
              Top Selling Products
            </h2>
            <p className="text-gray-600 text-lg">Our most popular items</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {topProducts.map((product, index) => {
              const images = product.images ? JSON.parse(product.images) : []
              const minPrice = product.variants.length > 0 && product.variants.some(v => v.price)
                ? Math.min(...product.variants.filter(v => v.price).map(v => v.price!))
                : product.basePrice

              return (
                <div key={product.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 bg-white hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <span 
                      className="absolute top-3 left-3 text-black px-2.5 py-1 rounded-md text-xs font-bold z-10 bg-white border-2 border-gray-300 shadow-sm"
                    >
                      #{index + 1}
                    </span>
                    {images[0] ? (
                      <Link href={`/products/${product.slug}`}>
                        <div className="aspect-square overflow-hidden bg-gray-50">
                          <img
                            src={images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      </Link>
                    ) : (
                      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold mb-2 hover:underline line-clamp-2 text-black text-base leading-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-bold text-xl mb-4 text-black">
                      {formatPrice(minPrice)}
                    </p>
                    <AddToCartButton productId={product.id} accentColor={accentColor} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Shop by Product Group */}
      {categories.length > 0 && (
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-3 text-black">
                Shop by Product Group
              </h2>
              <p className="text-gray-600 text-lg">Browse our product categories</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="group bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      <CategoryIcon iconName={category.icon} color="#111827" className="w-8 h-8" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-black text-base mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-3 text-black">
            Why Choose Us
          </h2>
          <p className="text-gray-600 text-lg">What sets us apart</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Established Business',
              description: settings.aboutText ? settings.aboutText.substring(0, 100) + '...' : 'With years of experience, we bring expertise to every order.',
              Icon: BuildingOfficeIcon,
            },
            {
              title: 'Product Experts',
              description: 'Have a question? Our Product Experts are here to help!',
              Icon: UserGroupIcon,
            },
            {
              title: 'Large Inventory',
              description: 'We stock high quality products ready to ship.',
              Icon: CubeIcon,
            },
            {
              title: 'Fast Shipping',
              description: 'Get your products faster with quick shipping.',
              Icon: TruckIcon,
            },
          ].map((feature, index) => {
            const IconComponent = feature.Icon
            return (
              <div key={index} className="text-center p-6 rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-center mb-5">
                  <div className="p-4 rounded-full bg-gray-50">
                    <IconComponent className="w-12 h-12 text-gray-900" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-black">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* About Section */}
      {settings.aboutText && (
        <section className="bg-gradient-to-b from-white to-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-6 text-black">
                {settings.businessName || 'About Us'}
              </h2>
              <div className="w-24 h-1 bg-gray-300 mx-auto mb-8"></div>
              <p className="text-lg leading-relaxed text-gray-700 max-w-3xl mx-auto">
                {settings.aboutText}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

