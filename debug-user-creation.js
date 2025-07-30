// Debug user creation issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugUserCreation() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Environment check:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        url: supabaseUrl
    });
    
    if (!supabaseUrl || !serviceRoleKey) {
        console.error('Missing environment variables');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    console.log('Checking existing users...');
    
    // Check current users in database
    const { data: existingUsers, error: selectError } = await supabase
        .from('users')
        .select('id, email, auth_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (selectError) {
        console.error('Error selecting users:', selectError);
    } else {
        console.log('Current users:');
        existingUsers.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id}, Auth ID: ${user.auth_id || 'null'})`);
        });
    }
    
    // Test creating a new user with a specific auth ID
    const testAuthId = '12345678-1234-1234-1234-123456789012';
    const testEmail = 'test@algocarelab.com';
    
    console.log(`\nTesting user creation with auth_id: ${testAuthId}`);
    
    // First try to delete any existing test user
    await supabase
        .from('users')
        .delete()
        .eq('email', testEmail);
    
    // Try to create new user
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
            id: testAuthId,
            email: testEmail,
            password_hash: 'oauth_user',
            role: 'v',
            is_active: false,
            avatar_url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=test&gender=male&backgroundColor=b6e3f4'
        })
        .select()
        .single();
    
    if (insertError) {
        console.error('Error creating test user:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint
        });
    } else {
        console.log('Test user created successfully:', newUser);
        
        // Clean up test user
        await supabase
            .from('users')
            .delete()
            .eq('id', testAuthId);
        console.log('Test user cleaned up');
    }
}

debugUserCreation().catch(console.error);