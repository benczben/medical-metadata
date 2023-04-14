function qunatitativeExportObject(tuples, loincCode, valueUnit, appliedAccuracyGroup) {
	let retrunTupleQn = []
	for(let tuple of tuples){
		let tupleConstructed = {
			loincCode: loincCode,
			valueUnit: valueUnit,
			tupleAccuracy: appliedAccuracyGroup,
			minValue: tuple.tuple_min_value,
			maxValue: tuple.tuple_max_value,
			meanValue: tuple.tuple_mean_value,
			medianValue: tuple.tuple_median_value,
			dataItemCount: tuple.occurance_count,
			nullValuesCount: tuple.occurance_count_null,
			minUpdatedAt: tuple.tuple_min_time,
			maxUpdatedAt: tuple.tuple_max_time,
			meanUpdatedAt: tuple.tuple_mean_time,
			medianUpdatedAt: tuple.tuple_median_updated_at,
			metaDataCreatedAt: tuple.metadata_created_at,
		}
		retrunTupleQn.push(tupleConstructed)
	}
	return retrunTupleQn
}

function nominalNotMappedExportObject(tuples = [], loincCode, nullCount, initNom){
	let retrunTupleNom = []
	let nullTuple = []
	if(tuples && tuples.length > 0){
		for(let tuple of tuples){
			if(tuple.aggregate_value && tuple.aggregate_value != null){
				let tupleConstructed = {
					loincCode: loincCode,
					initNom: initNom,
					tupleAccuracy: 'high',
					value: tuple.aggregate_value,
					dataItemCount: tuple.occurance_count,
					nullValuesCount: nullCount,
					minUpdatedAt: tuple.tuple_min_time,
					maxUpdatedAt: tuple.tuple_max_time,
					meanUpdatedAt: tuple.tuple_mean_time,
					medianUpdatedAt: tuple.tuple_median_updated_at,
					metaDataCreatedAt: tuple.metadata_created_at,
				}
				retrunTupleNom.push(tupleConstructed)
			}
		}
	}

	// obligatory null count object
	nullTuple = tuples.filter(x => x.aggregate_value == null)
	if(nullTuple && nullTuple.length > 0){
		retrunTupleNom.push({
			loincCode: loincCode,
			initNom: initNom,
			value: null,
			tupleAccuracy: 'high',
			dataItemCount: nullCount,
			minUpdatedAt: nullTuple[0].tuple_min_time,
			maxUpdatedAt: nullTuple[0].tuple_max_time,
			meanUpdatedAt: nullTuple[0].tuple_mean_time,
			medianUpdatedAt: nullTuple[0].tuple_median_updated_at,
			metaDataCreatedAt: nullTuple[0].metadata_created_at,
		})
	// if in the DB table every data attribute is filled and there is no null aggregate
	} else { 
		retrunTupleNom.push({
			loincCode: loincCode,
			initNom: initNom,
			value: null,
			tupleAccuracy: 'high',
			dataItemCount: nullCount,
			minUpdatedAt: '',
			maxUpdatedAt: '',
			meanUpdatedAt: '',
			medianUpdatedAt: '',
			metaDataCreatedAt: new Date(),
		})
	}
	return retrunTupleNom
}

function nominalMappedExportObject(dataObject, loinc) {
	let retrunTupleNomMapped = []
	for(let row of dataObject){
		if(row.aggregate_value && row.aggregate_value != null)
		retrunTupleNomMapped.push({
			loincCode: loinc,
			initNom: true,
			value: row.aggregate_value,
			tupleAccuracy: 'medium',
			dataItemCount: row.occurance_count,
			minUpdatedAt: row.tuple_min_time,
			maxUpdatedAt: row.tuple_max_time,
			meanUpdatedAt: row.tuple_mean_time,
			medianUpdatedAt: row.tuple_median_updated_at,
			metaDataCreatedAt: row.metadata_created_at,
		})
	}
	// obligatory null count object
	let nullTuple = dataObject.filter(x => x.aggregate_value == null)
	if(nullTuple){
		retrunTupleNomMapped.push({
			loincCode: loinc,
			initNom: true,
			value: nullTuple[0].aggregate_value,
			tupleAccuracy: 'medium',
			dataItemCount: nullTuple[0].occurance_count,
			minUpdatedAt: nullTuple[0].tuple_min_time,
			maxUpdatedAt: nullTuple[0].tuple_max_time,
			meanUpdatedAt: nullTuple[0].tuple_mean_time,
			medianUpdatedAt: nullTuple[0].tuple_median_updated_at,
			metaDataCreatedAt: nullTuple[0].metadata_created_at,
		})
	// if in the DB table every data attribute is filled and there is no null aggregate
	} else { 
		retrunTupleNomMapped.push({
			loincCode: loinc,
			initNom: true,
			value: null,
			tupleAccuracy: 'medium',
			dataItemCount: 0,
			minUpdatedAt: '',
			maxUpdatedAt: '',
			meanUpdatedAt: '',
			medianUpdatedAt: '',
			metaDataCreatedAt: new Date(),
		})
	}
	return retrunTupleNomMapped
}

function ordinalMappedExportObject(dataObject) {
	let returnObjectOrdinal = []
	for(let row of dataObject){
		let preparedObject = {
			loincCode: row.loinc_code,
			value: row.aggregate_value,
			valueSetName: row.value_set_name,
			tupleAccuracy: 'medium',
			valueSetValue: row.value_set_value,
			valueSetSequenceNumber: row.sequence_number,
			dataItemCount: row.occurance_count,
			minUpdatedAt: row.tuple_min_time,
			maxUpdatedAt: row.tuple_max_time,
			meanUpdatedAt: row.tuple_mean_time,
			medianUpdatedAt: row.tuple_median_updated_at,
			metaDataCreatedAt: row.metadata_created_at
		}
		returnObjectOrdinal.push(preparedObject)
	}
	return returnObjectOrdinal
}

function documentAndNarrativeExportObject(dataObject) {
	let returnObject = []
	for(let row of dataObject){
		let preparedObject = {
			loincCode: row.loinc_code,
			dataAvailable: row.data_available,
			tupleAccuracy: 'low',
			dataItemCount: row.occurance_count,
			minUpdatedAt: row.tuple_min_time,
			maxUpdatedAt: row.tuple_max_time,
			meanUpdatedAt: row.tuple_mean_time,
			medianUpdatedAt: row.tuple_median_updated_at,
			metaDataCreatedAt: row.metadata_created_at
		}
		returnObject.push(preparedObject)
	}
	return returnObject
}

module.exports = {
	qunatitativeExportObject,
	nominalNotMappedExportObject,
	nominalMappedExportObject,
	ordinalMappedExportObject,
	documentAndNarrativeExportObject,
}