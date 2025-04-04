#!/usr/bin/env tsx

import waitOn from 'wait-on'

await waitOn({
  resources: [process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000'],
  interval: 1000,
  timeout: 300000, // 5 minutes
})
