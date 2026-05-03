import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook receptor de Dropi para actualización automática de estado de pedidos
// Configurar en Dropi: Settings → Webhooks → URL: https://tuapp.com/api/dropi-webhook

const DROPI_WEBHOOK_SECRET = process.env.DROPI_WEBHOOK_SECRET || ''

const ESTADO_MAP: Record<string, string> = {
  'pendiente': 'pendiente',
  'confirmado': 'confirmado',
  'en_camino': 'confirmado',
  'en_transito': 'confirmado',
  'entregado': 'entregado',
  'delivered': 'entregado',
  'rechazado': 'rechazado',
  'devuelto': 'rechazado',
  'returned': 'rechazado',
  'cancelado': 'rechazado',
  'no_entregado': 'rechazado',
}

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-dropi-secret') || req.headers.get('authorization')?.replace('Bearer ', '')
    if (DROPI_WEBHOOK_SECRET && secret !== DROPI_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const dropiId = body.order_id || body.id || body.orderId || body.dropi_id
    const estadoRaw = (body.status || body.estado || body.order_status || '').toLowerCase()
    const estadoInterno = ESTADO_MAP[estadoRaw] || null

    if (!dropiId) return NextResponse.json({ error: 'order_id requerido' }, { status: 400 })
    if (!estadoInterno) return NextResponse.json({ ok: true, nota: `Estado "${estadoRaw}" no mapeado` })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pedido } = await supabase
      .from('pedidos')
      .select('id, estado, notas')
      .or(`dropi_order_id.eq.${dropiId},notas.ilike.%${dropiId}%`)
      .single()

    if (!pedido) return NextResponse.json({ ok: true, nota: 'Pedido no encontrado' })
    if (pedido.estado === estadoInterno) return NextResponse.json({ ok: true, nota: 'Sin cambios' })

    await supabase.from('pedidos').update({
      estado: estadoInterno,
      updated_at: new Date().toISOString(),
      notas: `${pedido.notas || ''}\n[AUTO] Dropi: ${estadoRaw} (${new Date().toLocaleString('es-PY')})`.trim(),
    }).eq('id', pedido.id)

    return NextResponse.json({ ok: true, nuevo_estado: estadoInterno })
  } catch (err) {
    console.error('[Dropi Webhook]', err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 200 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Creatives Pro — Dropi Webhook',
    estados_mapeados: Object.keys(ESTADO_MAP),
  })
}
