import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = 'https://yttrpzzzqpqmcyfgzhvl.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_M1ClwNSDbPSpJf5EoSHn9g_Ps1i94qc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
