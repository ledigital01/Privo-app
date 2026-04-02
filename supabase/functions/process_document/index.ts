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

    // 4. Appel à l'API Google Gemini avec secours (Fallback)
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY n'est pas configuré dans Supabase.")

    console.log(`[INFO] Appel API Google Gemini avec stratégie de secours...`)
    
    const promptText = `
      Analyse ce document (scan CNI, Passeport, Facture, Certificat, etc.).
      Extrais les informations et réponds UNIQUEMENT avec cet objet JSON :
      {
        "detected_type": "Passport / ID_Card / Invoice / Receipt / License / Diploma / Other",
        "extracted_data": {
           "Nom": "Nom complet si présent",
           "Expiration": "DD/MM/YYYY si présente",
           "Emetteur": "Source ou autorité du document"
        },
        "suggested_tags": ["tag1", "tag2"]
      }
    `

    const models = ['gemini-2.0-flash', 'gemini-1.5-flash']
    let geminiResponse
    let lastError = ""

    for (const model of models) {
      console.log(`[INFO] Tentative avec Gemini : ${model}`)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              { inlineData: { mimeType: mimeType, data: base64Str } }
            ]
          }],
          generationConfig: {
            response_mime_type: "application/json"
          }
        })
      })

      if (response.ok) {
        geminiResponse = response
        console.log(`[SUCCESS] Modèle ${model} a fonctionné !`)
        break
      } else {
        const err = await response.text()
        lastError = err
        console.warn(`[WARN] Échec avec ${model}: ${err}`)
        // Si c'est un quota (429), on continue vers le modèle suivant
        if (response.status !== 429) break 
      }
    }

    if (!geminiResponse) {
      throw new Error(`Toutes les tentatives Gemini ont échoué : ${lastError}`)
    }

    const aiData = await geminiResponse.json()
    // Extraction du JSON depuis la réponse Gemini
    const rawContent = aiData.candidates?.[0]?.content?.parts?.[0]?.text
    if (!rawContent) throw new Error("L'IA n'a pas renvoyé de contenu.")

    const aiResult = JSON.parse(rawContent)
    console.log(`[SUCCESS] Analyse Gemini terminée:`, aiResult)

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
