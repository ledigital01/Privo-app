import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages, documents } = await req.json()

    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY manquant")

    // Construire le contexte des documents de l'utilisateur
    const docsContext = documents && documents.length > 0
      ? documents.map((d: any) => {
          const expiry = d.expiresAt
            ? `expire le ${new Date(d.expiresAt).toLocaleDateString('fr-FR')}`
            : `sans expiration`
          return `- ${d.title} (${d.type}, ${expiry})`
        }).join('\n')
      : "Aucun document archivé pour le moment."

    const systemPrompt = `Tu es Privo, l'assistant IA personnel de l'utilisateur dans l'app DigiSAFE — un coffre-fort numérique de documents personnels.

Voici les documents actuellement dans le coffre de l'utilisateur :
${docsContext}

Réponds de façon naturelle, directe et courte. Pas de listes inutiles, pas de formules de politesse. Sois utile, précis, et humain.`

    // Convertir les messages du frontend en format Anthropic
    const claudeMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text
    }))

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 512,
        system: systemPrompt,
        messages: claudeMessages
      })
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Claude API error: ${err}`)
    }

    const data = await response.json()
    const reply = data.content[0].text

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error("[ai_chat ERROR]:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
