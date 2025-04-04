#!/usr/bin/env node

;(async () => {
    const { execaCommandSync } = await import('execa')

    execaCommandSync('pnpm run build', { stdio: 'inherit' })
})()
