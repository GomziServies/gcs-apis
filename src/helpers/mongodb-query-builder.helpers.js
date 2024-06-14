const { isNumber } = require('lodash');

/**
 * @author Smit Luvani
 * @description It will return the query object for the search text
 * @param {string|number|boolean} searchText 
 * @param {string[]} fields
 * @param {{
 * operator: 'and' | 'or',
 * case_sensitive: boolean
 * }} options
 * @returns 
 */
const searchText = (searchText, fields, options = {}) => {
    if (!searchText) return {};

    const { operator = 'or', case_sensitive = false } = options;

    if (['and', 'or'].indexOf(operator) === -1) throw new Error('Invalid operator');
    if (!Array.isArray(fields)) fields = [fields];

    let _queryObject = {
        $regex: searchText,
    }

    if (!case_sensitive) {
        _queryObject.$options = 'i'
    }

    if (['true', 'false'].includes(searchText.toLowerCase())) _queryObject = searchText.toLowerCase() === 'true'

    if (isNumber(searchText)) _queryObject = Number(searchText)

    return {
        [`$${operator}`]: fields.map(field => ({ [field]: _queryObject }))
    }
}
module.exports.searchTextQuery = searchText;

const sortQuery = (sort, sortOrder) => {
    if (!sort || !sortOrder) return {};

    return {
        [sort]: sortOrder === 'asc' ? 1 : -1
    }
}
module.exports.sortQuery = sortQuery;