import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://iaxrtaqaavckkbftwgjr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlheHJ0YXFhYXZja2tiZnR3Z2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxMTYyODUsImV4cCI6MjA5NTY5MjI4NX0.a2pVmgCqqlFgfULO-0Euiv2Zdj0L2iiZPoF8eoGk03g')

async function run() {
  const { data: p } = await supabase.from('pain_records').select('*').limit(1)
  console.log('pain_records:', p)
  
  const { data: e } = await supabase.from('exercise_records').select('*').limit(1)
  console.log('exercise_records:', e)
  
  const { data: s } = await supabase.from('sleep_records').select('*').limit(1)
  console.log('sleep_records:', s)
}

run()
