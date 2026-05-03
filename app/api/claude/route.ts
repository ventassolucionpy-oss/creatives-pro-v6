import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// ─────────────────────────────────────────────
// RUTA CENTRAL DE CLAUDE — Todas las llamadas a la API de Anthropic
// pasan por aquí. La API key NUNCA sale al browser.
// ─────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar autenticación
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
    }

    // 2. Obtener el cuerpo de la solicitud
    const body = await req.json()
    const { messages, max_tokens = 8000, system, tool: toolName, saveGeneration } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages es requerido.' }, { status: 400 })
    }

    // 3. Llamar a la API de Anthropic con la key del servidor
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY no configurada en variables de entorno del servidor')
      return NextResponse.json({ error: 'Configuración del servidor incompleta.' }, { status: 500 })
    }

    const anthropicBody: Record<string, unknown> = {
      model: 'claude-sonnet-4-20250514',
      max_tokens,
      messages,
    }
    if (system) anthropicBody.system = system

    const anthropicRes = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(anthropicBody),
    })

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.text()
      console.error('Anthropic API error:', anthropicRes.status, errBody)
      return NextResponse.json(
        { error: `Error de la API de IA (${anthropicRes.status}). Intentá nuevamente.` },
        { status: anthropicRes.status }
      )
    }

    const data = await anthropicRes.json()
    const rawText: string = data.content?.[0]?.text || ''

    // 4. Si se pide guardar la generación en Supabase
    if (saveGeneration && toolName) {
      // Parsear JSON si el output es JSON
      let parsedOutput: Record<string, unknown> | null = null
      try {
        let clean = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
        const s = clean.indexOf('{'), e = clean.lastIndexOf('}')
        if (s >= 0 && e > s) clean = clean.slice(s, e + 1)
        parsedOutput = JSON.parse(clean)
      } catch {
        // Si no es JSON, guardar como texto
        parsedOutput = { text: rawText }
      }

      try {
        await supabase.from('generations').insert({
          user_id: user.id,
          product_id: saveGeneration.product_id || null,
          tool: toolName,
          status: 'completed',
          input: saveGeneration.input || {},
          output: parsedOutput,
        })
      } catch (dbErr) {
        // No fallar si el guardado falla — el usuario igual recibe el output
        console.error('Error guardando generación:', dbErr)
      }
    }

    return NextResponse.json({ text: rawText, usage: data.usage })
  } catch (err: unknown) {
    console.error('Error en /api/claude:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error desconocido' },
      { status: 500 }
    )
  }
}
