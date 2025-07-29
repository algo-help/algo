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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, is_active, created_at, updated_at, avatar_url, auth_id) FROM stdin;
41c3c124-ba4b-4600-ab27-490a4d2278f4	developer@algocarelab.com	oauth_user	rw	t	2025-07-16 05:42:22.821627+00	2025-07-17 04:21:28.9513+00	https://api.dicebear.com/7.x/lorelei/svg?seed=08qhhca5x13q&gender=male&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf	\N
6fc4e4f2-4fec-4071-a7d3-b56d62cb78a1	olive@algocarelab.com	oauth_user	rw	t	2025-07-17 04:25:20.598898+00	2025-07-17 04:26:07.951454+00	https://api.dicebear.com/7.x/lorelei/svg?seed=y6azbfp31x&gender=female&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf	\N
65179826-ef70-4419-9d41-dc400fce879e	kai@algocarelab.com	oauth_user	v	t	2025-07-17 07:12:06.314362+00	2025-07-17 07:15:13.899418+00	https://api.dicebear.com/7.x/lorelei/svg?seed=6kcrrgroozi&gender=male&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf	\N
6892cdf5-5ab4-41a0-9cb0-7a92d1beb029	jeff@algocarelab.com	oauth_user	admin	t	2025-07-14 01:12:41.982787+00	2025-07-17 07:18:38.315121+00	https://api.dicebear.com/7.x/lorelei/svg?seed=1nx8g9fu4al&gender=male&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf	\N
0661c1fb-3dd2-45a2-9706-1ff5530676ee	ellen@algocarelab.com	oauth_user	rw	t	2025-07-22 09:19:37.430535+00	2025-07-22 09:20:34.805371+00	https://api.dicebear.com/7.x/lorelei/svg?seed=d1ilqnknyow&gender=male&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf	\N
\.


--
-- Data for Name: forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.forms (id, title, description, slug, is_published, questions, styling, settings, scheduling_config, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: form_responses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.form_responses (id, responses, submitted_at, respondent_email, respondent_name, respondent_phone, form_id) FROM stdin;
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.appointments (id, title, description, start_time, end_time, time_zone, meeting_type, location, meeting_url, status, created_at, updated_at, user_id, form_id, response_id) FROM stdin;
\.


--
-- Data for Name: calendar_integrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.calendar_integrations (id, provider, access_token, refresh_token, expires_at, user_id, email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: menu_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.menu_items (id, menu_key, menu_name, menu_path, parent_menu_key, icon, sort_order, is_active, created_at, updated_at) FROM stdin;
1	delivery	영양제 배송	/delivery	\N	Package	1	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
2	monthly-usage	월간 사용금액 관리	/monthly-usage	\N	Calculator	2	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
3	formtime	FormTime	/formtime	\N	Clock	3	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
4	formtime.main	FormTime 메인	/formtime	\N	Clock	31	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
5	formtime.builder	폼 빌더	/formtime/form-builder	\N	Edit	32	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
6	formtime.responses	응답 관리	/formtime/responses	\N	FileText	33	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
7	formtime.appointments	예약 관리	/formtime/appointments	\N	Calendar	34	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
8	admin	관리자 메뉴	/admin	\N	Shield	100	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
9	admin.users	사용자 관리	/admin/users	\N	Users	101	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
10	admin.auth	인증 및 권한	/admin/auth	\N	Shield	102	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
\.


--
-- Data for Name: oauth_user_mapping; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.oauth_user_mapping (auth_id, user_id, email, created_at) FROM stdin;
\.


--
-- Data for Name: role_hierarchy; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_hierarchy (id, role, level, can_manage_roles, description, created_at) FROM stdin;
1	super_admin	100	{admin,rw,v}	슈퍼관리자 - 모든 권한	2025-07-20 13:58:34.027192+00
2	admin	50	{rw,v}	관리자 - 일반 사용자 관리	2025-07-20 13:58:34.027192+00
3	rw	20	{}	사용자 - 읽기/쓰기 권한	2025-07-20 13:58:34.027192+00
4	v	10	{}	보기전용 - 읽기 권한만	2025-07-20 13:58:34.027192+00
\.


--
-- Data for Name: role_menu_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_menu_permissions (id, role, menu_key, can_access, can_read, can_write, can_delete, created_at, updated_at) FROM stdin;
1	admin	delivery	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
2	admin	monthly-usage	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
3	admin	formtime	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
4	admin	formtime.main	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
5	admin	formtime.builder	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
6	admin	formtime.responses	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
7	admin	formtime.appointments	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
8	admin	admin	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
9	admin	admin.users	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
10	admin	admin.auth	t	t	t	t	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
11	rw	delivery	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
12	rw	monthly-usage	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
13	rw	formtime	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
14	rw	formtime.main	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
15	rw	formtime.builder	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
16	rw	formtime.responses	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
17	rw	formtime.appointments	t	t	t	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
18	v	delivery	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
19	v	monthly-usage	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
20	v	formtime	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
21	v	formtime.main	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
22	v	formtime.builder	f	f	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
23	v	formtime.responses	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
24	v	formtime.appointments	t	t	f	f	2025-07-20 13:58:33.873078+00	2025-07-20 13:58:33.873078+00
25	super_admin	delivery	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
26	super_admin	monthly-usage	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
27	super_admin	formtime	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
28	super_admin	formtime.main	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
29	super_admin	formtime.builder	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
30	super_admin	formtime.responses	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
31	super_admin	formtime.appointments	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
32	super_admin	admin	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
33	super_admin	admin.users	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
34	super_admin	admin.auth	t	t	t	t	2025-07-20 13:58:34.027192+00	2025-07-20 13:58:34.027192+00
\.


--
-- Data for Name: supplement_delivery; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.supplement_delivery (id, delivery_date, supplement_type, recipient_name, quantity, invoice_number, is_send, customer_request) FROM stdin;
96	2025-06-10	콜라겐	서창원	1	\N	t	f
101	2025-06-19	비타민 D	서창원	1	\N	t	f
103	2025-06-23	오메가3	박준영	1	\N	t	f
104	2025-06-23	카테킨	장희성	1	\N	t	f
105	2025-06-23	콜라겐	박재연	1	\N	t	f
1	2025-04-14	오메가3	신형규	1	6892077893205	t	f
2	2025-04-14	비타민 D	신형규	1	6892077893205	t	f
3	2025-04-14	콜라겐	신형규	1	6892077893205	t	f
4	2025-04-14	오메가3	마혜인	1	6892077893851	t	f
5	2025-04-14	바나바잎	장희성	1	6892077894273	t	f
6	2025-04-14	카테킨	장희성	1	6892077894273	t	f
7	2025-04-16	비타민 B	최두영	1	6102915112631	t	f
8	2025-04-16	오메가3	김현진	1	6102915112633	t	f
9	2025-04-18	콜라겐	박준영	1	6892078173945	t	f
10	2025-04-22	비타민 B	이지후	1	6892078325412	t	f
11	2025-04-22	비타민 B	장희성	1	6892078325614	t	f
12	2025-04-25	비타민 B	마혜인	1	6892078519154	t	f
13	2025-04-25	마그네슘	박현준	1	6892078519440	t	f
14	2025-04-25	멜라토닌	박현준	1	6892078519440	t	f
90	2025-06-10	비타민 B	김현진	1	\N	t	f
124	2025-07-11	바나바잎추출물	박준영	1	\N	t	f
123	2025-07-11	칼슘	박준영	1	\N	t	f
127	2025-07-14	유산균	박상욱	1	\N	t	f
126	2025-07-14	비타민 C	박상욱	1	\N	t	f
134	2025-07-14	종합비타민미네랄	김민선	1	\N	t	f
131	2025-07-14	콜라겐	김민선	1	\N	t	f
132	2025-07-14	오메가3	김민선	1	\N	t	f
133	2025-07-14	마그네슘	김민선	1	\N	t	f
137	2025-07-14	홍경천테아닌	김민선	1	\N	t	f
136	2025-07-14	바나바잎추출물	김민선	1	\N	t	f
141	2025-07-15	칼슘	조종원	1	\N	t	f
142	2025-07-15	비타민 B	이지후	1	\N	t	f
143	2025-07-16	홍경천테아닌	조종원	1	\N	t	f
144	2025-07-16	바나바잎추출물	조종원	1	\N	t	f
145	2025-07-16	카테킨	이환희	1	\N	t	f
148	2025-07-21	바나바잎추출물	장희성	1	\N	t	f
149	2025-07-21	콜라겐	이환희	1	\N	t	f
150	2025-07-21	멜라토닌	김민선	1	\N	t	f
155	2025-07-29	마그네슘	박현준	1	\N	f	f
15	2025-04-25	비타민 B	장희성	1	6892078519588	t	f
16	2025-04-30	종합비타민미네랄	박준영	1	6892078739833	t	f
17	2025-04-30	비타민 B	장희성	1	6892078785269	t	f
18	2025-04-30	카테킨	장희성	1	6892078785269	t	f
19	2025-05-02	비타민 D	신형규	1	6102914124520	t	f
20	2025-05-02	카테킨	정성욱	1	6102914124521	t	f
21	2025-05-02	마그네슘	마혜인	1	6102914124522	t	f
22	2025-05-02	카테킨	권형기	1	6102914124519	t	f
23	2025-05-02	비타민 D	권형기	1	6102914124519	t	f
24	2025-05-02	마그네슘	권형기	1	6102914124519	t	f
25	2025-05-02	종합비타민미네랄	장두현	1	6102914124518	t	f
26	2025-05-02	마그네슘	장두현	1	6102914124518	t	f
27	2025-05-02	오메가3	장두현	1	6102914124518	t	f
28	2025-05-02	밀크씨슬	장두현	1	6102914124518	t	f
29	2025-05-02	바나바잎	장두현	1	6102914124518	t	f
30	2025-05-02	유산균	장두현	1	6102914124518	t	f
31	2025-05-02	홍경천테아닌	장두현	1	6102914124518	t	f
32	2025-05-02	카테킨	장두현	1	6102914124518	t	f
33	2025-05-07	칼슘	박준영	1	6892079023949	t	f
34	2025-05-07	오메가3	박준영	1	6892079023949	t	f
35	2025-05-07	비타민 C	박현준	1	6892079024188	t	f
36	2025-05-07	마그네슘	이지후	1	6892079024611	t	f
37	2025-05-07	오메가3	김현진	1	6892079025080	t	f
38	2025-05-08	종합비타민미네랄	김민선	1	6892079091589	t	f
39	2025-05-08	바나바잎	신형규	1	6892079091749	t	f
40	2025-05-08	마그네슘	신형규	1	6892079091749	t	f
41	2025-05-09	비타민 B	심다슬	1	6892079156773	t	f
42	2025-05-09	밀크씨슬	심다슬	1	6892079156773	t	f
111	2025-06-30	카테킨	조종원	1	\N	t	f
110	2025-06-30	콜라겐	박준영	1	\N	t	f
114	2025-07-04	종합비타민미네랄	박준영	1	\N	t	f
119	2025-07-09	밀크씨슬	박재연	1	\N	t	f
122	2025-07-10	카테킨	문한빛	1	\N	t	f
128	2025-07-11	멜라토닌	김현진	1	\N	t	f
129	2025-07-11	칼슘	김현진	1	\N	t	f
130	2025-07-11	마그네슘	박상욱	1	\N	t	f
98	2025-06-18	비타민 B	신형규	1	\N	t	f
43	2025-05-12	마그네슘	이지후	1	6892079236880	t	f
44	2025-05-12	오메가3	이지후	1	6892079236880	t	f
140	2025-07-14	비타민 D	조종원	1	\N	t	f
138	2025-07-14	종합비타민미네랄	권형기	1	\N	t	f
146	2025-07-15	카테킨	서창원	1	\N	t	t
151	2025-07-23	밀크씨슬	이환희	1	\N	t	f
147	2025-07-18	카테킨	신형규	1	\N	t	f
152	2025-07-28	비타민 B	박현준	1	\N	t	f
153	2025-07-28	홍경천테아닌	박준영	1	\N	t	f
154	2025-07-28	마그네슘	조종원	1	\N	t	f
45	2025-05-12	카테킨	권형기	1	6892079237339	t	f
46	2025-05-12	아연미네랄8	권형기	1	6892079237339	t	f
47	2025-05-13	콜라겐	박준영	1	6892079345548	t	f
48	2025-05-13	유산균	장희성	1	6892079345758	t	f
49	2025-05-14	종합비타민미네랄	조종원	1	6102914124619	t	f
50	2025-05-14	멜라토닌	조종원	1	6102914124619	t	f
51	2025-05-14	유산균	조종원	1	6102914124619	t	f
52	2025-05-14	마그네슘	조종원	1	6102914124619	t	f
53	2025-05-15	비타민 C	이지후	1	6892079476949	t	f
54	2025-05-15	밀크씨슬	박준영	1	6892079477266	t	f
55	2025-05-16	카테킨	박현준	1	6892079541062	t	f
56	2025-05-19	카테킨	신형규	1	winn	t	f
57	2025-05-22	칼슘	조종원	1	6892079843546	t	f
58	2025-05-23	카테킨	김민선	1	6892079884576	t	f
97	2025-06-10	종합비타민미네랄	서창원	1	\N	t	f
99	2025-06-19	홍경천테아닌	박현준	1	\N	t	f
100	2025-06-19	오메가3	박재연	1	\N	t	f
102	2025-06-23	오메가3	서창원	1	요청함	t	f
108	2025-06-27	오메가3	테스트 고객	1	\N	t	f
66	2025-05-26	비타민 C	박재연	1	6892080008750	t	f
69	2025-05-28	비타민 D	박재연	1	6892080106810	t	f
68	2025-05-27	비타민 C	조종원	1	6892080106164	t	f
113	2025-07-01	오메가3	조사무엘	1	\N	t	f
67	2025-05-27	마그네슘	신형규	1	6102917216145	t	f
72	2025-05-28	홍경천테아닌	조종원	1	6102917216145	t	f
71	2025-05-28	비타민 C	신형규	1	6102917216144	t	f
70	2025-05-28	비타민 B	신형규	1	6102917216144	t	f
112	2025-07-01	카테킨	조사무엘	1	\N	t	f
73	2025-05-30	콜라겐	박준영	1	6892080248496	t	f
117	2025-07-07	유산균	박상욱	1	\N	t	f
74	2025-05-30	종합비타민미네랄	박준영	1	6892080248496	t	f
75	2025-05-30	오메가3	김민선	1	6892080248920	t	f
76	2025-05-30	콜라겐	신형규	1	6892080248293	t	f
77	2025-06-02	칼슘	박준영	1	\N	t	f
82	2025-06-04	유산균	김민선	1	\N	t	f
81	2025-06-04	비타민 B	이지후	1	\N	t	f
80	2025-06-04	오메가3	조종원	1	\N	t	f
115	2025-07-07	오메가3	권형기	1	\N	t	f
85	2025-06-05	마그네슘	장희성	1	\N	t	f
86	2025-06-05	오메가3	장희성	1	\N	t	f
120	2025-07-09	유산균	권형기	1	\N	t	f
121	2025-07-09	바나바잎추출물	권형기	1	\N	t	f
87	2025-06-09	유산균	박현준	1	\N	t	f
88	2025-06-09	종합비타민미네랄	김민선	1	\N	t	f
95	2025-06-10	마그네슘	김현진	1	\N	t	f
93	2025-06-10	바나바잎추출물	김현진	1	\N	t	f
94	2025-06-10	멜라토닌	김현진	1	\N	t	f
92	2025-06-10	비타민 D	김현진	1	\N	t	f
\.


--
-- Data for Name: user_menu_permissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_menu_permissions (id, user_id, menu_key, can_access, can_read, can_write, can_delete, created_at, updated_at) FROM stdin;
\.


--
-- Name: menu_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.menu_items_id_seq', 10, true);


--
-- Name: role_hierarchy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_hierarchy_id_seq', 4, true);


--
-- Name: role_menu_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_menu_permissions_id_seq', 34, true);


--
-- Name: supplement_delivery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.supplement_delivery_id_seq', 155, true);


--
-- Name: user_menu_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_menu_permissions_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

