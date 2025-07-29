

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."supplement_delivery" (
    "id" integer NOT NULL,
    "delivery_date" "date" NOT NULL,
    "supplement_type" "text" NOT NULL,
    "recipient_name" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "invoice_number" "text",
    "is_send" boolean DEFAULT false,
    "customer_request" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."supplement_delivery" OWNER TO "postgres";


COMMENT ON TABLE "public"."supplement_delivery" IS '영양제 배송 정보 테이블';



COMMENT ON COLUMN "public"."supplement_delivery"."delivery_date" IS '배송 일자';



COMMENT ON COLUMN "public"."supplement_delivery"."supplement_type" IS '영양제 종류';



COMMENT ON COLUMN "public"."supplement_delivery"."recipient_name" IS '대상자 이름';



COMMENT ON COLUMN "public"."supplement_delivery"."quantity" IS '수량';



COMMENT ON COLUMN "public"."supplement_delivery"."invoice_number" IS '송장번호';



COMMENT ON COLUMN "public"."supplement_delivery"."is_send" IS '발송 여부';



CREATE OR REPLACE FUNCTION "public"."get_supplement_deliveries"() RETURNS SETOF "public"."supplement_delivery"
    LANGUAGE "sql"
    AS $$
    SELECT * FROM supplement_delivery
  $$;


ALTER FUNCTION "public"."get_supplement_deliveries"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."supplement_delivery_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."supplement_delivery_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."supplement_delivery_id_seq" OWNED BY "public"."supplement_delivery"."id";



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "password_hash" character varying(255) NOT NULL,
    "role" character varying(50) DEFAULT 'readonly'::character varying NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_role" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'rw'::character varying, 'v'::character varying])::"text"[])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS '시스템 사용자 정보 테이블';



COMMENT ON COLUMN "public"."users"."email" IS '사용자 이메일 (로그인 ID)';



COMMENT ON COLUMN "public"."users"."password_hash" IS '암호화된 비밀번호';



COMMENT ON COLUMN "public"."users"."role" IS '사용자 권한 (admin: 관리자, readonly: 읽기전용)';



COMMENT ON COLUMN "public"."users"."is_active" IS '계정 활성화 여부';



ALTER TABLE ONLY "public"."supplement_delivery" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."supplement_delivery_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."supplement_delivery"
    ADD CONSTRAINT "supplement_delivery_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE POLICY "Admin can view all users" ON "public"."users" FOR SELECT USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow all for testing" ON "public"."users" USING (true) WITH CHECK (true);



CREATE POLICY "Allow authenticated user creation" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable delete for all users" ON "public"."supplement_delivery" FOR DELETE USING (true);



CREATE POLICY "Enable insert for all users" ON "public"."supplement_delivery" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."supplement_delivery" FOR SELECT USING (true);



CREATE POLICY "Enable update for all users" ON "public"."supplement_delivery" FOR UPDATE USING (true);



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND (("email")::"text" = ("auth"."jwt"() ->> 'email'::"text"))));



ALTER TABLE "public"."supplement_delivery" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON TABLE "public"."supplement_delivery" TO "anon";
GRANT ALL ON TABLE "public"."supplement_delivery" TO "authenticated";
GRANT ALL ON TABLE "public"."supplement_delivery" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_supplement_deliveries"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_supplement_deliveries"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_supplement_deliveries"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON SEQUENCE "public"."supplement_delivery_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."supplement_delivery_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."supplement_delivery_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
