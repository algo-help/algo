'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  let email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // 이메일 형식 검증
  if (!email.includes('@')) {
    return { error: '올바른 이메일 형식을 입력해주세요.' };
  }

  const supabase = await createClient();

  // 데이터베이스에서 사용자 조회
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password_hash, role, is_active')
    .eq('email', email)
    .single();

  if (error || !user) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  // 계정이 비활성화된 경우
  if (!user.is_active) {
    return { error: '계정이 비활성화되었습니다. 관리자에게 문의하세요.' };
  }

  // 비밀번호 검증
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  // 간단한 세션 쿠키 설정 (역할 포함)
  const cookieStore = await cookies();
  cookieStore.set('auth-session', JSON.stringify({ 
    id: user.id,
    email: user.email, 
    role: user.role,
    authenticated: true,
    is_active: user.is_active
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7일
  });

  revalidatePath('/');
  return { success: true };
}

export async function checkUserStatus() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth-session');
  
  if (!sessionCookie) {
    return { error: '세션이 없습니다.' };
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    const supabase = await createClient();

    // 데이터베이스에서 최신 사용자 정보 조회
    let user;
    let error;
    
    if (!session.id) {
      return { error: '유효한 세션 정보가 없습니다.' };
    }
    const result = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', session.id)
      .single();
    user = result.data;
    error = result.error;
    

    if (error || !user) {
      return { error: '사용자 정보를 찾을 수 없습니다.' };
    }

    // 권한이 변경되었거나 ID가 다른 경우 쿠키 업데이트
    if (session.role !== user.role || session.is_active !== user.is_active || session.id !== user.id) {
      // auth_type 유지 (OAuth 사용자인 경우)
      const authType = session.auth_type || undefined;
      
      cookieStore.set('auth-session', JSON.stringify({ 
        id: user.id, // users 테이블의 실제 ID 사용
        email: user.email, 
        role: user.role,
        authenticated: true,
        is_active: user.is_active,
        ...(authType && { auth_type: authType })
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      });
    }

    return { 
      success: true, 
      user: {
        is_active: user.is_active,
        role: user.role
      }
    };
  } catch (error) {
    // console.error('checkUserStatus error:', error);
    return { error: '상태 확인 중 오류가 발생했습니다.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth-session');
  
  // OAuth 세션인 경우 Supabase 로그아웃도 처리
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value);
      if (session.auth_type === 'oauth') {
        const supabase = await createClient();
        await supabase.auth.signOut();
      }
    } catch (error) {
      // console.error('Error parsing session:', error);
    }
  }
  
  cookieStore.delete('auth-session');
  
  // 페이지 재검증으로 세션 상태 업데이트
  revalidatePath('/');
  revalidatePath('/login');
  
  redirect('/login');
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('auth-session');
  
  if (!session) {
    return null;
  }

  try {
    return JSON.parse(session.value);
  } catch {
    return null;
  }
}

export async function addDelivery(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 최신 권한 확인
  const statusResult = await checkUserStatus();
  if (statusResult.success && statusResult.user) {
    if (statusResult.user.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 추가할 수 없습니다.');
    }
  } else {
    // checkUserStatus 실패 시 기존 세션 권한 확인
    if (session.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 추가할 수 없습니다.');
    }
  }

  const supabase = await createClient();

  const delivery = {
    recipient_name: formData.get('recipient_name') as string,
    supplement_type: formData.get('supplement_type') as string,
    quantity: parseInt(formData.get('quantity') as string),
    delivery_date: formData.get('delivery_date') as string,
    invoice_number: formData.get('invoice_number') as string || null,
    is_send: false,
    customer_request: formData.get('customer_request') === 'true'
  };

  const { error } = await supabase
    .from('supplement_delivery')
    .insert([delivery]);

  if (error) {
    throw new Error(`Failed to add delivery: ${error.message}`);
  }

  revalidatePath('/');
}

export async function deleteDelivery(id: number) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 보기 전용 사용자는 삭제 불가
  if (session.role === 'v') {
    throw new Error('보기 전용 사용자는 데이터를 삭제할 수 없습니다.');
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('supplement_delivery')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete delivery: ${error.message}`);
  }

  revalidatePath('/');
}

export async function updateDelivery(formData: FormData) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 최신 권한 확인
  const statusResult = await checkUserStatus();
  if (statusResult.success && statusResult.user) {
    if (statusResult.user.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 수정할 수 없습니다.');
    }
  } else {
    // checkUserStatus 실패 시 기존 세션 권한 확인
    if (session.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 수정할 수 없습니다.');
    }
  }

  const supabase = await createClient();
  const id = parseInt(formData.get('id') as string);

  // 기존 데이터 조회 (편집 로그용)
  const { data: originalData, error: fetchError } = await supabase
    .from('supplement_delivery')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch original data: ${fetchError.message}`);
  }

  const updatedDelivery = {
    recipient_name: formData.get('recipient_name') as string,
    supplement_type: formData.get('supplement_type') as string,
    quantity: parseInt(formData.get('quantity') as string),
    delivery_date: formData.get('delivery_date') as string,
    invoice_number: formData.get('invoice_number') as string || null,
    is_send: formData.get('is_send') === 'true',
    customer_request: formData.get('customer_request') === 'true'
  };

  // 변경사항 확인 및 로그 생성
  const changes: any = {};
  if (originalData.recipient_name !== updatedDelivery.recipient_name) {
    changes.recipient_name = { from: originalData.recipient_name, to: updatedDelivery.recipient_name };
  }
  if (originalData.supplement_type !== updatedDelivery.supplement_type) {
    changes.supplement_type = { from: originalData.supplement_type, to: updatedDelivery.supplement_type };
  }
  if (originalData.quantity !== updatedDelivery.quantity) {
    changes.quantity = { from: originalData.quantity, to: updatedDelivery.quantity };
  }
  if (originalData.delivery_date !== updatedDelivery.delivery_date) {
    changes.delivery_date = { from: originalData.delivery_date, to: updatedDelivery.delivery_date };
  }
  if (originalData.invoice_number !== updatedDelivery.invoice_number) {
    changes.invoice_number = { from: originalData.invoice_number, to: updatedDelivery.invoice_number };
  }
  if (originalData.is_send !== updatedDelivery.is_send) {
    changes.is_send = { from: originalData.is_send, to: updatedDelivery.is_send };
  }
  if (originalData.customer_request !== updatedDelivery.customer_request) {
    changes.customer_request = { from: originalData.customer_request, to: updatedDelivery.customer_request };
  }

  // 변경사항이 있는 경우에만 업데이트
  if (Object.keys(changes).length === 0) {
    return; // 변경사항이 없으면 그냥 리턴
  }

  // 배송 정보 업데이트
  const { error: updateError } = await supabase
    .from('supplement_delivery')
    .update(updatedDelivery)
    .eq('id', id);

  if (updateError) {
    throw new Error(`Failed to update delivery: ${updateError.message}`);
  }

  // 편집 로그 저장 (테이블이 있는 경우에만)
  try {
    const editLog = {
      delivery_id: id,
      editor_email: session.email,
      editor_id: session.id,
      changes: JSON.stringify(changes),
      edited_at: new Date().toISOString()
    };

    // delivery_edit_logs 테이블이 있는지 확인하고 로그 저장
    await supabase
      .from('delivery_edit_logs')
      .insert([editLog]);
  } catch (logError) {
    // 로그 저장 실패는 메인 기능에 영향을 주지 않음
    // console.warn('Failed to save edit log:', logError);
  }

  revalidatePath('/');
}

export async function updateDeliveryStatus(id: number, is_send: boolean) {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // 최신 권한 확인
  const statusResult = await checkUserStatus();
  if (statusResult.success && statusResult.user) {
    if (statusResult.user.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 수정할 수 없습니다.');
    }
  } else {
    // checkUserStatus 실패 시 기존 세션 권한 확인
    if (session.role === 'v') {
      throw new Error('보기 전용 사용자는 데이터를 수정할 수 없습니다.');
    }
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from('supplement_delivery')
    .update({ is_send })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update delivery status: ${error.message}`);
  }

  revalidatePath('/');
}