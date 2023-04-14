const router = require('express').Router()
const loincService = require('../services/loinc-service')

router.get('/loinc-parent-groups', async function (req, res) {
	try {
		let loincParentGroups = await loincService.getAllLoincParentGroups()
		res.status(200).json(loincParentGroups)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get('/loinc-relevant-parent-groups', async function (req, res) {
	try {
		let loincParentGroups = await loincService.getRelevantLoincParentGroups()
		res.status(200).json(loincParentGroups)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get('/loinc-groups', async function (req, res) {
	try {
		let loincParentGroupList = req.query.parentGroupIdList
		let loincGroups = await loincService.getLoincGroups(loincParentGroupList)
		res.status(200).json(loincGroups)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get('/loinc-terms', async function (req, res) {
	try {
		let loincGroupIdList = req.query.groupIdList
		let loincTerms = await loincService.getLoincTerms(loincGroupIdList)
		res.status(200).json(loincTerms)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

router.get('/loinc-fsn', async function (req, res) {
	try {
		console.log('FSN CALLED...')
		let loincCode = req.query.loinc_code
		let loincTermsResolved = await loincService.getLoincFsn(loincCode)
		// ORD can be treated as NOM -> check is required on meta data level (own API call)
		if(loincTermsResolved.SCALE_TYP.toUpperCase() == 'ORD'){
		let metadatascalingOfOrdinal = await loincService.ordinalLoincFhirResponseInterceptor(loincCode)
		if(metadatascalingOfOrdinal[0] && metadatascalingOfOrdinal[0].scaling_of_meta_data.toUpperCase() == 'NOM') 
			loincTermsResolved.SCALE_TYP = 'NOM'
		}
		res.status(200).json(loincTermsResolved)
	} catch (e) {
		console.log('ERROR: ' + e.message)
		res.status(500).send({ error: e })
	}
})

router.get('/collections-to-loinc', async function (req, res) {
	try {
		let loincCodes = req.query.loinc_codes
		if(typeof(loincCodes) == 'undefined') throw new Error('no loinc code')
		let collectionList = await loincService.relatedCollectionsBasedOnMetadataAggregation(loincCodes)
		res.status(200).json(collectionList)
	} catch (error) {
		if(error.message = 'no loinc code')
			res.status(400).send(error.message)
		else {
			console.log('ERROR: ' + error.message)
			res.status(500).send({ error: error })
		}
	}
})

router.get('/loinc-part-value', async(req, res) => {
	try {
		
		let loincPartSelected = req.query.loincPartSerialNumber
		let loincPartValues = await loincService.getLoincPartValues(loincPartSelected)
		res.status(200).json(loincPartValues)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/collection-to-loinc-part-value', async(req, res) => {
	try {
		let component = req.query.component
		let property = req.query.property
		let time_aspect = req.query.time_aspect
		let system = req.query.system
		let scale = req.query.scale
		let method = req.query.method
		let collectionsToLoincPartValues = await loincService.getCollectionsToLoincPartValues(component, property, time_aspect, system, scale, method)
		res.status(200).json(collectionsToLoincPartValues)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/loinc-codes-to-part-values', async(req, res) => {
	try {
		let component = req.query.component
		let property = req.query.property
		let time_aspect = req.query.time_aspect
		let system = req.query.system
		let scale = req.query.scale
		let method = req.query.method
		let collection = req.query.collection
		let loincCodes = await loincService.getLoincCodesToLoincPartValuesOfCollection(component, property, time_aspect, system, scale, method, collection)
		let loincCodesAndDescription = await loincService.getInfoToCodes(loincCodes)
		res.status(200).json(loincCodesAndDescription)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/metalevel-loinc-codes', async(req, res) => {
	try {
		let loincCodes = await loincService.getMetalevelLoincCodes()
		res.status(200).json(loincCodes)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/loinc-code-operators', async(req, res) => {
	try {
		let loincCodes = await loincService.getLoincCodeOperators()
		res.status(200).json(loincCodes)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

router.get('/collections-to-composite-descriptors', async(req, res) => {
	try {
		let operator = req.query.operator
		let participatingCodes = req.query.participatingCodes
		let collections = await loincService.getCollectionsToCompositeDescriptors(participatingCodes, operator)
		res.status(200).json(collections)
	} catch (error) {
		res.status(500).send({error: error})
	}
})

module.exports = { router }
