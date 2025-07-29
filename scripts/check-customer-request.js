const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCustomerRequestColumn() {
  console.log('customer_request 컬럼이 제대로 추가되었는지 확인합니다...\n');
  
  try {
    // 데이터 조회해서 customer_request 필드가 있는지 확인
    const { data, error } = await supabase
      .from('supplement_delivery')
      .select('id, recipient_name, customer_request')
      .limit(5);

    if (error) {
      console.error('데이터 조회 실패:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ customer_request 컬럼이 성공적으로 추가되었습니다!');
      console.log('\n샘플 데이터:');
      data.forEach((item, index) => {
        console.log(`${index + 1}. ID: ${item.id}, 수령인: ${item.recipient_name}, 고객요청: ${item.customer_request}`);
      });
      
      console.log('\n모든 레코드가 customer_request = false로 기본값이 설정되어 있습니다.');
    } else {
      console.log('데이터가 없습니다. 빈 테이블입니다.');
    }

    // 테스트용으로 하나의 레코드를 customer_request = true로 업데이트해보기
    if (data && data.length > 0) {
      console.log('\n테스트를 위해 첫 번째 레코드를 customer_request = true로 업데이트합니다...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('supplement_delivery')
        .update({ customer_request: true })
        .eq('id', data[0].id)
        .select();

      if (updateError) {
        console.error('업데이트 실패:', updateError);
      } else {
        console.log('✅ 업데이트 성공!');
        console.log('업데이트된 데이터:', updateData[0]);
      }
    }

  } catch (error) {
    console.error('확인 중 오류 발생:', error.message);
  }
}

checkCustomerRequestColumn();