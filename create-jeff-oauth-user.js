// Create jeff@algocarelab.com user for OAuth
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createJeffOAuthUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Creating OAuth-ready jeff@algocarelab.com user...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const email = 'jeff@algocarelab.com';
    
    // First check if user exists
    console.log('🔹 Checking if user exists...');
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
        console.error('❌ Error checking user:', selectError);
        return;
    }
    
    if (existingUser) {
        console.log('✅ User already exists:', {
            id: existingUser.id,
            email: existingUser.email,
            auth_id: existingUser.auth_id,
            role: existingUser.role,
            is_active: existingUser.is_active
        });
        
        // Remove auth_id to force OAuth re-linking
        console.log('🔹 Clearing auth_id to allow fresh OAuth linking...');
        const { error: updateError } = await supabase
            .from('users')
            .update({ auth_id: null })
            .eq('id', existingUser.id);
        
        if (updateError) {
            console.error('❌ Failed to clear auth_id:', updateError);
        } else {
            console.log('✅ Successfully cleared auth_id - OAuth can now link properly');
        }
        
    } else {
        console.log('🔹 User does not exist, would need OAuth to create first');
    }
    
    // Now try OAuth signup through Supabase directly
    console.log('\n🔹 Testing OAuth signup directly through Supabase...');
    
    // Create a test auth user (this simulates what Google OAuth would do)
    console.log('🔹 This would normally happen through Google OAuth...');
    
    // Check what happens when we try to create a user with a fresh UUID
    const testAuthId = 'test-oauth-' + Date.now();
    console.log(`🔹 Testing user creation with ID: ${testAuthId}`);
    
    // Clean up any test users first
    await supabase.from('users').delete().eq('email', 'test-oauth@algocarelab.com');
    
    const { data: testUser, error: testError } = await supabase
        .from('users')
        .insert({
            id: testAuthId, // This might be the problem - non-UUID ID
            email: 'test-oauth@algocarelab.com',
            password_hash: 'oauth_user',
            role: 'v',
            is_active: false,
            avatar_url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=test&gender=male&backgroundColor=b6e3f4'
        })
        .select()
        .single();
    
    if (testError) {
        console.error('❌ Test user creation failed:', {
            code: testError.code,
            message: testError.message,
            details: testError.details
        });
        
        if (testError.code === '22P02') {
            console.log('\n💡 FOUND THE ISSUE: Non-UUID ID format!');
            console.log('🔹 Google OAuth probably returns non-UUID user ID');
            console.log('🔹 But our database expects UUID format for id column');
        }
    } else {
        console.log('✅ Test user created successfully:', testUser);
        
        // Clean up
        await supabase.from('users').delete().eq('id', testAuthId);
        console.log('🔹 Test user cleaned up');
    }
}

createJeffOAuthUser().catch(console.error);