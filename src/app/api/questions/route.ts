import { promises as fs } from 'node:fs'
import path from 'node:path'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'questions.json')
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ questoes: [], textos_compartilhados: [] }, { status: 200 })
  }
}
