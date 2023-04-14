let prepOrdinalForInsert = async(ordinalMapperObject, ordinalDifferentThanNominal, ordinalOrNominalHandling) => {
	let queriesValues = new Array()
	let orderIndex
	let insertValues

	for (const [key, value] of Object.entries(ordinalMapperObject)) {
		for (const [keyChild, valueChild] of Object.entries(value)) {
			for (const [keyLeaf, valueLeaf] of Object.entries(valueChild)) {
				//if order has been made among the values, then consider it, otherwise empty string
				orderIndex = (ordinalDifferentThanNominal) ? keyLeaf : "''"
				insertValues = `('${key}', '${keyChild}', '${valueLeaf.aggregateValue}', '${valueLeaf.selectedValue}', '${ordinalOrNominalHandling}')`
				queriesValues.push(insertValues)
			}
		}
	}
	return queriesValues
}

module.exports = {
	prepOrdinalForInsert,
}