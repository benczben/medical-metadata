const Pool = require('pg').Pool
const pgConnection = require('../dao/pg-connection.js').pgConnection
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})
const dataConetentHelper = require('../helpers/data-content-reader')
const fs = require('fs')
const collectionQueries = require('../dao/queries/collection')
const loincMappingQueries = require('../dao/queries/loinc_mapper')
const dataInfoQueries = require('../dao/queries/datainfo')
const loincService = require('./loinc-service')

const getCollectionColumnsFromFile = async (pathToFile) => {
	let columns = await dataConetentHelper.getFirstLine(pathToFile)
	columns = columns.split('\t')
	return columns
}

const renameFile = async(oldapath, newName) => {
	return new Promise((resolve, reject) => {
		try {
			let newPath = oldapath.split('/')
			let pathLength = newPath.length
			newPath[pathLength-1] = newName + '.tsv'
			newPath = newPath.join('/')
			fs.rename(oldapath, newPath, () => {
				resolve(newPath)
			})
		} catch (error) {
			reject(error)
		}
	})
}

const createSchema = async(pathToSchema, columns, collectionName) => {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(pathToSchema, 'utf8' , async(err, schema) => {
				try {
					if (err) throw new Error('Schema file could not be read')
					console.log(schema)
					schema = schema.split('\n')
					// drop table if exits
					let dropTable = `DROP TABLE IF EXISTS ${collectionName} `
					await pool.query(dropTable)
					// create the empty table
					let baseTableCreation = `CREATE TABLE ${collectionName} ()`
						await pool.query(baseTableCreation)
					// add columns to the table
					let addColumnsToTableBase = `ALTER TABLE ${collectionName} ADD COLUMN $1 $2`
					let datatype = ''
					for(const [index, column] of columns.entries()){
						switch (schema[index]) {
							case "string": datatype = 'text'
								break;
							case "integer": datatype = 'integer'
								break;
							case "double": datatype = 'double precision'
								break;
							case "timestamp": datatype = 'timestamp'
								break;
							default:
								break;
						}
						// add columns to the table
						let query = await addColumnsToTableBase.replace(/\$1/g, column).replace(/\$2/g, datatype)
						try {
							await pool.query(query)
						} catch (error) {
							throw new Error(error.message)
						}
					}
					resolve('table created')
				} catch (error) {
					reject(error)	
				}
			})
		} catch (error) {
			reject(error)
		}
	})
}

const insertData = async (pathToData, columns, collectionName) => {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(pathToData, 'utf8' , async(err, dataitems) => {
				try {
					rows = dataitems.split('\n')
					let insertColumns = []
					
					for(const [index, row] of rows.entries()){
						if(index == 0){
							insertColumns = row.split('\t')
						}
					} 
					// path in the postgres contianer /tmp/data/uploads/collections
					// the folder structure if th euploads is mounted to the postgres container, so it has a direct access to it and that is the reason why the the path must be modified
					let pathArray = pathToData.split('/')
					let filename = pathArray[pathArray.length-1]
					let copyStatement = `COPY ${collectionName} (${insertColumns.join(',')}) FROM '/tmp/data/uploads/collections/${filename}' WITH DELIMITER E'\t' NULL AS '\\N' CSV HEADER`
					await pool.query(copyStatement)
					resolve(dataitems)
				} catch (error) {
					reject(error)
				}
			})
		} catch (error) {
			reject(error)
		}
	})
}

const loadLoincMapping = async (pathToData, collectionName) => {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(pathToData, 'utf8' , async(err, dataitems) => {
				try {
					// path in the postgres contianer /tmp/data/uploads/collections
					// the folder structure if the uploads is mounted to the postgres container, so it has a direct access to it and that is the reason why the the path must be modified
					const pathArray = pathToData.split('/')
					const filename = pathArray[pathArray.length-1]

					// step 1: create the temp table for mapping
					const createTempTableStatement = loincMappingQueries.createTempMappingTable
					await pool.query(createTempTableStatement)
					// step 2: load the data into the temp table
					const copyStatement = loincMappingQueries.copyIntoStatement(filename)
					await pool.query(copyStatement)
					// step 3: select all the loaded data form the temp table
					const selectFromTempTable = loincMappingQueries.selectAllTempMappingEntries(collectionName)
					let tempMapingEntries = await pool.query(selectFromTempTable)
					// step 4 and 5: read the scaling for the loinc code from the fhir api and load the scaling into the temp table
					let updateScalingInTempTable = ''
					for(let loincCode of tempMapingEntries.rows.map(row => row.loinc_code)){
						let loincTerms = await loincService.getLoincFsn(loincCode)
						updateScalingInTempTable = loincMappingQueries.updateScalingInTempTable(loincCode, loincTerms.SCALE_TYP)
						// write the scaling of the loinc code to the temp table
						await pool.query(updateScalingInTempTable)
					}
					// step 6: load the mapping data from temp into the final mapping table
					const insertStatement = loincMappingQueries.insertIntoMappingTable(collectionName)
					await pool.query(insertStatement)
					// step 7: drop the temp mapping table
					const dropStatment = dataInfoQueries.dropTable('temp_mapping')
					await pool.query(dropStatment)

					resolve(dataitems)
				} catch (error) {
					reject(error)
				}
			})
		} catch (error) {
			reject(error)
		}
	})
}

const loadCollectionIntoDb = async(pathToData, pathToSchema, collectionName) => {
	let columns = await getCollectionColumnsFromFile(pathToData)
	await createSchema(pathToSchema, columns, collectionName)
	await insertData(pathToData, columns, collectionName)
	return
}

const loadCollectionNameToDirectory = async(collectionName) => {
	let insertCollectionNameQuery = collectionQueries.insertCollectionNameIntoDirectory(collectionName)
	let res = await pool.query(insertCollectionNameQuery)
	return res.rowCount
}

const selectCollectionNamesFromDirectory = async() => {
	let selectCollectionNameQuery = collectionQueries.selectCollectionNamesFromDirectory
	let res = await pool.query(selectCollectionNameQuery)
	return res.rows
}
const deleteCollectionNamesFromDirectory = async(collectionName) => {
	let selectCollectionNameQuery = collectionQueries.deleteCollectionNameFromDirectory(collectionName)
	let res = await pool.query(selectCollectionNameQuery)
	return res.rowCount
}

module.exports = {
	getCollectionColumnsFromFile,
	renameFile,
	loadCollectionIntoDb,
	loadCollectionNameToDirectory,
	selectCollectionNamesFromDirectory,
	deleteCollectionNamesFromDirectory,
	loadLoincMapping,
}