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

module.exports = { sqlForPartialUpdate };
