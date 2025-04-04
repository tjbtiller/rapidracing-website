import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getContentPage } from '@lib/data/fetch'
import { serializeMdx } from '@lib/util/serializeMdx'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import SidebarBookmarks from '@modules/content/components/sidebar-bookmarks'
import { MDXRemote } from '@modules/mdx/MDXRemote'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description:
    'Review the terms governing the use of our website, products and services, including user responsibilities, legal rights, and policies.',
}

export default async function TermsAndConditionsPage() {
  try {
    console.log('📦 Fetching Terms & Conditions content...')

    const contentResponse = await getContentPage(
      'terms-and-condition',
      'terms-and-conditions'
    )

    const pageContent = contentResponse?.data?.PageContent

    if (!pageContent) {
      console.error('❌ No PageContent found for Terms & Conditions')
      return notFound()
    }

    const mdxSource = await serializeMdx(pageContent)

    const bookmarks =
      mdxSource?.frontmatter?.headings?.map((heading: any) => ({
        id: heading.id,
        label: heading.title,
      })) || []

    console.log('✅ Terms & Conditions page loaded.')

    return (
      <Container className="min-h-screen max-w-full bg-secondary !p-0">
        <Container className="!py-8">
          <StoreBreadcrumbs breadcrumb="Terms & Conditions" />
          <Heading as="h1" className="mt-4 text-4xl medium:text-5xl">
            Terms & Conditions
          </Heading>
          <Box className="mt-6 grid grid-cols-12 medium:mt-12">
            <Box className="col-span-12 mb-10 medium:col-span-3 medium:mb-0">
              <SidebarBookmarks data={bookmarks} />
            </Box>
            <Box className="col-span-12 space-y-10 medium:col-span-8 medium:col-start-5">
              <MDXRemote source={mdxSource} />
            </Box>
          </Box>
        </Container>
      </Container>
    )
  } catch (error: any) {
    console.error('❌ Unexpected error loading Terms & Conditions:', error.message || error)
    return notFound()
  }
}
