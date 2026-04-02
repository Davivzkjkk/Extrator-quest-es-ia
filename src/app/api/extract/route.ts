import { promises as fs } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function runExtractorCommand(command: string, args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe']
    })

    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (err) => {
      reject(err)
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(stderr || `Extractor exited with code ${code}`))
    })
  })
}

function resolvePythonBinary(root: string) {
  const candidates = [
    path.join(root, '.venv', 'bin', 'python'),
    path.join(root, '.venv', 'Scripts', 'python.exe')
  ]
  return Promise.all(candidates.map((p) => fs.access(p).then(() => p).catch(() => null))).then((results) => {
    const found = results.find((entry) => Boolean(entry))
    return found || 'python'
  })
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Arquivo PDF não enviado.' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ error: 'Envie um arquivo PDF válido.' }, { status: 400 })
    }

    const projectRoot = process.cwd()
    const pdfPath = path.join(projectRoot, 'EsPCEx.pdf')
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(pdfPath, buffer)

    const python = await resolvePythonBinary(projectRoot)
    await runExtractorCommand(python, ['pdf_vision_engine.py'], projectRoot)

    const outputPath = path.join(projectRoot, 'public', 'data', 'questions.json')
    const raw = await fs.readFile(outputPath, 'utf-8')
    const payload = JSON.parse(raw)

    return NextResponse.json(payload, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro interno durante a extração.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
