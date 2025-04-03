import React from 'react'
import Image from 'next/image'

import { clx, Container } from '@medusajs/ui'
import { PlaceholderImage } from '@modules/common/icons'

type ThumbnailProps = {
  thumbnail?: string | null
  // TODO: Fix image typings
  images?: any[] | null
  size?: 'small' | 'medium' | 'large' | 'full' | 'square'
  isFeatured?: boolean
  className?: string
  'data-testid'?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = 'small',
  isFeatured,
  className,
  'data-testid': dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        'relative w-full overflow-hidden rounded-none p-4 shadow-none duration-150 ease-in-out',
        className,
        {
          'aspect-[11/14]': isFeatured,
          'aspect-[9/16]': !isFeatured && size !== 'square',
          'aspect-[1/1]': size === 'square',
          'w-[180px]': size === 'small',
          'w-[290px]': size === 'medium',
          'w-[440px]': size === 'large',
          'w-full': size === 'full',
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} size={size} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
  size,
}: Pick<ThumbnailProps, 'size'> & { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Thumbnail"
      className="absolute inset-0 object-cover object-center"
      draggable={false}
      quality={50}
      priority
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center">
      <PlaceholderImage size={size === 'small' ? 16 : 24} />
    </div>
  )
}

export default Thumbnail
