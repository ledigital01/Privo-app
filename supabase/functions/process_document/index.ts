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
    const { documentId, filePath, userId } = await req.json()
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

    // 3. Convertir (Correction : Méthode robuste pour gros fichiers)
    console.log(`[INFO] Encodage Base64...`)
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    let binary = ''
    const chunk = 8192
    for (let i = 0; i < uint8Array.length; i += chunk) {
      binary += String.fromCharCode.apply(null, uint8Array.slice(i, i + chunk))
    }
    const base64Str = btoa(binary)
    const mimeType = fileData.type || 'image/jpeg'
    const base64Url = `data:${mimeType};base64,${base64Str}`

    // 4. Appel à l'API Groq
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY n'est pas configuré.")

    console.log(`[INFO] Appel API Groq (Llama Vision)...`)
    const promptText = `
      Analyse ce document (scan CNI, Passeport, Facture, etc.).
      Extrais exactement cet objet JSON :
      {
        "detected_type": "Passport / ID_Card / Invoice / Receipt / License / Diploma / Other",
        "extracted_data": {
           "Nom": "Nom complet si lisible",
           "Expiration": "DD/MM/YYYY si présente",
           "Emetteur": "Source du document"
        },
        "suggested_tags": ["tag1", "tag2"]
      }
    `

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-11b-vision-preview', // Passage au modèle 11b pour plus de rapidité
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: base64Url } }
            ]
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    })

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text()
      console.error("[ERROR] Groq API Response Error:", errorText)
      throw new Error(`API Groq: ${errorText}`)
    }

    const aiData = await groqResponse.json()
    const aiResult = JSON.parse(aiData.choices[0].message.content)
    console.log(`[SUCCESS] Analyse terminée:`, aiResult)

    // 5. Sauvegarder les résultats dans notre base de données "document_ai_analysis"
    const { error: insertError } = await supabaseClient
      .from('document_ai_analysis')
      .upsert({
        document_id: documentId,
        user_id: userId,
        detected_type: aiResult.detected_type,
        extracted_data: aiResult.extracted_data,
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      }, { onConflict: 'document_id' })

    if (insertError) throw insertError

    // 6. Retourner le succès
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
