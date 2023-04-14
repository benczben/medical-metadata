const router = require('express').Router()
const datagenerationService = require('../services/datageneration/datageneration-service')
const collectionService = require('../services/collection-service')

router.post('/datasets', async function (req, res) {
	try {
		if(!req.body || !req.body.numberOfDatasets || typeof(req.body.numberOfDatasets) == 'undefined')
			throw new Error('Number of datasets numberOfDatasets is missing or is wrong')
		if(!req.body || !req.body.numberOfRows || typeof(req.body.numberOfRows) == 'undefined')
			throw new Error('Number of rows numberOfRows is missing or is wrong')
		let result = await datagenerationService.createDatasets(parseInt(req.body.numberOfDatasets), parseInt(req.body.numberOfRows))
		for(let createdCollection of result.createdCollection){
			await collectionService.loadCollectionNameToDirectory(createdCollection)
			await datagenerationService.fillMappingTableForDemoData(createdCollection)
		}
		res.status(200).json(result)
	} catch (error) {
		res.status(500).send()
	}
})

module.exports = { router }