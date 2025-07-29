const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreBeforeTrueChange() {
  console.log('전체 true 변경 이전 상태로 복원합니다...\n');
  console.log('복원할 상태:');
  console.log('- 최근 10개 레코드: is_send = false (배송 대기)');
  console.log('- 나머지 레코드: is_send = true (배송 완료)');
  console.log('- customer_request: 모두 false (ID 98번만 true)');
  
  try {
    // 1. 최근 10개 레코드를 배송 대기로 변경 (fix-delivery-status.js에서 했던 것)
    const { data: recentDeliveries, error: fetchError } = await supabase
      .from('supplement_delivery')
      .select('id')
      .order('id', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('최근 레코드 조회 실패:', fetchError);
      return;
    }

    const idsToUpdate = recentDeliveries.map(item => item.id);
    console.log(`\n배송 대기로 변경할 ID들: ${idsToUpdate.join(', ')}`);
    
    // 2. 최근 10개를 배송 대기로 변경
    const { data: updatedData, error: updateError } = await supabase
      .from('supplement_delivery')
      .update({ is_send: false })
      .in('id', idsToUpdate)
      .select('id, recipient_name, is_send');

    if (updateError) {
      console.error('배송 대기 변경 실패:', updateError);
      return;
    }

    console.log(`✅ ${updatedData.length}개 레코드를 배송 대기로 변경 완료`);

    // 3. ID 98번을 customer_request = true로 설정 (테스트용)
    const { data: customerData, error: customerError } = await supabase
      .from('supplement_delivery')
      .update({ customer_request: true })
      .eq('id', 98)
      .select('id, recipient_name, customer_request');

    if (customerError) {
      console.error('고객 요청 설정 실패:', customerError);
    } else if (customerData && customerData.length > 0) {
      console.log(`✅ ID 98번을 고객 요청으로 설정: ${customerData[0].recipient_name}`);
    }

    // 4. 최종 통계 확인
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

    console.log('\n📊 복원된 통계:');
    console.log(`총 배송: ${total}`);
    console.log(`배송 완료: ${delivered}`);
    console.log(`배송 대기: ${pending}`);
    console.log(`고객 요청: ${customerRequests}`);

    // 5. 변경된 레코드들 확인
    console.log('\n📋 배송 대기로 변경된 레코드들:');
    updatedData.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, 수령인: ${item.recipient_name}, 상태: 배송 대기`);
    });

    if (delivered + pending === total && pending === 10) {
      console.log('\n✅ 전체 true 변경 이전 상태로 완전히 복원되었습니다!');
    }

  } catch (error) {
    console.error('복원 중 오류 발생:', error.message);
  }
}

restoreBeforeTrueChange();