const Pool = require("pg").Pool;
const pgConnection = require("../dao/pg-connection").pgConnection;
const pool = new Pool({
  host: pgConnection.host,
  port: pgConnection.port,
  user: pgConnection.user,
  password: pgConnection.password,
  database: pgConnection.database,
});

let loincMappingQueries = require("../dao/queries/loinc_mapper");
let metadataQueries = require("../dao/queries/metadata");

async function getMappedData(loincCode, minValue, maxValue){
	try {
        let query = `
			SELECT 
				CAST(aggregate_value AS numeric),
				occurance_count AS occurance_count,
				source_database AS source_database,
				value_unit AS value_unit,
				MAX(CAST(min_value AS numeric)) AS min_value,
				MAX(CAST(max_value AS numeric)) AS max_value,
				MAX(CAST(mean_value AS numeric)) AS mean_value,
				MAX(CAST(median_value AS numeric)) AS median_value,
				MAX(min_updated_at) AS min_updated_at,
				MAX(max_updated_at) AS max_updated_at,
				MAX(mean_updated_at) AS mean_updated_at,
				MAX(median_updated_at) AS median_updated_at
			FROM
				metadata_aggregation 
			WHERE 
				loinc_code = '${loincCode}'
				AND
				aggregate_value::numeric BETWEEN ${minValue} AND ${maxValue}
				AND
				source_database NOT IN ('raw_medical_data')
			GROUP BY 1,2,3,4
			ORDER BY 1,3`
		let res = await pool.query(query)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getValueRangesForLoincCode(loincCode){
	try {
		let query = metadataQueries.valueRangeForLoinc
		let accuracyQueryPrep = query.replace(/\$1/g, loincCode)
		let res = await pool.query(accuracyQueryPrep)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getMappedDataNominal(loincCode, valuesRestrictionList){
	try {
		let sqlPreppedArrayToString = (valuesRestrictionList.length > 0) ? "aggregate_value IN (" + "'" + valuesRestrictionList.join("','") + "'" + ")" : " true "
		let query = `
		SELECT 
			aggregate_value,
			occurance_count,
			source_database,
			MAX(min_updated_at) AS min_updated_at,
			MAX(max_updated_at) AS max_updated_at,
			MAX(mean_updated_at) AS mean_updated_at,
			MAX(median_updated_at) AS median_updated_at
		FROM
			metadata_aggregation 
		WHERE 
			loinc_code = '${loincCode}'
		AND
		${sqlPreppedArrayToString}
		AND
			source_database NOT IN ('raw_medical_data')
		GROUP BY 1,2,3
		ORDER BY 1,3;`
		let res = await pool.query(query)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getValuesForNominalColumn(loincCode){
	try {
		let query = metadataQueries.valuesForNominalColumn
		let accuracyQueryPrep = query.replace(/\$1/g, loincCode)
		let res = await pool.query(accuracyQueryPrep)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getValuesForOrdinalColumn(loincCode){
	try {
		let query = metadataQueries.valuesForOrdinalColumn
		let accuracyQueryPrep = query.replace(/\$1/g, loincCode)
		let res = await pool.query(accuracyQueryPrep)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getMappedDataOrdinal(loincCode, minValue, maxValue){
	try {
		let query = `
		SELECT 
			ma.aggregate_value,
			ma.occurance_count,
			ma.source_database,
			MAX(min_updated_at) AS min_updated_at,
			MAX(max_updated_at) AS max_updated_at,
			MAX(mean_updated_at) AS mean_updated_at,
			MAX(median_updated_at) AS median_updated_at
		FROM
			metadata_aggregation ma
		LEFT OUTER JOIN ordinal_value_sets ovs
			on ovs.loinc_code = ma.loinc_code
		WHERE 
			ma.aggregate_value IN (SELECT value_set_value FROM ordinal_value_sets WHERE sequence_number::numeric BETWEEN ${minValue} AND ${maxValue})
				AND
			ovs.loinc_code = '${loincCode}'
				AND
			ma.source_database NOT IN ('raw_medical_data')
				AND
			ovs.sequence_number::numeric BETWEEN ${minValue} AND ${maxValue}
		GROUP BY 1,2,3
		ORDER BY 1,3`
		let res = await pool.query(query)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getMappedDataDocumentAndNarrative(loincCode, selectedValues){
	try {
		let sqlPreppedArrayToString = await (selectedValues.length > 0) ? "aggregate_value IN (" + "'" + selectedValues.join("','") + "'" + ")" : " true "
		let query = `
		SELECT 
			aggregate_value,
			occurance_count,
			source_database,
			MAX(min_updated_at) AS min_updated_at,
			MAX(max_updated_at) AS max_updated_at,
			MAX(mean_updated_at) AS mean_updated_at,
			MAX(median_updated_at) AS median_updated_at
		FROM
			metadata_aggregation 
		WHERE 
			loinc_code = '${loincCode}'
			AND
			${sqlPreppedArrayToString}
			AND
			source_database NOT IN ('raw_medical_data')
		GROUP BY 1,2,3
		ORDER BY 1,3;`
		console.log('query' + query)
		let res = await pool.query(query)
		return res.rows  
	} catch (error) {
		throw new Error(error)
	}
}

async function getOrdinalAsNominalScalingOnMetaLevel(loincCode){
	try {
		let sqlPreppedArrayToString = loincMappingQueries.getOrdinalAsNominalScalingOnMetaLevel(loincCode)
		let res = await pool.query(sqlPreppedArrayToString)
		return res.rows
	} catch (error) {
		throw new Error(error)
	}
}

async function insertCompositeContentDescriptor(compositeContentDescriptorName, compositeContentDescriptorDescription, participatingLoincCodes, operator){
	let insertStatementCompositeContentDescriptor = loincMappingQueries.insertCompositeContentDescriptor
	let participatingLoincCodesArray = participatingLoincCodes.map(code => code.loinc_code)
	let res = await pool.query(insertStatementCompositeContentDescriptor, [compositeContentDescriptorName, compositeContentDescriptorDescription, participatingLoincCodesArray, operator])
	return res
}

async function selectCompositeContentDescriptor(){
	let selectStatementCompositeContentDescriptor = loincMappingQueries.selectCompositeContentDescriptor
	let res = await pool.query(selectStatementCompositeContentDescriptor)
	return res.rows
}

async function deleteCompositeContentDescriptor(ids){
	let deleteStatementCompositeContentDescriptor = loincMappingQueries.deleteCompositeContentDescriptor
	for(let id of ids){
		await pool.query(deleteStatementCompositeContentDescriptor, [id])
	}
	return
}

async function inertIntoMappingTable(columnName, loincCode, scaling, collectionName){
	let query = loincMappingQueries.insertPassedValuesIntoMappingTable
	let res = await pool.query(query, [columnName, loincCode, scaling, collectionName])
	return res.rows
}

module.exports = {
  getMappedData,
  getValueRangesForLoincCode,
  getValuesForNominalColumn,
  getMappedDataNominal,
  getValuesForOrdinalColumn,
  getMappedDataOrdinal,
  getMappedDataDocumentAndNarrative,
  getOrdinalAsNominalScalingOnMetaLevel,
  insertCompositeContentDescriptor,
  selectCompositeContentDescriptor,
  deleteCompositeContentDescriptor,
  inertIntoMappingTable,
}