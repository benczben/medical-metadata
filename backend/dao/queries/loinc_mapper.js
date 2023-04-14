let sqlstring = require("sqlstring");

let getMappedDataSingleColumn = sqlstring.format(`SELECT $1 FROM raw_medical_data GROUP BY 1`);

let getOrdinalAsNominalScalingOnMetaLevel = (loincCode) => sqlstring.format(`
	SELECT 
		source_database as source_database,
		loinc_code as loinc_code,
		MAX(scaling_of_meta_data) as scaling_of_meta_data
	FROM ordinal_order
	WHERE loinc_code = '${loincCode}'
	GROUP BY 1,2`
);

let selectAllUsedLoincCodes = sqlstring.format(`
	SELECT maps_to_loinc AS loinc_code
	FROM mapping_table
	WHERE source_collection = $1
`)

let selectCodesForLoincPartValuesFilled = sqlstring.format(`
	SELECT loinc_code AS loinc_code
	FROM loinc_part_values
`)

// order of values loinc_code component property time_aspect system_part scale_part method_part
let insertLoincPartValues = sqlstring.format(`
	INSERT INTO loinc_part_values VALUES('$1','$2','$3','$4','$5','$6','$7');
`)

let insertCompositeContentDescriptor = sqlstring.format(`
	INSERT INTO composite_content_descriptors (name, description, participating_codes, code_operator) VALUES ($1, $2, $3, $4)
`)

let selectCompositeContentDescriptor = sqlstring.format(`
	SELECT
		id as id,
		name AS descriptor_name,
		description AS description,
		participating_codes AS participating_codes,
		code_operator AS code_operator
	FROM composite_content_descriptors
`)

let deleteCompositeContentDescriptor = sqlstring.format(`
	DELETE FROM composite_content_descriptors WHERE id = $1
`)

const createTempMappingTable = sqlstring.format(`
	CREATE TABLE IF NOT EXISTS temp_mapping (
		source_column character varying(255),
		maps_to_loinc character varying(255),
		value_scaling character varying(20)
	)
`)

const insertIntoMappingTable = (collectionName) => {
	return sqlstring.format(`
		INSERT INTO mapping_table(source_column, maps_to_loinc, value_scaling, source_collection)
		SELECT 
			source_column AS source_column,
			maps_to_loinc AS maps_to_loinc, 
			UPPER(value_scaling) AS value_scaling,
			'${collectionName}' AS source_collection
		FROM temp_mapping ON CONFLICT ON CONSTRAINT "candidate_key_mapping" DO NOTHING;
	`)
}

let copyIntoStatement = (filename) => {
	return sqlstring.format(`
		COPY temp_mapping (source_column, maps_to_loinc) FROM '/tmp/data/uploads/collections/${filename}' WITH DELIMITER E'\t' NULL AS '\\N'
	`)
}

const selectAllTempMappingEntries = () => {
	return sqlstring.format(`
		SELECT maps_to_loinc as loinc_code FROM temp_mapping
	`)
}

const updateScalingInTempTable = (loincCode, scaling) => {
	return sqlstring.format(`
		UPDATE temp_mapping SET value_scaling = '${scaling.toUpperCase()}' WHERE maps_to_loinc = '${loincCode}'
	`)
}

// this query is executed for the mock-data filled, auto-generated demo tables
const insertIntoMappingTableForGeneratedData = (collectionName) => {
	return sqlstring.format(`
		INSERT INTO mapping_table(source_column, maps_to_loinc, value_scaling, source_collection)
		SELECT 
			source_column AS source_column,
			maps_to_loinc AS maps_to_loinc, 
			UPPER(value_scaling) AS value_scaling,
			'${collectionName}' AS source_collection
		FROM mapping_table WHERE source_collection = 'raw_medical_data'
	`)
}

const insertPassedValuesIntoMappingTable = 	sqlstring.format(`
	INSERT INTO mapping_table
		(source_column, maps_to_loinc, value_scaling, source_collection)
	VALUES ($1, $2, $3, $4)
`)

module.exports = {
    getMappedDataSingleColumn,
    getOrdinalAsNominalScalingOnMetaLevel,
    selectAllUsedLoincCodes,
    selectCodesForLoincPartValuesFilled,
	insertLoincPartValues,
	insertCompositeContentDescriptor,
	selectCompositeContentDescriptor,
	deleteCompositeContentDescriptor,
	createTempMappingTable,
	insertIntoMappingTable,
	copyIntoStatement,
	selectAllTempMappingEntries,
	updateScalingInTempTable,
	insertIntoMappingTableForGeneratedData,
	insertPassedValuesIntoMappingTable,
}
