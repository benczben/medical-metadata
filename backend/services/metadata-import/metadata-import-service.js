const Pool = require('pg').Pool
const pgConnection = require('../../dao/pg-connection.js').pgConnection
const pool = new Pool({
	host: pgConnection.host,
	port: pgConnection.port,
	user: pgConnection.user,
	password: pgConnection.password,
	database: pgConnection.database,
})
const fs = require('fs')

const metadataImportQueries = require('../../dao/queries/metadata-import')
const metadataQueries = require('../../dao/queries/metadata')
const loincService = require('../loinc-service')
const mappingService = require('../loinc-mapping-service')

const writeEntriesIntoMappingTableIfNewLoincForCollection = async(loincCode, collectionName) => {
	let collections = await loincService.relatedCollectionsBasenOnMapping(loincCode)
	collections = collections.map(collection => collection.source_collection)
	if(!collections.includes(collectionName)){
		let loincTerms = await loincService.getLoincFsn(loincCode)
		try {
			await mappingService.inertIntoMappingTable('FROM_IMPORT', loincCode, loincTerms.SCALE_TYP.toUpperCase(), collectionName)
		} catch (error) {
			console.log("This error is only prompted, code exeutes further on: " + error)
		}
	}
}

const loadQnValues = async(object, collectionName) => {
	let query = metadataImportQueries.insertIntoMatadataAggregationValuesQn
	let insertedCount = 0
	for(let item of object){
		// check if the mapping table already contains the loinc code for the collection, if not: fetch from fhir api and insert
		// it's suffiecient to check only once per tuple because tuples are homogenous
		await writeEntriesIntoMappingTableIfNewLoincForCollection(item[0].loincCode, collectionName)
		
		// iterate through the tuples and import their contained data 
		for(let tuple of item){
			let res = await pool.query(query, [
				tuple.meanValue,
				collectionName,
				tuple.loincCode,
				'JSON_IMPORT',
				tuple.dataItemCount,
				tuple.nullValuesCount,
				tuple.valueUnit,
				tuple.minValue,
				tuple.maxValue,
				tuple.meanValue,
				tuple.medianValue,
				tuple.minUpdatedAt,
				tuple.maxUpdatedAt,
				tuple.meanUpdatedAt,
				tuple.medianUpdatedAt,
				tuple.metaDataCreatedAt,
				tuple.tupleAccuracy
			])
			if(res && res.rowCount) insertedCount += Number(res.rowCount)
		}
	}
	return insertedCount
}

const loadNomValues = async(object, collectionName) => {
	let query = metadataImportQueries.insertIntoMatadataAggregationValuesNom
	let insertedCount = 0
	let nullCountOfTuple = null
	for(let tuple of object){
		// check if the mapping table already contains the loinc code for the collection, if not: fetch from fhir api and insert
		await writeEntriesIntoMappingTableIfNewLoincForCollection(tuple.loincCode, collectionName)
		
		if(tuple.value == null) {
			nullCountOfTuple = tuple.dataItemCount

		}
		else nullCountOfTuple = null

		let res = await pool.query(query, [
			collectionName,
			tuple.loincCode,
			'JSON_IMPORT',
			tuple.value,
			tuple.dataItemCount,
			nullCountOfTuple,
			tuple.minUpdatedAt,
			tuple.maxUpdatedAt,
			tuple.meanUpdatedAt,
			tuple.medianUpdatedAt,
			tuple.metaDataCreatedAt,
			tuple.tupleAccuracy
		])
		if(!tuple.initNom){
			// insert into ordinal_order table a NOM row to override the initial LOINC scaling for later search
			let insertValues = `('${collectionName}', '${tuple.loincCode}', '', '', 'NOM')`
			let insertOrdinalOrderStatement = metadataQueries.insertIntoOrdinalOrder
			let queryPrep = insertOrdinalOrderStatement.replace(/\$1/g, insertValues)
			await pool.query(queryPrep)
		}
		if(res && res.rowCount) insertedCount += Number(res.rowCount)
	}
	return insertedCount
}

const loadOrdValues = async(object, collectionName) => {
	let queryMetadata = metadataImportQueries.insertIntoMatadataAggregationValuesOrd
	let insertOrdinalOrderStatement = metadataQueries.insertIntoOrdinalOrder
	let insertedCount = 0
	for(let item of object){
		// check if the mapping table already contains the loinc code for the collection, if not: fetch from fhir api and insert
		// it's suffiecient to check only once per tuple because tuples are homogenous
		await writeEntriesIntoMappingTableIfNewLoincForCollection(item[0].loincCode, collectionName)
		
		// iterate through the tuples and import their contained data 
		for(let tuple of item){
			let res = await pool.query(queryMetadata, [
				collectionName,
				tuple.loincCode,
				'JSON_IMPORT',
				tuple.value,
				0,
				tuple.dataItemCount,
				tuple.minUpdatedAt,
				tuple.maxUpdatedAt,
				tuple.meanUpdatedAt,
				tuple.medianUpdatedAt,
				tuple.metaDataCreatedAt,
				tuple.tupleAccuracy,
			])
			
			// insert into ordinal_order table
			let insertValues = `('${collectionName}', '${tuple.loincCode}', '', '${tuple.valueSetValue}', 'ORD')`
			let queryPrep = insertOrdinalOrderStatement.replace(/\$1/g, insertValues)
			await pool.query(queryPrep)

			if(res && res.rowCount) insertedCount += Number(res.rowCount)
		}
	}
	return insertedCount
}

const loadDocOrNarValues = async(object, collectionName) => {
	let query = metadataImportQueries.insertIntoMatadataAggregationValuesDocOrNar
	let insertedCount = 0
	for(let item of object){
		// check if the mapping table already contains the loinc code for the collection, if not: fetch from fhir api and insert
		// it's suffiecient to check only once per tuple because tuples are homogenous
		await writeEntriesIntoMappingTableIfNewLoincForCollection(item[0].loincCode, collectionName)
		let nullCountOfTuple = null
		// iterate through the tuples
		for(let tuple of item){
			if(tuple.dataAvailable == '1' || tuple.dataAvailable == 1 || tuple.dataAvailable == true ){
				tuple.dataAvailable = 'exists'
				nullCountOfTuple = null
			}
			else if(tuple.dataAvailable == '0' || tuple.dataAvailable == 0 || tuple.dataAvailable == false){
				tuple.dataAvailable = 'notExists'
				nullCountOfTuple = tuple.dataItemCount
			} else {
				continue
			}

			let res = await pool.query(query, [
				collectionName,
				tuple.loincCode,
				tuple.dataAvailable, 
				tuple.dataItemCount,
				nullCountOfTuple,
				'JSON_IMPORT',
				tuple.minUpdatedAt,
				tuple.maxUpdatedAt,
				tuple.meanUpdatedAt,
				tuple.medianUpdatedAt,
				tuple.metaDataCreatedAt,
				tuple.tupleAccuracy,
			])
			if(res && res.rowCount) insertedCount += Number(res.rowCount)
		}
	}
	return insertedCount
}

const loadMetadata = async (metadataPath) => {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(metadataPath, 'utf8' , async(err, content) => {
				if(err) reject(err)
				let parsedObject = JSON.parse(content)
				let inserted = 0

				// Quantitative
				if(parsedObject.dataAttributes.rangeBased){
					let resQn = await loadQnValues(parsedObject.dataAttributes.rangeBased, parsedObject.biobankSampleCollectionName)
					if(resQn && typeof(resQn) == 'number') inserted += resQn
				}
				
				// Nominal
				if(parsedObject.dataAttributes.valueBasedNom){
					let resNom = await loadNomValues(parsedObject.dataAttributes.valueBasedNom, parsedObject.biobankSampleCollectionName)
					if(resNom && typeof(resNom) == 'number') inserted += resNom
				}
				
				// Ordinal
				if(parsedObject.dataAttributes.valueBasedOrd){
					let resOrd = await loadOrdValues(parsedObject.dataAttributes.valueBasedOrd, parsedObject.biobankSampleCollectionName)
					if(resOrd && typeof(resOrd) == 'number') inserted += resOrd
				}
					
				// Document
				if(parsedObject.dataAttributes.valueBasedDoc){
					let resDoc = await loadDocOrNarValues(parsedObject.dataAttributes.valueBasedDoc, parsedObject.biobankSampleCollectionName)
					if(resDoc && typeof(resDoc) == 'number') inserted += resDoc
				}

				// Narrative
				if(parsedObject.dataAttributes.valueBasedNar){
					let resNom = await loadDocOrNarValues(parsedObject.dataAttributes.valueBasedNar, parsedObject.biobankSampleCollectionName)
					if(resNom && typeof(resNom) == 'number') inserted += resNom
				}
				
				resolve({
					inserted: inserted,
					collectionName: parsedObject.biobankSampleCollectionName
				})
			})
		} catch (error) {
			reject(error)
		}
	})
}

module.exports = {
	loadMetadata,
}