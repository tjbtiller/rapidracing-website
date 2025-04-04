import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getAboutUs, getExploreBlogData } from '@lib/data/fetch'
import { Banner } from '@modules/content/components/banner'
import { BasicContentSection } from '@modules/content/components/basic-content-section'
import { FramedTextSection } from '@modules/content/components/framed-text-section'
import { NumericalSection } from '@modules/content/components/numerical-section'
import { ExploreBlog } from '@modules/home/components/explore-blog'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'At Rapid Racing, we deliver innovative products designed to meet your needs with quality and care.',
}

export default async function AboutUsPage() {
  let aboutUsData = null
  let blogPosts = []

  try {
    // Fetch About Us data
    try {
      const aboutUsResponse = await getAboutUs()
      aboutUsData = aboutUsResponse?.data || null

      if (!aboutUsData) {
        console.error('❌ About Us data is missing or invalid.')
        return notFound()
      }
    } catch (error) {
      console.error('❌ Error fetching About Us data:', error.message, error.stack)
      return notFound()
    }

    // Fetch Explore Blog data
    try {
      const blogResponse = await getExploreBlogData()
      blogPosts = blogResponse?.data || []

      if (!blogPosts.length) {
        console.warn('⚠️ No blog posts available.')
      }
    } catch (error) {
      console.error('❌ Error fetching Explore Blog data:', error.message, error.stack)
      blogPosts = [] // Fallback to an empty array
    }
  } catch (error) {
    console.error('❌ Unexpected error in AboutUsPage:', error.message, error.stack)
    return notFound()
  }

  const { Banner: bannerData, OurStory, WhyUs, OurCraftsmanship, Numbers } = aboutUsData || {}

  return (
    <>
      {bannerData && <Banner data={bannerData} />}
      {OurStory && <BasicContentSection data={OurStory} />}
      {WhyUs && <FramedTextSection data={WhyUs} />}
      {OurCraftsmanship && <BasicContentSection data={OurCraftsmanship} />}
      {Numbers && <NumericalSection data={Numbers} />}
      {blogPosts.length > 0 && <ExploreBlog posts={blogPosts} />}
    </>
  )
}
