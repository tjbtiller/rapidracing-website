#!/usr/bin/env tsx

import waitOn from 'wait-on'

// Fallback to a valid backend endpoint
const backendUrl =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL?.replace(/\/+$/, '') ?? 
  'https://backend-production-6e0f.up.railway.app'

const healthcheckEndpoint = `${backendUrl}/store/products` // adjust to a known good endpoint

console.log(`⏳ Waiting for backend: ${healthcheckEndpoint}`)

async function main() {
  if (process.env.SKIP_WAIT === 'true') {
    console.log('⏩ SKIP_WAIT is true — skipping backend wait')
    process.exit(0)
  }

  try {
    await waitOn({
      resources: [healthcheckEndpoint],
      interval: 1000,
      timeout: 300000, // 5 minutes
      validateStatus: (status: number) => status >= 200 && status < 500, // accept 2xx–4xx
      headers: { accept: 'application/json' },
    })

    console.log('✅ Backend is up!')
  } catch (err) {
    console.error('❌ Backend failed to respond in time')
    console.error(err)
    process.exit(1)
  }
}

main()
