import { getStoreSettings } from '@/lib/settings'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'
import { CategoryIcon } from '@/components/CategoryIcon'

export const dynamic = 'force-dynamic'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string }
}) {
  const settings = await getStoreSettings()

  if (!settings.showProductList) {
    redirect('/')
  }

  const search = searchParams.search || ''
  const categorySlug = searchParams.category || ''
  
  // Get category if filtering by category (gracefully handle if table doesn't exist yet)
  let categoryId: number | undefined
  if (categorySlug) {
    try {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug },
        select: { id: true },
      })
      categoryId = category?.id
    } catch (error: any) {
      // Category table might not exist yet if migrations haven't run
      console.warn('Categories table not available:', error.message)
    }
  }

  const where: any = {
    isActive: true,
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { name: { contains: search } },
        { description: { contains: search } },
      ],
    }),
  }

  const [products, categoriesResult] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: { where: { isActive: true } }, category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }).catch(() => []), // Gracefully handle if table doesn't exist yet
  ])
  const categories = categoriesResult || []

  const primaryColor = settings.primaryColor || '#111827'
  const accentColor = settings.secondaryColor || '#2563eb'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4 text-black">
          Products
        </h1>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-lg border transition-colors ${
                !categorySlug
                  ? 'text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
              style={!categorySlug ? { backgroundColor: accentColor } : { borderColor: primaryColor + '40', color: primaryColor }}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  categorySlug === category.slug
                    ? 'text-white'
                    : 'bg-white hover:bg-gray-50'
                }`}
                style={categorySlug === category.slug ? { backgroundColor: accentColor } : { borderColor: primaryColor + '40', color: primaryColor }}
              >
                <CategoryIcon iconName={category.icon} className="w-5 h-5" />
                {category.name}
              </Link>
            ))}
          </div>
        )}
        {settings.showSearch && (
          <form method="get" className="max-w-md">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={search}
              className="w-full px-4 py-2 border rounded-lg"
              style={{ 
                borderColor: primaryColor + '40',
                color: primaryColor,
              }}
            />
          </form>
        )}
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg text-black">
            No products found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const images = product.images ? JSON.parse(product.images) : []
            const minPrice = product.variants.length > 0 && product.variants.some(v => v.price)
              ? Math.min(...product.variants.filter(v => v.price).map(v => v.price!))
              : product.basePrice
            const maxPrice = product.variants.length > 0 && product.variants.some(v => v.price)
              ? Math.max(...product.variants.filter(v => v.price).map(v => v.price!))
              : product.basePrice

            return (
              <div
                key={product.id}
                className="group"
              >
                <div 
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
                  style={{ borderColor: primaryColor + '20' }}
                >
                  <Link href={`/products/${product.slug}`}>
                    {images[0] && (
                      <div className="aspect-square relative bg-gray-100">
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Link>
                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:underline text-black">
                        {product.name}
                      </h3>
                      <p className="text-sm opacity-70 mb-2 line-clamp-2 text-black">
                        {product.description}
                      </p>
                    </Link>
                    <p className="font-bold mb-3 text-black">
                      {minPrice === maxPrice 
                        ? formatPrice(minPrice)
                        : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                      }
                    </p>
                    <AddToCartButton productId={product.id} accentColor={accentColor} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

