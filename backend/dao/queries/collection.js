const sqlstring = require('sqlstring')

let insertCollectionNameIntoDirectory = (collectionName) => {
	return sqlstring.format(`
		INSERT INTO collections_directory(collection_name) VALUES ('${collectionName.toLowerCase()}')
	`)
}

let deleteCollectionNameFromDirectory = (collectionName) => {
	return sqlstring.format(`
		DELETE FROM collections_directory WHERE collection_name = '${collectionName}'
	`)
}	

let selectCollectionNamesFromDirectory = sqlstring.format(`
	SELECT collection_name as text, id as value FROM collections_directory
`)	

let deleteFromMappingTable = (collectionName) => {
	return sqlstring.format(`
		DELETE FROM mapping_table WHERE source_collection = '${collectionName}'
	`)
}	

module.exports = {
	insertCollectionNameIntoDirectory,
	selectCollectionNamesFromDirectory,
	deleteCollectionNameFromDirectory,
	deleteFromMappingTable,
}