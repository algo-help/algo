const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDeliveryStatus() {
  console.log('일부 배송을 대기 상태로 변경합니다...\n');
  
  try {
    // 최근 10개 레코드를 배송 대기로 변경
    const { data: recentDeliveries, error: fetchError } = await supabase
      .from('supplement_delivery')
      .select('id')
      .order('id', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('데이터 조회 실패:', fetchError);
      return;
    }

    const idsToUpdate = recentDeliveries.map(item => item.id);
    
    const { data: updatedData, error: updateError } = await supabase
      .from('supplement_delivery')
      .update({ is_send: false })
      .in('id', idsToUpdate)
      .select('id, recipient_name, is_send');

    if (updateError) {
      console.error('업데이트 실패:', updateError);
      return;
    }

    console.log('✅ 업데이트 완료!');
    console.log(`${updatedData.length}개 레코드가 배송 대기로 변경되었습니다.`);
    
    // 변경된 통계 다시 확인
    const { data: allDeliveries, error: statsError } = await supabase
      .from('supplement_delivery')
      .select('is_send');

    if (statsError) {
      console.error('통계 조회 실패:', statsError);
      return;
    }

    const total = allDeliveries.length;
    const delivered = allDeliveries.filter(item => item.is_send === true).length;
    const pending = allDeliveries.filter(item => item.is_send === false).length;

    console.log('\n📊 업데이트된 통계:');
    console.log(`총 배송: ${total}`);
    console.log(`배송 완료: ${delivered}`);
    console.log(`배송 대기: ${pending}`);

  } catch (error) {
    console.error('처리 중 오류 발생:', error.message);
  }
}

fixDeliveryStatus();