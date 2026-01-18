#!/usr/bin/env node

/**
 * Coverage Threshold Checker
 * Validates that test coverage meets the required 80% threshold
 */

const fs = require('fs')
const path = require('path')

const COVERAGE_THRESHOLD = 80

function checkCoverage() {
  const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')

  if (!fs.existsSync(coveragePath)) {
    console.error('❌ Coverage summary not found. Run tests with --coverage first.')
    process.exit(1)
  }

  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
  const total = coverage.total

  const metrics = {
    statements: total.statements.pct,
    branches: total.branches.pct,
    functions: total.functions.pct,
    lines: total.lines.pct,
  }

  console.log('\n📊 Coverage Report:')
  console.log('─'.repeat(50))

  let allPassed = true

  Object.entries(metrics).forEach(([metric, percentage]) => {
    const passed = percentage >= COVERAGE_THRESHOLD
    const icon = passed ? '✅' : '❌'
    const status = passed ? 'PASS' : 'FAIL'

    console.log(`${icon} ${metric.padEnd(15)}: ${percentage.toFixed(2)}% [${status}]`)

    if (!passed) {
      allPassed = false
    }
  })

  console.log('─'.repeat(50))

  if (allPassed) {
    console.log(`\n✅ All coverage thresholds met (≥${COVERAGE_THRESHOLD}%)\n`)
    process.exit(0)
  } else {
    console.log(`\n❌ Coverage below threshold (${COVERAGE_THRESHOLD}%)\n`)
    process.exit(1)
  }
}

checkCoverage()
