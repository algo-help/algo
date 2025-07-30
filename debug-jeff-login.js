// Debug jeff@algocarelab.com login issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugJeffLogin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Debugging jeff@algocarelab.com login issue...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const userEmail = 'jeff@algocarelab.com';
    
    console.log(`\n🔹 Step 1: Check if ${userEmail} exists in database...`);
    
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
    
    if (selectError) {
        console.error('❌ Error fetching user:', selectError);
        return;
    }
    
    if (existingUser) {
        console.log('✅ User found in database:', {
            id: existingUser.id,
            email: existingUser.email,
            auth_id: existingUser.auth_id,
            role: existingUser.role,
            is_active: existingUser.is_active,
            created_at: existingUser.created_at
        });
        
        // Simulate the OAuth callback logic
        console.log(`\n🔹 Step 2: Simulating OAuth callback logic...`);
        
        // Assume we get a new auth_id from Google OAuth (simulate)
        const simulatedGoogleAuthId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
        
        console.log(`🔹 Simulated Google auth_id: ${simulatedGoogleAuthId}`);
        console.log(`🔹 Current user auth_id: ${existingUser.auth_id}`);
        
        // Step 2a: Check if auth_id lookup would find the user
        console.log(`\n🔹 Step 2a: Testing auth_id lookup...`);
        
        const { data: authIdResult, error: authIdError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', simulatedGoogleAuthId)
            .single();
        
        if (authIdError && authIdError.code === 'PGRST116') {
            console.log('🔹 Auth ID lookup: No user found (expected for new auth_id)');
        } else if (authIdError) {
            console.error('❌ Auth ID lookup error:', authIdError);
        } else {
            console.log('✅ Auth ID lookup found user:', authIdResult.email);
        }
        
        // Step 2b: Check if email lookup would find the user
        console.log(`\n🔹 Step 2b: Testing email lookup...`);
        
        const { data: emailResult, error: emailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', userEmail)
            .single();
        
        if (emailError) {
            console.error('❌ Email lookup error:', emailError);
        } else {
            console.log('✅ Email lookup found user:', {
                id: emailResult.id,
                email: emailResult.email,
                auth_id: emailResult.auth_id
            });
        }
        
        // Step 2c: Test auth_id update
        console.log(`\n🔹 Step 2c: Testing auth_id update...`);
        
        const { error: updateError } = await supabase
            .from('users')
            .update({ auth_id: simulatedGoogleAuthId })
            .eq('id', existingUser.id);
        
        if (updateError) {
            console.error('❌ Auth ID update error:', updateError);
        } else {
            console.log('✅ Auth ID update successful');
            
            // Restore original auth_id
            await supabase
                .from('users')
                .update({ auth_id: existingUser.auth_id })
                .eq('id', existingUser.id);
            console.log('🔹 Restored original auth_id');
        }
        
    } else {
        console.log('❌ User not found in database!');
    }
    
    // Step 3: Test new user creation scenario
    console.log(`\n🔹 Step 3: Testing new user creation scenario (this might be where the error occurs)...`);
    
    const testAuthId = 'test-auth-id-12345';
    const testEmail = 'test-new-user@algocarelab.com';
    
    // Clean up any existing test user
    await supabase.from('users').delete().eq('email', testEmail);
    
    const { data: newUser, error: createError } = await supabase
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
    
    if (createError) {
        console.error('❌ New user creation error (this might be the OAuth callback issue):', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
        });
    } else {
        console.log('✅ New user creation successful:', newUser.email);
        
        // Clean up
        await supabase.from('users').delete().eq('id', testAuthId);
        console.log('🔹 Test user cleaned up');
    }
}

debugJeffLogin().catch(console.error);