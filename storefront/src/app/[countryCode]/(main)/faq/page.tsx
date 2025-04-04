import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getFAQ } from '@lib/data/fetch'
import { Box } from '@modules/common/components/box'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import { FAQAccordion } from '@modules/content/components/faq-accordion'
import SidebarBookmarks from '@modules/content/components/sidebar-bookmarks'
import StoreBreadcrumbs from '@modules/store/templates/breadcrumbs'

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Find quick answers to common questions about our products/services.',
}

export default async function FAQPage() {
  try {
    console.log('📦 Fetching FAQ data...')

    const response = await getFAQ()
    const FAQSection = response?.data?.FAQSection || []

    if (!FAQSection.length) {
      console.warn('⚠️ No FAQ sections available.')
      return notFound()
    }

    const bookmarks = FAQSection.map((section) => ({
      id: section.Bookmark,
      label: section.Title,
    }))

    console.log(`✅ Loaded ${FAQSection.length} FAQ sections.`)

    return (
      <Container className="min-h-screen max-w-full bg-secondary !p-0">
        <Container className="!py-8">
          <StoreBreadcrumbs breadcrumb="Frequently asked questions" />
          <Heading as="h1" className="mt-4 text-4xl medium:text-5xl">
            Frequently asked questions
          </Heading>
          <Box className="mt-6 grid grid-cols-12 medium:mt-12">
            <Box className="col-span-12 mb-10 medium:col-span-3 medium:mb-0">
              <SidebarBookmarks data={bookmarks} />
            </Box>

            <Box className="col-span-12 space-y-10 medium:col-span-8 medium:col-start-5">
              {FAQSection.map((section, id) => (
                <FAQAccordion key={id} data={section} />
              ))}
            </Box>
          </Box>
        </Container>
      </Container>
    )
  } catch (err: any) {
    console.error('❌ Error loading FAQ page:', err.message || err)
    return notFound()
  }
}
