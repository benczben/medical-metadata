const Pool = require('pg').Pool
const pgConnection = require('../../dao/pg-connection.js').pgConnection
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})

const metadataQueries = require('../../dao/queries/metadata')
const metadataExportQueries = require('../../dao/queries/metadata-export')
const dataGenerationQueries = require('../../dao/queries/datageneration')
const metadataExportDbHelper = require('./metadata-export-db-helper')
const metadataExportObjectBuilder = require('./metadata-export-object-builder')
const metadataService = require('../metadata/metadata-service')

const getRowCountForCollection = async (collectionName) => {
	let rowCountFromTableQuery = metadataQueries.rowCountFromTable.replace(/\$1/g, collectionName)
	let rowCountResponse = await pool.query(rowCountFromTableQuery)
	let rowCountAllRows = rowCountResponse.rows[0].count
	return rowCountAllRows
}

const getRowCountNullRowsForCollection = async(collectionName, column) => {
	let nullCountFromTableQuery = metadataQueries.getNullCountFromTable.replace(/\$1/g, collectionName).replace(/\$2/g, column)
	let nullCountResponse = await pool.query(nullCountFromTableQuery)
	let nullCountForDataAttribute = nullCountResponse.rows[0].count
	return nullCountForDataAttribute
}

const getLoincCodeForColAndCollection = async(columnName, collectionName) => {
	let loincCodeForColAndCollectionQuery = metadataExportQueries.getMappedLoincForColAndCollection
	let res = await pool.query(loincCodeForColAndCollectionQuery, [columnName, collectionName])
	let loincCode = (res.rows && res.rows[0] && res.rows[0].loinc_code) ? res.rows[0].loinc_code : ''
	return loincCode
}

const getValueUnitForCol = async(columnName, collectionName) => {
	let valueUnitQuery = metadataExportQueries.getValueUnit(columnName, collectionName)
    let res = await pool.query(valueUnitQuery)
	let valueUnit = res.rows[0].value_unit
	return valueUnit
}

const tupleDataBasedOnDesiredAccuracy = async(column, collectionName, desiredAccuracy, rowCountAllRows) => {
	let desiredAccuracyLowerLimit
	let appieldAccuracyGroup 
	if(desiredAccuracy == 'high'){
		// NOTE: high accuracy if the aggregates keep 75% of the initail rows
		desiredAccuracyLowerLimit = 75
	} else if(desiredAccuracy == 'medium'){
		// NOTE: medium accuracy is if the aggregates keep 30% - 74,9%  of the initail rows
		desiredAccuracyLowerLimit = 30
	} else if(desiredAccuracy == 'low'){
		// NOTE: medium accuracy is if the aggregates keep <29,9%  of the initail rows
		desiredAccuracyLowerLimit = 1
	} else {
		return 'the desired accuracy is not supported'
	}

	let desiredAccuracyMet = false
	let accuracyRunnerVariableFrozenValue = -6
	let accuracyRunnerVariable = -6
	let metadataTuples

	while(!desiredAccuracyMet){
		accuracyRunnerVariable++
		let accuracyQuery = metadataExportQueries.tupleDetailDataCalculatorQn
		let accuracyQueryPrep = accuracyQuery.replace(/\$1/g, column).replace('$2', accuracyRunnerVariable).replace(/\$3/g, collectionName)
        metadataTuples = await pool.query(accuracyQueryPrep)
		if(metadataTuples.rowCount/rowCountAllRows*100 >= desiredAccuracyLowerLimit){
			desiredAccuracyMet = true
			appieldAccuracyGroup = desiredAccuracy
		}
		if(accuracyRunnerVariable + accuracyRunnerVariableFrozenValue * -1 >= 20){
			// NOTE: this is a case if the values in the column share a small domain and therefore 75% can not be reached
			desiredAccuracyMet = true
			appieldAccuracyGroup = 'high'
		}
	}

	return {
		calculatedAccuracy: accuracyRunnerVariable,
		appliedAccuracyGroup: appieldAccuracyGroup,
		metadataTuples: metadataTuples.rows,
	}
}

const tupleDataForNominal = async(column, collectionName) => {
	let query = metadataExportQueries.tupleDetailDataCalculatorNom
	let nominalQueryPrep = query.replace(/\$1/g, column).replace(/\$2/g, collectionName)
	let metadataTuples = await pool.query(nominalQueryPrep)
	
	return {
		metadataTuples: metadataTuples.rows,
	}
}

const tupleDataForDocOrNar = async(column, collectionName) => {
	let query = metadataExportQueries.tupleDetailDataCalculatorDocOrNar
	let docOrNarQueryPrep = query.replace(/\$1/g, column).replace(/\$2/g, collectionName)
	let metadataTuples = await pool.query(docOrNarQueryPrep)
	
	return {
		metadataTuples: metadataTuples.rows,
	}
}

const tupleDataForOrdinal = async(column, collectionName) => {
	let query = metadataExportQueries.tupleDetailDataCalculatorOrd
	let ordinalQueryPrep = query.replace(/\$1/g, column).replace(/\$2/g, collectionName)
	let metadataTuples = await pool.query(ordinalQueryPrep)
	
	return {
		metadataTuples: metadataTuples.rows,
	}
}

const calculateQuantitativeColumnsExportData = async (column, collectionName, desiredAccuracy) => {
	// get base values
	let rowCountAllRows = await getRowCountForCollection(collectionName)
	let nullCountForDataAttribute = await getRowCountNullRowsForCollection(collectionName, column)
	
	// gather the needed values
	let loincCodeForCol = await getLoincCodeForColAndCollection(column, collectionName)
    let valueUnit = await getValueUnitForCol(column, collectionName)
    let tupleData = await tupleDataBasedOnDesiredAccuracy(column, collectionName, desiredAccuracy, rowCountAllRows)
    
	return {
		loincCode: loincCodeForCol,
		valueUnit: valueUnit,
		metadataTuples: tupleData.metadataTuples,
		calculatedAccuracy: tupleData.calculatedAccuracy,
		nullCount: nullCountForDataAttribute,
		appliedAccuracyGroup: tupleData.appliedAccuracyGroup
	}
}

const calculateNominalColumnsExportData = async (column, collectionName, nominal = true) => {
	// get base values
	let rowCountAllRows = await getRowCountForCollection(collectionName)
	let nullCountForDataAttribute = await getRowCountNullRowsForCollection(collectionName, column)
	let loincCodeForCol = await getLoincCodeForColAndCollection(column, collectionName)
	let tupleData
	if(nominal){
		// get tuple specific values for nom
		tupleData = await tupleDataForNominal(column, collectionName)
	} else {
		// get tuple specific values for nom
		tupleData = await tupleDataForOrdinal(column, collectionName)
	}
	
	return {
		loincCode: loincCodeForCol,
		initNom: true,
		metadataTuples: tupleData.metadataTuples,
		nullCount: nullCountForDataAttribute,
	}
}

let filterOutNotNumberColumns = async (columns) => {
	let colArray = columns.filter(col => {
		if(col.data_type !== ('character varying') && col.data_type !== ('text') && col.data_type !== ('boolean') && col.data_type !== ('timestamp without time zone')){
			return true
		} else {
			return false
		}
	}).map(col => col.column_name)
	return colArray
}


let filterNotNominalColumns = async (columns) => {
	let cols = await metadataService.getAllColumnsOfTableForValueScaling('nom', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotOrdinalColumns = async (columns) => {
	let cols = await metadataService.getAllColumnsOfTableForValueScaling('ord', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotDocumentColumns = async (columns) => {
	let cols = await metadataService.getAllColumnsOfTableForValueScaling('doc', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotNarrativeColumns = async (columns) => {
	let cols = await metadataService.getAllColumnsOfTableForValueScaling('nar', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let createExportableMetasSchema = async (collectionName, desiredAccuracy, ordinalAsNominalFlag, documentSupport, narrativeSupport, nominalMappingConsidered, nominalMappingObject, ordinalMapperObject) => {
	let exportableStructure = {}
	let columnsQuery = dataGenerationQueries.getColNamesOfTable
	let columns = await pool.query(columnsQuery, [collectionName])

	//Begin Quantitative Values Aggregation
	let colArray = await filterOutNotNumberColumns(columns.rows)
	let retrunTupleQn = []
	let retrunTupleNom = []
	let retrunTupleNomMapped = []
	let retrunTupleOrd = []
	let retrunTupleDoc = []
	let retrunTupleNar = []

	for(let col of colArray){
		let calculatedTupleDataForQn = await calculateQuantitativeColumnsExportData(col, collectionName, desiredAccuracy)
		let exportObjectForQn = metadataExportObjectBuilder.qunatitativeExportObject(calculatedTupleDataForQn.metadataTuples, calculatedTupleDataForQn.loincCode, calculatedTupleDataForQn.valueUnit, calculatedTupleDataForQn.appliedAccuracyGroup)
		if(exportObjectForQn && exportObjectForQn.length > 0) retrunTupleQn.push(exportObjectForQn)
	}
	
	//Begin Nominal Values Aggregation
	if(!nominalMappingConsidered){
		let colArrayNominal = await filterNotNominalColumns(columns.rows)
		for(let col of colArrayNominal){
			let calculatedTupleDataForNom = await calculateNominalColumnsExportData(col, collectionName)
			let exportObjectForNom = metadataExportObjectBuilder.nominalNotMappedExportObject(calculatedTupleDataForNom.metadataTuples, calculatedTupleDataForNom.loincCode, calculatedTupleDataForNom.nullCount, calculatedTupleDataForNom.initNom)
			retrunTupleNom.push(exportObjectForNom)
		}
	} else {
		let columnName = ''
		for (let [db, dbBranch] of Object.entries(nominalMappingObject)) {
			for (let [loinc, mappedValues] of Object.entries(dbBranch)) {
				// get the column name for the loinc number --> needed for the SQL query construction
				let selectQueryPrepped = metadataQueries.getColumnNameForLoincAndDataSource.replace(/\$1/g, loinc).replace(/\$2/g, db)
				let columnNameRes = await pool.query(selectQueryPrepped)
				columnName = columnNameRes.rows[0].source_column

				// construct the query
				let metadataExportNomMappedQuery = metadataExportDbHelper.constructMetadataExportNomMappedQuery(mappedValues, columnName, db)
				let data = await pool.query(metadataExportNomMappedQuery)
				
				// build the exported object 
				let exportObjectForMappedNom = metadataExportObjectBuilder.nominalMappedExportObject(data.rows, loinc)
				retrunTupleNomMapped.push(exportObjectForMappedNom)
			}
		}
	}

	//Begin Ordinal Values Aggregation
	let colArrayOrdinal = await filterNotOrdinalColumns(columns.rows)
	if(!ordinalAsNominalFlag){
		// ordinal scaled loinc codes will be handled as nominal ones due missing sequence mapping
		for(let col of colArrayOrdinal){
			let calculatedTupleDataForOrd = await calculateNominalColumnsExportData(col, collectionName)
			let exportObjectForOrdAsNom = metadataExportObjectBuilder.nominalNotMappedExportObject(calculatedTupleDataForOrd.metadataTuples, calculatedTupleDataForOrd.loincCode, calculatedTupleDataForOrd.nullCount, false)
			retrunTupleNom.push(exportObjectForOrdAsNom)
		}
	} else {
		let ordinalOrNominalHandling = (ordinalAsNominalFlag) ? 'ORD' : 'NOM'
		let createOrdinalOrderTableQuery = metadataQueries.createOrdinalOrderTable
		await pool.query(createOrdinalOrderTableQuery)
		if(ordinalOrNominalHandling == 'ORD'){
			// construct the export structure
			for (const [key, value] of Object.entries(ordinalMapperObject)) {
				for (const [keyChild, valueChild] of Object.entries(value)) {
					// get the column name for the loinc number
					let selectQueryPrepped = metadataQueries.getColumnNameForLoincAndDataSource.replace(/\$1/g, keyChild).replace(/\$2/g, key)
					let columnNameRes = await pool.query(selectQueryPrepped)
					columnName = columnNameRes.rows[0].source_column
					// construct the export structure for mapped ordnial sequenced values
					let metadataExportNomMappedQuery = metadataExportDbHelper.constructMetadataExportOrdMappedQuery(valueChild, columnName, collectionName)
					let data = await pool.query(metadataExportNomMappedQuery)
					let exportObejctForOrd = metadataExportObjectBuilder.ordinalMappedExportObject(data.rows)
					retrunTupleOrd.push(exportObejctForOrd)
				}
			}
		}
	}

	// Begin Document Values Aggregation
	 if(documentSupport){
		let colArrayDocument = await filterNotDocumentColumns(columns.rows)
		for(let col of colArrayDocument){
			let calculatedTupleDataForDoc = await tupleDataForDocOrNar(col, collectionName)
			let exportObjectForDoc = metadataExportObjectBuilder.documentAndNarrativeExportObject(calculatedTupleDataForDoc.metadataTuples)
			retrunTupleDoc.push(exportObjectForDoc)
		}
	}

	// Begin Narrative Values Aggregation
	if(narrativeSupport){
		let colArrayNarrative = await filterNotNarrativeColumns(columns.rows)
		for(let col of colArrayNarrative){
			let calculatedTupleDataForNar = await tupleDataForDocOrNar(col, collectionName)
			let exportObjectForNar = metadataExportObjectBuilder.documentAndNarrativeExportObject(calculatedTupleDataForNar.metadataTuples)
			retrunTupleNar.push(exportObjectForNar)
		}
	}

	// construct the final return object
	let valueBasedNomObjectValue = (retrunTupleNom) ? retrunTupleNom.reduce((acc, val) => acc.concat(val), []) : exportableStructure['valueBasedNom']
	(retrunTupleNomMapped) ? retrunTupleNomMapped.reduce((acc, val) => acc.concat(val), exportableStructure['valueBasedNom']) : exportableStructure['valueBasedNom']
	let valueBasedOrdObjectValue = (retrunTupleOrd) ? retrunTupleOrd : exportableStructure['valueBasedOrd']
	let valueBasedDocObjectValue = (retrunTupleDoc) ? retrunTupleDoc : exportableStructure['valueBasedDoc']
	let valueBasedNarObjectValue = (retrunTupleNar) ? retrunTupleNar : exportableStructure['valueBasedNar']
	
	exportableStructure['biobankSampleCollectionName'] = collectionName
	exportableStructure['dataAttributes'] = {
		rangeBased: retrunTupleQn,
		valueBasedNom: valueBasedNomObjectValue,
		valueBasedNom: valueBasedNomObjectValue,
		valueBasedOrd: valueBasedOrdObjectValue,
		valueBasedDoc: valueBasedDocObjectValue,
		valueBasedNar: valueBasedNarObjectValue,
	}
	console.log('[INFO] exportable metadata model was created')
	return exportableStructure
}

module.exports = {
	createExportableMetasSchema,
}