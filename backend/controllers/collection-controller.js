const router = require('express').Router()
const collectionService = require('../services/collection-service')
const multer  = require('multer')
const upload = multer({ dest: './uploads/collections' })

router.post('/upload', upload.array('files', 3), async function(req, res) {
	try {
		if(!req.body.name) throw new Error('no-filename')
		if(req.files[0].mimetype != 'text/tab-separated-values') throw new Error('not-acceptable')
		if(req.files[1].mimetype != 'text/plain') throw new Error('not-acceptable')
		if(req.files[2].mimetype != 'text/tab-separated-values') throw new Error('not-acceptable')
		
		let collectionName = req.body.name.replace(/\s+/g, '')
		// load data into the db as temp table
		await collectionService.loadCollectionIntoDb(__dirname + '/../' + req.files[0].path, __dirname + '/../' + req.files[1].path, collectionName)
		await collectionService.loadLoincMapping(__dirname + '/../' + req.files[2].path, collectionName)
		// rename the file to what the user has sent
		await collectionService.renameFile(__dirname + '/../' + req.files[0].path, collectionName + '_data')
		await collectionService.renameFile(__dirname + '/../' + req.files[1].path, collectionName + '_schema')
		await collectionService.renameFile(__dirname + '/../' + req.files[1].path, collectionName + '_mapping')
		await collectionService.loadCollectionNameToDirectory(collectionName)
		
		res.status(200).json({
			message: 'ok'
		})
	} catch (error) {
        console.log("ERROR: ", error)
		if(error.message == 'not-acceptable'){
			res.statusMessage = 'Acceptable content type: for data and mapping -> text/tab-separated-values, for schema -> text/plain'
			res.status(406).send()
		} else if(error.message == 'no-filename'){
			res.statusMessage = 'Provide a filename'
			res.status(400).send()
		} else {
			res.statusMessage = error.message
			res.status(500).send({message: error.message})
		}
	}
})

router.get('/names-from-directory', async function(req, res) {
	try {
		let result = await collectionService.selectCollectionNamesFromDirectory()
		res.status(200).json(result)
	} catch (error) {
		res.status(500).send()
	}
})

router.delete('/names-from-directory', async function(req, res) {
	try {
		let collectionName = req.body.collectionName
		let result = await collectionService.deleteCollectionNamesFromDirectory(collectionName)
		res.status(200).json(result)
	} catch (error) {
		res.status(500).send()
	}
})

module.exports = { router }