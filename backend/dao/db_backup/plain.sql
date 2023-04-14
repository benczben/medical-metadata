--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1 (Debian 13.1-1.pgdg100+1)
-- Dumped by pg_dump version 13.1

-- Started on 2021-12-10 21:59:20 UTC

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16885)
-- Name: raw_medical_data_2; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.raw_medical_data_2 (
    dose numeric,
    time_in_study integer,
    accession_number character varying(100),
    depositor_study_number character varying(100),
    organization_name character varying(256),
    start_date character varying(100),
    end_date character varying(100),
    dose_unit character varying(50),
    ntp_toxicology_type character varying(100),
    ntp_tdms_number character varying(100),
    time_in_study_unit character varying(100),
    group_name character varying(100),
    treatment_group_type character varying(100),
    route character varying(100),
    subject_name character varying(100),
    species_common_name character varying(100),
    sex character varying(100),
    strain character varying(100),
    ur_bld character varying(100),
    ur_color character varying(100),
    cyto_rep character varying(256),
    chemical_name character varying(256),
    amino character varying(256),
    study_title text,
    ala numeric,
    ala_unit character varying(100),
    ap_creat numeric,
    ap_creat_unit character varying(20),
    asp_creat numeric,
    asp_creat_unit character varying(20),
    asp_hr numeric,
    asp_hr_unit character varying(20),
    ast numeric,
    ast_unit character varying(20),
    ava numeric,
    ava_unit character varying(20),
    bili numeric,
    bili_unit character varying(20),
    ca numeric,
    ca_unit character varying(20),
    cl numeric,
    cl_unit character varying(20),
    creat numeric,
    creat_unit character varying(20),
    crtn_16 numeric,
    crtn_16_unit character varying(20),
    crtn_48 numeric,
    crtn_48_unit character varying(20),
    decalol numeric,
    decalol_unit character varying(20),
    galac numeric,
    galac_unit character varying(20),
    ggt numeric,
    ggt_unit character varying(20),
    ggt_creat numeric,
    ggt_creat_unit character varying(20),
    ggt_hr numeric,
    ggt_hr_unit character varying(20),
    gluc numeric,
    gluc_unit character varying(20),
    gluc_hr numeric,
    gluc_hr_unit character varying(20),
    glu_hr_tis numeric,
    glu_hr_tis_unit character varying(20),
    k numeric,
    k_unit character varying(20),
    ldh_creatn numeric,
    ldh_creatn_unit character varying(20),
    mg numeric,
    mg_unit character varying(20),
    na numeric,
    na_unit character varying(20),
    nag numeric,
    nag_unit character varying(20),
    nag_creat numeric,
    nag_creat_unit character varying(20),
    ph numeric,
    ph_unit character varying(20),
    phos numeric,
    phos_unit character varying(20),
    protein numeric,
    protein_unit character varying(20),
    pro_g_hr numeric,
    pro_g_hr_unit character varying(20),
    prpb numeric,
    prpb_unit character varying(20),
    rnase numeric,
    rnase_unit character varying(20),
    sdh numeric,
    sdh_unit character varying(20),
    tsprot numeric,
    tsprot_unit character varying(20),
    upro_crtn numeric,
    upro_crtn_unit character varying(20),
    urea_conc numeric,
    urea_conc_unit character varying(20),
    urine_vol numeric,
    urine_vol_unit character varying(20),
    ur_clar character varying(20),
    ur_clar_unit character varying(20),
    ur_prot numeric,
    ur_prot_unit character varying(20),
    ur_prot_hr numeric,
    ur_prot_hr_unit character varying(20),
    ur_vol_hr numeric,
    ur_vol_hr_unit character varying(20)
);


ALTER TABLE public.raw_medical_data_2 OWNER TO postgres;

--
-- TOC entry 3001 (class 0 OID 16885)
-- Dependencies: 220
-- Data for Name: raw_medical_data_2; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.raw_medical_data_2 (dose, time_in_study, accession_number, depositor_study_number, organization_name, start_date, end_date, dose_unit, ntp_toxicology_type, ntp_tdms_number, time_in_study_unit, group_name, treatment_group_type, route, subject_name, species_common_name, sex, strain, ur_bld, ur_color, cyto_rep, chemical_name, amino, study_title, ala, ala_unit, ap_creat, ap_creat_unit, asp_creat, asp_creat_unit, asp_hr, asp_hr_unit, ast, ast_unit, ava, ava_unit, bili, bili_unit, ca, ca_unit, cl, cl_unit, creat, creat_unit, crtn_16, crtn_16_unit, crtn_48, crtn_48_unit, decalol, decalol_unit, galac, galac_unit, ggt, ggt_unit, ggt_creat, ggt_creat_unit, ggt_hr, ggt_hr_unit, gluc, gluc_unit, gluc_hr, gluc_hr_unit, glu_hr_tis, glu_hr_tis_unit, k, k_unit, ldh_creatn, ldh_creatn_unit, mg, mg_unit, na, na_unit, nag, nag_unit, nag_creat, nag_creat_unit, ph, ph_unit, phos, phos_unit, protein, protein_unit, pro_g_hr, pro_g_hr_unit, prpb, prpb_unit, rnase, rnase_unit, sdh, sdh_unit, tsprot, tsprot_unit, upro_crtn, upro_crtn_unit, urea_conc, urea_conc_unit, urine_vol, urine_vol_unit, ur_clar, ur_clar_unit, ur_prot, ur_prot_unit, ur_prot_hr, ur_prot_hr_unit, ur_vol_hr, ur_vol_hr_unit) FROM stdin;
1.000000000000000	26	002-02877-0004-0000-0	\N	NTP	2001	\N	ppm	\N	0519703.ss	hour	C61881_0521603_07	\N	\N	0126_03	Mouse	Female	Fischer 344	3+	yellow	\N	Sodium Selenate	\N	18-Week Evaluation of the Toxicity (C99013) of Styrene-acrylonitrile Trimer (SANTRIMER2) in F344 Rats Exposed via Dosed Feed. NTP Special Study	4.8511	umol/L	1960.0644	mU/mg	\N	\N	0.7343	mg/hr	77.3546	U/L	0	\N	0	mg/dL	\N	\N	\N	\N	108.7099	mg/dL	\N	\N	229.4533	mg/hr	0	\N	\N	\N	3986.0153	U/L	\N	\N	33.4333	mU/hr	\N	\N	\N	\N	0	\N	\N	\N	0	\N	0	\N	0	\N	33.7444	U/L	155.6084	mU/mg	0	\N	\N	\N	\N	\N	\N	\N	0.643	umol/L	0.0804	U/mL	7.5091	U/L	0	\N	0	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	13.4404	mL/hr
4.800000000000000	13	002-02877-0004-0000-0	\N	NTP	\N	\N	ppm	\N	0519603.ss	hour	C62033_0518004_10	\N	\N	0001_FM812	Mouse	Female	B6C3F1	neg.	\N	\N	1,2,4,5-Tetrachlorobenzene	amino_acid_interpret.doc	3-Month Evaluation of the Toxicity (C04308) of Sodium Selenite (10102-18-8) in F344 Rats Exposed via Dosed Water. NTP Special Study	1.234	umol/L	14774.5403	mU/mg	745.445	mU/mg	\N	\N	273.1882	U/L	\N	\N	0	mg/dL	0	\N	0	\N	127.6049	mg/dL	1.575	mg/hr	47.1183	mg/hr	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	10.3104	U/L	29.028	mU/mg	\N	\N	0	\N	0	\N	0	\N	5.7661	umol/L	0.1877	U/mL	\N	\N	\N	\N	0	\N	1288.9441	mg/dL	\N	\N	\N	\N	353.3375	mg/dL	0.4763	mg/hr	\N	\N
2000.000000000000000	42	002-02196-0007-0000-7	\N	NTP	\N	\N	mg/L	\N	\N	day	C88006B_8800601_07	\N	\N	1013_05	Rat	Male	Fischer 344	negative	light yellow	cytorep_image.jpeg	Ethylene Glycol Monoethyl Ether (EGMEE)	amino_acid_interpret.doc	3-Month Evaluation of the Toxicity (C61881) of 2,3-Dichloropropylene (78-88-6) in F344 Rats via Whole Body Respiratory Exposure. NTP Special Study	6.4057	umol/L	\N	\N	373.2658	mU/mg	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	\N	267.4619	mg/dL	\N	\N	\N	\N	0	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.0695	mg/hr	\N	\N	0	\N	0	\N	\N	\N	\N	\N	17.7178	U/L	187.9957	mU/mg	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	0.0116	U/mL	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	11.5671	mL/hr
10.000000000000000	90	002-01884-0001-0000-4	NTP002	NTP	\N	\N	mg/m3	\N	9000405.fixtime	month	C99013_9901303_04	\N	\N	0639_98_02_F	Mouse	Female	B6C3F1	\N	amber	cytorep_image.jpeg	Indium Phosphide	amino_acid_interpret.doc	18-Week Evaluation of the Toxicity (C99013) of Styrene-acrylonitrile Trimer (SANTRIMER2) in F344 Rats Exposed via Dosed Feed. NTP Special Study	17.7692	umol/L	\N	\N	\N	\N	0.4412	mg/hr	155.0408	U/L	\N	\N	0	mg/dL	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	2657.377	U/L	0	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	0	\N	0	\N	0	\N	46.0256	U/L	179.2747	mU/mg	0	\N	\N	\N	\N	\N	\N	\N	0.4988	umol/L	0.2402	U/mL	7.0091	U/L	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	562.6748	mg/dL	0.5498	mg/hr	4.7526	mL/hr
32.000000000000000	365	002-02748-0005-0000-8	\N	NTP	2001	\N	mg/m3	\N	6142703.ss	hour	C62113_0519503_07	\N	\N	0138_05	Rat	Female	Fischer 344	1	red	cytorep_domcument.pdf	Indium Phosphide	\N	3-Month Evaluation of the Toxicity (C55367C) of tert-Butyl Alcohol (75-65-0) in F344 Rats via Whole Body Respiratory Exposure. NTP Special Study	13.1663	umol/L	8533.4183	mU/mg	\N	\N	0.5648	mg/hr	487.7277	U/L	\N	\N	\N	\N	\N	\N	0	\N	63.8716	mg/dL	9.8965	mg/hr	\N	\N	\N	\N	0	\N	508.6443	U/L	0	\N	\N	\N	58.6226	mg/dL	0.0566	mg/hr	\N	\N	0	\N	\N	\N	0	\N	\N	\N	57.5158	U/L	107.7184	mU/mg	0	\N	0	\N	0	\N	\N	\N	5.4881	umol/L	\N	\N	7.6587	U/L	\N	\N	0	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
24.000000000000000	81	002-00001-0011-000-5	NTP002	NTP	\N	\N	mg/kg	\N	0521603.ss	day	C62033_0518004_07	\N	\N	0001_FR824	Rat	Male	Fischer 344	0	brown	cytorep_image.jpeg	Indium Phosphide	amino_acid_interpret.doc	3-Month Evaluation of the Toxicity (C62168) of o-Cresol (95-48-7) in F344 Rats Exposed via Dosed Feed. NTP Special Study	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	0	\N	0	\N	164.9995	mg/dL	5.2928	mg/hr	229.6405	mg/hr	0	\N	0	\N	\N	\N	0	\N	\N	\N	\N	\N	0.0216	mg/hr	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	7.7557	U/L	\N	\N	\N	\N	0	\N	0	\N	0	\N	\N	\N	0.2059	U/mL	5.578	U/L	0	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	0.098	mg/hr	9.6103	mL/hr
33.000000000000000	41	002-02816-0002-0000-1	NTP002	NTP	\N	\N	ppm	\N	0520605.ss	hour	C20114_2011497_05	\N	\N	0004_MR05	Mouse	Female	F344	negativ	\N	cytorep_domcument.pdf	Ethylene Glycol Monoethyl Ether (EGMEE)	amino_acid_interpret.doc	3-Month Evaluation of the Toxicity (C61983A) of 1-Chloro-2-propanol, Technical (127-00-4) in F344 Rats Exposed via Dosed Water. NTP Special Study	\N	\N	\N	\N	\N	\N	0.5447	mg/hr	\N	\N	0	\N	\N	\N	0	\N	0	\N	147.8325	mg/dL	\N	\N	288.795	mg/hr	\N	\N	0	\N	\N	\N	0	\N	\N	\N	53.7627	mg/dL	\N	\N	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	5.1417	umol/L	0.1577	U/mL	1.2717	U/L	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	197.848	mg/dL	\N	\N	11.4677	mL/hr
6000.000000000000000	82	002-01658-0002-0000-4	NTP002	NTP	\N	\N	mg/kg	\N	0520605.ss	week	C88006B_8800601_05	\N	\N	0530_99	Rat	Female	Fischer 344	\N	yellow	cytorep_domcument.pdf	Sodium Cyanide	\N	3-Month Evaluation of the Toxicity (C88045) of Butanal Oxime (110-69-0) in F344 Rats Exposed via Dosed Water. NTP Special Study	12.6669	umol/L	\N	\N	\N	\N	\N	\N	90.1326	U/L	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	\N	\N	\N	\N	\N	17.6193	mU/hr	21.9364	mg/dL	0.0241	mg/hr	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	40.1006	mU/mg	\N	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	4.3811	U/L	\N	\N	\N	\N	634.9859	mg/dL	0	\N	0	\N	\N	\N	0.074	mg/hr	\N	\N
600.000000000000000	11	002-03029-0004-0000-0	\N	NTP	2001	\N	%	\N	0511301.ss	hour	C54853B_0519803_01	\N	\N	0236_03	Mouse	Female	B6C3F1	\N	light yellow	cytorep_image.jpeg	Sodium Dichromate Dihydrate (VI)	amino_acid_interpret.doc	Evaluation of the Chronic Toxicity and Carcinogenicity (C56224C) of Furfuryl Alcohol (98-00-0) in F344 Rats via Whole Body Respiratory Exposure. NTP Special Study	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	mg/dL	0	\N	\N	\N	242.8918	mg/dL	\N	\N	\N	\N	0	\N	\N	\N	445.7932	U/L	\N	\N	82.4046	mU/hr	57.6142	mg/dL	0.0278	mg/hr	\N	\N	0	\N	\N	\N	\N	\N	0	\N	\N	\N	92.8098	mU/mg	0	\N	0	\N	0	\N	0	\N	3.8006	umol/L	0.0471	U/mL	5.4513	U/L	0	\N	0	\N	267.1889	mg/dL	0	\N	\N	\N	\N	\N	\N	\N	\N	\N
33.000000000000000	90	002-01872-0001-0000-1	NTP002	NTP	2001	\N	mg/L	\N	0519703.ss	day	C62271_0520203_01	\N	\N	0403_05	Rat	Female	Fischer 344	\N	light yellow	cytorep_domcument.pdf	2,3-Dichloropropylene	\N	Evaluation of the Chronic Toxicity and Carcinogenicity (C99027) of Chromium Picolinate Monohydrate (27882-76-4) in F344 Rats Exposed via Dosed Feed. NTP Special Study	\N	\N	\N	\N	731.019	mU/mg	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	188.4762	mg/dL	\N	\N	34.0997	mg/hr	0	\N	0	\N	\N	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	0	\N	0	\N	\N	\N	\N	\N	59.4882	U/L	206.3292	mU/mg	0	\N	0	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	396.8214	mg/dL	\N	\N	\N	\N
\.


-- Completed on 2021-12-10 21:59:20 UTC

--
-- PostgreSQL database dump complete
--

