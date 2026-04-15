import { supabase } from './supabase'

/** Typed helper for sb_players table (not in generated Supabase types yet) */
export function sbPlayersTable() {
  return supabase.from('sb_players' as never)
}
