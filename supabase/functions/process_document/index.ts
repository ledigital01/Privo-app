import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Initialiser le client
    const { filePath, userId } = await req.json()
    console.log(`[START] Traitement du document: ${filePath} pour l'user: ${userId}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Télécharger
    console.log(`[INFO] Téléchargement du fichier...`)
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      console.error("[ERROR] Téléchargement échoué:", downloadError)
      throw downloadError
    }

    // 3. Convertir (Correction : Méthode optimisée pour photos lourdes)
    console.log(`[INFO] Encodage Base64...`)
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Chunking plus agressif et propre pour éviter les erreurs de pile (stack overflow)
    const base64Str = btoa(
      Array.from(uint8Array)
        .map(byte => String.fromCharCode(byte))
        .join('')
    )
    
    const mimeType = fileData.type || 'image/jpeg'
    console.log(`[INFO] Type détecté: ${mimeType}, Taille: ${uint8Array.length} bytes`)

    // 4. Appel à l'IA (Modèle: claude-sonnet-4-6)
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY n'est pas configuré dans Supabase.")

    const promptText = `
      Analyse ce document de manière ultra-précise.
      Réponds UNIQUEMENT avec cet objet JSON valide :
      {
        "title": "Nom complet ou titre du document (ex: Carte Nationale d'Identité, Facture EDF...)",
        "category": "Identité | Finance | Santé | Contrat | Autre",
        "expiresAt": "YYYY-MM-DD ou null si pas d'expiration",
        "issuer": "L'émetteur ou l'autorité (ex: État, Nom de l'entreprise, Hôpital) ou null",
        "description": "Un court résumé utile ou null",
        "tags": ["mot-clé 1", "mot-clé 2"]
      }
    `

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: mimeType === "application/pdf" ? "document" : "image",
              source: {
                type: "base64",
                media_type: mimeType === "application/pdf" ? "application/pdf" : mimeType,
                data: base64Str
              }
            },
            {
              type: "text",
              text: promptText
            }
          ]
        }]
      })
    })

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text()
      console.error("[ERROR] Claude API Error:", errorText)
      throw new Error(`Erreur Claude: ${errorText}`)
    }

    const aiData = await claudeResponse.json()
    const rawContent = aiData.content[0].text

    // Logique de parsing robuste (Nettoyage Markdown + Regex JSON)
    let aiResult;
    try {
      const cleaned = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
      aiResult = JSON.parse(cleaned);
    } catch (e) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        throw new Error("Impossible de décoder la réponse JSON de Claude");
      }
    }

    console.log(`[SUCCESS] Analyse Claude terminée:`, aiResult)

    return new Response(JSON.stringify({ success: true, result: aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("[CRITICAL ERROR]:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
