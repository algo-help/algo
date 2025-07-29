const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreOriginalState() {
  console.log('세션 시작 전 원래 상태로 완전 복원합니다...\n');
  
  try {
    // 1. customer_request 컬럼을 모든 레코드에서 false로 설정 (원래 이 컬럼은 없었음)
    const { data: customerData, error: customerError } = await supabase
      .from('supplement_delivery')
      .update({ customer_request: false })
      .neq('id', 0)  // 모든 레코드
      .select('id');

    if (customerError) {
      console.error('customer_request 필드 복원 실패:', customerError);
    } else {
      console.log(`✅ customer_request 필드 복원: ${customerData.length}개 레코드`);
    }

    // 2. 현재 데이터베이스 상태 확인
    const { data: currentData, error: fetchError } = await supabase
      .from('supplement_delivery')
      .select('id, recipient_name, is_send, customer_request')
      .order('id', { ascending: false })
      .limit(20);

    if (fetchError) {
      console.error('현재 상태 조회 실패:', fetchError);
      return;
    }

    console.log('\n📋 현재 상태 (최근 20개):');
    currentData.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, 수령인: ${item.recipient_name}, 배송완료: ${item.is_send ? 'O' : 'X'}, 고객요청: ${item.customer_request ? 'O' : 'X'}`);
    });

    // 3. 최종 통계
    const { data: allDeliveries, error: statsError } = await supabase
      .from('supplement_delivery')
      .select('is_send, customer_request');

    if (statsError) {
      console.error('통계 조회 실패:', statsError);
      return;
    }

    const total = allDeliveries.length;
    const delivered = allDeliveries.filter(item => item.is_send === true).length;
    const pending = allDeliveries.filter(item => item.is_send === false).length;
    const customerRequests = allDeliveries.filter(item => item.customer_request === true).length;

    console.log('\n📊 최종 통계:');
    console.log(`총 배송: ${total}`);
    console.log(`배송 완료: ${delivered}`);
    console.log(`배송 대기: ${pending}`);
    console.log(`고객 요청: ${customerRequests}`);

    if (customerRequests === 0 && delivered === total) {
      console.log('\n✅ 원래 상태로 완전 복원되었습니다!');
      console.log('- customer_request 컬럼은 추가되었지만 모든 값이 false');
      console.log('- 모든 배송이 완료 상태로 유지');
    }

  } catch (error) {
    console.error('복원 중 오류 발생:', error.message);
  }
}

restoreOriginalState();