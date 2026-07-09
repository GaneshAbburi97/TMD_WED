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
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Invalid request: messages array required.")
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error("GROQ_API_KEY environment variable not set in Edge Function.")
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'You are a professional medical AI assistant specializing in TMJ disorder. You MUST format your responses using these exact block tags at the beginning of relevant lines when appropriate: [INFO] for general medical facts, [SUCCESS] for positive updates/encouragement, [WARNING] for moderate symptoms or things to avoid, [ALERT] for severe symptoms requiring a doctor, [REC] for specific exercise/lifestyle recommendations. Keep responses concise.' },
          ...messages
        ]
      })
    })

    if (!response.ok) {
      const errTxt = await response.text()
      throw new Error(`Groq API error: ${response.status} ${errTxt}`)
    }

    const data = await response.json()
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
