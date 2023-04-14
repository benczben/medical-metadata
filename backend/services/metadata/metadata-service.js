const Pool = require('pg').Pool;
const pgConnection = require('../../dao/pg-connection.js').pgConnection;
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})
const metadataQueries = require('../../dao/queries/metadata')
const datainfoQueries = require('../../dao/queries/datainfo')
const dataGenerationQueries = require('../../dao/queries/datageneration')
const metadataHelper = require('./metadata-helper')

let createMetadataAggregationTable = async() => {
	let query = metadataQueries.createMetadataAggregationTable
	let tableData = await pool.query(query)
	return 'Table created'
}

let deleteMetadataAggregationTable = async (collectionName) => {
	let querySelectIfExists  = `SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'metadata_aggregation'`
	let resSelect = await pool.query(querySelectIfExists)
	if(resSelect && resSelect.rows.length > 0){
		let query  = `DELETE FROM metadata_aggregation WHERE source_database = '${collectionName}'`  
		let resAfterDelete = await pool.query(query)
		return `Deleted meta data for ${collectionName} - rows: ${resAfterDelete.rowCount} `
	} else {
		return `No aggregation was made yet, nothing to delete.`
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
	let cols = await getAllColumnsOfTableForValueScaling('nom', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotOrdinalColumns = async (columns) => {
	let cols = await getAllColumnsOfTableForValueScaling('ord', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotDocumentColumns = async (columns) => {
	let cols = await getAllColumnsOfTableForValueScaling('doc', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let filterNotNarrativeColumns = async (columns) => {
	let cols = await getAllColumnsOfTableForValueScaling('nar', columns[0].table_name)
	cols = cols.map(col => col.column_name)
	return cols
}

let calculateAccuracyLevelForOrdinalColumn = async (column, dataTableName, desiredAccuracy) => {
	let rowCountFromTableQuery = metadataQueries.rowCountFromTable.replace(/\$1/g, dataTableName)
	let rowCountResponse = await pool.query(rowCountFromTableQuery)
	let rowCountAllRows = rowCountResponse.rows[0].count

	let nullCountFromTableQuery = metadataQueries.getNullCountFromTable.replace(/\$1/g, dataTableName).replace(/\$2/g, column)
	let nullCountResponse = await pool.query(nullCountFromTableQuery)
	let nullCountForDataAttribute = nullCountResponse.rows[0].count

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
	let accuracyGuesser

	while(!desiredAccuracyMet){
		accuracyRunnerVariable++
		let accuracyQuery = metadataQueries.accuracyCalculatorMetadataAggregationTable
		let accuracyQueryPrep = accuracyQuery.replace(/\$1/g, column).replace('$2', accuracyRunnerVariable).replace(/\$3/g, dataTableName)
		accuracyGuesser = await pool.query(accuracyQueryPrep)
		if(accuracyGuesser.rowCount/rowCountAllRows*100 >= desiredAccuracyLowerLimit){
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
		rowCountAllRows: rowCountAllRows,
		aggregateRowCount: accuracyGuesser.rowCount,
		calculatedAccuracy: accuracyRunnerVariable,
		nullCount: nullCountForDataAttribute,
		appliedAccuracyGroup: appieldAccuracyGroup,
	}
}

let insertIntoMetadataAggregationTable = async (collectionName, desiredAccuracy, ordinalAsNominalFlag, documentSupport, narrativeSupport, nominalMappingConsidered, ordinalMapperObject) => {
	// NOTE: plan way to call the fhir api to find out the scaling of the value (and not from DB) --> call from the DB is OK, because eg. ORD can be treated as NOM on meta level
	// NOTE: ranges vary strongly so there is no way this can be coded the same for every col
	// NOTE: ordinalAsNominalFlag means if it is checked then the ordinal values are treated as nominal values without a comparison possibility
	await createMetadataAggregationTable()
	let rowCountsMessage = '';

	let columnsQuery = dataGenerationQueries.getColNamesOfTable
	let rowCountQuery = await metadataQueries.rowCountMetadataAggregationTableNames
	let columns = await pool.query(columnsQuery, [collectionName])

	//Begin Quantitative Values Aggregation
	let colArray = await filterOutNotNumberColumns(columns.rows)
	let rowcountAll = 0

	for(let col of colArray){
		let accuracyOfColumn = await calculateAccuracyLevelForOrdinalColumn(col, collectionName, desiredAccuracy)
		let queryBase = metadataQueries.populateMetadataAggregationTableQn
		let queryPrep = queryBase
			.replace(/\$1/g, col)
			.replace(/\$2/g, accuracyOfColumn.calculatedAccuracy)
			.replace(/\$3/g, collectionName)
			.replace(/\$4/g, accuracyOfColumn.appliedAccuracyGroup)
        let data = await pool.query(queryPrep)
		rowcountAll += data.rowCount
	}

	//Begin Nominal Values Aggregation
	if(!nominalMappingConsidered){
		let colArrayNominal = await filterNotNominalColumns(columns.rows)
		for(let col of colArrayNominal){
			let queryBase = metadataQueries.populateMetadataAggregationTableNominal
			let queryPrep = queryBase.replace(/\$1/g, col).replace(/\$3/g, collectionName)
			let data = await pool.query(queryPrep)
			rowcountAll += data.rowCount
		}
	}

	//Begin Ordinal Values Aggregation
	let colArrayOrdinal = await filterNotOrdinalColumns(columns.rows)

	if(!ordinalAsNominalFlag){
		for(let col of colArrayOrdinal){
			let queryBase = metadataQueries.populateMetadataAggregationTableNominal
			let queryPrep = queryBase.replace(/\$1/g, col).replace(/\$3/g, collectionName)
			let data = await pool.query(queryPrep)
			rowcountAll += data.rowCount
		}
		rowCountsMessage += 'Ordinal scaled values handled as nominal.\n'
	}
	// Begin Document Values Aggregation
	if(documentSupport){
		let colArrayDocument = await filterNotDocumentColumns(columns.rows)
		for(let col of colArrayDocument){
			let queryBase = metadataQueries.populateMetadataAggregationTableDocument
			let queryPrep = queryBase.replace(/\$1/g, col).replace(/\$2/g, collectionName)
			let data = await pool.query(queryPrep)
			rowcountAll += data.rowCount
		}
	}

	// Begin Narrative Values Aggregation
	if(narrativeSupport){
		let colArrayNarrative = await filterNotNarrativeColumns(columns.rows)
		for(let col of colArrayNarrative){
			let queryBase = metadataQueries.populateMetadataAggregationTableNarrative
			let queryPrep = queryBase.replace(/\$1/g, col).replace(/\$2/g, collectionName)
			let data = await pool.query(queryPrep)
			rowcountAll += data.rowCount
		}
	}

	let rowCountAfter = await pool.query(rowCountQuery)
	rowCountsMessage += `Data inserted from ${collectionName}. ${rowcountAll} new rows, overall rows in the model ${rowCountAfter.rows[0].count}\n`

	console.log('[INFO] metadata model was created for one dimension support')
	return rowCountsMessage
}

let getAllColumnsForValueScaling = async (scaling) => {
	let scalingLocal = scaling.toUpperCase()
	let queryBase = metadataQueries.getAllColumnsForValueScaling
	let queryPrep = queryBase.replace(/\$1/g, scalingLocal)
	let data = await pool.query(queryPrep)
	return data.rows
}

let getGeneratedTableNames = async () => {
	let queryBase = datainfoQueries.getOnlyGeneratedDataTableNames
	let data = await pool.query(queryBase)
	return data.rows
}

let getAllColumnsOfTableForValueScaling = async (scaling, tablename) => {
	let scalingLocal = scaling.toUpperCase()
	let queryBase = metadataQueries.getAllColumnsOfTableForValueScaling
	let queryPrep = queryBase.replace(/\$1/g, scalingLocal).replace(/\$2/g, tablename)
	let data = await pool.query(queryPrep)
	return data.rows
}

let getDistictValuesForTablesColumn = async (tablename, columnname) => {
	let queryBase = metadataQueries.getDistictValuesForTablesColumn
	let queryPrep = queryBase.replace(/\$1/g, tablename).replace(/\$2/g, columnname)
	let data = await pool.query(queryPrep)
	return data.rows
}

let insertOrdinalOrder = async(ordinalMapperObject, ordinalDifferentThanNominal, dataTableName) => {
	try {
		let ordinalOrNominalHandling = (ordinalDifferentThanNominal) ? 'ORD' : 'NOM'
		let createOrdinalOrderTableQuery = metadataQueries.createOrdinalOrderTable
		let deletedValues
		let data
		let instertedresponse
		await pool.query(createOrdinalOrderTableQuery)
		if(ordinalOrNominalHandling == 'ORD'){
			instertedresponse = await insertOrdinalMapped(ordinalMapperObject, dataTableName)
			let preppedInsertValues = await metadataHelper.prepOrdinalForInsert(ordinalMapperObject, ordinalDifferentThanNominal, ordinalOrNominalHandling)
			let insertValuesForStatement = preppedInsertValues.join(', ')
			let queryPrep = metadataQueries.insertIntoOrdinalOrder.replace(/\$1/g, insertValuesForStatement)
			data = await pool.query(queryPrep)
		} else if (ordinalOrNominalHandling == 'NOM'){
			// if no ordinal order was submitted, then write one row into the ordinal_order table,
			// which indicates for every source table and ord scaled col, that it should be treated as nom
			let resultOrdCols = await getAllColumnsOfTableForValueScaling('ORD', dataTableName)
			for(let ordCol of resultOrdCols){
				let insertValues = `('${dataTableName}', '${ordCol.maps_to_loinc}', '', '', 'NOM')`
				let queryPrep = metadataQueries.insertIntoOrdinalOrder.replace(/\$1/g, insertValues)
				data = await pool.query(queryPrep)
				instertedresponse += `Column: ${ordCol.column_name} from data source: ${dataTableName} was inserting ${data.rowCount} rows into the model.\n`
			}
		} else {
			throw new Error('init ORD scaled column is no nom or ord')
		}
		return {
			deleted: deletedValues,
			inserted: instertedresponse,
			ordinalValuesHandledAs: ordinalOrNominalHandling
		}
	} catch (error) {
		console.log('ERROR ' + error)
		throw new Error(error)   
	}   
}

let deleteOrdinalOrderForColellection = async(collectionName) => {
	let deleteAllFromOrdinalOrder = metadataQueries.deleteAllFromOrdinalOrder
	let data = await pool.query(deleteAllFromOrdinalOrder, [collectionName])
	if(data.rowCount > 0){
		return `deleted all entries from ordinal_order for the collection ${collectionName}`
	} else {
		return `ordinal_order was empty for the ${collectionName}, nothing to delete`
	}
}

let insertNewNomninalValueForMapping = async(newValue, loincCode) => {
	// create table for nominal values if it does not exist yet
	let createNominalValueHolderTableQuery = metadataQueries.createNominalMapValueHolder
	await pool.query(createNominalValueHolderTableQuery)

	let insertQuery = metadataQueries.insertNewNomninalValueForMapping
	let dataInsert = await pool.query(insertQuery, [newValue, loincCode])
	if(dataInsert.rowCount > 0){
		return `${newValue} was inserted into the value table`
	} else {
		return `${newValue} exists already`
	}
}

let selectNomninalValueListForMapping = async(loincCode) => {
	let selectQueryPrepped = metadataQueries.selectNominalMapValueHolder.replace(/\$1/g, loincCode)
	let res = await pool.query(selectQueryPrepped)
	return res.rows
}

let deleteNomninalValueListForMapping = async(loincCode, nominalValue) => {
	//let deleteQueryPrepped = metadataQueries.deleteNominalMapValueHolder.replace(/\$1/g, loincCode)
	let res = await pool.query(metadataQueries.deleteNominalMapValueHolder, [loincCode, nominalValue])
	return res.rows
}

let insertOrdinalMapped = async(ordinalMappedObject, dataTableName) => {
	if(!ordinalMappedObject) throw new Error('ordinalMappedObject is required in insertOrdinalMapped()')
	let sqlCaseWhenRows = ''
	let columnName = ''
	let resString = []

	for (let [db, dbBranch] of Object.entries(ordinalMappedObject)) {
		if(db == dataTableName){        
			for (let [loinc, mappedValues] of Object.entries(dbBranch)) {
				// get the column name for the loinc number
				let selectQueryPrepped = metadataQueries.getColumnNameForLoincAndDataSource.replace(/\$1/g, loinc).replace(/\$2/g, db)
				let columnNameRes = await pool.query(selectQueryPrepped)
				columnName = columnNameRes.rows[0].source_column
				// construct the query
				sqlCaseWhenRows = '(CASE '
				for (let valueOfRow of mappedValues) {
					sqlCaseWhenRows += ` WHEN rmd.${columnName} = '${valueOfRow.aggregateValue}' THEN '${valueOfRow.selectedValue}' `
				}
				sqlCaseWhenRows += ` ELSE rmd.${columnName} ` 
				sqlCaseWhenRows += ` END) as aggregate_value, `
				let query = `
				INSERT INTO metadata_aggregation (
					aggregate_value,
					source_database,
					loinc_code,
					column_name,
					occurance_count,
					tuple_accuracy
					) 
				SELECT 
					${sqlCaseWhenRows}
					'${db}' as source_database,
					MAX(mt.maps_to_loinc) as loinc_code,
					MAX(mt.source_column) as column_name,
					count(1) as occurance_count,
					'medium' as tuple_accuracy
				FROM ${db} rmd
				LEFT JOIN mapping_table mt ON
					mt.source_column = '${columnName}'
				WHERE
					mt.source_column IS NOT NULL
				GROUP BY 1
				ORDER BY 1;`
				let data = await pool.query(query)
				resString += `${data.rowCount} ordinal rows were inserted from ${db}.\n`
			}
		}
	}
	return resString;
}


let insertNominalMapped = async(nomnialMappedObject) => {
	let sqlCaseWhenRows = ''
	let columnName = ''
	let resString = []

	for (let [db, dbBranch] of Object.entries(nomnialMappedObject)) {
		for (let [loinc, mappedValues] of Object.entries(dbBranch)) {
			// get the column name for the loinc number
			let selectQueryPrepped = metadataQueries.getColumnNameForLoincAndDataSource.replace(/\$1/g, loinc).replace(/\$2/g, db)
			let columnNameRes = await pool.query(selectQueryPrepped)
			columnName = columnNameRes.rows[0].source_column
			// construct the query
			sqlCaseWhenRows = '(CASE '
			for (let valueOfRow of mappedValues) {
				sqlCaseWhenRows += ` WHEN rmd.${columnName} = '${valueOfRow.aggregateValue}' THEN '${valueOfRow.selectedValue}' `
			}
			sqlCaseWhenRows += ` ELSE rmd.${columnName} ` 
			sqlCaseWhenRows += ` END) as aggregate_value, `
			let query = `
			INSERT INTO metadata_aggregation (
				aggregate_value,
				source_database,
				loinc_code,
				column_name,
				occurance_count,
				tuple_accuracy
				) 
			SELECT 
				${sqlCaseWhenRows}
				'${db}' as source_database,
				MAX(mt.maps_to_loinc) as loinc_code,
				MAX(mt.source_column) as column_name,
				count(1) as occurance_count,
				'medium'
			FROM ${db} rmd
			LEFT JOIN mapping_table mt ON
				mt.source_column = '${columnName}'
			WHERE
				mt.source_column IS NOT NULL
			GROUP BY 1
			ORDER BY 1;`
			let data = await pool.query(query)
			resString.push(`${data.rowCount} nominal rows were inserted from ${db} `)
			
		}
	}
	return resString
}

let getOridnalValueSetsForLoinc = async(loincCode) => {
	let res = await pool.query(metadataQueries.getOridnalValueSetsForLoinc, [loincCode])
	return res.rows
}

let getOridnalValueSetValues = async(loincCode, valueSetName) => {
	let res = await pool.query(metadataQueries.getOridnalValueSetValues, [loincCode, valueSetName])
	return res.rows
}

let updateOridnalValueSetValues = async(ordidnalValueSetValues) => {
	let resRowCountFromUpdates = new Number
	for (let value of Object.values(ordidnalValueSetValues)){
		let res = await pool.query(metadataQueries.updateOridnalValueSetValues, [value.loinc_code, value.value_set_name, value.value_set_value, value.new_sequence_number])
		resRowCountFromUpdates += res.rowCount
	}
	return resRowCountFromUpdates
}

module.exports = {
    deleteMetadataAggregationTable,
    insertIntoMetadataAggregationTable,
    createMetadataAggregationTable,
    getAllColumnsOfTableForValueScaling,
    getGeneratedTableNames,
    getDistictValuesForTablesColumn,
    insertOrdinalOrder,
    deleteOrdinalOrderForColellection,
    insertNewNomninalValueForMapping,
    selectNomninalValueListForMapping,
    deleteNomninalValueListForMapping,
    insertNominalMapped,
    getOridnalValueSetsForLoinc,
    getOridnalValueSetValues,
    updateOridnalValueSetValues,
    insertOrdinalMapped,
}