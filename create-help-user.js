// Create help@algocarelab.com user in database
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: '.env.local' });

async function createHelpUser() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔹 Creating help@algocarelab.com user...');
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const email = 'help@algocarelab.com';
    const userId = uuidv4();
    const authId = uuidv4();
    
    // Generate random avatar
    const avatarSeed = Math.random().toString(36).substring(2, 15);
    const avatarGender = 'female'; // or 'male'
    const avatarUrl = `https://api.dicebear.com/7.x/lorelei/svg?seed=${avatarSeed}&gender=${avatarGender}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    
    console.log(`🔹 User details:
  - Email: ${email}
  - User ID: ${userId}
  - Auth ID: ${authId}
  - Role: admin (since this is help account)
  - Avatar: ${avatarUrl}`);
    
    const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
            id: userId,
            email: email,
            password_hash: 'oauth_user', // OAuth user doesn't need password
            role: 'admin', // help account should have admin privileges
            is_active: true, // help account should be active by default
            avatar_url: avatarUrl,
            auth_id: authId
        })
        .select()
        .single();
    
    if (createError) {
        console.error('❌ Error creating help user:', {
            code: createError.code,
            message: createError.message,
            details: createError.details
        });
    } else {
        console.log('✅ Successfully created help@algocarelab.com user:', {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            is_active: newUser.is_active,
            auth_id: newUser.auth_id
        });
        
        console.log('\n🔹 Now help@algocarelab.com can login via Google OAuth!');
    }
    
    // Verify creation
    console.log('\n🔹 Verifying user creation...');
    const { data: verifyUser, error: verifyError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (verifyError) {
        console.error('❌ Error verifying user:', verifyError);
    } else {
        console.log('✅ User verification successful:', {
            email: verifyUser.email,
            role: verifyUser.role,
            is_active: verifyUser.is_active
        });
    }
}

createHelpUser().catch(console.error);