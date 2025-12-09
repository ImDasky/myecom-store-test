import { getStoreSettings } from '@/lib/settings'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { AddToCartButton } from '@/components/AddToCartButton'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const settings = await getStoreSettings()
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: { where: { isActive: true }, orderBy: { name: 'asc' } } },
  })

  if (!product || !product.isActive) {
    notFound()
  }

  const images = product.images ? JSON.parse(product.images) : []
  const primaryColor = settings.primaryColor || '#111827'
  const accentColor = settings.secondaryColor || '#2563eb'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {images[0] ? (
            <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square rounded-lg flex items-center justify-center bg-gray-100">
              <span className="text-black">No Image</span>
            </div>
          )}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {images.slice(1).map((img: string, idx: number) => (
                <div key={idx} className="aspect-square relative bg-gray-100 rounded overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4 text-black">
            {product.name}
          </h1>
          <p className="text-2xl font-semibold mb-6 text-black">
            {product.variants.length > 0
              ? `${formatPrice(Math.min(...product.variants.map(v => v.price || product.basePrice)))} - ${formatPrice(Math.max(...product.variants.map(v => v.price || product.basePrice)))}`
              : formatPrice(product.basePrice)
            }
          </p>
          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-black">
                Description
              </h2>
              <p className="leading-relaxed text-black">
                {product.description}
              </p>
            </div>
          )}

          {/* Variants */}
          {product.variants.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-black">
                Options
              </h2>
              <div className="space-y-4">
                {product.variants.map((variant) => (
                  <div 
                    key={variant.id}
                    className="p-4 border rounded-lg"
                    style={{ borderColor: primaryColor + '20' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-black">
                          {variant.name}
                        </h3>
                        {variant.sku && (
                          <p className="text-sm opacity-70 text-black">
                            SKU: {variant.sku}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-black">
                        {formatPrice(variant.price || product.basePrice)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-black">
                        Stock: {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
                      </p>
                      <AddToCartButton
                        productId={product.id}
                        variantId={variant.id}
                        disabled={variant.stock === 0}
                        accentColor={accentColor}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <AddToCartButton productId={product.id} accentColor={accentColor} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

