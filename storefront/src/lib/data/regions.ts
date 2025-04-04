import { cache } from 'react'

import { sdk } from '@lib/config'
import medusaError from '@lib/util/medusa-error'
import { HttpTypes } from '@medusajs/types'

export const listRegions = cache(async function () {
  return sdk.store.region
    .list({}, { next: { tags: ['regions'] } })
    .then(({ regions }) => regions)
    .catch(medusaError)
})

export const retrieveRegion = cache(async function (id: string) {
  return sdk.store.region
    .retrieve(id, {}, { next: { tags: ['regions'] } })
    .then(({ region }) => region)
    .catch(medusaError)
})

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = cache(async function (countryCode: string) {
  try {
    console.log("📦 Fetching regions from Medusa...")

    const regions = await listRegions()

    console.log("✅ Regions fetched:", regions)

    if (!regions) return null

    regions.forEach((region) => {
      region.countries?.forEach((c) => {
        console.log(`📍 Mapping country: ${c?.iso_2} to region ${region.name}`)
        regionMap.set(c?.iso_2 ?? '', region)
      })
    })

    const region = countryCode
      ? regionMap.get(countryCode)
      : regionMap.get('us')

    return region
  } catch (e: any) {
    console.error("❌ getRegion failed:", e)
    return null
  }
})
