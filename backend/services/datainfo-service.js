const sqlstring = require('sqlstring')
const Pool = require('pg').Pool
const pgConnection = require('../dao/pg-connection.js').pgConnection
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})
const datainfoQueries = require('../dao/queries/datainfo')
const collectionQueries = require('../dao/queries/collection')

const getTableNames = async() => {
	// returns an array of the collection's names (uploaded or generated)
	let query = collectionQueries.selectCollectionNamesFromDirectory
	let resCollections = await pool.query(query)
	let collectionNames = resCollections.rows.map(collection => collection.text)
	return collectionNames
}

const deleteAllCreatedDataTable = async() => {
	let query = collectionQueries.selectCollectionNamesFromDirectory
	let resCollections = await pool.query(query)
	let collections = resCollections.rows.map(collection => collection.text)
	// itarate throught the list and drop each table from the DB and from the collection directory
	for(let collection of collections){
		let deleteQuery = datainfoQueries.dropTable(collection)
		await pool.query(deleteQuery)
		let deleteFromDirectoryQuery = collectionQueries.deleteCollectionNameFromDirectory(collection)
		await pool.query(deleteFromDirectoryQuery)
		let deleteFromMapping = collectionQueries.deleteFromMappingTable(collection)
		await pool.query(deleteFromMapping)
	}
	let message = `The following tables were deleted: ${collections.join(', ')}`
	console.log('[INFO] ' + message)
	return({'message': message})
}

const deleteCreatedDataTable = async(collectionName) => {
	let message = ''
	try {
		let deleteQuery = datainfoQueries.dropTable(collectionName)
		await pool.query(deleteQuery)
		message += `Colection ${collectionName}'s data was dropped.`
	} catch (error) {
		console.log(error)
		message += `${error.message}`
	}

	try {
		let deleteFromDirectoryQuery = collectionQueries.deleteCollectionNameFromDirectory(collectionName)
		await pool.query(deleteFromDirectoryQuery)
		message += `\nColection ${collectionName} was deleted from the collection directory.`
	} catch (error) {
		console.log(error)
		message += `\n${error.message}`
	}

	try {
		let deleteFromMapping = collectionQueries.deleteFromMappingTable(collectionName)
		await pool.query(deleteFromMapping)
		message += `\nMapping entries for ${collectionName} were deleted.`
	} catch (error) {
		console.log(error)
		message += `\n${error.message}`
	}
	console.log('[INFO] ' + message)
	return({'message': message})
}

module.exports = {
	getTableNames, 
	deleteAllCreatedDataTable,
	deleteCreatedDataTable,
}