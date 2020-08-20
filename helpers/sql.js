const { BadRequestError } = require("../expressError");
// THIS NEEDS SOME GREAT DOCUMENTATION.
/** Takes an object, iterates through the keys and adds a '=$#'
 * to each key. Returns an object with setCols = key + =$#
 * and values equal to each key's value
 * 
 * TODO: add expectations of the required inputs
 *  
 * {name: nick, num_employees: 32} ==>
 * {setCols: 'name=$1, num_employees=$2', values: [nick, 32]}
 */
function sqlForPartialUpdate(dataToUpdate) {
  const cols = Object.keys(dataToUpdate).map(
      (col, idx) => `${col}=$${idx + 1}`);

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** Takes in an object of filter types
 * if name, check upper against upper in database
 * check min is not greater than max if both exist
 * iterate through each key and construct/return where clause
 * 
 * {name: c3, minEmployees: 2} ==>
 * {whereClause: 'WHERE upper(name) = $1 AND num_employees >= $2',
 * values: [C3, 2]}
 */
function sqlForFiltering(userFilters) {
  // if (Object.keys(userFilters).length === 0) return '';
  console.log('In sqlForFiltering');
  
  if (userFilters.minEmployees && userFilters.maxEmployees){
    if (userFilters.minEmployees > userFilters.maxEmployees){
      throw new BadRequestError
    }
  }

  /*
  Example Query: 
  SELECT handle, name
           FROM companies
           WHERE upper(name) = C3 AND num_employees >=2
           ORDER BY name` 
  */
// TODO: name is like the name put in, not exact
  let sanitizer = 1;
  let whereClause = 'WHERE';
  let values = [];
  console.log('userFilters:', userFilters);
  if(userFilters.name){
    whereClause += ` upper(name) LIKE $${sanitizer} AND`
    sanitizer++
    let revizedName = '%'+ (userFilters.name.toUpperCase()) +'%'
    values.push(revizedName);
    // values.push(userFilters.name.toUpperCase());

  }
  if(userFilters.minEmployees) {
    whereClause += ` num_employees >= $${sanitizer} AND`;
    sanitizer++;
    values.push(userFilters.minEmployees);
  }
  if(userFilters.maxEmployees) {
    whereClause += ` num_employees <= $${sanitizer} AND`;
    values.push(userFilters.maxEmployees);
  } 

  const removeAnd = -4;
  whereClause = whereClause.slice(0, removeAnd);
  console.log('Return Object from sqlForFiltering', {whereClause, values});
  return {whereClause, values};
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
