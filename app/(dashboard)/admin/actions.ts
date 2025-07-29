'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getSession } from '../actions';

export async function updateUserRole(userId: string, newRole: string) {
  // 현재 사용자가 관리자인지 확인
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.');
  }

  try {
    // 먼저 일반 클라이언트로 시도
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // console.error('Regular client update failed:', error);
      
      // RLS 제한으로 실패한 경우 admin 클라이언트 사용
      if (error.code === 'PGRST301' || error.message?.includes('permission')) {
        // console.log('Trying with admin client...');
        const adminSupabase = createAdminClient();
        const { data: adminData, error: adminError } = await adminSupabase
          .from('users')
          .update({ role: newRole })
          .eq('id', userId)
          .select()
          .single();

        if (adminError) {
          throw adminError;
        }

        return { success: true, data: adminData };
      }
      
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    // console.error('updateUserRole error:', error);
    throw error;
  }
}

export async function updateUserStatus(userId: string, isActive: boolean) {
  // 현재 사용자가 관리자인지 확인
  const session = await getSession();
  
  if (!session || session.role !== 'admin') {
    throw new Error('관리자 권한이 필요합니다.');
  }

  try {
    // 먼저 일반 클라이언트로 시도
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // console.error('Regular client update failed:', error);
      
      // RLS 제한으로 실패한 경우 admin 클라이언트 사용
      if (error.code === 'PGRST301' || error.message?.includes('permission')) {
        // console.log('Trying with admin client...');
        const adminSupabase = createAdminClient();
        const { data: adminData, error: adminError } = await adminSupabase
          .from('users')
          .update({ is_active: isActive })
          .eq('id', userId)
          .select()
          .single();

        if (adminError) {
          throw adminError;
        }

        return { success: true, data: adminData };
      }
      
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    // console.error('updateUserStatus error:', error);
    throw error;
  }
}