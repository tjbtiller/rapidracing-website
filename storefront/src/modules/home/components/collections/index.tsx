import { useMemo } from 'react'
import Image from 'next/image'

import { cn } from '@lib/util/cn'
import { StoreCollection } from '@medusajs/types'
import { Box } from '@modules/common/components/box'
import { Button } from '@modules/common/components/button'
import { Container } from '@modules/common/components/container'
import { Heading } from '@modules/common/components/heading'
import LocalizedClientLink from '@modules/common/components/localized-client-link'
import { Text } from '@modules/common/components/text'
import { CollectionsData } from 'types/strapi'

const CollectionTile = ({
  title,
  handle,
  imgSrc,
  description,
  id,
}: {
  title: string
  handle: string
  imgSrc: string
  description: string
  id: number
}) => {
  return (
    <Box
      className={cn('group relative', {
        'small:col-start-2 small:row-start-1 small:row-end-3': id === 2,
      })}
    >
      <Image
        src={imgSrc}
        alt={`${title} collection image`}
        width={600}
        height={300}
        loading="lazy"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="h-full w-full object-cover object-center"
      />
      <Box className="absolute left-0 top-0 hidden h-full w-full flex-col p-6 small:flex large:p-10">
        <Button
          asChild
          className="w-max self-end transition-all duration-500 ease-in-out large:opacity-0 large:group-hover:opacity-100"
        >
          <LocalizedClientLink href={`/collections/${handle}`}>
            Discover
          </LocalizedClientLink>
        </Button>
        <Box className="mt-auto text-static">
          <Heading as="h3" className="mt-auto text-2xl large:text-3xl">
            {title}
          </Heading>
          <Text
            size="lg"
            className="line-clamp-2 transition-all duration-500 ease-in-out large:h-0 large:opacity-0 large:group-hover:h-12 large:group-hover:opacity-100"
          >
            {description}
          </Text>
        </Box>
      </Box>
      <Box className="absolute left-0 top-0 block h-full w-full p-6 small:hidden large:p-10">
        <LocalizedClientLink
          href={`/collections/${handle}`}
          className="flex h-full w-full flex-col justify-end"
        >
          <Heading as="h3" className="text-2xl text-static large:text-3xl">
            {title}
          </Heading>
        </LocalizedClientLink>
      </Box>
    </Box>
  )
}

const Collections = ({
  cmsCollections,
  medusaCollections,
}: {
  cmsCollections: CollectionsData
  medusaCollections: StoreCollection[]
}) => {
  const validCollections = useMemo(() => {
    try {
      if (!cmsCollections?.data?.length || !medusaCollections?.length) {
        console.warn('⚠️ No collections available from CMS or Medusa.')
        return []
      }

      const collections = cmsCollections.data.filter((cmsCollection) =>
        medusaCollections.some(
          (medusaCollection) => medusaCollection.handle === cmsCollection.Handle
        )
      )

      if (!collections || collections.length === 0) {
        console.warn('⚠️ No valid collections found after filtering.')
        return []
      }

      return collections.sort((a, b) => b.id - a.id)
    } catch (error) {
      console.error('❌ Error processing valid collections:', error.message, error.stack)
      return []
    }
  }, [cmsCollections, medusaCollections])

  const newestCollections = useMemo(() => {
    try {
      if (!validCollections || validCollections.length === 0) {
        console.warn('⚠️ No valid collections to process for newest collections.')
        return []
      }
      return validCollections.slice(0, 3)
    } catch (error) {
      console.error('❌ Error processing newest collections:', error.message, error.stack)
      return []
    }
  }, [validCollections])

  if (!newestCollections || newestCollections.length === 0) {
    console.warn('⚠️ No newest collections to display.')
    return (
      <Container className="text-center py-10">
        <p className="text-lg text-secondary">No collections available at the moment.</p>
      </Container>
    )
  }

  return (
    <Container className="grid max-h-[660px] grid-rows-3 gap-2 small:max-h-[440px] small:grid-cols-2 small:grid-rows-2 large:max-h-[660px]">
      {newestCollections.map((element, id) => (
        <CollectionTile
          key={id}
          title={element.Title}
          handle={element.Handle}
          imgSrc={element.Image?.url || '/placeholder.jpg'} // Fallback to a placeholder image
          description={element.Description || 'No description available.'} // Fallback description
          id={id}
        />
      ))}
    </Container>
  )
}

export default Collections
