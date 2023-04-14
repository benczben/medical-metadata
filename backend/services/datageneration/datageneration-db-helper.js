const Pool = require('pg').Pool 
const pgConnection = require('../../dao/pg-connection').pgConnection
const pool = new Pool({
  host: pgConnection.host,
  port: pgConnection.port,
  user: pgConnection.user,
  password: pgConnection.password,
  database: pgConnection.database,
})
const datagenerationQueries = require('../../dao/queries/datageneration')

async function getRawDataColNamesVar() {
	let query = datagenerationQueries.getRawDataColNamesVar
	let colnames = await pool.query(query)
	return colnames.rows
}

async function getRawDataColNamesFix() {
	let query = datagenerationQueries.getRawDataColNamesFix
	let colnames = await pool.query(query)
	return colnames.rows
}

async function getTableName(tableaname) {
	let query = datagenerationQueries.getTableName;
	let tablenamequeried = (!tableaname || typeof tableaname == "undefined") ? "raw_medical_data" : tableaname
	let colnames = await pool.query(query, [tablenamequeried])
	return colnames.rowCount
}

async function getUnits(unitColumn) {
	let units =await pool.query(`SELECT ${unitColumn} as unit,  count(1) as count_of_unit, (SELECT count(1) from raw_medical_data) as count_overall FROM raw_medical_data GROUP BY 1`)
	return units.rows
}

async function getDistinctValuesForFixCols(column) {
	let valueRanges = [];
	let res = await pool.query(
		`SELECT 
		${column} as distinct_value,
		'${column}' as colname
		FROM raw_medical_data 
		GROUP BY ${column};`
	)
	valueRanges.push(res.rows);
	return valueRanges
  }
  
async function getDistinctValuesForFixedCols() {
	let valueRanges = []
	let colnames = [
		"chemical_name",
		"study_title",
		"accession_number",
		"depositor_study_number",
		"organization_name",
		"start_date",
		"end_date",
		"dose",
		"dose_unit",
		"ntp_toxicology_type",
		"ntp_tdms_number",
		"time_in_study",
		"time_in_study_unit",
		"group_name",
		"treatment_group_type",
		"route",
		"subject_name",
		"species_common_name",
		"sex",
		"strain",
		"ur_color",
		"ur_bld",
		"cyto_rep",
		"amino"
	]

	for (let i = 0; i < colnames.length; i++) {
		try {
			let res = await getDistinctValuesForFixCols(colnames[i])
			valueRanges.push(res[0])
		} catch (error) {
			console.log(error)
		}
	}
	return valueRanges
}

async function getValueRange(valueColumn, unitColumn) {
	let unitsReceived = await getUnits(unitColumn)
	let valueRanges = []
	for (let unitRow of unitsReceived) {
		//calculation how many times this value is filled
		let ratio = (unitRow.count_of_unit / unitRow.count_overall).toPrecision(4)
		if (unitRow.unit != null) {
			let res = await pool.query(
				`SELECT 
				MIN(${valueColumn}) as min_value,
				MAX(${valueColumn}) as max_value,
				${unitColumn} as unit,
				'${valueColumn}' as colname,
				'${ratio}' as p_of_filled
				FROM raw_medical_data 
				WHERE ${unitColumn} = '${unitRow.unit}'
				GROUP BY ${unitColumn};`
			)
			valueRanges.push(res.rows);
		} else {
		valueRanges.push([
			{
				min_value: 0,
				max_value: 0,
				unit: null,
				colname: valueColumn,
				p_of_filled: ratio,
			},
		])
		}
	}
	return valueRanges
  }

module.exports = {
	getRawDataColNamesVar,
	getRawDataColNamesFix,
	getTableName,
	getValueRange,
	getDistinctValuesForFixedCols
}