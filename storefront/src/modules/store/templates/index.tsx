'use client'

import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { storeSortOptions } from '@lib/constants'
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

import ProductFilters from '../components/filters'
import ActiveProductFilters from '../components/filters/active-filters'
import ProductFiltersDrawer from '../components/filters/filters-drawer'
import PaginatedProducts from './paginated-products'

export const runtime = 'edge'

export default async function StoreTemplate({
  searchParams,
  params,
}: {
  searchParams: Record<string, string>
  params?: { countryCode?: string }
}) {
  const countryCode = params?.countryCode || 'us'
  const pageNumber = searchParams.page ? parseInt(searchParams.page) : 1

  let region = null
  let filters = []
  let results = []
  let count = 0
  let recommendedProducts = []

  try {
    region = await getRegion(countryCode)
    console.log('Region:', region);

    if (!region || !region.currency_code) {
      console.error('Invalid region data:', region);
      return notFound();
    }

    try {
      filters = await getStoreFilters();
      console.log('Filters Response:', filters);

      if (!filters || filters.length === 0) {
        console.warn('No filters available.');
        filters = []; // Provide a fallback to avoid breaking the UI.
      }
    } catch (error) {
      console.error('Error fetching filters:', error.message, error.stack);
      filters = []; // Fallback to an empty array.
    }

    console.log('Search Params:', searchParams);

    const searchRes = await search({
      currency_code: region.currency_code,
      order: searchParams.sortBy || 'relevance', // Default to 'relevance'
      page: pageNumber || 1, // Default to page 1
      collection: searchParams.collection?.split(',') || [], // Default to empty array
      type: searchParams.type?.split(',') || [], // Default to empty array
      material: searchParams.material?.split(',') || [], // Default to empty array
      price: searchParams.price?.split(',') || [], // Default to empty array
    });

    console.log('Search Response:', searchRes);

    results = searchRes?.results || [];
    count = searchRes?.count || 0;

    if (results.length === 0) {
      console.warn('No products found for the given search parameters.');
      console.log('Search Response:', searchRes);
    }

    try {
      const productList = await getProductsList({
        pageParam: 0,
        queryParams: { limit: 9 },
        countryCode,
      });

      recommendedProducts = productList?.response?.products || [];
      console.log('Recommended Products:', recommendedProducts);
    } catch (error) {
      console.error('Error fetching recommended products:', error.message, error.stack);
      recommendedProducts = [];
    }
  } catch (error) {
    console.error('❌ Error in StoreTemplate:', error)
    return notFound()
  }

  console.log('Search Params:', searchParams)
  console.log('Filters:', filters)
  console.log('Region:', region)

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
              sortBy={searchParams.sortBy || 'relevance'}
            />
          </Box>
        </Box>
        <ActiveProductFilters countryCode={countryCode} filters={filters} />
        <Suspense fallback={<SkeletonProductGrid />}>
          {results && results.length > 0 ? (
            <PaginatedProducts
              products={results}
              page={pageNumber}
              total={count}
              countryCode={countryCode}
            />
          ) : (
            <p className="py-10 text-center text-lg text-secondary">
              No products found. Please adjust your filters.
            </p>
          )}
        </Suspense>
      </Container>

      {recommendedProducts.length > 0 ? (
        <Suspense fallback={<SkeletonProductsCarousel />}>
          <ProductCarousel
            products={recommendedProducts}
            regionId={region.id}
            title="Recommended products"
          />
        </Suspense>
      ) : (
        <p className="py-10 text-center text-lg text-secondary">
          No recommended products available at the moment.
        </p>
      )}
    </>
  )
}
