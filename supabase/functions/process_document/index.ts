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
    const { documentId, filePath, userId } = await req.json()

    // 1. Initialiser le client Supabase avec l'Admin Role (pour lire les fichiers privés de l'utilisateur)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Télécharger le fichier depuis Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('documents')
      .download(filePath)

    if (downloadError) throw downloadError

    // 3. Convertir le fichier en Base64 pour l'envoyer à Groq
    const arrayBuffer = await fileData.arrayBuffer()
    const base64Str = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || 'image/jpeg'
    const base64Url = `data:${mimeType};base64,${base64Str}`

    // 4. Appel à l'API Groq (Compatible OpenAI)
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY n'est pas configuré.")

    const promptText = `
      Tu es l'assistant de sécurité de Privo. Analyse ce document.
      Extrais les informations sous forme d'objet JSON strict :
      {
        "detected_type": "Passeport / CNI / Contrat / Facture / Inconnu",
        "confidence_score": 0.95,
        "extracted_text": "Le texte brut pertinent lu",
        "extracted_data": {"Nom": "xxx", "Date": "xxx"},
        "summary": "Un bref résumé du document"
      }
    `

    // Note : Groq a récemment sorti llama-3.2-90b-vision-preview pour les images
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              { type: 'image_url', image_url: { url: base64Url } }
            ]
          }
        ],
        temperature: 0.2, // Mode analytique
        response_format: { type: "json_object" } // Sécuriser la réponse en JSON
      })
    })

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text()
      console.error("Groq Error:", errorData)
      throw new Error(`Erreur API Groq: ${errorData}`)
    }

    const aiData = await groqResponse.json()
    const aiResult = JSON.parse(aiData.choices[0].message.content)

    // 5. Sauvegarder les résultats dans notre base de données "document_ai_analysis"
    const { error: insertError } = await supabaseClient
      .from('document_ai_analysis')
      .upsert({
        document_id: documentId,
        user_id: userId,
        detected_type: aiResult.detected_type,
        confidence_score: aiResult.confidence_score,
        extracted_text: aiResult.extracted_text,
        extracted_data: aiResult.extracted_data,
        summary: aiResult.summary,
        processing_status: 'completed',
        processed_at: new Date().toISOString()
      }, { onConflict: 'document_id' })

    if (insertError) throw insertError

    // 6. Retourner le succès
    return new Response(JSON.stringify({ success: true, result: aiResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Fonction Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
