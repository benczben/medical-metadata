const router = require('express').Router()
const datainfoService = require('../services/datainfo-service')

// get all collection's names which exist in the project
router.get('/collectionnames', async function (req, res) {
	try {
		let result = await datainfoService.getTableNames()
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
});

// deletes data all collections
router.delete('/collections', async function (req, res) {
	try {
		let result = await datainfoService.deleteAllCreatedDataTable()
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

// deletes data for only one selected collection
router.delete('/collection', async function (req, res) {
	try {
		const collectionName = req.body.collectionName
		let result = await datainfoService.deleteCreatedDataTable(collectionName)
		res.status(200).json(result)
	} catch (e) {
		res.status(500).send({ error: e.message })
	}
})

module.exports = { router }