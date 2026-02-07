// Supabase Edge Function: checkout
// Cria booking(s) 'pending' e gera Stripe Checkout Session
// Essenza Medical Center - Sistema de reserva por períodos
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const PUBLIC_APP_URL = Deno.env.get('PUBLIC_APP_URL')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })

type Period = 'morning' | 'afternoon'

type PeriodSelection = {
  date: string // formato YYYY-MM-DD
  period: Period
}

type Body = {
  room_id: string
  periods: PeriodSelection[]
  notes?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: corsHeaders
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    const { room_id, periods, notes } = (await req.json()) as Body
    if (!room_id || !periods || periods.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing fields: room_id and periods are required' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    // Obter usuário logado
    const { data: { user }, error: userErr } = await supabase.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    // Carregar sala
    const { data: room, error: roomErr } = await supabase
      .from('rooms')
      .select('id, title, price_per_period, price_per_day, price_per_hour')
      .eq('id', room_id)
      .single()

    if (roomErr || !room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    // Verificar disponibilidade de todos os períodos
    for (const p of periods) {
      const { data: conflicts, error: conflictErr } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', room_id)
        .eq('date', p.date)
        .eq('period', p.period)
        .in('status', ['pending', 'confirmed'])
        .limit(1)

      if (conflictErr) {
        console.error('Availability check error:', conflictErr)
        throw new Error('Failed to check availability')
      }

      if (conflicts && conflicts.length > 0) {
        const periodLabel = p.period === 'morning' ? 'Manhã' : 'Tarde'
        return new Response(JSON.stringify({
          error: `O período ${periodLabel} do dia ${p.date} não está disponível.`
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }
    }

    // Calcular preço total
    const pricePerPeriod = room.price_per_period || room.price_per_day || room.price_per_hour || 0
    const totalPrice = pricePerPeriod * periods.length
    const totalCents = Math.round(totalPrice * 100)

    // Criar bookings para cada período
    const bookingIds: string[] = []

    for (const p of periods) {
      const { data: booking, error: bookErr } = await supabase
        .from('bookings')
        .insert({
          room_id,
          user_id: user.id,
          date: p.date,
          period: p.period,
          total_price: pricePerPeriod,
          status: 'pending',
          notes: notes || null,
        })
        .select('id')
        .single()

      if (bookErr || !booking) {
        console.error('Booking Insert Error:', bookErr)
        // Se falhar, tentar cancelar as anteriores
        if (bookingIds.length > 0) {
          await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .in('id', bookingIds)
        }
        return new Response(JSON.stringify({
          error: 'Reserva indisponível ou conflito de horário.'
        }), {
          status: 409,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        })
      }

      bookingIds.push(booking.id)
    }

    // Criar descrição dos períodos para o Stripe
    const periodDescriptions = periods.map(p => {
      const periodLabel = p.period === 'morning' ? 'Manhã' : 'Tarde'
      return `${p.date} (${periodLabel})`
    }).join(', ')

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: `${PUBLIC_APP_URL}/app/bookings?status=success`,
      cancel_url: `${PUBLIC_APP_URL}/app/rooms/${room_id}?status=cancel`,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Reserva: ${room.title}`,
              description: `${periods.length} período(s): ${periodDescriptions}`
            },
            unit_amount: totalCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_ids: bookingIds.join(','),
        room_id,
        periods_count: periods.length.toString()
      },
    })

    // Persistir stripe_session_id em todos os bookings
    await supabase
      .from('bookings')
      .update({ stripe_session_id: session.id })
      .in('id', bookingIds)

    return new Response(JSON.stringify({ url: session.url }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200,
    })
  } catch (e) {
    console.error('Checkout Function Error:', e)
    return new Response(JSON.stringify({ error: 'Erro interno ao processar pagamento.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
})
