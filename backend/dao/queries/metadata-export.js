let sqlstring = require('sqlstring')

let rowCountFromTable = sqlstring.format(`
	SELECT count(1) FROM $1
`)

let getMappedLoincForColAndCollection = sqlstring.format(`
	SELECT maps_to_loinc as loinc_code FROM mapping_table WHERE source_column = $1 AND source_collection = $2
`)

let getValueUnit = (columnName, collectionName) => {
	// supporting only one value unit per collection
	return sqlstring.format(`
		SELECT ${columnName}_unit AS value_unit FROM ${collectionName} GROUP BY 1 ORDER BY 1 LIMIT 1
	`)
}

let tupleDetailDataCalculatorQn = sqlstring.format(`
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
		SUM(CASE WHEN $1 IS NULL THEN 1 ELSE 0 END) AS occurance_count_null,
		MAX(updated_at) as tuple_max_time,
		MIN(updated_at) as tuple_min_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at
	FROM $3 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$3'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1
`)

let tupleDetailDataCalculatorNom = sqlstring.format(`
	SELECT 
		$1 as aggregate_value,
		'$2' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		MAX(updated_at) as tuple_max_time,
		MIN(updated_at) as tuple_min_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		count(1) as occurance_count
	FROM $2 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1
`)

let tupleDetailDataCalculatorOrd = sqlstring.format(`
	SELECT 
		$1 as aggregate_value,
		'$2' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		MAX(updated_at) as tuple_max_time,
		MIN(updated_at) as tuple_min_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at,
		count(1) as occurance_count
	FROM $2 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	WHERE
		mt.source_column IS NOT NULL
	GROUP BY 1
	ORDER BY 1
`)

let tupleDetailDataCalculatorDocOrNar = sqlstring.format(`
	SELECT 
		(CASE 
			WHEN rmd.$1 IS NOT NULL THEN '1'
			WHEN rmd.$1 IS NULL THEN '0'
			ELSE rmd.$1 END)
		as data_available,
		'$2' as source_database,
		MAX(mt.maps_to_loinc) as loinc_code,
		MAX(mt.source_column) as column_name,
		count(1) as occurance_count,
		MAX(updated_at) as tuple_max_time,
		MIN(updated_at) as tuple_min_time,
		to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
		PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
		now() as metadata_created_at
	FROM $2 rmd
	LEFT JOIN mapping_table mt 
		ON mt.source_column = '$1'
		AND mt.source_collection = '$2'
	GROUP BY 1
	ORDER BY 1
`)

module.exports = {
	rowCountFromTable,
	getMappedLoincForColAndCollection,
	getValueUnit,
	tupleDetailDataCalculatorQn,
	tupleDetailDataCalculatorNom,
	tupleDetailDataCalculatorOrd,
	tupleDetailDataCalculatorDocOrNar,
}