const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCustomerRequestColumn() {
  console.log('데이터베이스에 customer_request 컬럼을 추가합니다...');
  
  try {
    // customer_request 컬럼 추가
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE supplement_delivery 
        ADD COLUMN IF NOT EXISTS customer_request BOOLEAN DEFAULT FALSE;
        
        UPDATE supplement_delivery 
        SET customer_request = FALSE 
        WHERE customer_request IS NULL;
        
        ALTER TABLE supplement_delivery 
        ALTER COLUMN customer_request SET NOT NULL;
      `
    });

    if (error) {
      console.error('RPC 함수로 실행 실패:', error);
      console.log('대신 직접 SQL 실행을 시도합니다...');
      
      // 대안: 직접 SQL 실행 시도
      const { data: result, error: sqlError } = await supabase
        .from('supplement_delivery')
        .select('*')
        .limit(1);
        
      if (sqlError) {
        throw sqlError;
      }
      
      console.log('테이블 접근 성공. Supabase Dashboard에서 수동으로 다음 SQL을 실행해주세요:');
      console.log(`
ALTER TABLE supplement_delivery 
ADD COLUMN IF NOT EXISTS customer_request BOOLEAN DEFAULT FALSE;

UPDATE supplement_delivery 
SET customer_request = FALSE 
WHERE customer_request IS NULL;

ALTER TABLE supplement_delivery 
ALTER COLUMN customer_request SET NOT NULL;
      `);
      
    } else {
      console.log('customer_request 컬럼이 성공적으로 추가되었습니다!');
      console.log('결과:', data);
    }
    
  } catch (error) {
    console.error('오류 발생:', error.message);
    console.log('\nSupabase Dashboard의 SQL Editor에서 다음 SQL을 실행해주세요:');
    console.log(`
ALTER TABLE supplement_delivery 
ADD COLUMN IF NOT EXISTS customer_request BOOLEAN DEFAULT FALSE;

UPDATE supplement_delivery 
SET customer_request = FALSE 
WHERE customer_request IS NULL;

ALTER TABLE supplement_delivery 
ALTER COLUMN customer_request SET NOT NULL;
    `);
  }
}

addCustomerRequestColumn();