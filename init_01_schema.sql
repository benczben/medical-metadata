CREATE TABLE public.loinc_parent_groups (
	parent_group_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
	parent_group text COLLATE pg_catalog."default",
	status character varying(20) COLLATE pg_catalog."default",
	used_in_project boolean,
	CONSTRAINT pantent_gorups_pkey PRIMARY KEY (parent_group_id)
);

ALTER TABLE public.loinc_parent_groups ADD CONSTRAINT candidate_key_loinc_parent_groups UNIQUE (parent_group_id, parent_group);

CREATE TABLE public.loinc_groups (
	parent_group_id character varying(20) COLLATE pg_catalog."default" NOT NULL,
	group_id character varying(20) COLLATE pg_catalog."default",
	group_name text,
	archetype character varying(256) COLLATE pg_catalog."default",
	current_status character varying(50) COLLATE pg_catalog."default",
	version_first_released character varying(20) COLLATE pg_catalog."default"
);

ALTER TABLE public.loinc_groups ADD CONSTRAINT candidate_key_groups UNIQUE (parent_group_id, group_id, archetype);

CREATE TABLE public.loinc_terms (
	category character varying(256) COLLATE pg_catalog."default",
	group_id character varying(20) COLLATE pg_catalog."default",
	archetype character varying(256) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	long_common_name text
);

ALTER TABLE public.loinc_terms ADD CONSTRAINT candidate_key_loinc_terms UNIQUE (category, group_id, archetype, loinc_code);

CREATE TABLE public.loinc_terms_95percent (
	loinc_code character varying(20) COLLATE pg_catalog."default",
	long_common_name text,
	order_obs character varying(50) COLLATE pg_catalog."default"
);

ALTER TABLE public.loinc_terms_95percent ADD CONSTRAINT candidate_key_loinc_terms_95percent UNIQUE (loinc_code, long_common_name, order_obs);

CREATE TABLE public.raw_medical_data (
	chemical_name character varying(256) COLLATE pg_catalog."default",
	study_title text,
	accession_number character varying(100) COLLATE pg_catalog."default",
	depositor_study_number character varying(100) COLLATE pg_catalog."default",
	organization_name character varying(256) COLLATE pg_catalog."default",
	start_date character varying(100) COLLATE pg_catalog."default",
	end_date character varying(100) COLLATE pg_catalog."default",
	dose decimal(40,15),
	dose_unit character varying(50) COLLATE pg_catalog."default",
	ntp_toxicology_type character varying(100) COLLATE pg_catalog."default",
	ntp_tdms_number character varying(100) COLLATE pg_catalog."default",
	time_in_study integer,
	time_in_study_unit character varying(100) COLLATE pg_catalog."default",
	group_name character varying(100) COLLATE pg_catalog."default",
	is_control_group boolean,
	treatment_group_type character varying(100) COLLATE pg_catalog."default",
	route character varying(100) COLLATE pg_catalog."default",
	subject_name character varying(100) COLLATE pg_catalog."default",
	species_common_name character varying(100) COLLATE pg_catalog."default",
	sex character varying(100) COLLATE pg_catalog."default",
	strain character varying(100) COLLATE pg_catalog."default",
	ala decimal(40,15),
	ala_unit character varying(100) COLLATE pg_catalog."default",
	alp decimal(40,15),
	alp_unit character varying(20) COLLATE pg_catalog."default",
	alphr decimal(40,15),
	alphr_unit character varying(20) COLLATE pg_catalog."default",
	ap_creat decimal(40,15),
	ap_creat_unit character varying(20) COLLATE pg_catalog."default",
	asp_creat decimal(40,15),
	asp_creat_unit character varying(20) COLLATE pg_catalog."default",
	asp_hr decimal(40,15),
	asp_hr_unit character varying(20) COLLATE pg_catalog."default",
	ast decimal(40,15),
	ast_unit character varying(20) COLLATE pg_catalog."default",
	ava decimal(40,15),
	ava_unit character varying(20) COLLATE pg_catalog."default",
	bili decimal(40,15),
	bili_unit character varying(20) COLLATE pg_catalog."default",
	ca decimal(40,15),
	ca_unit character varying(20) COLLATE pg_catalog."default",
	cl decimal(40,15),
	cl_unit character varying(20) COLLATE pg_catalog."default",
	creat decimal(40,15),
	creat_unit character varying(20) COLLATE pg_catalog."default",
	creat_hr decimal(40,15),
	creat_hr_unit character varying(20) COLLATE pg_catalog."default",
	crtn_16 decimal(40,15),
	crtn_16_unit character varying(20) COLLATE pg_catalog."default",
	crtn_24 decimal(40,15),
	crtn_24_unit character varying(20) COLLATE pg_catalog."default",
	crtn_48 decimal(40,15),
	crtn_48_unit character varying(20) COLLATE pg_catalog."default",
	decalol decimal(40,15),
	decalol_unit character varying(20) COLLATE pg_catalog."default",
	galac decimal(40,15),
	galac_unit character varying(20) COLLATE pg_catalog."default",
	ggt decimal(40,15),
	ggt_unit character varying(20) COLLATE pg_catalog."default",
	ggt_creat decimal(40,15),
	ggt_creat_unit character varying(20) COLLATE pg_catalog."default",
	ggt_hr decimal(40,15),
	ggt_hr_unit character varying(20) COLLATE pg_catalog."default",
	gluc decimal(40,15),
	gluc_unit character varying(20) COLLATE pg_catalog."default",
	gluc_hr decimal(40,15),
	gluc_hr_unit character varying(20) COLLATE pg_catalog."default",
	glu_creat decimal(40,15),
	glu_creat_unit character varying(20) COLLATE pg_catalog."default",
	glu_hr_tis decimal(40,15),
	glu_hr_tis_unit character varying(20) COLLATE pg_catalog."default",
	k decimal(40,15),
	k_unit character varying(20) COLLATE pg_catalog."default",
	ketone decimal(40,15),
	ketone_unit character varying(20) COLLATE pg_catalog."default",
	ldh_creatn decimal(40,15),
	ldh_creatn_unit character varying(20) COLLATE pg_catalog."default",
	mg decimal(40,15),
	mg_unit character varying(20) COLLATE pg_catalog."default",
	na decimal(40,15),
	na_unit character varying(20) COLLATE pg_catalog."default",
	nag decimal(40,15),
	nag_unit character varying(20) COLLATE pg_catalog."default",
	nag_creat decimal(40,15),
	nag_creat_unit character varying(20) COLLATE pg_catalog."default",
	nag_hr decimal(40,15),
	nag_hr_unit character varying(20) COLLATE pg_catalog."default",
	ph decimal(40,15),
	ph_unit character varying(20) COLLATE pg_catalog."default",
	phos decimal(40,15),
	phos_unit character varying(20) COLLATE pg_catalog."default",
	protein decimal(40,15),
	protein_unit character varying(20) COLLATE pg_catalog."default",
	pro_creat decimal(40,15),
	pro_creat_unit character varying(20) COLLATE pg_catalog."default",
	pro_g_hr decimal(40,15),
	pro_g_hr_unit character varying(20) COLLATE pg_catalog."default",
	prpb decimal(40,15),
	prpb_unit character varying(20) COLLATE pg_catalog."default",
	prpb_hr decimal(40,15),
	prpb_hr_unit character varying(20) COLLATE pg_catalog."default",
	rnase decimal(40,15),
	rnase_unit character varying(20) COLLATE pg_catalog."default",
	sdh decimal(40,15),
	sdh_unit character varying(20) COLLATE pg_catalog."default",
	spgrav decimal(40,15),
	spgrav_unit character varying(20) COLLATE pg_catalog."default",
	tcn_lt decimal(40,15),
	tcn_lt_unit character varying(20) COLLATE pg_catalog."default",
	tsprot decimal(40,15),
	tsprot_unit character varying(20) COLLATE pg_catalog."default",
	ubgen decimal(40,15),
	ubgen_unit character varying(20) COLLATE pg_catalog."default",
	upro_crtn decimal(40,15),
	upro_crtn_unit character varying(20) COLLATE pg_catalog."default",
	urea_conc decimal(40,15),
	urea_conc_unit character varying(20) COLLATE pg_catalog."default",
	urea_hr decimal(40,15),
	urea_hr_unit character varying(20) COLLATE pg_catalog."default",
	urine_vol decimal(40,15),
	urine_vol_unit character varying(20) COLLATE pg_catalog."default",
	ur_bld character varying(100) COLLATE pg_catalog."default",
	ur_bld_unit character varying(20) COLLATE pg_catalog."default",
	ur_clar character varying(20) COLLATE pg_catalog."default",
	ur_clar_unit character varying(20) COLLATE pg_catalog."default",
	ur_color character varying(100) COLLATE pg_catalog."default",
	ur_color_unit character varying(100) COLLATE pg_catalog."default",
	ur_prot decimal(40,15),
	ur_prot_unit character varying(20) COLLATE pg_catalog."default",
	ur_prot_hr decimal(40,15),
	ur_prot_hr_unit character varying(20) COLLATE pg_catalog."default",
	ur_vol_hr decimal(40,15),
	ur_vol_hr_unit character varying(20) COLLATE pg_catalog."default",
	cyto_rep character varying(256) COLLATE pg_catalog."default",
	cyto_rep_url character varying(512) COLLATE pg_catalog."default",
	amino character varying(256) COLLATE pg_catalog."default",
	amino_url character varying(512) COLLATE pg_catalog."default"
);

ALTER TABLE public.raw_medical_data ADD CONSTRAINT candidate_key_raw_medical_data UNIQUE (chemical_name,study_title,accession_number,depositor_study_number,organization_name,start_date,end_date,dose,dose_unit,ntp_toxicology_type,ntp_tdms_number,time_in_study,time_in_study_unit,group_name,is_control_group,treatment_group_type,route,subject_name,species_common_name,sex,strain);

CREATE TABLE public.mapping_table (
	source_column character varying(255),
	maps_to_loinc character varying(255),
	value_scaling character varying(20),
	source_collection character varying(255)
);

CREATE TABLE IF NOT EXISTS public.nominal_map_values (
	nomnial_map_values_id serial,
	nominal_value character varying(128) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	CONSTRAINT nomnial_map_values_id_pkey PRIMARY KEY (nomnial_map_values_id),
	CONSTRAINT nomnial_map_values_id_candidate_key UNIQUE (nominal_value, loinc_code)
);

CREATE TABLE IF NOT EXISTS public.ordinal_map_values (
	ordnial_map_values_id serial,
	ordnial_value character varying(128) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	CONSTRAINT ordinal_map_values_id_pkey PRIMARY KEY (ordnial_map_values_id),
	CONSTRAINT ordinal_map_values_id_candidate_key UNIQUE (ordnial_value, loinc_code)
);


ALTER TABLE public.mapping_table ADD CONSTRAINT candidate_key_mapping UNIQUE (source_column, maps_to_loinc, source_collection);

CREATE TABLE public.ordinal_value_sets (
	id serial,
	value_set_name character varying(256) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	value_set_value character varying(256) COLLATE pg_catalog."default",
	sequence_number integer,
	CONSTRAINT ordinal_value_sets_pkey PRIMARY KEY (id)
);

CREATE TABLE public.loinc_part_values (
	loinc_code character varying(20) COLLATE pg_catalog."default",
	component character varying(256) COLLATE pg_catalog."default",
	property character varying(256) COLLATE pg_catalog."default",
	time_aspect character varying(256) COLLATE pg_catalog."default",
	system_part character varying(256) COLLATE pg_catalog."default",
	scale_part character varying(256) COLLATE pg_catalog."default",
	method_part character varying(256) COLLATE pg_catalog."default",
	CONSTRAINT loinc_part_value_pkey PRIMARY KEY (loinc_code)
);

CREATE TABLE composite_content_descriptors (
	id serial,
	name character varying(500),
	description text,
	participating_codes text[],
	code_operator character varying(50)
);

ALTER TABLE public.composite_content_descriptors ADD CONSTRAINT candidate_key_composite_content_descriptors UNIQUE (participating_codes, code_operator);

CREATE TABLE composite_content_operator (
	id serial,
	code_operator character varying(50),
	CONSTRAINT composite_content_operator_pkey PRIMARY KEY (id)
);

CREATE TABLE collections_directory (
	id serial,
	collection_name character varying(256),
	created_at timestamp default now(),
	CONSTRAINT collections_directory_pkey PRIMARY KEY (collection_name)
);

CREATE TABLE IF NOT EXISTS ordinal_order (
	ordinal_order_id serial,
	source_database character varying(128) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	column_name character varying(128) COLLATE pg_catalog."default",
	serial_value character varying(128) COLLATE pg_catalog."default",
	ordinal_value character varying(128) COLLATE pg_catalog."default",
	scaling_of_meta_data character varying(128) COLLATE pg_catalog."default",
	CONSTRAINT ordinal_order_pkey PRIMARY KEY (ordinal_order_id)
);

CREATE TABLE IF NOT EXISTS public.metadata_aggregation (
	metadata_aggregation_id serial,
	aggregate_value character varying(128) COLLATE pg_catalog."default",
	min_value character varying(128) COLLATE pg_catalog."default",
	max_value character varying(128) COLLATE pg_catalog."default",
	mean_value character varying(128) COLLATE pg_catalog."default",
	median_value character varying(128) COLLATE pg_catalog."default",
	source_database character varying(128) COLLATE pg_catalog."default",
	loinc_code character varying(20) COLLATE pg_catalog."default",
	column_name character varying(128) COLLATE pg_catalog."default",
	value_unit character varying(64) COLLATE pg_catalog."default",
	occurance_count int,
	null_value_count int,
	min_updated_at timestamp,
	max_updated_at timestamp,
	mean_updated_at timestamp,
	median_updated_at timestamp,
	metadata_created_at timestamp DEFAULT now(),
	tuple_accuracy character varying(64) COLLATE pg_catalog."default",
	CONSTRAINT metadata_aggregation_pkey PRIMARY KEY (metadata_aggregation_id)
);