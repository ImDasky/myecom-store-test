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
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center text-black">
            Top Selling Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {topProducts.map((product, index) => {
              const images = product.images ? JSON.parse(product.images) : []
              const minPrice = product.variants.length > 0 && product.variants.some(v => v.price)
                ? Math.min(...product.variants.filter(v => v.price).map(v => v.price!))
                : product.basePrice

              return (
                <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                  <div className="relative">
                    <span 
                      className="absolute top-2 left-2 text-black px-2 py-1 rounded text-xs font-bold z-10 bg-white border border-gray-300"
                    >
                      #{index + 1}
                    </span>
                    {images[0] ? (
                      <Link href={`/products/${product.slug}`}>
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold mb-2 hover:underline line-clamp-2 text-black">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="font-bold text-lg mb-3 text-black">
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
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8 text-center text-black">
              Shop by Product Group
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/products?category=${category.slug}`}
                  className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-center mb-3">
                    <CategoryIcon iconName={category.icon} color={accentColor} />
                  </div>
                  <h3 className="font-semibold text-black">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
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
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8 text-center text-black">
          Why Choose Us
        </h2>
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
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <IconComponent className="w-16 h-16" style={{ color: accentColor }} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-black">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* About Section */}
      {settings.aboutText && (
        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-black">
                {settings.businessName || 'About Us'}
              </h2>
              <p className="text-lg leading-relaxed text-gray-700">
                {settings.aboutText}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

