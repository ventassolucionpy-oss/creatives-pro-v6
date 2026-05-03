import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')

  if (action === 'campaigns') {
    const { data } = await supabase
      .from('ab_campaigns')
      .select('*, ab_variants(*), products(name)')
      .order('created_at', { ascending: false })
    return NextResponse.json(data || [])
  }

  if (action === 'stats') {
    // Aggregate stats across all variants
    const { data: variants } = await supabase
      .from('ab_variants')
      .select('*, ab_campaigns(nombre, plataforma)')
    return NextResponse.json(variants || [])
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}

export async function POST(req: NextRequest) {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await req.json()
  const { action, ...payload } = body

  if (action === 'create_campaign') {
    const { data, error } = await supabase
      .from('ab_campaigns')
      .insert({ ...payload, user_id: user.id })
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'add_variant') {
    const { data, error } = await supabase
      .from('ab_variants')
      .insert({ ...payload, user_id: user.id })
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'update_metrics') {
    const { variant_id, impresiones, clicks, conversiones, gasto, ingresos, estado } = payload
    const { data, error } = await supabase
      .from('ab_variants')
      .update({ impresiones, clicks, conversiones, gasto, ingresos, estado, updated_at: new Date().toISOString() })
      .eq('id', variant_id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'update_campaign') {
    const { campaign_id, ...updates } = payload
    const { data, error } = await supabase
      .from('ab_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', campaign_id)
      .eq('user_id', user.id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (action === 'delete_campaign') {
    await supabase.from('ab_campaigns').delete().eq('id', payload.campaign_id).eq('user_id', user.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 })
}
