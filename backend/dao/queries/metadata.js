let sqlstring = require("sqlstring");

let createMetadataAggregationTable = sqlstring.format(`
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
	CONSTRAINT metadata_aggregation_pkey PRIMARY KEY (metadata_aggregation_id))
`)

let populateMetadataAggregationTableQn = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		min_value,
		max_value,
		mean_value,
		median_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		value_unit,
		tuple_accuracy
	) 
	SELECT 
		ROUND($1::integer, $2) as aggregate_value,
		MIN($1) as tuple_min_value,
		MAX($1) as tuple_max_value,
		AVG($1) as tuple_mean_value,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY $1) as tuple_median_value,
		'$3' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		SUM(CASE WHEN $1 IS NULL THEN 1 ELSE 0 END) AS null_value_count,
		MAX(updated_at) as tuple_max_time,
		MIN(updated_at) as tuple_min_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		MAX($1_unit) as value_unit,
		'$4' as tuple_accuracy
	FROM $3 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$3'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1; 
`)

let populateMetadataAggregationTableNominal = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) 
	SELECT 
		$1 as aggregate_value,
		'$3' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		CASE WHEN ($1 is not null)
			THEN 0
			ELSE count(1) 
		END as null_value_count,
		MIN(updated_at) as tuple_min_time,
		MAX(updated_at) as tuple_max_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		'high' as tuple_accuracy
	FROM $3 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$3'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1; 
`)

let populateMetadataAggregationTableOrdinal = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at
	) 
	SELECT 
		$1 as aggregate_value,
		'$3' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		CASE WHEN ($1 is not null)
			THEN 0
			ELSE count(1) 
		END as null_value_count,
		MIN(updated_at) as tuple_min_time,
		MAX(updated_at) as tuple_max_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at
	FROM $3 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1; 
`)

let populateMetadataAggregationTableDocument = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) 
	SELECT 
		(CASE 
			WHEN rmd.$1 IS NOT NULL THEN 'exists'
			WHEN rmd.$1 IS NULL THEN 'notExists'
			ELSE rmd.$1 END)
		as aggregate_value,
		'$2' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		(CASE 
			WHEN rmd.$1 IS NOT NULL THEN 0
			WHEN rmd.$1 IS NULL THEN (SELECT count(1) FROM $2 WHERE $1 IS NULL)
			ELSE 0 END)
		AS null_value_count,
		MIN(updated_at) as tuple_min_time,
		MAX(updated_at) as tuple_max_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		'low' as tuple_accuracy
	FROM $2 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	GROUP BY 1, 6
	ORDER BY 1;
`)

let populateMetadataAggregationTableNarrative = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) 
	SELECT 
		(CASE 
			WHEN rmd.$1 IS NOT NULL THEN 'exists'
			WHEN rmd.$1 IS NULL THEN 'notExists'
			ELSE rmd.$1 END)
		as aggregate_value,
		'$2' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		(CASE 
			WHEN rmd.$1 IS NOT NULL THEN 0
			WHEN rmd.$1 IS NULL THEN (SELECT count(1) FROM $2 WHERE $1 IS NULL)
			ELSE 0 END)
		AS null_value_count,
		MIN(updated_at) as tuple_min_time,
		MAX(updated_at) as tuple_max_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		'low' as tuple_accuracy
	FROM $2 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	GROUP BY 1, 6
	ORDER BY 1;
`)

let accuracyCalculatorMetadataAggregationTable = sqlstring.format(`
	SELECT 
		ROUND($1::integer, $2) as aggregate_value,
		'$3' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count
	FROM $3 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$3'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1
`)

let rowCountFromTable = sqlstring.format(`
	SELECT count(1) FROM $1
`)

let getNullCountFromTable = sqlstring.format(`
	SELECT count(1) FROM $1 where $2 is null
`)

let rowCountMetadataAggregationTableNames = sqlstring.format(`
	SELECT count(1) FROM metadata_aggregation
`)

let valueRangeForLoinc = sqlstring.format(`
	SELECT 
		MIN(aggregate_value::DECIMAL) as min_value,
		MAX(aggregate_value::DECIMAL) as max_value
	FROM
		metadata_aggregation 
	WHERE
		loinc_code = '$1'
`)

let valuesForNominalColumn = sqlstring.format(`
	SELECT 
		aggregate_value as distinct_values 
	FROM
		metadata_aggregation 
	WHERE
		loinc_code = '$1'
	GROUP BY 1
`)

let getAllColumnsOfTableForValueScaling = sqlstring.format(`
	SELECT 
		table_name as table_name, 
		column_name as column_name,
		mt.maps_to_loinc as maps_to_loinc
	FROM information_schema.columns
		LEFT OUTER JOIN mapping_table mt 
		ON mt.source_column = information_schema.columns.column_name
	WHERE 
		table_schema = 'public'
		AND	UPPER(mt.value_scaling) = '$1'
		AND table_name = '$2'
		AND mt.source_collection = '$2'
`)

let getDistictValuesForTablesColumn = sqlstring.format(`
	SELECT 
		$2 as aggregate_value,
		'$1' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count
	FROM $1 rmd
	LEFT JOIN mapping_table mt ON
		mt.source_column = '$2'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1
`)

let createOrdinalOrderTable = sqlstring.format(`
	CREATE TABLE IF NOT EXISTS public.ordinal_order (
		ordinal_order_id serial,
		source_database character varying(128) COLLATE pg_catalog."default",
		loinc_code character varying(20) COLLATE pg_catalog."default",
		column_name character varying(128) COLLATE pg_catalog."default",
		serial_value character varying(128) COLLATE pg_catalog."default",
		ordinal_value character varying(128) COLLATE pg_catalog."default",
		scaling_of_meta_data character varying(128) COLLATE pg_catalog."default",
	CONSTRAINT ordinal_order_pkey PRIMARY KEY (ordinal_order_id))
`)

let insertIntoOrdinalOrder = sqlstring.format(`
	INSERT INTO ordinal_order (
		source_database,
		loinc_code,
		serial_value,
		ordinal_value,
		scaling_of_meta_data
	) 
	VALUES $1
`)

let selectFromOrdinalOrder = sqlstring.format(`
	SELECT count(1) AS count FROM ordinal_order WHERE source_database = '$1' AND column_name = '$2'
`)

let deleteAllFromOrdinalOrder = sqlstring.format(`
	DELETE FROM ordinal_order WHERE source_database = $1
`)

let valuesForOrdinalColumn = sqlstring.format(`
	SELECT value_set_value, sequence_number
	FROM ordinal_value_sets
	WHERE
		loinc_code = '$1'
	ORDER BY sequence_number::integer ASC
`)

let createNominalMapValueHolder = sqlstring.format(`
	CREATE TABLE IF NOT EXISTS public.nominal_map_values (
		nomnial_map_values_id serial,
		nominal_value character varying(128) COLLATE pg_catalog."default",
		loinc_code character varying(20) COLLATE pg_catalog."default",
		CONSTRAINT nomnial_map_values_id_pkey PRIMARY KEY (nomnial_map_values_id),
		CONSTRAINT nomnial_map_values_id_candidate_key UNIQUE (nominal_value, loinc_code))
`)
    
let insertNewNomninalValueForMapping = sqlstring.format(`
	INSERT INTO nominal_map_values (nominal_value, loinc_code) VALUES($1, $2)
`)

let deleteNominalMapValueHolder = sqlstring.format(`
	DELETE 
	FROM nominal_map_values 
	WHERE 
		loinc_code = $1
		AND
		nominal_value = $2
`)

let selectNominalMapValueHolder = sqlstring.format(`
	SELECT
		nominal_value
	FROM 
		nominal_map_values
	WHERE 
		loinc_code = '$1'
`)

let getColumnNameForLoincAndDataSource = sqlstring.format(`
	SELECT
		source_column
	FROM 
		mapping_table
	WHERE 
		maps_to_loinc = '$1'
		AND
		source_collection = '$2'
`)

let getOridnalValueSetsForLoinc = sqlstring.format(`
	SELECT
		value_set_name
	FROM 
		ordinal_value_sets
	WHERE 
		loinc_code = $1
	GROUP BY 1
`)

let getOridnalValueSetValues = sqlstring.format(`
	SELECT
		value_set_name,
		value_set_value,
		loinc_code,
		sequence_number
	FROM 
		ordinal_value_sets
	WHERE 
		loinc_code = $1
		AND
		value_set_name = $2
	ORDER BY sequence_number ASC
`)

//loincCode, valueSetName, valueSetValue, newSequenceNumber
let updateOridnalValueSetValues = sqlstring.format(`
	UPDATE
		ordinal_value_sets
	SET 
		sequence_number = $4
	WHERE 
		loinc_code = $1
		AND
		value_set_name = $2
		AND
		value_set_value = $3
`)

const selectCollectionToLoincFromMetadataAggregation = sqlstring.format(`
	SELECT 
		source_database 
	FROM metadata_aggregation 
	WHERE 
		loinc_code IN ($1)
	GROUP BY 1
`) 

const selectCollectionToLoincFromMappingTable = sqlstring.format(`
	SELECT 
		source_collection as source_collection
	FROM mapping_table 
	WHERE 
		maps_to_loinc = '$1'
	GROUP BY 1
`) 

const selectCollectionsToCompositeDescriptorsAny = sqlstring.format(`
	SELECT source_database AS collection_name
	FROM 
		public.metadata_aggregation
	WHERE loinc_code = ANY($1)
	GROUP BY 1
	ORDER BY 1
`) 

const selectCollectionsToCompositeDescriptorsAll = sqlstring.format(`
	SELECT source_database AS collection_name
	FROM public.metadata_aggregation ma
	WHERE TRUE
		$1
	GROUP BY 1
	ORDER BY 1
`)

const calculateCompleteness = sqlstring.format(`
	SELECT 
		ma.source_database AS source_database,
		SUM(ma.occurance_count) as occurance_count,
		SUM(ma.null_value_count) as null_value_count,
		(1 - (cast(SUM(ma.null_value_count) as numeric) / cast(SUM(ma.occurance_count) as numeric))) * 100 as standard_metadata_completeness,
		(
			SELECT 
				(1 - (cast(SUM(ma.null_value_count) as numeric) / cast(SUM(ma.occurance_count) as numeric))) * 100 as standard_metadata_completeness
			FROM metadata_aggregation ma
			WHERE 
				ma.loinc_code IN (
					SELECT maps_to_loinc 
					FROM mapping_table
					WHERE source_collection = ma.source_database
				)
				AND
				ma.source_database = ma.source_database
		) as collection_completeness
	FROM metadata_aggregation ma
		WHERE 
			ma.loinc_code = '$1'
		AND
			ma.source_database NOT IN ('raw_medical_data')
	GROUP BY 1
	HAVING ( 1- (cast(SUM(ma.null_value_count) as numeric) / cast(SUM(ma.occurance_count) as numeric))) * 100 BETWEEN $2 and $3
	ORDER BY 1
`)

const calculateAccuracy = sqlstring.format(`
	SELECT 
		ma.source_database AS source_database,
		ma.tuple_accuracy as tuple_accuracy,
		count(1) as occurance_count,
		1 as collection_accuracy -- only a palceholder, will be filled later
	FROM metadata_aggregation ma
	WHERE 
		ma.loinc_code = '$1'
			AND
		ma.tuple_accuracy IN ($2)
			AND
		ma.source_database NOT IN ('raw_medical_data')
	GROUP BY 1,2
	ORDER BY 1
`)

const calculateWeightedCollectionAccuracy = sqlstring.format(`
	SELECT
		ma.source_database,
		ma.tuple_accuracy,
		(
			CASE WHEN(ma.tuple_accuracy = 'high')
				THEN (SELECT count(1) FROM metadata_aggregation ma2 WHERE ma2.source_database = '$1' AND ma2.tuple_accuracy = 'high')
			WHEN (tuple_accuracy = 'medium')
				THEN 0.5 * (SELECT count(1) FROM metadata_aggregation ma3 WHERE ma3.source_database = '$1' AND ma3.tuple_accuracy = 'medium')
			WHEN (tuple_accuracy = 'low')
				THEN 0.1 * (SELECT count(1) FROM metadata_aggregation ma4 WHERE ma4.source_database = '$1' AND ma4.tuple_accuracy = 'low')
			END
		) / 
		(SELECT count(1) FROM metadata_aggregation ma5 WHERE ma5.source_database = '$1' ) as weighted_accuracy
	FROM metadata_aggregation ma
	WHERE 
		ma.loinc_code IN (
				SELECT maps_to_loinc 
				FROM mapping_table
				WHERE source_collection = '$1'
			)
		AND
	ma.source_database = '$1'
	GROUP BY ma.tuple_accuracy, ma.source_database
`)

const calculateTimeliness = sqlstring.format(`
	SELECT 
		ma.source_database as source_database,
		SUM(ma.occurance_count) as occurance_count,
		EXTRACT(epoch FROM (age(date(ma.metadata_created_at)))) /3600 / 24 / $4 AS timeliness
	FROM metadata_aggregation ma
	WHERE 
		ma.loinc_code = '$1'
		AND
		ma.source_database != 'raw_medical_data'
	GROUP BY 1, 3
	HAVING EXTRACT(epoch FROM (age(date(ma.metadata_created_at)))) /3600 / 24 / $4 BETWEEN $2 and $3 
	ORDER BY EXTRACT(epoch FROM (age(date(ma.metadata_created_at)))) /3600 / 24 / $4
`)

const calculateCollectionTimeliness = sqlstring.format(`
	SELECT
		ma.source_database,
		EXTRACT(epoch FROM (
			(count(1) * age(date(ma.metadata_created_at)))
			/ 
			(SELECT count(1) FROM metadata_aggregation ma WHERE ma.source_database = '$1'))
		) /3600 / 24 / $2 AS timeliness
	FROM metadata_aggregation ma
	WHERE 
	ma.source_database = '$1'
	GROUP BY 1, age(date(ma.metadata_created_at))
`)


module.exports = {
    createMetadataAggregationTable,
    rowCountMetadataAggregationTableNames,
    rowCountFromTable,
    populateMetadataAggregationTableQn,
    populateMetadataAggregationTableNominal,
    populateMetadataAggregationTableOrdinal,
    populateMetadataAggregationTableDocument,
    populateMetadataAggregationTableNarrative,
    accuracyCalculatorMetadataAggregationTable,
    valueRangeForLoinc,
    valuesForNominalColumn,
    getAllColumnsOfTableForValueScaling,
    getDistictValuesForTablesColumn,
    createOrdinalOrderTable,
    insertIntoOrdinalOrder,
    selectFromOrdinalOrder,
    deleteAllFromOrdinalOrder,
    valuesForOrdinalColumn,
    insertNewNomninalValueForMapping,
    createNominalMapValueHolder,
    selectNominalMapValueHolder,
    deleteNominalMapValueHolder,
    getColumnNameForLoincAndDataSource,
    getOridnalValueSetsForLoinc,
    getOridnalValueSetValues,
    updateOridnalValueSetValues,
    selectCollectionToLoincFromMetadataAggregation,
	selectCollectionToLoincFromMappingTable,
    selectCollectionsToCompositeDescriptorsAny,
    selectCollectionsToCompositeDescriptorsAll,
	getNullCountFromTable,
	calculateCompleteness,
	calculateAccuracy,
	calculateWeightedCollectionAccuracy,
	calculateTimeliness,
	calculateCollectionTimeliness,
};