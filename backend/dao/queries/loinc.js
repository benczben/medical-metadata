let sqlstring = require("sqlstring")

let getAllParentGroups = sqlstring.format(`SELECT parent_group_id, parent_group FROM loinc_parent_groups`)

let getRelevantParentGroups = sqlstring.format(`SELECT parent_group_id, parent_group FROM loinc_parent_groups WHERE used_in_project is true`)

let getParentGroup = sqlstring.format(`SELECT parent_group_id, parent_group FROM loinc_parent_groups WHERE parent_group_id = $1`)

let getAllGroups = sqlstring.format(`SELECT parent_group_id, group_id, group_name FROM loinc_groups`)

let getGroups = sqlstring.format(`
	SELECT parent_group_id, group_id, group_name 
	FROM loinc_groups 
	WHERE parent_group_id = ANY($1)
`)

let getGroupsRestricted = sqlstring.format(`
	SELECT lg.parent_group_id, lg.group_id, lg.group_name FROM loinc_groups lg
	LEFT JOIN loinc_terms lt on 
		lt.group_id = lg.group_id
	WHERE 
		lg.parent_group_id = ANY($1)
		AND
		lt.loinc_code 
			IN ('34284-0', '1776-4', '14413-9', '1978-6', '17862-4', '2078-4', '2161-8', '53120-2', '2162-6', '16689-2', '15076-3', '33352-6', '2828-2', '49779-2', '53561-7', '19124-7', '2955-3', '33354-2', '48995-5', '2756-5', '2778-9', '17815-2', '2965-2', '59973-8', '59973-8', '3092-4', '53137-6', '28009-9', '5794-3', '32167-9', '5778-6', '9188-4', '47525-1', '49248-8')
`)

let getTerms = sqlstring.format(`
	SELECT loinc_code, long_common_name, group_id 
	FROM loinc_terms 
	WHERE group_id = ANY($1)
`)

let getTermsRestricted = sqlstring.format(`
	SELECT loinc_code, long_common_name, group_id 
	FROM loinc_terms 
	WHERE group_id = ANY($1)
		AND loinc_code IN ('34284-0', '1776-4', '14413-9', '1978-6', '17862-4', '2078-4', '2161-8', '53120-2', '2162-6', '16689-2', '15076-3', '33352-6', '2828-2', '49779-2', '53561-7', '19124-7', '2955-3', '33354-2', '48995-5', '2756-5', '2778-9', '17815-2', '2965-2', '59973-8', '59973-8', '3092-4', '53137-6', '28009-9', '5794-3', '32167-9', '5778-6', '9188-4', '47525-1', '49248-8')
`)

let selectLoincPartValues = (selectedPart) => {
	let selectedPartPrepped = ''
	switch (selectedPart) {
		case '1':
			selectedPartPrepped = 'component'
			break;
		case '2':
			selectedPartPrepped = 'property'
			break;
		case '3':
			selectedPartPrepped = 'time_aspect'
			break;
		case '4':
			selectedPartPrepped = 'system_part'
			break;
		case '5':
			selectedPartPrepped = 'scale_part'
			break;
		case '6':
			selectedPartPrepped = 'method_part'
			break;
		default: 
			throw new Error('invalid part')
	}
	let baseQuery = 'SELECT $1 as loinc_part_value FROM loinc_part_values GROUP BY 1'
	baseQuery = baseQuery.replace(/\$1/g, selectedPartPrepped)
	return sqlstring.format(baseQuery)
}

let selectCollectionsToLoincPartValues = (component, property, time_aspect, system, scale, method, collection) => {
	let collectionProvided = (collection) ? true : false
	let componentStringForQuery = (component == null) ? ' TRUE ' : ` component = '${component}' `
	let propertyStringForQuery = (property == null) ? ' TRUE ' : ` property = '${property}' `
	let timeAspectStringForQuery = (time_aspect == null) ? ' TRUE ' : ` time_aspect = '${time_aspect}' `
	let systemStringForQuery = (system == null) ? ' TRUE ' : ` system_part = '${system}' `
	let scaleStringForQuery = (scale == null) ? ' TRUE ' : ` scale_part = '${scale}' `
	let methodStringForQuery = (method == null) ? ' TRUE ' :` method_part = '${method}' `
	let query = ''

	if(collectionProvided){
		// get the loinc codes which describe a colleciton and fulfill the given search parameters
		query = `SELECT 
			loinc_code as loinc_code
		FROM metadata_aggregation ma
		WHERE ma.loinc_code IN (
			SELECT loinc_code
			FROM loinc_part_values
			WHERE 
				${componentStringForQuery} AND
				${propertyStringForQuery} AND
				${timeAspectStringForQuery} AND
				${systemStringForQuery} AND
				${scaleStringForQuery} AND
				${methodStringForQuery} AND
				ma.source_database = '${collection}'
		)
		GROUP BY 1
		ORDER BY 1`
	} else {
		// get the collections which contain loinc codes which fulfill the given seach parameters
		query = `SELECT 
			source_database as collection_name
		FROM metadata_aggregation ma
		WHERE ma.loinc_code IN (
			SELECT loinc_code
			FROM loinc_part_values
			WHERE 
				${componentStringForQuery} AND
				${propertyStringForQuery} AND
				${timeAspectStringForQuery} AND
				${systemStringForQuery} AND
				${scaleStringForQuery} AND
				${methodStringForQuery} 
		)
		GROUP BY 1
		ORDER BY 1`
	}

	return query
}

let getInfoToCode = sqlstring.format(`
	SELECT 
		loinc_code as loinc_code,
		MAX(long_common_name) as long_common_name
	FROM 
		loinc_terms
	WHERE
		loinc_code IN ($1)
	GROUP BY 1
`)

let getMetalevelLoincCodes = sqlstring.format(`
	SELECT 
		ma.loinc_code AS loinc_code,
		MAX(lt.long_common_name) AS long_common_name
	FROM public.metadata_aggregation ma
		LEFT OUTER JOIN public.loinc_terms lt
			ON lt.loinc_code = ma.loinc_code
	GROUP BY ma.loinc_code
`)

let insertLoincTermIntoDb = sqlstring.format(`
	INSERT INTO loinc_terms (group_id, loinc_code, long_common_name) 
	VALUES ($1, $2, $3)
`)

let selectLoincCodeOperators = sqlstring.format(`
	SELECT code_operator as code_operator FROM composite_content_operator;
`)

module.exports = {
    getAllParentGroups,
    getRelevantParentGroups,
    getAllGroups,
    getGroups,
    getTerms,
    getTermsRestricted,
    getGroupsRestricted,
    selectLoincPartValues,
	selectCollectionsToLoincPartValues,
	getInfoToCode,
	getMetalevelLoincCodes,
	insertLoincTermIntoDb,
	selectLoincCodeOperators,
}