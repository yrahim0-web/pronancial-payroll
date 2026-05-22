import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aferijqnrpzccyuusoqm.supabase.co'
const supabaseKey = 'sb_publishable_kYzc1GJGxHyNDqsAHCM9Xw_Q-z84nGa'

export const supabase = createClient(supabaseUrl, supabaseKey)