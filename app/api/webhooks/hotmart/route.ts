import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'

// Hotmart sends a HOTTOK header for verification
function verifyHotmartWebhook(req: NextRequest): boolean {
  const secret = process.env.HOTMART_WEBHOOK_SECRET
  if (!secret) return true // Skip verification if not configured
  const hottok = req.headers.get('x-hotmart-hottok')
  return hottok === secret
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook authenticity
    if (!verifyHotmartWebhook(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await req.json()
    const supabase = await createServerComponentClient()

    // Extract relevant fields from Hotmart payload
    const eventType = payload.event || payload.data?.event || 'UNKNOWN'
    const purchase = payload.data?.purchase || {}
    const buyer = payload.data?.buyer || {}
    const product = payload.data?.product || {}
    const producer = payload.data?.producer || {}

    const event = {
      hotmart_id: purchase.transaction || `evt_${Date.now()}`,
      event_type: eventType,
      status: purchase.status || 'UNKNOWN',
      product_id_hotmart: String(product.id || ''),
      buyer_email: buyer.email || '',
      buyer_name: buyer.name || '',
      value: parseFloat(purchase.price?.value || '0'),
      currency: purchase.price?.currency_value || 'USD',
      commission: parseFloat(producer.commission?.value || '0'),
      raw_payload: payload,
    }

    // Try to match with a generation by product URL or notes
    // (user links their Hotmart product URL in the product record)
    const { data: matchedProduct } = await supabase
      .from('products')
      .select('id')
      .eq('platform', 'hotmart')
      .ilike('url', `%${product.id}%`)
      .limit(1)
      .single()

    if (matchedProduct) {
      // Find latest generation for this product
      const { data: latestGen } = await supabase
        .from('generations')
        .select('id')
        .eq('product_id', matchedProduct.id)
        .eq('tool', 'hotmart')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (latestGen) {
        Object.assign(event, { generation_id: latestGen.id })
      }
    }

    // Insert event
    const { data, error } = await supabase
      .from('hotmart_events')
      .upsert(event, { onConflict: 'hotmart_id' })
      .select()
      .single()

    if (error) {
      console.error('Hotmart webhook DB error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`✅ Hotmart event received: ${eventType} - ${buyer.email} - $${event.value}`)
    return NextResponse.json({ received: true, id: data?.id })

  } catch (err) {
    console.error('Hotmart webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Hotmart sometimes sends GET to verify the endpoint
export async function GET() {
  return NextResponse.json({ status: 'Hotmart webhook endpoint active ✅' })
}
