const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreDatabase() {
  console.log('데이터베이스를 원래 상태로 복원합니다...\n');
  
  try {
    // 모든 배송을 완료 상태로 복원 (원래 상태)
    const { data: updatedData, error: updateError } = await supabase
      .from('supplement_delivery')
      .update({ is_send: true })
      .neq('id', 0)  // 모든 레코드
      .select('id, recipient_name, is_send');

    if (updateError) {
      console.error('복원 실패:', updateError);
      return;
    }

    console.log('✅ 데이터베이스 복원 완료!');
    console.log(`${updatedData.length}개 레코드가 모두 배송 완료 상태로 복원되었습니다.`);
    
    // 복원된 통계 확인
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
    
    // customer_request = true인 레코드도 원래대로 되돌리기 (ID 98번만 제외하고)
    const { data: customerRequestData, error: customerError } = await supabase
      .from('supplement_delivery')
      .update({ customer_request: false })
      .neq('id', 98)  // ID 98번은 테스트용으로 남겨두기
      .eq('customer_request', true)
      .select('id');

    if (customerError) {
      console.error('고객 요청 필드 복원 실패:', customerError);
    } else if (customerRequestData && customerRequestData.length > 0) {
      console.log(`\n고객 요청 필드도 복원됨: ${customerRequestData.length}개 레코드`);
    }

    console.log('\n✅ 모든 데이터가 원래 상태로 복원되었습니다.');

  } catch (error) {
    console.error('복원 중 오류 발생:', error.message);
  }
}

restoreDatabase();