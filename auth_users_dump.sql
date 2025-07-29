--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 17.5 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	db909e55-12cc-4e2c-841c-e5014872a8e6	authenticated	authenticated	test@algocarelab.com	$2a$10$QcVQlMXFUD1T6ZzSY.ZC1.WfoMiDk0SlW8lu2070tYDf3HZ8eaFjS	2025-07-13 14:20:51.597073+00	\N		\N		\N			\N	2025-07-13 14:34:21.081837+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2025-07-13 14:20:51.579852+00	2025-07-13 14:34:21.086408+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	4c6b01f7-58c8-4222-ba3d-19da09474245	authenticated	authenticated	jeff@algocarelab.com	\N	2025-07-13 13:04:11.149308+00	\N		\N		\N			\N	2025-07-28 00:37:59.054754+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "105148593949521080617", "name": "박상우(Jeff)", "email": "jeff@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLcsb_OCtoEBXNidT-Fi6AyC0qOiZKbpjHTIguIG7MvJXxi6g=s96-c", "full_name": "박상우(Jeff)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLcsb_OCtoEBXNidT-Fi6AyC0qOiZKbpjHTIguIG7MvJXxi6g=s96-c", "provider_id": "105148593949521080617", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-13 13:04:11.092175+00	2025-07-28 08:59:53.759117+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5f980b59-98bc-41a4-a3a3-a12e2ec3035c	authenticated	authenticated	harry@algocarelab.com	\N	2025-07-15 06:02:26.267649+00	\N		\N		\N			\N	2025-07-15 06:25:24.062866+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "102683343271180906317", "name": "김도환 (Harry)", "email": "harry@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLCKoM_ozAZ9_Atz7k57eV5KteHTl1C11Y9tHPeJEOydQQibg=s96-c", "full_name": "김도환 (Harry)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLCKoM_ozAZ9_Atz7k57eV5KteHTl1C11Y9tHPeJEOydQQibg=s96-c", "provider_id": "102683343271180906317", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-15 06:02:26.249315+00	2025-07-15 06:25:24.06581+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6fc4e4f2-4fec-4071-a7d3-b56d62cb78a1	authenticated	authenticated	olive@algocarelab.com	\N	2025-07-17 04:25:17.548948+00	\N		\N		\N			\N	2025-07-28 02:22:00.437783+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "117277584940319253601", "name": "김경희(Olive)", "email": "olive@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocImrUIARkMm7k_rt9ya8P10TTCdZccng5nGM81vNMUMG0Ylsg=s96-c", "full_name": "김경희(Olive)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocImrUIARkMm7k_rt9ya8P10TTCdZccng5nGM81vNMUMG0Ylsg=s96-c", "provider_id": "117277584940319253601", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-17 04:25:17.528004+00	2025-07-29 02:16:44.751992+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5bc18f01-b341-4d0f-b0c9-fbf9b8e57bcb	authenticated	authenticated	developer@algocarelab.com	\N	2025-07-15 06:28:41.191412+00	\N		\N		\N			\N	2025-07-17 04:21:39.86208+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "100819301035248595588", "name": "개발팀", "email": "developer@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK8MhdzaTwXQ9fWkuH6uGpucY6eGwYWNutnhLmyKCuV13gbYg=s96-c", "full_name": "개발팀", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocK8MhdzaTwXQ9fWkuH6uGpucY6eGwYWNutnhLmyKCuV13gbYg=s96-c", "provider_id": "100819301035248595588", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-15 06:28:41.167909+00	2025-07-17 04:21:39.86657+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	65179826-ef70-4419-9d41-dc400fce879e	authenticated	authenticated	kai@algocarelab.com	\N	2025-07-17 07:12:03.796563+00	\N		\N		\N			\N	2025-07-17 07:12:05.379414+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "105215785079823063662", "name": "오지훈 (kai)", "email": "kai@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocIG1aU9PXEQYMYiXtcUj4PcT4RkqmZ8J8ws_KSBfC1g5DY5=s96-c", "full_name": "오지훈 (kai)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocIG1aU9PXEQYMYiXtcUj4PcT4RkqmZ8J8ws_KSBfC1g5DY5=s96-c", "provider_id": "105215785079823063662", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-17 07:12:03.771368+00	2025-07-17 07:12:05.386326+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	0661c1fb-3dd2-45a2-9706-1ff5530676ee	authenticated	authenticated	ellen@algocarelab.com	\N	2025-07-22 09:19:34.256486+00	\N		\N		\N			\N	2025-07-22 09:19:35.984229+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "117035353614099030414", "name": "이다예(Ellen)", "email": "ellen@algocarelab.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocKcl9FJ9R44CalWJyI3RK2qZTmxftDzHPFgtQCnsZr0IwBViA=s96-c", "full_name": "이다예(Ellen)", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocKcl9FJ9R44CalWJyI3RK2qZTmxftDzHPFgtQCnsZr0IwBViA=s96-c", "provider_id": "117035353614099030414", "custom_claims": {"hd": "algocarelab.com"}, "email_verified": true, "phone_verified": false}	\N	2025-07-22 09:19:34.22249+00	2025-07-22 09:19:35.999316+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- PostgreSQL database dump complete
--

