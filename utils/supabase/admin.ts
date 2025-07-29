import { createClient } from '@supabase/supabase-js'

// Service role key를 사용하는 관리자용 클라이언트
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl) {
    throw new Error('Supabase URL이 설정되지 않았습니다.')
  }

  // Service role key가 없으면 anon key 사용 (임시 방편)
  const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}