const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStats() {
  console.log('데이터베이스 통계를 확인합니다...\n');
  
  try {
    // 전체 데이터 조회
    const { data: allDeliveries, error } = await supabase
      .from('supplement_delivery')
      .select('id, recipient_name, is_send, customer_request')
      .order('id', { ascending: false });

    if (error) {
      console.error('데이터 조회 실패:', error);
      return;
    }

    if (!allDeliveries) {
      console.log('데이터가 없습니다.');
      return;
    }

    // 통계 계산
    const total = allDeliveries.length;
    const delivered = allDeliveries.filter(item => item.is_send === true).length;
    const pending = allDeliveries.filter(item => item.is_send === false).length;
    const customerRequests = allDeliveries.filter(item => item.customer_request === true).length;

    console.log('📊 데이터베이스 통계:');
    console.log(`총 배송: ${total}`);
    console.log(`배송 완료: ${delivered}`);
    console.log(`배송 대기: ${pending}`);
    console.log(`고객 요청: ${customerRequests}`);
    console.log('');

    // 최근 10개 데이터 샘플
    console.log('📋 최근 10개 레코드:');
    allDeliveries.slice(0, 10).forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}, 수령인: ${item.recipient_name}, 배송완료: ${item.is_send ? 'O' : 'X'}, 고객요청: ${item.customer_request ? 'O' : 'X'}`);
    });

    // 검증
    if (delivered + pending !== total) {
      console.log('\n⚠️  경고: 배송완료 + 배송대기 ≠ 총 배송');
      console.log(`계산: ${delivered} + ${pending} = ${delivered + pending}, 총계: ${total}`);
    } else {
      console.log('\n✅ 통계가 올바릅니다.');
    }

  } catch (error) {
    console.error('확인 중 오류 발생:', error.message);
  }
}

checkDatabaseStats();