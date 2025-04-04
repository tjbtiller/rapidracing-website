#!/usr/bin/env tsx

import waitOn from 'wait-on'

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'https://backend-production-6e0f.up.railway.app/app'

console.log('⏳ Waiting for backend:', backendUrl)

async function main() {
  await waitOn({
    resources: [backendUrl],
    interval: 1000,
    timeout: 300000, // 5 mins
  })

  console.log('✅ Backend is up!')
}

main()
