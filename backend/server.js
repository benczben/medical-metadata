const express = require('express')
const cors = require('cors')
const app = express()
const port = 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.get('/', (request, response) => {
  response.json({ info: 'Up and running!' })
})

//bind the controllers
const dataGenerationController = require('./controllers/datageneration-controller')
const loincController = require('./controllers/loinc-controller')
const loincMappingController = require('./controllers/loinc-mapping-controller')
const datainfoController = require('./controllers/datainfo-controller')
const metadataController = require('./controllers/metadata-controller')
const collectionController = require('./controllers/collection-controller')

//middleware for router
app.use('/api', dataGenerationController.router)
app.use('/api', loincController.router)
app.use('/api', loincMappingController.router)
app.use('/api/datainfo', datainfoController.router)
app.use('/api/collection', collectionController.router)
app.use('/api/metadata', metadataController.router)

app.listen(port, () => {
  console.log(`running on port ${port}.`)
});
