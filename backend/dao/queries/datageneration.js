let sqlstring = require('sqlstring')

let getRawDataColNamesVar = sqlstring.format(`
	SELECT *
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND table_name   = 'raw_medical_data'
		AND column_name NOT LIKE '%unit%'
		AND column_name NOT IN ('chemical_name','study_title','accession_number','depositor_study_number','organization_name','start_date','end_date','dose','dose_unit','ntp_toxicology_type','ntp_tdms_number','time_in_study','time_in_study_unit','group_name','is_control_group','treatment_group_type','route','subject_name','species_common_name','sex','strain','ur_color','ur_bld','cyto_rep','amino','cyto_rep_url','amino_url')
`)

let getRawDataColNamesFix = sqlstring.format(`
	SELECT *
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND table_name   = 'raw_medical_data'
		AND column_name IN ('chemical_name','study_title','accession_number','depositor_study_number','organization_name','start_date','end_date','dose', 'dose_unit','ntp_toxicology_type','ntp_tdms_number','time_in_study', 'time_in_study_unit' ,'group_name','treatment_group_type','route','subject_name','species_common_name','sex','strain','ur_color','ur_bld','cyto_rep','amino')
`)

let getRawDataColNamesVarForMock = sqlstring.format(`
	SELECT *
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND table_name = $1
		AND column_name NOT IN ('chemical_name','study_title','accession_number','depositor_study_number','organization_name','start_date','end_date','dose','dose_unit','ntp_toxicology_type','ntp_tdms_number','time_in_study','time_in_study_unit','group_name','is_control_group','treatment_group_type','route','subject_name','species_common_name','sex','strain','ur_color','ur_bld','cyto_rep','amino','cyto_rep_url','amino_url')
`)

let getColNamesOfTable = sqlstring.format(`
	SELECT *
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND table_name = $1    
`)

let getRawDataColCharacteristics = sqlstring.format(`
	SELECT column_name, data_type, character_maximum_length
	FROM information_schema.columns
	WHERE table_schema = 'public'
		AND table_name  = 'raw_medical_data'
		AND column_name = $1
`)

let getTableName = sqlstring.format(`
	SELECT *
	FROM pg_catalog.pg_tables
	WHERE schemaname != 'pg_catalog' 
		AND schemaname != 'information_schema'
		AND tablename = $1
`)

let getValueRange = sqlstring.format(`
	SELECT $1, $2, count(1)
	FROM raw_medical_data
	WHERE $1 is not null 
		AND $2 is not null
	GROUP BY 1,2
`)

let getUnits = sqlstring.format(`
	SELECT $1 as unit, count(1) as count FROM raw_medical_data GROUP BY $1
`)

// adds a column to the table called updated_at and fills in a timestamp form the past 5 years - demo purposes
let alterTableAddUpdatedAtAndFillRandomly = (tableName) => {
	return sqlstring.format(`
		ALTER TABLE ${tableName} ADD COLUMN updated_at timestamp default now() - (random() * interval '5 years')
	`)
} 

module.exports = {
  getRawDataColNamesVar,
  getRawDataColNamesFix,
  getColNamesOfTable,
  getTableName,
  getRawDataColCharacteristics,
  getValueRange,
  getUnits,
  getRawDataColNamesVarForMock,
  alterTableAddUpdatedAtAndFillRandomly,
};
