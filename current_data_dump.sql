--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
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
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-07-29 01:39:53
20211116045059	2025-07-29 01:39:54
20211116050929	2025-07-29 01:39:55
20211116051442	2025-07-29 01:39:55
20211116212300	2025-07-29 01:39:56
20211116213355	2025-07-29 01:39:57
20211116213934	2025-07-29 01:39:58
20211116214523	2025-07-29 01:39:59
20211122062447	2025-07-29 01:40:00
20211124070109	2025-07-29 01:40:01
20211202204204	2025-07-29 01:40:01
20211202204605	2025-07-29 01:40:02
20211210212804	2025-07-29 01:40:05
20211228014915	2025-07-29 01:40:06
20220107221237	2025-07-29 01:40:07
20220228202821	2025-07-29 01:40:07
20220312004840	2025-07-29 01:40:08
20220603231003	2025-07-29 01:40:09
20220603232444	2025-07-29 01:40:10
20220615214548	2025-07-29 01:40:11
20220712093339	2025-07-29 01:40:12
20220908172859	2025-07-29 01:40:13
20220916233421	2025-07-29 01:40:14
20230119133233	2025-07-29 01:40:14
20230128025114	2025-07-29 01:40:16
20230128025212	2025-07-29 01:40:16
20230227211149	2025-07-29 01:40:17
20230228184745	2025-07-29 01:40:18
20230308225145	2025-07-29 01:40:19
20230328144023	2025-07-29 01:40:19
20231018144023	2025-07-29 01:40:20
20231204144023	2025-07-29 01:40:22
20231204144024	2025-07-29 01:40:22
20231204144025	2025-07-29 01:40:23
20240108234812	2025-07-29 01:40:24
20240109165339	2025-07-29 01:40:25
20240227174441	2025-07-29 01:40:26
20240311171622	2025-07-29 01:40:27
20240321100241	2025-07-29 01:40:29
20240401105812	2025-07-29 01:40:31
20240418121054	2025-07-29 01:40:32
20240523004032	2025-07-29 01:40:35
20240618124746	2025-07-29 01:40:36
20240801235015	2025-07-29 01:40:37
20240805133720	2025-07-29 01:40:37
20240827160934	2025-07-29 01:40:38
20240919163303	2025-07-29 01:40:39
20240919163305	2025-07-29 01:40:40
20241019105805	2025-07-29 01:40:41
20241030150047	2025-07-29 01:40:44
20241108114728	2025-07-29 01:40:45
20241121104152	2025-07-29 01:40:46
20241130184212	2025-07-29 01:40:47
20241220035512	2025-07-29 01:40:47
20241220123912	2025-07-29 01:40:48
20241224161212	2025-07-29 01:40:49
20250107150512	2025-07-29 01:40:50
20250110162412	2025-07-29 01:40:50
20250123174212	2025-07-29 01:40:51
20250128220012	2025-07-29 01:40:52
20250506224012	2025-07-29 01:40:53
20250523164012	2025-07-29 01:40:53
20250714121412	2025-07-29 01:40:54
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-07-29 01:39:50.259272
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-07-29 01:39:50.283696
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-07-29 01:39:50.288931
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-07-29 01:39:50.354566
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-07-29 01:39:50.390071
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-07-29 01:39:50.392959
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-07-29 01:39:50.397154
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-07-29 01:39:50.40006
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-07-29 01:39:50.403744
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-07-29 01:39:50.40645
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-07-29 01:39:50.409669
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-07-29 01:39:50.414966
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-07-29 01:39:50.425281
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-07-29 01:39:50.428587
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-07-29 01:39:50.43177
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-07-29 01:39:50.462617
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-07-29 01:39:50.467778
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-07-29 01:39:50.47191
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-07-29 01:39:50.479383
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-07-29 01:39:50.488786
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-07-29 01:39:50.49267
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-07-29 01:39:50.501329
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-07-29 01:39:50.529669
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-07-29 01:39:50.551944
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-07-29 01:39:50.557762
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-07-29 01:39:50.562057
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-07-29 01:39:50.565692
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-07-29 01:39:50.594017
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-07-29 01:39:50.603083
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-07-29 01:39:50.614917
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-07-29 01:39:50.625234
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-07-29 01:39:50.632591
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-07-29 01:39:50.642163
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-07-29 01:39:50.649663
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-07-29 01:39:50.651187
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-07-29 01:39:50.656036
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-07-29 01:39:50.658741
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-07-29 01:39:50.665785
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-07-29 01:39:50.67233
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

