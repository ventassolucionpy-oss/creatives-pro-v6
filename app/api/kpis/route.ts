import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '30')

    const { data, error } = await supabase
      .from('kpi_snapshots')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return NextResponse.json({ snapshots: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Error cargando KPIs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()

    const { data, error } = await supabase.from('kpi_snapshots').insert({
      user_id: user.id,
      ...body,
    }).select().single()

    if (error) throw error
    return NextResponse.json({ snapshot: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error guardando KPIs' }, { status: 500 })
  }
}
