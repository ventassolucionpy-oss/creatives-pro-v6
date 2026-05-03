import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const { data, error } = await supabase
      .from('pedidos')
      .select('*, products(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ pedidos: data || [] })
  } catch (err) {
    console.error('GET /api/pedidos error:', err)
    return NextResponse.json({ error: 'Error cargando pedidos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()
    const { producto, ciudad, precio, telefono, notas, estado, product_id, pais } = body

    // BUG FIX #2: Validación correcta de precio numérico
    if (!producto) {
      return NextResponse.json({ error: 'producto es requerido.' }, { status: 400 })
    }
    const precioNum = Number(precio)
    if (isNaN(precioNum) || precioNum <= 0) {
      return NextResponse.json({ error: 'precio debe ser un número positivo.' }, { status: 400 })
    }

    const { data, error } = await supabase.from('pedidos').insert({
      user_id: user.id,
      producto,
      ciudad: ciudad || 'Asunción',
      precio: precioNum,   // FIX: usar Number() en lugar de parseInt() — preserva decimales
      telefono: telefono || '',
      notas: notas || '',
      estado: estado || 'pendiente',
      product_id: product_id || null,
      pais: pais || 'PY',  // nuevo campo multi-país
    }).select().single()

    if (error) throw error
    return NextResponse.json({ pedido: data })
  } catch (err) {
    console.error('POST /api/pedidos error:', err)
    return NextResponse.json({ error: 'Error creando pedido' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const body = await req.json()
    const { id, estado, notas, upsell_aceptado, upsell_producto } = body

    if (!id) return NextResponse.json({ error: 'id es requerido.' }, { status: 400 })

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (estado !== undefined) updateData.estado = estado
    if (notas !== undefined) updateData.notas = notas
    if (upsell_aceptado !== undefined) updateData.upsell_aceptado = upsell_aceptado
    if (upsell_producto !== undefined) updateData.upsell_producto = upsell_producto

    const { data, error } = await supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ pedido: data })
  } catch (err) {
    console.error('PATCH /api/pedidos error:', err)
    return NextResponse.json({ error: 'Error actualizando pedido' }, { status: 500 })
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
      .from('pedidos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/pedidos error:', err)
    return NextResponse.json({ error: 'Error eliminando pedido' }, { status: 500 })
  }
}
