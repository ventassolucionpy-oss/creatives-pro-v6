// ─────────────────────────────────────────────
// lib/claude-client.ts
// Helper centralizado para llamar a Claude desde el browser.
// NUNCA llama a api.anthropic.com directamente — todo va por /api/claude.
// ─────────────────────────────────────────────

type Message = { role: 'user' | 'assistant'; content: string }

type CallClaudeOptions = {
  messages: Message[]
  maxTokens?: number
  system?: string
  /** Si se provee, guarda la generación en Supabase */
  saveGeneration?: {
    tool: string
    product_id?: string
    input?: Record<string, unknown>
  }
}

type CallClaudeResult = {
  text: string
  usage?: { input_tokens: number; output_tokens: number }
}

/**
 * Llama a Claude a través del servidor seguro.
 * La API key nunca sale al browser.
 */
export async function callClaude(options: CallClaudeOptions): Promise<CallClaudeResult> {
  const { messages, maxTokens = 8000, system, saveGeneration } = options

  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      max_tokens: maxTokens,
      ...(system && { system }),
      ...(saveGeneration && { tool: saveGeneration.tool, saveGeneration }),
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Error ${res.status}`)
  }

  const data = await res.json()
  if (data.error) throw new Error(data.error)

  return { text: data.text, usage: data.usage }
}

/**
 * Llama a Claude esperando una respuesta JSON.
 * Parsea automáticamente y extrae el objeto JSON del texto.
 */
export async function callClaudeJSON<T = Record<string, unknown>>(
  options: CallClaudeOptions
): Promise<T> {
  const { text } = await callClaude(options)

  // Limpiar fences de markdown y extraer el JSON
  let clean = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
  const s = clean.indexOf('{')
  const e = clean.lastIndexOf('}')
  if (s >= 0 && e > s) clean = clean.slice(s, e + 1)

  try {
    return JSON.parse(clean) as T
  } catch {
    throw new Error('La IA devolvió una respuesta inesperada. Intentá nuevamente.')
  }
}
