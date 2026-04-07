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

    // 4. Appel à l'API Anthropic Claude 3.5 Sonnet (Le plus précis pour la vision)
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY n'est pas configuré dans Supabase.")

    console.log(`[INFO] Appel API Anthropic Claude 3.5 Sonnet...`)
    
    const promptText = `
      Analyse ce document (scan CNI, Passeport, Facture, Certificat, etc.).
      Extrais les informations de manière ultra-précise et réponds UNIQUEMENT avec cet objet JSON :
      {
        "detected_type": "Passport / ID_Card / Invoice / Receipt / License / Diploma / Other",
        "extracted_data": {
           "Nom": "Nom complet exactement tel qu'il apparaît",
           "Expiration": "DD/MM/YYYY si présente",
           "Emetteur": "Autorité ou source du document"
        },
        "suggested_tags": ["tag1", "tag2"]
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
                media_type: mimeType,
                data: base64Str
              }
            },
            {
              type: "text",
              text: `Analyse ce document et réponds UNIQUEMENT en JSON valide :
{
  "nom_document": "à détecter",
  "categorie": "pièce d'identité | passeport | reçu | facture | contrat | autre",
  "date_expiration": "JJ/MM/AAAA ou null",
  "date_emission": "JJ/MM/AAAA ou null",
  "titulaire": "nom complet ou null",
  "informations_importantes": ["info1", "info2"],
  "resume": "courte description"
}`
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
    // Extraction du JSON depuis la réponse Claude
    const rawContent = aiData.content[0].text
    const aiResult = JSON.parse(rawContent)
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
