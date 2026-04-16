import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Headers pour autoriser les appels depuis le navigateur (CORS)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gérer la requête de pré-vérification du navigateur (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transaction_id, tx_ref, user_id, plan_id, billing_cycle } = await req.json()

    // 🔐 Vérification des données entrantes
    if (!transaction_id || !user_id || !plan_id || !billing_cycle) {
      return new Response(JSON.stringify({ error: "Données manquantes pour la vérification" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 🔑 Clé secrète Flutterwave (doit être configurée dans les secrets Supabase)
    const FLW_SECRET_KEY = Deno.env.get("FLUTTERWAVE_SECRET_KEY")

    // 📡 Vérifier la transaction côté Flutterwave via leur API officielle
    const verifyRes = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    )

    const verifyData = await verifyRes.json()

    // Vérifier si la requête API a réussi ET si le paiement est marqué comme "successful"
    if (verifyData.status !== "success" || verifyData.data.status !== "successful") {
      return new Response(JSON.stringify({ error: "Échec de la validation Flutterwave ou paiement non complété" }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const paymentData = verifyData.data

    // 🧠 Vérifier la cohérence du montant (Sécurité anti-fraude)
    // On compare ce qui a été payé en XOF avec ce qui est attendu au taux de 650
    const PRICING = {
      pro: { monthly: 3.5, yearly: 29 },
      business: { monthly: 13, yearly: 99 }
    }
    
    const EXCHANGE_RATE = 650;
    const expectedUSD = PRICING[plan_id]?.[billing_cycle]
    const expectedXOF = Math.floor(expectedUSD * EXCHANGE_RATE)

    // On accepte une marge de 5 FCFA pour les arrondis
    if (!expectedUSD || paymentData.amount < (expectedXOF - 5)) {
      return new Response(JSON.stringify({ 
        error: "Montant invalide", 
        details: `Reçu: ${paymentData.amount} XOF, Attendu: ~${expectedXOF} XOF` 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // ⏱ Calcul des dates (Début et Expiration)
    const now = new Date()
    let expiresAt = new Date()
    if (billing_cycle === "monthly") {
      expiresAt.setMonth(now.getMonth() + 1)
    } else {
      expiresAt.setFullYear(now.getFullYear() + 1)
    }

    // 🔗 Initialisation Supabase avec Service Role (pour bypasser les RLS)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? ""
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 💾 1. Éviter les doublons (si la transaction est déjà dans notre table payments)
    const { data: existingPay } = await supabase
      .from("payments")
      .select("id")
      .eq("transaction_id", transaction_id.toString())
      .maybeSingle()

    if (existingPay) {
      return new Response(JSON.stringify({ success: true, message: "Transaction déjà traitée" }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // 💾 2. Enregistrer la trace du paiement
    const { error: payError } = await supabase.from("payments").insert({
      user_id,
      plan_id,
      billing_cycle,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: "successful",
      transaction_id: transaction_id.toString(),
      tx_ref: tx_ref,
      customer_email: paymentData.customer.email,
      payment_type: paymentData.payment_type
    })

    if (payError) throw payError

    // 🚀 3. Activer officiellement l'abonnement sur le profil
    const { error: profError } = await supabase.from("profiles").update({
      plan: plan_id,
      plan_start_date: now.toISOString(),
      plan_expiry_date: expiresAt.toISOString()
    }).eq("id", user_id)

    if (profError) throw profError

    return new Response(JSON.stringify({ success: true, message: "Abonnement activé avec succès" }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    console.error("Erreur Edge Function:", error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})
