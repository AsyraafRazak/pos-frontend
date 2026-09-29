/**
 * Catalog cache layer — Phase 2
 *
 * Strategy (cache-first with network refresh):
 *  1. Always read from IndexedDB immediately (instant load).
 *  2. In the background, try to fetch fresh data from the backend API.
 *  3. If the API responds, overwrite IndexedDB with fresh data.
 *  4. If the API is unreachable and IndexedDB is empty, fall back to
 *     the static mock seed data so the cashier can still work.
 */

import { getDb, setSetting, getSetting } from './db'
import { fetchCategories, fetchProducts } from './api'
import { adaptCategory, adaptProduct } from './adapters'
import { CATEGORIES as SEED_CATEGORIES, MOCK_PRODUCTS } from '@/data/mockData'
import type { Category, Product } from '@/types/pos.types'
import type { CategoryDto, ProductDto } from './api.types'

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function getCachedCategories(): Promise<CategoryDto[]> {
  const db = await getDb()
  return db.getAll('categories')
}

async function getCachedProducts(): Promise<ProductDto[]> {
  const db = await getDb()
  return db.getAll('products')
}

async function persistCategories(cats: CategoryDto[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('categories', 'readwrite')
  await tx.store.clear()
  await Promise.all(cats.map((c) => tx.store.put(c)))
  await tx.done
}

async function persistProducts(prods: ProductDto[]): Promise<void> {
  const db = await getDb()
  const tx = db.transaction('products', 'readwrite')
  await tx.store.clear()
  await Promise.all(prods.map((p) => tx.store.put(p)))
  await tx.done
}

// ─── Seed fallback ────────────────────────────────────────────────────────────

/** Seed IndexedDB with local mock data so the UI works without any network. */
async function seedFromMockData(): Promise<void> {
  // Map CATEGORIES (skip 'all' pseudo-category)
  const catDtos: CategoryDto[] = SEED_CATEGORIES.filter((c) => c.id !== 'all').map((c, i) => ({
    id: i + 1,
    name: c.name,
    icon: c.icon,
    sortOrder: i,
    isActive: true,
    productCount: 0,
  }))

  const catNameToId = Object.fromEntries(catDtos.map((c) => [c.name.toLowerCase(), c.id]))

  const prodDtos: ProductDto[] = MOCK_PRODUCTS.map((p, i) => ({
    id: i + 1,
    name: p.name,
    price: p.price,
    costPrice: 0,
    stockQuantity: 99,
    trackStock: false,
    isActive: true,
    categoryId: catNameToId[p.category.toLowerCase()] ?? 1,
    categoryName: p.category,
    barcode: p.barcode,
    modifiersJson: undefined,
  }))

  await persistCategories(catDtos)
  await persistProducts(prodDtos)
  await setSetting('catalogSource', 'seed')
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface CatalogData {
  categories: Category[]
  products: Product[]
  /** 'cache' = IndexedDB hit, 'api' = fresh from backend, 'seed' = mock fallback */
  source: 'cache' | 'api' | 'seed'
}

/**
 * Load catalog using cache-first strategy.
 *
 * Returns data immediately from cache, then triggers a background refresh
 * against the API if possible. The `onRefresh` callback is called when the
 * background refresh completes with fresher data.
 */
export async function loadCatalog(
  onRefresh?: (data: CatalogData) => void,
): Promise<CatalogData> {
  // 1. Read from cache
  const [cachedCats, cachedProds] = await Promise.all([
    getCachedCategories(),
    getCachedProducts(),
  ])

  const hasCachedData = cachedCats.length > 0 && cachedProds.length > 0

  let initial: CatalogData

  if (hasCachedData) {
    initial = {
      categories: [{ id: 'all', name: 'All' }, ...cachedCats.map(adaptCategory)],
      products: cachedProds.map(adaptProduct),
      source: 'cache',
    }
  } else {
    // No cache — seed with mock data for immediate UX
    await seedFromMockData()
    const [seedCats, seedProds] = await Promise.all([getCachedCategories(), getCachedProducts()])
    initial = {
      categories: [{ id: 'all', name: 'All' }, ...seedCats.map(adaptCategory)],
      products: seedProds.map(adaptProduct),
      source: 'seed',
    }
  }

  // 2. Background refresh from API
  void refreshCatalogFromApi(onRefresh)

  return initial
}

/** Fetch fresh catalog from the API and update IndexedDB + notify caller. */
export async function refreshCatalogFromApi(
  onRefresh?: (data: CatalogData) => void,
): Promise<void> {
  try {
    const [catDtos, prodDtos] = await Promise.all([
      fetchCategories(true),
      fetchProducts({ activeOnly: true }),
    ])

    await persistCategories(catDtos)
    await persistProducts(prodDtos)
    await setSetting('catalogSource', 'api')
    await setSetting('lastCatalogSync', new Date().toISOString())

    if (onRefresh) {
      onRefresh({
        categories: [{ id: 'all', name: 'All' }, ...catDtos.map(adaptCategory)],
        products: prodDtos.map(adaptProduct),
        source: 'api',
      })
    }
  } catch {
    // API unreachable — keep existing cache, no crash
    console.warn('[CatalogCache] Could not refresh from API, using cached/seed data.')
  }
}

/** Find a product by barcode in the local IndexedDB (works offline). */
export async function findProductByBarcode(barcode: string): Promise<Product | undefined> {
  const db = await getDb()
  const idx = db.transaction('products').store.index('byBarcode')
  const dto = await idx.get(barcode)
  return dto ? adaptProduct(dto) : undefined
}

/** Returns ISO timestamp of the last successful API catalog sync, or null. */
export async function getLastCatalogSyncTime(): Promise<string | null> {
  return (await getSetting('lastCatalogSync')) ?? null
}
