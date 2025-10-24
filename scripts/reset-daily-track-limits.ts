#!/usr/bin/env ts-node

// Script to reset daily track limits for all users
// This should be run daily at midnight

import { resetDailyTrackLimits } from '../src/lib/track-limits'

async function main() {
  console.log('Resetting daily track limits...')
  
  try {
    await resetDailyTrackLimits()
    console.log('Daily track limits reset successfully')
  } catch (error) {
    console.error('Error resetting daily track limits:', error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}