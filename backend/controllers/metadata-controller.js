const router = require("express").Router()
const metadataService = require("../services/metadata/metadata-service")
const metadataExportService = require("../services/metadata-export/metadata-export-service")
const metadataImportService = require("../services/metadata-import/metadata-import-service")
const collectionService = require("../services/collection-service")
const loincService = require('../services/loinc-service')
const multer  = require('multer')
const upload = multer({ dest: './uploads/metadata' })

router.put("/metadimension", async function (req, res) {
	try {
		const accuracySupport = req.body.accuracySupport
		const ordinalDifferentThanNominal = req.body.ordinalAsNominal
		const documentSupport = req.body.documentSupport
		const narrativeSupport = req.body.narrativeSupport
		const collectionName = req.body.collectionName

		//ordinal related data from body
		const ordinalMapperObject = req.body.ordinalMapperObject

		// nominal related data from body
		const nominalMappingConsidered = req.body.nominalMappingConsidered
		const nominalMappingObject = req.body.nominalMappingObject

		//model creation
		//let ordinalOrderPreppedForInsert = await metadataService.insertOrdinalOrder(ordinalOrder, ordinalDifferentThanNominal)
		let result = await metadataService.insertIntoMetadataAggregationTable(collectionName, accuracySupport, ordinalDifferentThanNominal, documentSupport, narrativeSupport, nominalMappingConsidered, ordinalMapperObject)

		let ordinalOrderPreppedForInsert = await metadataService.insertOrdinalOrder(ordinalMapperObject, ordinalDifferentThanNominal, collectionName)
		let nominalInsert = (nominalMappingConsidered) ? await metadataService.insertNominalMapped(nominalMappingObject) : 'No nominal mapping was made'

		// write the used loinc part values into local db
		let loincPartValuesInsertRes = await loincService.getLoincPartValuesFromLoincFhir(collectionName)

		//construct the info
		let ordinalHandledAs = (ordinalOrderPreppedForInsert.ordinalValuesHandledAs == 'ORD') ? 'ordinal' : 'nominal'
		result += nominalInsert + '\n' + 'Ordinal scaled values handled as ' + ordinalHandledAs
    	result += `\n ${loincPartValuesInsertRes}`
		res.status(200).json(result)
	} catch (error) {
		console.log("ERROR ", error.message)
		res.status(500).send({ message: error.message })
	}
})

router.delete("/metadimension", async function (req, res) {
	try {
		let collectionName = req.body.collectionName
		let result = await metadataService.deleteMetadataAggregationTable(collectionName)
		let resultOrdinalDeletion = await metadataService.deleteOrdinalOrderForColellection(collectionName)
		res.status(200).json(`${result} and  ${resultOrdinalDeletion}.`)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
});

router.get("/table-cols-for-scaling", async function (req, res) {
	try {
		let scaling = req.query.scaling
		let tablename = req.query.tablename
		let result = await metadataService.getAllColumnsOfTableForValueScaling(scaling, tablename)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get("/distinct-values", async function (req, res) {
	try {
		let tableName = req.query.tablename
		let columnName = req.query.columnname
		let result = await metadataService.getDistictValuesForTablesColumn(tableName, columnName)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get("/collection-list", async function (req, res) {
	try {
		let result = await metadataService.getGeneratedTableNames()
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.post("/nominal-mapped-value", async function (req, res) {
	try {
		let nominalValue = req.body.nominalValue
		let loincCode = req.body.loincCode
		let result = await metadataService.insertNewNomninalValueForMapping(nominalValue, loincCode)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get("/nominal-mapped-value", async function (req, res) {
	try {
		let loincCode = req.query.loincCode
		let result = await metadataService.selectNomninalValueListForMapping(loincCode)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.delete("/nominal-mapped-value", async function (req, res) {
	try {
		let loincCode = req.body.loincCode
		let nominalValue = req.body.nominalValue
		let result = await metadataService.deleteNomninalValueListForMapping(loincCode, nominalValue)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
});

router.get("/ordinal-valuesets-for-loinc", async function(req, res) {
	try {
		let loincCode = req.query.loincCode
		let result = await metadataService.getOridnalValueSetsForLoinc(loincCode)
		res.status(200).json(result)
	} catch (error) {
		res.status(500).send({ error: error.message })
	}
})

router.get("/ordinal-valuesets-values", async function(req, res) {
	try {
		let loincCode = req.query.loincCode
		let valueSetName = req.query.valueSetName
		let result = await metadataService.getOridnalValueSetValues(loincCode, valueSetName)
		res.status(200).json(result)
	} catch (error) {
		res.status(500).send({ error: error.message })
	}
})

router.post("/ordinal-valuesets-values", async function(req, res) {
	try {
		let changedOrderOfValueSetArray = req.body.changedOrderOfValueSetArray
		let result = await metadataService.updateOridnalValueSetValues(changedOrderOfValueSetArray)
		res.status(200).json({message: "The new order was saved to the database", rowCount: result})
	} catch (error) {
		res.status(500).send({ error: error.message })
	}
})

router.post("/export", async function (req, res) {
	try {
		const accuracySupport = req.body.accuracySupport
		const ordinalDifferentThanNominal = req.body.ordinalAsNominal
		const documentSupport = req.body.documentSupport
		const narrativeSupport = req.body.narrativeSupport
		const collectionName = req.body.collectionName
		const ordinalMapperObject = req.body.ordinalMapperObject
		const nominalMappingConsidered = req.body.nominalMappingConsidered
		const nominalMappingObject = req.body.nominalMappingObject

		let metaSchemaToExport = await metadataExportService.createExportableMetasSchema(collectionName, accuracySupport, ordinalDifferentThanNominal, documentSupport, narrativeSupport, nominalMappingConsidered, nominalMappingObject, ordinalMapperObject)
		
		res.attachment('metadata-export.json')
		return res.send(JSON.stringify(metaSchemaToExport))
	} catch (error) {
		console.log("ERROR ", error.message)
		res.statusMessage = error.message
		res.status(500).send()
	}
})

router.post("/import",  upload.array('files', 1), async function (req, res) {
	try {
		if(req.files[0].mimetype != 'application/json') throw new Error('not-acceptable')
		let metdataLoadedReturnValue = await metadataImportService.loadMetadata(__dirname + '/../' + req.files[0].path)
		// write the used loinc part values into local db
		await loincService.getLoincPartValuesFromLoincFhir(metdataLoadedReturnValue.collectionName)
		await collectionService.loadCollectionNameToDirectory(metdataLoadedReturnValue.collectionName)

		res.status(200).json({itemsCount: metdataLoadedReturnValue.inserted})
	} catch (error) {
		console.log("ERROR: ", error)
		res.statusMessage = error.message
		res.status(500).send({message: error.message})
	}
})

router.get('/quality-completeness', async(req, res) => {
	try {
		let loincCode = req.query.loincCode
		let lowerBound = req.query.lowerBound
		let upperBound = req.query.upperBound
		let completenessInfo = await loincService.getCompletenessOfCollectionsForLoinc(loincCode, lowerBound, upperBound)
		res.status(200).json(completenessInfo)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/quality-accuracy', async(req, res) => {
	try {
		let loincCode = req.query.loincCode
		let accuracy = req.query.accuracy
		let accuracyInfo = await loincService.getAccuracyOfCollectionsForLoinc(loincCode, accuracy)
		res.status(200).json(accuracyInfo)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/quality-timeliness', async(req, res) => {
	try {
		let loincCode = req.query.loincCode
		let lowerBound = req.query.lowerBound
		let upperBound = req.query.upperBound
		let timelinessUnit = req.query.timelinessUnit
		let timelinessInfo = await loincService.getTimelinessInfoOfCollectionsForLoinc(loincCode, lowerBound, upperBound, timelinessUnit)
		res.status(200).json(timelinessInfo)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

module.exports = { router }