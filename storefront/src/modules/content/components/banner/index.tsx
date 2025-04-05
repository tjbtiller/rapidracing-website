import Image from 'next/image'

import { Container } from '@modules/common/components/container'
import { RapidRacingLogoBig } from '@modules/common/icons'
import { StrapiPhotoAttributes } from 'types/strapi'

export const Banner = ({ data }: { data: StrapiPhotoAttributes[] }) => {
  return (
    <Container className="flex flex-col gap-6 text-basic-primary small:gap-12">
      <Image
        src={data[0].url}
        alt={data[0].alternativeText ?? `Banner image`}
        height={300}
        width={1400}
        className="h-[208px] w-full object-cover large:h-[288px]"
      />
      {data[1] ? (
        <Image
          src={data[1].url}
          alt={data[1].alternativeText ?? `Banner logo`}
          height={208}
          width={1400}
          className="h-auto w-full dark:invert"
        />
      ) : (
        <img src="/RapidRacing.png" alt="Rapid Racing Logo" />
      )}
    </Container>
  )
}
