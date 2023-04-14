function constructMetadataExportNomMappedQuery(mappedValues, columnName, dbName) {
	let sqlCaseWhenRows = ''

	sqlCaseWhenRows = '(CASE '
	for (let valueOfRow of mappedValues) {
		sqlCaseWhenRows += ` WHEN rmd.${columnName} = '${valueOfRow.aggregateValue}' THEN '${valueOfRow.selectedValue}' `
	}
	sqlCaseWhenRows += ` ELSE rmd.${columnName} ` 
	sqlCaseWhenRows += ` END) as aggregate_value, `
	
	let query = `
		SELECT 
			${sqlCaseWhenRows}
			'${dbName}' as source_database,
			MAX(mt.maps_to_loinc) as loinc_code,
			MAX(mt.source_column) as column_name,
			MAX(updated_at) as tuple_max_time,
			MIN(updated_at) as tuple_min_time,
			to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
			PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
			now() as metadata_created_at,
			count(1) as occurance_count
		FROM ${dbName} rmd
		LEFT JOIN mapping_table mt ON
			mt.source_column = '${columnName}'
		WHERE
			mt.source_column IS NOT NULL
		GROUP BY 1
		ORDER BY 1`
	return query
}

function constructMetadataExportOrdMappedQuery(mappedValues, columnName, dbName) {
	let sqlCaseWhenRows = ''

	sqlCaseWhenRows = '(CASE '
	for (let valueOfRow of mappedValues) {
		sqlCaseWhenRows += ` WHEN rmd.${columnName} = '${valueOfRow.aggregateValue}' THEN '${valueOfRow.selectedValue}' `
	}
	sqlCaseWhenRows += ` ELSE rmd.${columnName} ` 
	sqlCaseWhenRows += ` END) as aggregate_value, `

	let sqlJoinOverCaseWhen = ''
	sqlJoinOverCaseWhen = '(CASE '
	for (let valueOfRow of mappedValues) {
		sqlJoinOverCaseWhen += ` WHEN rmd.${columnName} = '${valueOfRow.aggregateValue}' THEN '${valueOfRow.selectedValue}' `
	}
	sqlJoinOverCaseWhen += ` ELSE rmd.${columnName} END)` 

	let query = `
		SELECT 
			${sqlCaseWhenRows}
			'${dbName}' as source_database,
			MAX(mt.maps_to_loinc) as loinc_code,
			MAX(mt.source_column) as column_name,
			MAX(ovs.value_set_name) as value_set_name,
			MAX(ovs.value_set_value) as value_set_value,
			MAX(ovs.sequence_number) as sequence_number,
			MAX(updated_at) as tuple_max_time,
			MIN(updated_at) as tuple_min_time,
			to_timestamp(AVG(extract(epoch from (updated_at))))::timestamp as tuple_mean_time,
			PERCENTILE_DISC(0.5) WITHIN GROUP(ORDER BY updated_at) as tuple_median_updated_at,
			now() as metadata_created_at,
			count(1) as occurance_count
		FROM ${dbName} rmd
		LEFT JOIN mapping_table mt ON
			mt.source_column = '${columnName}'
		LEFT OUTER JOIN ordinal_value_sets ovs ON
			${sqlJoinOverCaseWhen} = ovs.value_set_value
		WHERE
			mt.source_column IS NOT NULL
			AND 
			ovs.value_set_value IS NOT NULL
		GROUP BY 1
		ORDER BY 1`
	return query
}

module.exports = {
	constructMetadataExportNomMappedQuery,
	constructMetadataExportOrdMappedQuery,
}