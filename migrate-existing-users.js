// Migrate existing users to add auth_id
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function migrateExistingUsers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Starting user migration...');
    console.log('Environment check:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!serviceRoleKey,
        url: supabaseUrl
    });
    
    if (!supabaseUrl || !serviceRoleKey) {
        console.error('❌ Missing environment variables');
        process.exit(1);
    }
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        // Get all users without auth_id
        console.log('🔹 Fetching users without auth_id...');
        const { data: usersWithoutAuthId, error: selectError } = await supabase
            .from('users')
            .select('id, email, auth_id, created_at')
            .is('auth_id', null)
            .order('created_at', { ascending: true });
        
        if (selectError) {
            console.error('❌ Error fetching users:', selectError);
            return;
        }
        
        console.log(`🔹 Found ${usersWithoutAuthId.length} users without auth_id:`);
        usersWithoutAuthId.forEach(user => {
            console.log(`  - ${user.email} (ID: ${user.id})`);
        });
        
        if (usersWithoutAuthId.length === 0) {
            console.log('✅ All users already have auth_id set');
            return;
        }
        
        // Ask for confirmation
        console.log('\n🔸 This will generate new auth_id for each user without one.');
        console.log('🔸 Continue? (This is a one-time migration)');
        
        // Auto-proceed for automation (remove this if you want manual confirmation)
        console.log('🔹 Proceeding with migration...\n');
        
        let successCount = 0;
        let errorCount = 0;
        
        // Update each user with a new auth_id
        for (const user of usersWithoutAuthId) {
            const newAuthId = uuidv4();
            
            console.log(`🔹 Updating ${user.email} with auth_id: ${newAuthId}`);
            
            const { error: updateError } = await supabase
                .from('users')
                .update({ auth_id: newAuthId })
                .eq('id', user.id);
            
            if (updateError) {
                console.error(`❌ Failed to update ${user.email}:`, updateError.message);
                errorCount++;
            } else {
                console.log(`✅ Successfully updated ${user.email}`);
                successCount++;
            }
        }
        
        console.log(`\n🔹 Migration completed:`);
        console.log(`  ✅ Success: ${successCount} users`);
        console.log(`  ❌ Errors: ${errorCount} users`);
        
        // Verify migration
        console.log('\n🔹 Verifying migration...');
        const { data: verifyUsers, error: verifyError } = await supabase
            .from('users')
            .select('id, email, auth_id')
            .order('created_at', { ascending: true });
        
        if (verifyError) {
            console.error('❌ Error verifying migration:', verifyError);
        } else {
            console.log('🔹 Current user status:');
            verifyUsers.forEach(user => {
                const status = user.auth_id ? '✅' : '❌';
                console.log(`  ${status} ${user.email} (Auth ID: ${user.auth_id || 'null'})`);
            });
            
            const usersWithoutAuth = verifyUsers.filter(u => !u.auth_id);
            if (usersWithoutAuth.length === 0) {
                console.log('\n✅ All users now have auth_id set!');
            } else {
                console.log(`\n⚠️  ${usersWithoutAuth.length} users still missing auth_id`);
            }
        }
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Special function to reset a specific user's auth_id (for testing)
async function resetUserAuthId(email) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    console.log(`🔹 Resetting auth_id for ${email}...`);
    
    const { error } = await supabase
        .from('users')
        .update({ auth_id: null })
        .eq('email', email);
    
    if (error) {
        console.error(`❌ Failed to reset ${email}:`, error.message);
    } else {
        console.log(`✅ Successfully reset ${email}`);
    }
}

// Check command line arguments
const args = process.argv.slice(2);
if (args[0] === 'reset' && args[1]) {
    resetUserAuthId(args[1]).catch(console.error);
} else {
    migrateExistingUsers().catch(console.error);
}