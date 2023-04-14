let sqlstring = require('sqlstring')

let insertIntoMatadataAggregationValuesQn = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		aggregate_value,
		source_database,
		loinc_code,
		column_name,
		occurance_count,
		null_value_count,
		value_unit,
		min_value,
		max_value,
		mean_value,
		median_value,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
`)

let insertIntoMatadataAggregationValuesNom = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		source_database,
		loinc_code,
		column_name,
		aggregate_value,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
`)

let insertIntoMatadataAggregationValuesOrd = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		source_database,
		loinc_code,
		column_name,
		aggregate_value,
		occurance_count,
		null_value_count,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
`)

let insertIntoMatadataAggregationValuesDocOrNar = sqlstring.format(`
	INSERT INTO metadata_aggregation (
		source_database,
		loinc_code,
		aggregate_value,
		occurance_count,
		null_value_count,
		column_name,
		min_updated_at,
		max_updated_at,
		mean_updated_at,
		median_updated_at,
		metadata_created_at,
		tuple_accuracy
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
`)

module.exports = {
	insertIntoMatadataAggregationValuesQn,
	insertIntoMatadataAggregationValuesNom,
	insertIntoMatadataAggregationValuesOrd,
	insertIntoMatadataAggregationValuesDocOrNar,
}