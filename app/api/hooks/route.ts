import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { data, error } = await supabase
      .from('hooks_biblioteca')
      .select('*')
      .eq('user_id', user.id)
      .order('votos', { ascending: false })

    if (error) throw error
    return NextResponse.json({ hooks: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Error cargando hooks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()
    const { texto, categoria, producto, plataforma, roas, tags } = body

    if (!texto) return NextResponse.json({ error: 'texto es requerido.' }, { status: 400 })

    const { data, error } = await supabase.from('hooks_biblioteca').insert({
      user_id: user.id,
      texto,
      categoria: categoria || 'Curiosidad',
      producto: producto || 'General',
      plataforma: plataforma || 'meta',
      roas: roas ? parseFloat(roas) : null,
      votos: 0,
      tags: tags || [],
    }).select().single()

    if (error) throw error
    return NextResponse.json({ hook: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error guardando hook' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()
    const { id, votos } = body
    if (!id) return NextResponse.json({ error: 'id es requerido.' }, { status: 400 })

    const { data, error } = await supabase
      .from('hooks_biblioteca')
      .update({ votos })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ hook: data })
  } catch (err) {
    return NextResponse.json({ error: 'Error actualizando hook' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id es requerido.' }, { status: 400 })

    const { error } = await supabase
      .from('hooks_biblioteca')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Error eliminando hook' }, { status: 500 })
  }
}
