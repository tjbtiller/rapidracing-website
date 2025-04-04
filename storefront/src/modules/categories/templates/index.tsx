import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
import { getCategoryByHandle } from '@lib/data/categories'
import { getProductsList, getStoreFilters } from '@lib/data/products'
import { getRegion } from '@lib/data/regions'
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

// Reusable error logging function
function logError(message: string, error: any) {
  console.error(`❌ ${message}:`, error.message, error.stack)
}

// Utility function to safely parse JSON
async function safeParseJSON(response: Response) {
  try {
    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    logError('Error parsing JSON response', error);
    return null;
  }
}

export default async function CategoryTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params: { countryCode: string; category: string[] }
}) {
  const { sortBy, page, collection, type, material, price } = searchParams
  const { countryCode, category } = params

  let region = null
  let currentCategory = null
  let filters = []
  let results = []
  let count = 0
  let recommendedProducts = []

  try {
    // Fetch region
    region = await getRegion(countryCode).catch((error) => {
      logError('Error fetching region', error)
      return null
    })
    if (!region) {
      console.error('❌ Region not found for countryCode:', countryCode)
      return notFound()
    }

    // Fetch category
    const categoryData = await getCategoryByHandle(category).catch((error) => {
      logError('Error fetching category', error);
      return null;
    });
    console.log('📦 Category Data:', categoryData);
    currentCategory = categoryData?.product_categories?.at(-1) || null
    if (!currentCategory) {
      console.error('❌ Current category not found for:', category)
      return notFound()
    }

    // Fetch filters
    filters = await getStoreFilters().then(safeParseJSON).catch((error) => {
      logError('Error fetching filters', error)
      return []
    })
    if (!filters || filters.length === 0) {
      console.warn('⚠️ No filters available.')
    }

    // Fetch products
    const pageNumber = page ? parseInt(page) : 1
    const searchRes = await search({
      currency_code: region.currency_code,
      category_id: currentCategory.id,
      order: sortBy || 'relevance',
      page: pageNumber,
      collection: collection?.split(','),
      type: type?.split(','),
      material: material?.split(','),
      price: price?.split(','),
    }).catch((error) => {
      logError('Error fetching products', error);
      return { results: [], count: 0 };
    });

    if (!searchRes || searchRes.results === undefined) {
      console.warn('⚠️ No products found for the given search parameters.');
      results = [];
      count = 0;
    } else {
      results = searchRes.results;
      count = searchRes.count;
    }

    // Fetch recommended products
    const productList = await getProductsList({
      pageParam: 0,
      queryParams: { limit: 9 },
      countryCode,
    }).catch((error) => {
      logError('Error fetching recommended products', error)
      return { response: { products: [] } }
    })

    recommendedProducts = productList?.response?.products || []
    if (recommendedProducts.length === 0) {
      console.warn('⚠️ No recommended products found.')
    }
  } catch (error) {
    logError('Unexpected error in CategoryTemplate', error)
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
          <ActiveProductFilters
            filters={filters}
            currentCategory={currentCategory}
            countryCode={countryCode}
          />
        </Box>
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
      {recommendedProducts && recommendedProducts.length > 0 ? (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={recommendedProducts}
            regionId={region.id}
            title="Recommended products"
          />
        </Suspense>
      ) : (
        console.warn('⚠️ No recommended products found.')
      )}
    </>
  )
}
