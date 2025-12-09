import { prisma } from './db'
import { ensureMigrations } from './migrate'

let settingsCache: any = null
let cacheTime = 0
const CACHE_TTL = 60000 // 1 minute

export async function getStoreSettings() {
  try {
    const now = Date.now()
    if (settingsCache && now - cacheTime < CACHE_TTL) {
      return settingsCache
    }

    // Ensure migrations are run automatically on first access
    await ensureMigrations()

    let settings = await prisma.storeSettings.findFirst()
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {},
      })
    }

    settingsCache = settings
    cacheTime = now
    return settings
  } catch (error: any) {
    // If it's a "table does not exist" error, try running migrations and retry
    if (error.message?.includes('does not exist') || error.message?.includes('relation') || error.message?.includes('table')) {
      try {
        console.log('Tables missing, running automatic migrations...')
        await ensureMigrations()
        // Retry after migrations
        const settings = await prisma.storeSettings.findFirst()
        if (!settings) {
          const newSettings = await prisma.storeSettings.create({
            data: {},
          })
          settingsCache = newSettings
          cacheTime = Date.now()
          return newSettings
        }
        settingsCache = settings
        cacheTime = Date.now()
        return settings
      } catch (retryError: any) {
        console.error('Error after migration retry:', retryError)
      }
    }
    
    // Return default settings if database is not available
    console.error('Error fetching store settings:', error)
    return {
      id: 0,
      businessName: null,
      logoUrl: null,
      primaryColor: '#111827',
      secondaryColor: '#f3f4f6',
      businessEmail: null,
      businessPhone: null,
      businessAddress: null,
      businessCity: null,
      businessState: null,
      businessZip: null,
      businessCountry: null,
      aboutText: null,
      heroHeadline: null,
      heroSubheadline: null,
      heroImageUrl: null,
      openingHours: null,
      facebookUrl: null,
      instagramUrl: null,
      twitterUrl: null,
      tiktokUrl: null,
      stripeSecretKey: null,
      stripePublishableKey: null,
      showHomepage: true,
      showProductList: true,
      showSearch: true,
      showAccountArea: true,
      showContactPage: true,
      showLocationPage: true,
      showBlog: true,
      showFAQ: true,
      shippingMode: 'flat',
      flatShippingRateCents: 0,
      flatShippingLabel: 'Standard Shipping',
      updatedAt: new Date(),
    }
  }
}

export function clearSettingsCache() {
  settingsCache = null
  cacheTime = 0
}

