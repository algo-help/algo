// Create users table using admin client
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createUsersTable() {
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
    
    console.log('Creating users table...');
    
    const { data, error } = await supabase.rpc('exec_sql', {
        sql: `
        -- Create users table for authentication and authorization
        CREATE TABLE IF NOT EXISTS "public"."users" (
            "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
            "email" character varying(255) NOT NULL,
            "password_hash" character varying(255) NOT NULL,
            "role" character varying(50) DEFAULT 'v'::character varying NOT NULL,
            "is_active" boolean DEFAULT true,
            "created_at" timestamp with time zone DEFAULT "now"(),
            "updated_at" timestamp with time zone DEFAULT "now"(),
            "avatar_url" TEXT,
            "auth_id" "uuid",
            CONSTRAINT "valid_role" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'rw'::character varying, 'v'::character varying])::"text"[])))
        );

        -- Add primary key
        ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

        -- Add unique constraints
        ALTER TABLE ONLY "public"."users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");

        -- Add index for auth_id for OAuth users
        CREATE INDEX IF NOT EXISTS "users_auth_id_idx" ON "public"."users" ("auth_id");
        `
    });
    
    if (error) {
        console.error('Error creating users table:', error);
    } else {
        console.log('Users table created successfully:', data);
    }
    
    // Test table creation by querying it
    console.log('Testing table creation...');
    const { data: testData, error: testError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
    
    if (testError) {
        console.error('Error testing users table:', testError);
    } else {
        console.log('Users table test successful:', testData);
    }
}

createUsersTable().catch(console.error);