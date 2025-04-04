import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
import { getCollectionByHandle } from '@lib/data/collections'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import RefinementList from '@modules/common/components/sort'
import { Text } from '@modules/common/components/text'
import { ProductCarousel } from '@modules/products/components/product-carousel'
import { search } from '@modules/search/actions'
import SkeletonProductGrid from '@modules/skeletons/templates/skeleton-product-grid'
import SkeletonProductsCarousel from '@modules/skeletons/templates/skeleton-products-carousel'
import ProductFilters from '@modules/store/components/filters'
import ActiveProductFilters from '@modules/store/components/filters/active-filters'
import ProductFiltersDrawer from '@modules/store/components/filters/filters-drawer'
import PaginatedProducts from '@modules/store/templates/paginated-products'

export const runtime = 'edge'

export default async function CollectionTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; handle: string }
}) {
  const { sortBy, page, type, material, price } = searchParams
  const { countryCode, handle } = params

  let region = null
  let currentCollection = null
  let filters = []
  let results = []
  let count = 0
  let recommendedProducts = []

  try {
    // Fetch region
    try {
      region = await getRegion(countryCode)
      if (!region) {
        console.error('❌ Region not found for countryCode:', countryCode)
        return notFound()
      }
    } catch (error) {
      console.error('❌ Error fetching region:', error.message, error.stack)
      return notFound()
    }

    // Fetch collection
    try {
      currentCollection = await getCollectionByHandle(handle)
      if (!currentCollection) {
        console.error('❌ Collection not found for handle:', handle)
        return notFound()
      }
    } catch (error) {
      console.error('❌ Error fetching collection:', error.message, error.stack)
      return notFound()
    }

    // Fetch filters
    try {
      filters = await getStoreFilters()
      if (!filters || filters.length === 0) {
        console.warn('⚠️ No filters available.')
        filters = [] // Fallback to an empty array
      }
    } catch (error) {
      console.error('❌ Error fetching filters:', error.message, error.stack)
      filters = [] // Fallback to an empty array
    }

    // Fetch products
    try {
      const pageNumber = page ? parseInt(page) : 1
      const searchRes = await search({
        currency_code: region.currency_code,
        order: sortBy || 'relevance',
        page: pageNumber,
        collection: [currentCollection.id],
        type: type?.split(','),
        material: material?.split(','),
        price: price?.split(','),
      })

      results = searchRes?.results || []
      count = searchRes?.count || 0

      if (results.length === 0) {
        console.warn('⚠️ No products found for the given search parameters.')
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error.message, error.stack)
      results = [] // Fallback to an empty array
      count = 0
    }

    // Fetch recommended products
    try {
      const productList = await getProductsList({
        pageParam: 0,
        queryParams: { limit: 9 },
        countryCode,
      })

      recommendedProducts = productList?.response?.products || []
      if (recommendedProducts.length === 0) {
        console.warn('⚠️ No recommended products found.')
      }
    } catch (error) {
      console.error('❌ Error fetching recommended products:', error.message, error.stack)
      recommendedProducts = [] // Fallback to an empty array
    }
  } catch (error) {
    console.error('❌ Unexpected error in CollectionTemplate:', error.message, error.stack)
    return notFound()
  }

  return (
    <>
      <Container className="flex flex-col gap-8 !pb-8 !pt-4">
        <Box className="flex flex-col gap-4">
          <Text className="text-md text-secondary">
            {count === 1 ? `${count} product` : `${count} products`}
          </Text>
          <Box className="grid w-full grid-cols-2 items-center justify-between gap-2 small:flex small:flex-wrap">
            <Box className="hidden small:flex">
              <ProductFilters filters={filters} />
            </Box>
            <ProductFiltersDrawer>
              <ProductFilters filters={filters} />
            </ProductFiltersDrawer>
            <RefinementList
              options={storeSortOptions}
              sortBy={sortBy || 'relevance'}
            />
          </Box>
        </Box>
        <ActiveProductFilters
          filters={filters}
          currentCollection={currentCollection}
          countryCode={countryCode}
        />
        <Suspense fallback={<SkeletonProductGrid />}>
          {results && results.length > 0 ? (
            <PaginatedProducts
              products={results}
              page={page ? parseInt(page) : 1}
              total={count}
              countryCode={countryCode}
            />
          ) : (
            <p className="py-10 text-center text-lg text-secondary">
              No products.
            </p>
          )}
        </Suspense>
      </Container>
      {recommendedProducts.length > 0 && (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={recommendedProducts}
            regionId={region.id}
            title="Recommended products"
          />
        </Suspense>
      )}
    </>
  )
}
