const mocker = require('mocker-data-generator').default
const dbhelper = require('./datageneration-db-helper')

async function getValueRangesForVarCols() {
	let colnames = [];
	let valueRanges = [];
	let cols = await dbhelper.getRawDataColNamesVar()
		
	for (let col of cols) {
		colnames.push(col.column_name)
		colnames.push(col.column_name + "_unit")
		let res = await dbhelper.getValueRange(col.column_name, col.column_name + "_unit")
		valueRanges.push(res[0][0]);
	}
	return valueRanges
}

async function getGenereatedMockValuesForVarCols(rowsGenerated) {
	let valueranges = await getValueRangesForVarCols();
	let conditionalField = {};

	for (let val of valueranges) {
		conditionalField[val.colname] = {};
		conditionalField[val.colname]["chance"] = `floating({"min": ${val.min_value}, "max": ${val.max_value}})`;
		conditionalField[val.colname + "_unit"] = {};
		conditionalField[val.colname + "_unit"]["values"] = [val.unit];
	}

	let data = mocker().schema("createdMockRow", conditionalField, rowsGenerated)
	let dataRes = await data.build()

	// replace actual values to null to simulate closer real-world conditions
	dataRes.createdMockRow = await setRandomNullValues(dataRes.createdMockRow)
	return dataRes
		
  }

  async function getGenereatedMockValuesForFixCols(rowsGenerated) {
	let valueranges = await dbhelper.getDistinctValuesForFixedCols();
	let conditionalField = {};
  
	//create the structure
	for (let i = 0; i < valueranges.length; i++) {
		for (let j = 0; j < valueranges[i].length; j++) {
			conditionalField[valueranges[i][j].colname] = {}
			conditionalField[valueranges[i][j].colname]["values"] = []
		}
	}

	for (let i = 0; i < valueranges.length; i++) {
		for (let j = 0; j < valueranges[i].length; j++) {
			conditionalField[valueranges[i][j].colname]["values"].push(valueranges[i][j].distinct_value)
		}
	}
  
	let data = mocker().schema("createdMockRow", conditionalField, rowsGenerated)
	let dataRes = await data.build()
	return dataRes
}


const setRandomNullValues = async(dataset) => {
	let deleteRow
	for(let datarow of dataset){
		for(let [key, value] of Object.entries(datarow)){
			if(!key.includes('_unit')){
				deleteRow = (Math.random() > Math.random()) ? false : true
				if(deleteRow){
					datarow[key] = null
					datarow[key+"_unit"] = null
				}
			}
		}
	}
	return dataset
}

  module.exports = {
	getGenereatedMockValuesForFixCols,
	getGenereatedMockValuesForVarCols,
  }