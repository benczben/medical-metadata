const pgConnection = require("../dao/pg-connection.js").pgConnection
const Pool = require("pg").Pool
const pool = new Pool({
  host: pgConnection.host,
  port: pgConnection.port,
  user: pgConnection.user,
  password: pgConnection.password,
  database: pgConnection.database,
})

let loincQueries = require("../dao/queries/loinc")
let loincHelper = require("../helpers/loinc-helper")
let loincMappingQueries = require("../dao/queries/loinc_mapper")
let metadaQueries = require("../dao/queries/metadata")

const getAllLoincParentGroups = async() => {
	let query = loincQueries.getAllParentGroups;
	let colnames = await pool.query(query)
	return colnames.rows
}

const getRelevantLoincParentGroups = async() => {
	let query = loincQueries.getRelevantParentGroups
	let colnames = await pool.query(query)
	return colnames.rows
}

const getLoincGroups = async(loincPrentGroupList) => {
	let query = loincQueries.getGroupsRestricted
	let res = await pool.query(query, [loincPrentGroupList])
	return res.rows
}

const getLoincTerms = async(loincGroupList) => {
	let query = loincQueries.getTermsRestricted;
    let res = await pool.query(query, [loincGroupList])
	return res.rows
}

const getLoincFsn = async(loincCode) => {
	let loincTermShell = __dirname + "/../helpers/shell/fhir_shell.sh " + loincCode
	let res = await loincHelper.nodeShellExecutor(loincTermShell)
	let responseParsed = JSON.parse(res.split("X-Frame-Options: DENY")[1])
	try {
		let fsn = new Object
		if(responseParsed.issue) throw new Error(responseParsed.issue[0].diagnostics)

		responseParsed.parameter.map(param => {
			//create FSN
			if(param && param.part && param.part.length > 0){
				if(param.part[0].name == "code" && param.part[0].valueCode == "COMPONENT"){
					fsn["COMPONENT"] = param.part[1].valueCoding.display
				}
				if(param.part[0].name == "code" && param.part[0].valueCode == "PROPERTY"){
					fsn["PROPERTY"] = param.part[1].valueCoding.display
				}
				if(param.part[0].name == "code" && param.part[0].valueCode == "TIME_ASPCT"){
					fsn["TIME_ASPCT"] = param.part[1].valueCoding.display
				}
				if(param.part[0].name == "code" && param.part[0].valueCode == "SYSTEM"){
					fsn["SYSTEM"] = param.part[1].valueCoding.display
				}
				if(param.part[0].name == "code" && param.part[0].valueCode == "SCALE_TYP"){
					fsn["SCALE_TYP"] = param.part[1].valueCoding.display
				}
				if(param.part[0].name == "code" && param.part[0].valueCode == "METHOD"){
					fsn["METHOD"] = param.part[1].valueCoding.display
				}
			}
		})
		return fsn
	} catch (error) {
		throw new Error(error)
	}
}

const getLoincInfoFromFhirApi = async(loincCode) => {
	let loincTermShell = __dirname + "/../helpers/shell/fhir_shell.sh " + loincCode
	let res = await loincHelper.nodeShellExecutor(loincTermShell)
	let responseParsed = JSON.parse(res.split("X-Frame-Options: DENY")[1])
	try {
		let loincTerm = new Object
		loincTerm['loincCode'] = loincCode
		if(responseParsed.issue) throw new Error(responseParsed.issue[0].diagnostics)
		
		responseParsed.parameter.map(param => {
			if(param.name == "display"){
				loincTerm['longCommonName'] = param.valueString
			}
			if(param && param.part && param.part.length > 0){
				if(param.part[0].name == "code" && param.part[0].valueCode == "parent"){
					loincTerm["groupId"] = param.part[1].valueCoding.code
				}
			}
			if(param.name == "display"){
				loincTerm['longCommonName'] = param.valueString
			}
		})
		return loincTerm
	} catch (error) {
		throw new Error(error)
	}
}

const ordinalLoincFhirResponseInterceptor = async(loincCode) => {
	let query = loincMappingQueries.getOrdinalAsNominalScalingOnMetaLevel(loincCode)
	let res = await pool.query(query)
	return res.rows
}

const relatedCollectionsBasedOnMetadataAggregation = async (loincCodes) => {
	loincCodes = loincCodes.map(code => "'" + code + "'")
	let query = metadaQueries.selectCollectionToLoincFromMetadataAggregation.replace(/\$1/g, loincCodes.join(', '))
	let collectionListRes = await pool.query(query)
	return collectionListRes.rows
}

const relatedCollectionsBasenOnMapping = async (loincCode) => {
	let query = metadaQueries.selectCollectionToLoincFromMappingTable.replace(/\$1/g, loincCode)
	let collectionListRes = await pool.query(query)
	return collectionListRes.rows
}

const getLoincPartValuesFromLoincFhir = async(collectionName) => {
	// codes used in the meta model
	let valuesFetchedCount = 0
	let query = loincMappingQueries.selectAllUsedLoincCodes
	let usedLoincCodesRes = await pool.query(query, [collectionName])
	let usedCodes = usedLoincCodesRes.rows.map(row => row.loinc_code)

	// codes for which the loinc part value is filled
	let loincPartValuesFilled = loincMappingQueries.selectCodesForLoincPartValuesFilled
	let loincPartValuesFilledRes = await pool.query(loincPartValuesFilled)
	let filledPartValuesForCodes = loincPartValuesFilledRes.rows.map(row => row.loinc_code)

	// fill those loinc part values which are not filled already (to avoid unneccessary calls)
	let deltaToBeFilled = usedCodes.filter(code => filledPartValuesForCodes.indexOf(code) === -1)
	for(let code of deltaToBeFilled) {
		try {
			let fsn = await getLoincFsn(code)
			let upadteQueryPrepped = loincMappingQueries.insertLoincPartValues
				.replace(/\$1/g, code)
				.replace(/\$2/g, fsn.COMPONENT)
				.replace(/\$3/g, fsn.PROPERTY)
				.replace(/\$4/g, fsn.TIME_ASPCT)
				.replace(/\$5/g, fsn.SYSTEM)
				.replace(/\$6/g, fsn.SCALE_TYP)
				.replace(/\$7/g, fsn.METHOD)
			let update = await pool.query(upadteQueryPrepped)
			valuesFetchedCount += update.rowCount
			
		} catch (error) {
			// throws error up to the controller
			throw new Error(error)
		}		
	}
	return `LOINC Part Values for ${valuesFetchedCount} new LOINC codes are fetched.`
}

const getLoincPartValues = async (loincPartSelected) => {
	let loincPartValuesQuery = loincQueries.selectLoincPartValues(loincPartSelected)
	let loincPartValuesRes = await pool.query(loincPartValuesQuery)
	loincPartArray = loincPartValuesRes.rows.map(x => x.loinc_part_value)
	return loincPartArray
}

const getCollectionsToLoincPartValues = async(component, property, time_aspect, system, scale, method) => {
	if(!component || typeof(component) == 'undefined') component == null
	if(!property || typeof(property) == 'undefined') property == null
	if(!time_aspect || typeof(time_aspect) == 'undefined') time_aspect == null
	if(!system || typeof(system) == 'undefined') system == null
	if(!scale || typeof(scale) == 'undefined') scale == null
	if(!method || typeof(method) == 'undefined') method == null
	let collecionsToLoincPartValuesQuery = loincQueries.selectCollectionsToLoincPartValues(component, property, time_aspect, system, scale, method)
	let collecionsToLoincPartValuesRes = await pool.query(collecionsToLoincPartValuesQuery)
	let uniqueCollections = [...new Set(collecionsToLoincPartValuesRes.rows.map(x => x.collection_name))]
	return uniqueCollections
}

const getLoincCodesToLoincPartValuesOfCollection = async(component, property, time_aspect, system, scale, method, collection) => {
	if(!component || typeof(component) == 'undefined') component == null
	if(!property || typeof(property) == 'undefined') property == null
	if(!time_aspect || typeof(time_aspect) == 'undefined') time_aspect == null
	if(!system || typeof(system) == 'undefined') system == null
	if(!scale || typeof(scale) == 'undefined') scale == null
	if(!method || typeof(method) == 'undefined') method == null
	let loincCodesToPartValuesQuery = loincQueries.selectCollectionsToLoincPartValues(component, property, time_aspect, system, scale, method, collection)
	let loincCodesToPartValuesRes = await pool.query(loincCodesToPartValuesQuery)
	let uniqueLoincCodes = [...new Set(loincCodesToPartValuesRes.rows.map(x => x.loinc_code))]
	return uniqueLoincCodes
}

const getInfoToCodes = async(codes) => {
	let codesQueryString = codes.map(code => `'${code}'`).join(',')
	let query = loincQueries.getInfoToCode.replace(/\$1/g, codesQueryString)
	let resultSetRes = await pool.query(query)
	let resultSet = resultSetRes.rows
	return resultSet
}

const getMetalevelLoincCodes = async() => {
	let query = loincQueries.getMetalevelLoincCodes
	let loincCodesRes = await pool.query(query)

	// check of every loinc code has a long common name. If not, get is from the FHIR API
	for(let loincCode of loincCodesRes.rows) {
		if(loincCode.long_common_name == null){
			let dbInsertQuery = loincQueries.insertLoincTermIntoDb
			try {
				let loincTerm = await getLoincInfoFromFhirApi(loincCode.loinc_code)
				await pool.query(dbInsertQuery, [loincTerm.groupId, loincTerm.loincCode, loincTerm.longCommonName])
				loincCode.long_common_name = loincTerm.longCommonName
			} catch (error) {
				console.log(error)
				continue
			}
		}
	}
	
	let loincCodes = loincCodesRes.rows
	loincCodes = loincCodes.filter(code => {
        if(code.long_common_name == null) return false
		else return true
	})
	return loincCodes
}

const getLoincCodeOperators = async() => {
	let query = loincQueries.selectLoincCodeOperators
	let result = await pool.query(query)
	let codeOperators = result.rows
	return codeOperators
}

const getCollectionsToCompositeDescriptors = async(participatingCodes, operator) => {
	let queryAny = metadaQueries.selectCollectionsToCompositeDescriptorsAny
	let queryAll = metadaQueries.selectCollectionsToCompositeDescriptorsAll
	let collectionList
	if(operator == 'ALL'){
		let queryWhereClauseAppend = ''
		for(let [index, code] of participatingCodes.entries()){
			queryWhereClauseAppend += `
			AND EXISTS
				(SELECT 1
				FROM metadata_aggregation ma${index+1}
				WHERE ma${index+1}.source_database = ma.source_database
					AND ma${index+1}.loinc_code = '${code}'
				)`
		}
		queryAll = queryAll.replace(/\$1/g , queryWhereClauseAppend)
		let result = await pool.query(queryAll)
		collectionList = result.rows
		return collectionList
	} else if (operator == 'ANY'){
		let result = await pool.query(queryAny, [participatingCodes])
		collectionList = result.rows
	}
	return collectionList
}

const getCompletenessOfCollectionsForLoinc = async(loincCode, lowerBound, upperBound) => {
	let query = metadaQueries.calculateCompleteness
	query = query.replace(/\$1/g, loincCode).replace(/\$2/g, lowerBound).replace(/\$3/g, upperBound)
	let result = await pool.query(query)
	return result.rows
}

const getAccuracyOfCollectionsForLoinc = async(loincCode, accuracyArray) => {
	let accuracyQueryString = accuracyArray.map(acc => "'" + acc + "'").join(', ')
	let query = metadaQueries.calculateAccuracy.replace(/\$1/g, loincCode).replace(/\$2/g, accuracyQueryString)
	let result = await pool.query(query)

	// fetch the weighted accuracy for collection and add to the return object
	let collections = [...new Set(result.rows.map(row => row.source_database))]
	for(collection of collections){
		let weightedValues = await getWeigthedAccuracyOfCollections(collection)
		let sumOfWeightedAverages = weightedValues.reduce((acc, curr) => {
			acc += Number(curr.weighted_accuracy)
			return acc
		}, 0)
        for(row of result.rows) {
			if(row.source_database == collection) row['collection_accuracy'] = sumOfWeightedAverages
		}
	}
	return result.rows
}

const getWeigthedAccuracyOfCollections = async(collection) => {
	let query = metadaQueries.calculateWeightedCollectionAccuracy.replace(/\$1/g, collection)
	let result = await pool.query(query)
	return result.rows
}

const getTimelinessInfoOfCollectionsForLoinc = async(collection, lowerBound, upperBound, timelinessUnit) => {
	let divider =  "1"
	switch (timelinessUnit) {
		case 'day':
			break
		case 'month':
			divider = "30"
			break
		case 'year':
			divider = "30 / 12"
			break
		default:
			divider = "1"
			break
	}

	let query = metadaQueries.calculateTimeliness
		.replace(/\$1/g, collection)
		.replace(/\$2/g, lowerBound)
		.replace(/\$3/g, upperBound)
		.replace(/\$4/g, divider)
	let result = await pool.query(query)
	// add collection timeliness to the return object
	let collections = [...new Set(result.rows.map(row => row.source_database))]
	for(collection of collections){
		let weightedValues = await getCollectionTimeliness(collection, divider)
		let sumOfWeghtedTimeliness = weightedValues.reduce((acc, curr) => {
			acc += Number(curr.timeliness)
			return acc
		}, 0)
        for(row of result.rows) {
			if(row.source_database == collection) row['collection_timeliness'] = sumOfWeghtedTimeliness
		}
	}
	return result.rows
}

const getCollectionTimeliness = async(collection, divider) => {
	let query = metadaQueries.calculateCollectionTimeliness.replace(/\$1/g, collection).replace(/\$2/g, divider)
	let result = await pool.query(query)
	return result.rows
}

module.exports = {
	getAllLoincParentGroups,
	getRelevantLoincParentGroups,
	getLoincGroups,
	getLoincTerms,
	getLoincFsn,
	ordinalLoincFhirResponseInterceptor,
	relatedCollectionsBasedOnMetadataAggregation,
	relatedCollectionsBasenOnMapping,
	getLoincPartValuesFromLoincFhir,
	getLoincPartValues,
	getCollectionsToLoincPartValues,
	getLoincCodesToLoincPartValuesOfCollection,
	getInfoToCodes,
	getMetalevelLoincCodes,
	getLoincCodeOperators,
	getCollectionsToCompositeDescriptors,
	getCompletenessOfCollectionsForLoinc,
	getAccuracyOfCollectionsForLoinc,
	getTimelinessInfoOfCollectionsForLoinc,
};
