const router = require("express").Router();
const loincMappingService = require("../services/loinc-mapping-service");

router.get("/meta-data", async function (req, res) {
  try {
    let loincCode = req.query.loinc_code
    let scaling = req.query.scaling.toUpperCase()
    let retrievedMapedData
    switch (scaling) {
      case 'QN':
        retrievedMapedData = await loincMappingService.getMappedData(loincCode, req.query.lower_bound + '', req.query.upper_bound + '')
        break
      case 'NOM':
        let restrictionArrayNominal = []
        if(req.query.value_restriction_list){
          for (const [key, value] of Object.entries(req.query.value_restriction_list)) {
            restrictionArrayNominal.push(JSON.parse(value).distinct_values)
          }
        }
        retrievedMapedData = await loincMappingService.getMappedDataNominal(loincCode, restrictionArrayNominal)
        break
      case 'ORD':
        // check if the ord was treated as ORD or NOM
        try {
          let ordinalAsNominalInMetalevel = await loincMappingService.getOrdinalAsNominalScalingOnMetaLevel(loincCode)
          if(ordinalAsNominalInMetalevel[0] && ordinalAsNominalInMetalevel[0].scaling_of_meta_data == 'NOM'){
            let restrictionArrayNominal = []
            if(req.query.value_restriction_list){
              for (const [key, value] of Object.entries(req.query.value_restriction_list)) {
                restrictionArrayNominal.push(JSON.parse(value).distinct_values)
              }
            }
            retrievedMapedData = await loincMappingService.getMappedDataNominal(loincCode, restrictionArrayNominal)
          } else {
            retrievedMapedData = await loincMappingService.getMappedDataOrdinal(loincCode, req.query.lower_bound + '', req.query.upper_bound + '')
          }
        } catch (error) {
          throw new  Error(error)
        }
        break
      case 'DOC':
        retrievedMapedData = await loincMappingService.getMappedDataDocumentAndNarrative(loincCode, req.query.selectedFilter)
        break
      case 'NAR':
        retrievedMapedData = await loincMappingService.getMappedDataDocumentAndNarrative(loincCode, req.query.selectedFilter)
        break
      default:
        retrievedMapedData = `Scaling of "${scaling}" is not supported or missing from the request.`
        break
    }
    res.status(200).json(retrievedMapedData)
  } catch (e) {
    console.log("ERROR: ", e.message)
    res.status(500).send({ error: e.message })
  }
});

router.get("/loinc-value-ranges", async function (req, res) {
  try {
    let loincCode = req.query.loinc_code
    let valueRangesForLoincCode = await loincMappingService.getValueRangesForLoincCode(loincCode)
    res.status(200).json(valueRangesForLoincCode[0])
  } catch (e) {
    res.status(500).send({ error: e.message })
  }
});

router.get("/column-values-nominal", async function (req, res) {
  try {
    let loincCode = req.query.loinc_code
    let valuesForColumn = await loincMappingService.getValuesForNominalColumn(loincCode)
    res.status(200).json(valuesForColumn)
  } catch (e) {
    res.status(500).send({ error: e.message })
  }
});

router.get("/column-values-ordinal", async function (req, res) {
  try {
    let loincCode = req.query.loinc_code
    let valuesForColumn = await loincMappingService.getValuesForOrdinalColumn(loincCode)
    res.status(200).json(valuesForColumn)
  } catch (e) {
    res.status(500).send({ error: e.message })
  }
})

router.post("/composite-content-descriptor", async function (req, res) {
	try {
		let compositeContentDescriptorName = req.body.compositeContentDescriptorName
		let compositeContentDescriptorDescription = req.body.compositeContentDescriptorDescription
		let participatingLoincCodes = req.body.participatingLoincCodes
		let operator = req.body.operator
		let valuesForColumn = await loincMappingService.insertCompositeContentDescriptor(compositeContentDescriptorName, compositeContentDescriptorDescription, participatingLoincCodes, operator)
		res.status(200).json({insertedRowCount: valuesForColumn.rowCount})
	} catch (error) {
		if(error.constraint && error.constraint == 'candidate_key_composite_content_descriptors')
			res.status(409).send({error: 'composite keys exists already'})
		else {
			res.status(500).send({ error: e.message })
		}
	}
})

router.get("/composite-content-descriptor", async function (req, res) {
	try {
		let descriptors = await loincMappingService.selectCompositeContentDescriptor()
		res.status(200).json(descriptors)
	} catch (error) {
		res.status(500).send({ error: e.message })
	}
})

router.delete("/composite-content-descriptor", async function (req, res) {
	try {
    if(!req.body.idList) throw new Error('missing id list')
    let ids = req.body.idList
		await loincMappingService.deleteCompositeContentDescriptor(ids)
		res.status(200).send({message: 'deleted'})
	} catch (error) {
		res.status(500).send({ error: e.message })
	}
})

module.exports = { router };
