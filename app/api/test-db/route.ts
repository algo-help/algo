import { createAdminClient } from '@/utils/supabase/admin';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🔹 Testing database connection...');
    
    // 환경변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!serviceRoleKey,
      urlStart: supabaseUrl?.substring(0, 30),
      serviceKeyStart: serviceRoleKey?.substring(0, 30)
    });
    
    // Admin client 생성 테스트
    const adminSupabase = createAdminClient();
    console.log('🔹 Admin client created successfully');
    
    // 간단한 쿼리 테스트
    const { count, error } = await adminSupabase
      .from('users')
      .select('*', { count: 'exact', head: true });
      
    console.log('🔹 Query result:', { count, error });
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      userCount: count || 0
    });
    
  } catch (err) {
    console.error('🔹 Test failed:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    });
  }
}