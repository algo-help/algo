// Test specific user creation to identify the exact issue
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testSpecificUserCreation() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Testing specific user creation scenarios...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    // Test case 1: help@algocarelab.com (the account that's likely being used for login)
    const testEmail = 'help@algocarelab.com';
    const testAuthId = '12345678-1234-1234-1234-123456789999'; // Different from existing ones
    
    console.log(`\n🔹 Test 1: Checking if ${testEmail} exists in database...`);
    
    const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('email', testEmail)
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
    } else {
        console.log('🔹 User does not exist, would need to be created');
    }
    
    console.log(`\n🔹 Test 2: Attempting to create new user with auth_id ${testAuthId}...`);
    
    // Clean up any existing test user first
    await supabase.from('users').delete().eq('email', 'test-oauth@algocarelab.com');
    
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            id: testAuthId,
            email: 'test-oauth@algocarelab.com',
            password_hash: 'oauth_user',
            role: 'v',
            is_active: false,
            avatar_url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=test&gender=male&backgroundColor=b6e3f4'
        })
        .select()
        .single();
    
    if (createError) {
        console.error('❌ Error creating new user:', {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint
        });
    } else {
        console.log('✅ Successfully created test user:', newUser);
        
        // Clean up
        await supabase.from('users').delete().eq('id', testAuthId);
        console.log('🔹 Test user cleaned up');
    }
    
    console.log(`\n🔹 Test 3: Testing auth_id update for existing user...`);
    
    if (existingUser) {
        const newAuthIdForExisting = '87654321-4321-4321-4321-987654321000';
        
        const { error: updateError } = await supabase
            .from('users')
            .update({ auth_id: newAuthIdForExisting })
            .eq('id', existingUser.id);
        
        if (updateError) {
            console.error('❌ Error updating auth_id:', updateError);
        } else {
            console.log('✅ Successfully updated auth_id for existing user');
            
            // Restore original auth_id
            await supabase
                .from('users')
                .update({ auth_id: existingUser.auth_id })
                .eq('id', existingUser.id);
            console.log('🔹 Restored original auth_id');
        }
    }
    
    console.log(`\n🔹 Test 4: Checking database constraints and permissions...`);
    
    // Check if there are any constraint violations
    const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, auth_id')
        .limit(10);
    
    if (allUsersError) {
        console.error('❌ Error fetching all users:', allUsersError);
    } else {
        console.log('✅ Current users in database:');
        allUsers.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id}, Auth ID: ${user.auth_id || 'null'})`);
        });
        
        // Check for duplicate auth_ids
        const authIds = allUsers.map(u => u.auth_id).filter(Boolean);
        const duplicateAuthIds = authIds.filter((id, index) => authIds.indexOf(id) !== index);
        
        if (duplicateAuthIds.length > 0) {
            console.warn('⚠️  Found duplicate auth_ids:', duplicateAuthIds);
        } else {
            console.log('✅ No duplicate auth_ids found');
        }
    }
}

testSpecificUserCreation().catch(console.error);