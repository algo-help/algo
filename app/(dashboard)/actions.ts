'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import * as bcrypt from 'bcryptjs';

export async function login(formData: FormData) {
  // 로그인 기능 비활성화 - 홈으로 리다이렉트
  redirect('/');
}

export async function checkUserStatus() {
  // 로그인 제거 - 항상 성공적인 사용자 상태 반환
  return { 
    success: true, 
    user: {
      id: 'default-user-id',
      email: 'jeff@algocarelab.com',
      role: 'admin',
      is_active: true
    }
  };
}

export async function logout() {
  // 로그아웃 기능 비활성화
  redirect('/');
}

export async function getSession() {
  // 로그인 제거 - 항상 기본 세션 반환
  return {
    id: 'default-user-id',
    email: 'jeff@algocarelab.com',
    role: 'admin',
    authenticated: true,
    is_active: true
  };
}

export async function addDelivery(formData: FormData) {
  const session = await getSession();
  // 로그인 체크 제거 - 항상 통과

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