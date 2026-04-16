import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const FLUTTERWAVE_SECRET_KEY = Deno.env.get('FLUTTERWAVE_SECRET_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { transaction_id, user_id, plan_id, billing_cycle } = await req.json()

    // 1. Vérifier la transaction auprès de Flutterwave
    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (data.status === 'success' && data.data.status === 'successful') {
      const amount = data.data.amount
      const currency = data.data.currency

      // 2. Initialiser Supabase avec la Service Role Key pour bypasser les RLS
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

      // 3. Mettre à jour le profil utilisateur
      const now = new Date()
      const expiry = new Date()
      if (billing_cycle === 'yearly') {
        expiry.setFullYear(now.getFullYear() + 1)
      } else {
        expiry.setMonth(now.getMonth() + 1)
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          plan: plan_id,
          plan_start_date: now.toISOString(),
          plan_expiry_date: expiry.toISOString(),
          last_payment_id: transaction_id
        })
        .eq('id', user_id)

      if (profileError) throw profileError

      // 4. Enregistrer dans la table payments
      await supabase.from('payments').insert({
        user_id,
        transaction_id: transaction_id.toString(),
        tx_ref: data.data.tx_ref,
        amount,
        currency,
        plan_id,
        billing_cycle,
        status: 'successful',
        payment_type: data.data.payment_type,
        customer_email: data.data.customer.email
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        status: 200
      })
    }

    return new Response(JSON.stringify({ success: false, message: 'Transaction non valide' }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 500
    })
  }
})
