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
  try {
    console.log('📦 Fetching About Us and blog data...')

    // Fetch About Us
    const aboutUsResponse = await getAboutUs()
    const aboutUsData = aboutUsResponse?.data

    if (!aboutUsData) {
      console.error('❌ No About Us data returned from Strapi')
      return notFound()
    }

    // Destructure CMS content
    const {
      Banner: bannerData,
      OurStory,
      WhyUs,
      OurCraftsmanship,
      Numbers,
    } = aboutUsData

    if (!bannerData || !OurStory || !WhyUs || !OurCraftsmanship || !Numbers) {
      console.error('❌ One or more critical sections are missing in About Us data')
      return notFound()
    }

    // Fetch blog posts
    let blogPosts = []
    try {
      const blogResponse = await getExploreBlogData()
      blogPosts = blogResponse?.data || []
    } catch (err) {
      console.warn('⚠️ Failed to fetch blog posts:', err)
    }

    console.log('✅ About Us page rendered successfully.')

    return (
      <>
        {bannerData && <Banner data={bannerData} />}
        {OurStory && <BasicContentSection data={OurStory} />}
        {WhyUs && <FramedTextSection data={WhyUs} />}
        {OurCraftsmanship && <BasicContentSection data={OurCraftsmanship} />}
        {Numbers && <NumericalSection data={Numbers} />}
        {blogPosts?.length > 0 ? (
          <ExploreBlog posts={blogPosts} />
        ) : (
          <p className="text-center text-secondary mt-6">No blog posts available.</p>
        )}
      </>
    )
  } catch (error: any) {
    console.error('❌ Unexpected error in AboutUsPage:', error?.message || error)
    return notFound()
  }
}
