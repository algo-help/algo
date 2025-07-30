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

-- Set table owner
ALTER TABLE "public"."users" OWNER TO "postgres";

-- Add table comment
COMMENT ON TABLE "public"."users" IS '사용자 인증 및 권한 관리 테이블';

-- Add column comments
COMMENT ON COLUMN "public"."users"."id" IS '사용자 고유 ID';
COMMENT ON COLUMN "public"."users"."email" IS '사용자 이메일';
COMMENT ON COLUMN "public"."users"."password_hash" IS '비밀번호 해시';
COMMENT ON COLUMN "public"."users"."role" IS '사용자 역할 (admin, rw, v)';
COMMENT ON COLUMN "public"."users"."is_active" IS '계정 활성화 상태';
COMMENT ON COLUMN "public"."users"."avatar_url" IS '사용자 아바타 URL';
COMMENT ON COLUMN "public"."users"."auth_id" IS 'OAuth 인증 ID (Supabase Auth UUID)';