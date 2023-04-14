const sqlstring = require('sqlstring')

const getOnlyGeneratedDataTableNames = sqlstring.format(`SELECT *
    FROM pg_catalog.pg_tables
    WHERE schemaname != 'pg_catalog' 
        AND schemaname != 'information_schema'
        AND tablename LIKE '%raw_medical_data_%';
`);

let dropTable = (name) => {
    let query = sqlstring.format(`
        DROP TABLE IF EXISTS ${name}
    `)
    return query
}

module.exports = {
    getOnlyGeneratedDataTableNames,
    dropTable,
};