#!/usr/bin/env tsx

import { execaCommandSync } from 'execa'

execaCommandSync('pnpm run wait', { stdio: 'inherit' })
execaCommandSync('pnpm run build', { stdio: 'inherit' })
