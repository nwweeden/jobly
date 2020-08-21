const { sqlForPartialUpdate, sqlForFiltering, sqlForJobsFiltering } = require('./sql.js')
const { BadRequestError } = require('../expressError.js')

describe("sqlForPartialUpdate", function () {
  
  test("sucess for multiple inputs sqlForPartialUpdate", async function () {
    const dataToUpdate ={
          name:"nick",
          employee_num: 32
      }

    const result = sqlForPartialUpdate(dataToUpdate)

    expect(result).toEqual({
          setCols: 'name=$1, employee_num=$2',
          values: ["nick", 32]
        })
  })

  test("sucess for one input sqlForPartialUpdate", async function () {
    const dataToUpdate ={
          name:"nick",
      }

    const result = sqlForPartialUpdate(dataToUpdate)

    expect(result).toEqual({
          setCols: 'name=$1',
          values: ["nick"]
        })
  })

  test("failure sqlForPartialUpdate", async function () {
    const dataToUpdate ={
      name:"wrong value",
      employee_num: 43
    }

    const result = sqlForPartialUpdate(dataToUpdate)

    expect(result).not.toEqual({
          setCols: 'name=$1, employee_num=$2',
          values: ["nick", 32]
        })
    })
})

describe("sqlForFiltering", function () {
  
  test("sucess for multiple inputs", async function () {
    const dataToUpdate ={name: "c3", minEmployees: 2}

    const result = sqlForFiltering(dataToUpdate)

    expect(result).toEqual({
        whereClause: 'WHERE name ILIKE $1 AND num_employees >= $2',
        values: ["%c3%", 2]
      })
  })

  test("sucess for one input", async function () {
    const dataToUpdate ={maxEmployees: 1}

    const result = sqlForFiltering(dataToUpdate)

    expect(result).toEqual({
        whereClause: 'WHERE num_employees <= $1',
        values: [1]
      })
  })

  test("error for invalid employee count", async function () {
    expect.assertions = 1;
    const dataToUpdate ={minEmployees: 2, maxEmployees: 1}
    try {
      sqlForFiltering(dataToUpdate);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy(); 
    }
  })

  test("success for like names", async function () {
    const dataToUpdate ={name: '2'}

    const result = sqlForFiltering(dataToUpdate)

    expect(result).toEqual({
      whereClause: 'WHERE name ILIKE $1',
      values: ['%2%']
    })
  })

  test("return empty object when no filters", async function() {
    const data ={_token: 'sample token'};

    const result = sqlForFiltering(data)

    expect(result).toEqual({})
  })
})




describe("sqlForJobsFiltering", function () {
  
  test("sucess for multiple inputs", async function () {
    const data ={title: "CEO", minSalary: 2000, hasEquity: true}

    const result = sqlForJobsFiltering(data)

    expect(result).toEqual({
        whereClause: 'WHERE title ILIKE $1 AND salary >= $2 AND equity > $3',
        values: ["%CEO%", 2000, 0]
      })
  })

  test("sucess for one input", async function () {
    const data ={minSalary: 10}

    const result = sqlForJobsFiltering(data)

    expect(result).toEqual({
        whereClause: 'WHERE salary >= $1',
        values: [10]
      })
  })

  test("failure for one input", async function () {
    const data ={minSalary: 10}

    const result = sqlForJobsFiltering(data)

    expect(result).not.toEqual({
        whereClause: 'WHERE salary >= $1',
        values: ['10']
      })
  })

  test("return empty object when no filters", async function() {
    const data ={_token: 'sample token'};

    const result = sqlForJobsFiltering(data)

    expect(result).toEqual({})
  })

});