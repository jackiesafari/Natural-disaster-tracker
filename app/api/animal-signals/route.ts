import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { NextResponse } from 'next/server'

import type { AnimalSignalRecord } from '@/lib/animal-signals'
import { summarizeSignals } from '@/lib/animal-signals'

async function loadRecords(fileName: string): Promise<AnimalSignalRecord[]> {
  const filePath = path.join(process.cwd(), 'data', 'animal-signals', fileName)
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw) as AnimalSignalRecord[]
}

export async function GET() {
  try {
    const generatedPath = path.join(process.cwd(), 'data', 'animal-signals', 'generated', 'latest.json')
    if (existsSync(generatedPath)) {
      const generatedRaw = await readFile(generatedPath, 'utf8')
      return NextResponse.json(JSON.parse(generatedRaw), { status: 200 })
    }

    const [birds, frogs] = await Promise.all([
      loadRecords('bird-signals.sample.json'),
      loadRecords('frog-signals.sample.json'),
    ])

    const allRecords = [...birds, ...frogs]
    const summary = summarizeSignals(allRecords)

    return NextResponse.json(
      {
        generatedAt: new Date().toISOString(),
        totals: summary.totals,
        records: allRecords,
        features: summary.features,
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to load animal signal records',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
