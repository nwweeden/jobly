const { sqlForPartialUpdate } = require('./sql.js')

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