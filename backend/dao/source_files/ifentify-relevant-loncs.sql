SELECT 
	pg.parent_group_id, 
	pg.parent_group,
	lg.group_id,
	lg.group_name,
	lt.loinc_code,
	lt.long_common_name
FROM parent_groups pg
LEFT JOIN loinc_groups lg 
	ON pg.parent_group_id = lg.parent_group_id
LEFT JOIN loinc_terms lt
	ON lg.group_id = lt.group_id
INNER JOIN loinc_terms_95percent lt95
	ON lt95.loinc_code = lt.loinc_code
WHERE pg.used_in_project = true;