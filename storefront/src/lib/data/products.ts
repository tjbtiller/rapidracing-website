import { unstable_noStore as noStore } from 'next/cache'

import { sdk } from '@lib/config'
import { HttpTypes } from '@medusajs/types'
import { BACKEND_URL, PUBLISHABLE_API_KEY } from '@modules/search/actions'
import { ProductFilters } from 'types/global'

import { getRegion } from './regions'

export const getProductsById = async function ({
  ids,
  regionId,
}: {
  ids: string[]
  regionId: string
}) {
  return sdk.store.product
    .list(
      {
        id: ids,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products)
}

export const getProductByHandle = async function (
  handle: string,
  regionId: string
) {
  return sdk.store.product
    .list(
      {
        handle,
        region_id: regionId,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices,*categories,+metadata',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products }) => products[0])
}

export const getProductsList = async function ({
  pageParam = 1,
  queryParams,
  countryCode,
}: {
  pageParam?: number
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
  countryCode: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: HttpTypes.FindParams & HttpTypes.StoreProductParams
}> {
  noStore()

  const limit = queryParams?.limit || 12
  const offset = Math.max(0, (pageParam - 1) * limit)

  let region

  try {
    region = await getRegion(countryCode)
    if (!region) throw new Error(`No region found for country code: ${countryCode}`)
    console.log('📦 Region from getRegion():', region)
  } catch (error: any) {
    console.error('❌ Error resolving region:', error?.message || error)
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  try {
    console.log(`🔎 Fetching products with region_id: ${region.id}`)

    const { products } = await sdk.store.product.list(
      {
        limit,
        offset,
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
        ...queryParams,
      },
      { next: { tags: ['products'] } }
    )

    console.log(`✅ Medusa returned ${products.length} products`)

    const filteredProducts = products.filter((product) => {
      if (product.variants.length === 1) {
        return product.variants[0].inventory_quantity > 0
      }
      return product.variants.length > 1
    })

    const filteredCount = filteredProducts.length
    const nextPage = filteredCount > offset + limit ? pageParam + 1 : null

    console.log(`✅ Filtered to ${filteredCount} available products`)

    return {
      response: {
        products: filteredProducts,
        count: filteredCount,
      },
      nextPage,
      queryParams,
    }
  } catch (err: any) {
    console.error('❌ Error fetching products from Medusa:', err?.message || err)
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }
}

export const getProductsListByCollectionId = async function ({
  collectionId,
  countryCode,
  excludeProductId,
  limit = 12,
  offset = 0,
}: {
  collectionId: string
  countryCode: string
  excludeProductId?: string
  limit?: number
  offset?: number
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
}> {
  const region = await getRegion(countryCode)

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  return sdk.store.product
    .list(
      {
        limit,
        offset,
        collection_id: [collectionId],
        region_id: region.id,
        fields:
          '*variants.calculated_price,+variants.inventory_quantity,*variants,*variants.prices',
      },
      { next: { tags: ['products'] } }
    )
    .then(({ products, count }) => {
      if (excludeProductId) {
        products = products.filter((product) => product.id !== excludeProductId)
      }

      const nextPage = count > offset + limit ? offset + limit : null

      return {
        response: {
          products,
          count,
        },
        nextPage,
      }
    })
}

export const getStoreFilters = async function () {
  const filters: ProductFilters = await fetch(
    `${BACKEND_URL}/store/filter-product-attributes`,
    {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
      },
    }
  ).then((res) => res.json())

  return filters
}
