import { Metadata } from 'next'

import { getBlogPostCategories } from '@lib/data/fetch'
import { getProductsList } from '@lib/data/products'
import BlogTemplate from '@modules/blog/templates'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Read our latest blog posts',
}

type Params = {
  searchParams: Promise<{
    sortBy?: string
    page?: string
    category?: string
    q?: string
  }>
  params: Promise<{
    countryCode: string
  }>
}

export default async function BlogPage(props: Params) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { sortBy, page, category, q } = searchParams
  const { data: categories } = await getBlogPostCategories()

  // TODO: Add logic in future
  const {
    response: { products: recommendedProducts },
  } = await getProductsList({
    pageParam: 0,
    queryParams: {
      limit: 9,
    },
    countryCode: params.countryCode,
  })

  return (
    <BlogTemplate
      sortBy={sortBy}
      page={page}
      categories={categories}
      currentCategory={category}
      query={q}
      countryCode={params.countryCode}
      recommendedProducts={recommendedProducts}
    />
  )
}
