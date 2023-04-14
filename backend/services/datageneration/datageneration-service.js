const Pool = require('pg').Pool
const pgConnection = require('../../dao/pg-connection').pgConnection
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})

const datagenerationQueries = require('../../dao/queries/datageneration')
const loincMapperQueries = require('../../dao/queries/loinc_mapper')
const mockdata = require('./datageneration-mockdata')
const dbhelper = require('./datageneration-db-helper')

async function getVarColNamesOfTable(table) {
	if (!table || typeof table == "undefined")
		throw Error("No table name was provided")
	let query = datagenerationQueries.getRawDataColNamesVarForMock
	let colnames = await pool.query(query, [table])
	return colnames.rows
}

async function getRawDataBaseColNames() {
	let query = datagenerationQueries.getRawDataColNamesFix
	let colnames = await pool.query(query)
	return colnames.rows
}

async function getRawDataColCharacteristics(colnames) {
	let query = datagenerationQueries.getRawDataColCharacteristics
	let colCharacteristics = []
	for (colname of colnames) {
		let characteristics = await pool.query(query, [colname])
		colCharacteristics.push(characteristics.rows[0])
	}
	return colCharacteristics
}

async function generateParticipatingColumns() {
	// Retrieve columns which are going to be added with p=100% to the new schema
	let colsFix = await dbhelper.getRawDataColNamesFix()
	let participatingColumns = colsFix.map(col => col.column_name)
	
	// Retrieve columns which are going to be added with p=80% to the new schema
  	let colsVar = await dbhelper.getRawDataColNamesVar()
	for (let col of colsVar) {
		// add the participating columns of 0.8 => so with a 80% of probability the column will be added to the generated dataset
		// the reson why it is not 80% is, that probably biobanks who handle samples, have very similar procedures but not exactly the same
		let participating = (Math.random() > 0.8) ? false : true
		if (participating) {
			participatingColumns.push(col.column_name)
			participatingColumns.push(col.column_name + "_unit")
		}
	}
	return participatingColumns
}

async function createEmptyTables(count) {
	let counter = 1
	let createdTables = []
	let basePrefix = "raw_medical_data"

	while (createdTables.length < count) {
		let tableName = basePrefix + "_" + counter
		let tableNameRes = await dbhelper.getTableName(tableName)
		//tabe does not exist -> create it
		if (tableNameRes == 0) {
			await pool.query(`CREATE TABLE IF NOT EXISTS ${tableName} ();`)
			console.log("[INFO] table is created: ", tableName)
			createdTables.push(tableName)
			if (createdTables.length == count) {
				return createdTables 
			}
		} else if (tableNameRes == 1) {
			console.log("[INFO] Table already exists: " + tableName)
		}
		counter += 1
	}
}

async function alterTableAddRows(tablename, colsWithCharacteristics) {
	let colRowCont = 0
	for (cols of colsWithCharacteristics) {
		let createdQuery
		if (cols.data_type == "character varying") {
			createdQuery = `ALTER TABLE ${tablename} ADD COLUMN ${cols.column_name} ${cols.data_type}(${cols.character_maximum_length})`
		} else if (
			cols.data_type == "numeric" ||
			cols.data_type == "integer" ||
			cols.data_type == "boolean" ||
			cols.data_type == "text"
		) {
			createdQuery = `ALTER TABLE ${tablename} ADD COLUMN ${cols.column_name} ${cols.data_type}`
		}
		await pool.query(createdQuery)
		colRowCont += 1
	}
	return `All columns were added (count: ${colRowCont})`
}

//load data into the created table
async function populateDatabase(datatable, numberOfRows) {
	let tableVariableColNamesObject = await getVarColNamesOfTable(datatable)
	let tableFixColNamesObject = await getRawDataBaseColNames()
	
	let currentTableColNamesArrayVariable = tableVariableColNamesObject.map(x => x.column_name)
	let currentTableColNamesArrayFix = tableFixColNamesObject.map(x => x.column_name)
	
	let unitonTableColNames = currentTableColNamesArrayFix.concat(currentTableColNamesArrayVariable)

	let mockdataVarCols = await mockdata.getGenereatedMockValuesForVarCols(numberOfRows)
	let mockdataFixCols = await mockdata.getGenereatedMockValuesForFixCols(numberOfRows)

	if (mockdataVarCols && mockdataVarCols.createdMockRow && mockdataVarCols.createdMockRow.length > 0) {
		let mockDataProperties = Object.getOwnPropertyNames(mockdataVarCols.createdMockRow[0])
		let mockDataFixProperties = Object.getOwnPropertyNames(mockdataFixCols.createdMockRow[0])

		mockDataProperties = mockDataFixProperties.concat(mockDataProperties)
		//iterate through the genereated rows
		for (let i = 0; i < mockdataVarCols.createdMockRow.length; i++) {
		let union = {...mockdataFixCols.createdMockRow[i], ...mockdataVarCols.createdMockRow[i]}
				
			//create the insert row for SQL
			let insertVals = [];
			for (let t = 0; t < unitonTableColNames.length; t++) {
				for (let m = 0; m < mockDataProperties.length; m++) {
				if (mockDataProperties[m] == unitonTableColNames[t]) {
					var key = mockDataProperties[m];
					if (union[key] == null) {
					insertVals.push(`NULL`);
					} else if (typeof union[key] == "string") {
					insertVals.push(`'${union[key]}'`);
					} else {
					insertVals.push(union[key]);
					}
				}
				}
			}

		//create insert row
		let insertQuery = `INSERT INTO ${datatable} (${unitonTableColNames.join(" ,")}) VALUES (${insertVals.join(" ,")});`;
				
		//insert the created row into the database
		await pool.query(insertQuery) 
		}
	}
	return
}

async function createDatasets(numberOfDatasets, numberOfRows) {
    try {
		let createdTables = await createEmptyTables(numberOfDatasets)
		if (!createdTables || createdTables.length == 0)
			throw new Error('No table name was emitted after creation or table was not created.')
		
		for (let i = 0; i < createdTables.length; i++) {
			let paricipatingColumns = await generateParticipatingColumns(createdTables[i])
			console.log("[INFO] Participating columns were defined")
			
			let rawDataCharacterictics = await getRawDataColCharacteristics(paricipatingColumns)
			console.log("[INFO] Data charateristicts were retrieved")
			
			// Add created at for timeliness support
			//rawDataCharacterictics.push({column_name: "created_at",data_type: "timestamp",character_maximum_length: null})
			
			await alterTableAddRows(createdTables[i], rawDataCharacterictics)
			console.log("[INFO] Table rows were added to the table")
		
			await populateDatabase(createdTables[i], numberOfRows)
			console.log("[INFO] Table was populated with generated test dataset")

			await addRandomUpdatedAtColToDatasets(createdTables[i])
			console.log('[INFO] Randomized updated_at timestamp was added to the dataset')

			return {
				message: `Dataset(s) are created: ${createdTables.join(', ')} with ${numberOfRows} rows`,
				createdCollection: createdTables,
			}
		}
	} catch (error) {
		throw new Error(error)
	}
}

async function addRandomUpdatedAtColToDatasets(tableName) {
	let query = datagenerationQueries.alterTableAddUpdatedAtAndFillRandomly(tableName)
	let alterTableRes = await pool.query(query) 
	return alterTableRes
} 

async function fillMappingTableForDemoData(tableName) {
	let query = loincMapperQueries.insertIntoMappingTableForGeneratedData(tableName)
	let mappingDataQuery = await pool.query(query) 
	return mappingDataQuery
} 

module.exports = {
	createDatasets,
	fillMappingTableForDemoData,
}
