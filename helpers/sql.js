const { BadRequestError } = require("../expressError");
/** Takes an object with ids to change and valid values,
 * iterates through the keys and adds a '=$#'
 * to each key. Returns an object with setCols = key + =$#
 * and values equal to each key's value
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

/** Takes in an object of selected filters
 * check min is not greater than max if both exist
 * if name, check upper against upper in database
 * for each possible filter included, add to a 
 * WHERE clause to be returned, santized
 * 
 * {name: c3, minEmployees: 2} ==>
 * {whereClause: 'WHERE upper(name) = $1 AND num_employees >= $2',
 * values: [C3, 2]}
 */
function sqlForFiltering(userFilters) {
  console.log('ENTERED INTO sqlForFilter FUNCTION')
  if (userFilters.minEmployees && userFilters.maxEmployees){
    if (userFilters.minEmployees > userFilters.maxEmployees){
      throw new BadRequestError('min cannot be greater than max')
    }
  }

  let filterPlaceholder = 1;
  let whereClause = 'WHERE';
  let values = [];

  if(userFilters.name){
    whereClause += ` name ILIKE $${filterPlaceholder} AND`;
    filterPlaceholder++;
    let revizedName = '%'+ (userFilters.name) +'%';
    values.push(revizedName);
  }

  if(userFilters.minEmployees) {
    whereClause += ` num_employees >= $${filterPlaceholder} AND`;
    filterPlaceholder++;
    values.push(userFilters.minEmployees);
  }

  if(userFilters.maxEmployees) {
    whereClause += ` num_employees <= $${filterPlaceholder} AND`;
    values.push(userFilters.maxEmployees);
  } 

  const removeAnd = -4;
  whereClause = whereClause.slice(0, removeAnd);
  // console.log('Return Object from sqlForFiltering', {whereClause, values});
  
  if(values.length > 0) {
    return {whereClause, values};
  } else {
    return {};
  }
}

/** Writes a WHERE clause to filter our Job.findAll() search 
 * Takes an object with the following optional keys/values:
 * - title (case insensitive, matches any part of string)
 * - minSalary (finds jobs with at least this salary)
 * - hasEquity (if true, finds jobs with equity > 0)
 * 
 * {title: engineer, hasEquity: true} ==>
 * {whereClause: 'WHERE title ILIEE $1 AND equity > $2',
 * values: [engineer, 0]}
*/
function sqlForJobsFiltering(userFilters) {
  let filterPlaceholder = 1;
  let values = [];
  let filters = [];

  if(userFilters.title) {
    let revisedTitle = '%'+ (userFilters.title) +'%';
    values.push(revisedTitle)
    filters.push(`title ILIKE $${filterPlaceholder}`);
    filterPlaceholder ++;
  }

  if(userFilters.minSalary) {
    values.push(userFilters.minSalary);
    filters.push(`salary >= $${filterPlaceholder}`);
    filterPlaceholder ++;
  }

  /**Removed because we do not include this filtering */
  // if(userFilters.hasEquity === false) {
  //   values.push(null);
  //   filters.push(`equity IS $${filterPlaceholder}`);
  //   filterPlaceholder ++;
  // }

  if(userFilters.hasEquity === true) {
    values.push(0);
    filters.push(`equity > $${filterPlaceholder}`);
  }

  if (values.length > 0) {
    let whereClause = 'WHERE '.concat(filters.join(' AND '));
    return {whereClause, values};
  } else {
    return {};
  }
};
  


module.exports = { sqlForPartialUpdate, sqlForFiltering, sqlForJobsFiltering };
