'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(userId: string, avatarUrl: string) {
  // console.log('[Server Action] updateProfile called with:', { userId, avatarUrl });
  
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('id', userId)
    .select();

  // console.log('[Server Action] Update result:', { data, error });

  if (error) {
    // console.error('[Server Action] Update failed:', error);
    throw new Error(`프로필 업데이트 실패: ${error.message}`);
  }

  revalidatePath('/profile');
  revalidatePath('/');
  revalidatePath('/', 'layout');
}