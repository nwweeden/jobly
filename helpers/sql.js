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
 * 'WHERE name = c3 AND maxEmployees >= 2'
 */
function sqlForFiltering(userFilters) {
  if (Object.keys(userFilters).length === 0) return '';
  
  if (userFilters.minEmployees && userFilters.maxEmployees){
    if (userFilters.minEmployees > userFilters.maxEmployees){
      throw new BadRequestError
    }
  }
  let si = 1;

  let result = 'WHERE';
  let values = [];
  if(userFilters.name){
    result += ` upper(name) = $${si} AND`
    si++
    values.push(userFilters.name);
  }
  if(userFilters.minEmployees) result += ` numEmployees >= ${userFilters.minEmployees} AND`
  if(userFilters.maxEmployees) result += ` numEmployees <= ${userFilters.maxEmployees} AND`

  result = result.slice(0, -4)
  return {result, values};
}

module.exports = { sqlForPartialUpdate, sqlForFiltering };
