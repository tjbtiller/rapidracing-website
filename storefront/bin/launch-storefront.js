#!/usr/bin/env node

const { execaCommandSync } = require('execa')

execaCommandSync('pnpm run wait', { stdio: 'inherit' })
execaCommandSync('pnpm run build', { stdio: 'inherit' })
