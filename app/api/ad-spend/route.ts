import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const periodo = searchParams.get('periodo') || 'hoy'
    const pais = searchParams.get('pais') || 'PY'

    let fechaDesde: string
    const hoy = new Date().toISOString().split('T')[0]
    if (periodo === 'hoy') {
      fechaDesde = hoy
    } else if (periodo === 'semana') {
      const d = new Date(); d.setDate(d.getDate() - 7)
      fechaDesde = d.toISOString().split('T')[0]
    } else {
      const d = new Date(); d.setDate(1)
      fechaDesde = d.toISOString().split('T')[0]
    }

    const { data, error } = await supabase
      .from('ad_spend_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('pais', pais)
      .gte('fecha', fechaDesde)
      .order('fecha', { ascending: false })

    if (error) throw error

    const total_usd = (data || []).reduce((s, r) => s + (r.monto_usd || 0), 0)
    const total_local = (data || []).reduce((s, r) => s + (r.monto_local || 0), 0)

    return NextResponse.json({ entries: data || [], total_usd, total_local })
  } catch (err) {
    console.error('GET /api/ad-spend error:', err)
    return NextResponse.json({ error: 'Error cargando gastos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()
    const { monto_usd, monto_local, moneda, plataforma, product_id, pais, notas, fecha } = body

    if (isNaN(Number(monto_usd)) || Number(monto_usd) < 0) {
      return NextResponse.json({ error: 'monto_usd inválido' }, { status: 400 })
    }

    const { data, error } = await supabase.from('ad_spend_entries').insert({
      user_id: user.id,
      monto_usd: Number(monto_usd),
      monto_local: Number(monto_local) || 0,
      moneda: moneda || 'PYG',
      plataforma: plataforma || 'meta',
      product_id: product_id || null,
      pais: pais || 'PY',
      notas: notas || '',
      fecha: fecha || new Date().toISOString().split('T')[0],
    }).select().single()

    if (error) throw error
    return NextResponse.json({ entry: data })
  } catch (err) {
    console.error('POST /api/ad-spend error:', err)
    return NextResponse.json({ error: 'Error guardando gasto' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

    const { error } = await supabase
      .from('ad_spend_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/ad-spend error:', err)
    return NextResponse.json({ error: 'Error eliminando entrada' }, { status: 500 })
  }
}
