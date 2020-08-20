"use strict";

const db = require("../db.js");
const Job = require("./Job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

let engId;
beforeAll(commonBeforeAll);

beforeEach(async function() {
  await commonBeforeEach();
  /*get an id for one of our jobs to use in tests*/
  const engResult = await db.query(`
    SELECT id
    FROM jobs
    WHERE title = 'engineer'
  `)
  // console.log("@@@@@@@@@@@@@ENGRESULT", engResult)
  engId = engResult.rows[0].id
});

afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("findAll", function () {
  test("all no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      { id: expect.any(Number), title: "cfo" },
      { id: expect.any(Number), title: "engineer" },
      { id: expect.any(Number), title: "recruiter" },
    ]);
  });

// TODO: remove this when we uncomment below
});

//   test("filter num_employees >= 3", async function () {
//     let companies = await Company.findAll(
//       {minEmployees: 3}
//     );
//     expect(companies).toEqual([
//       {handle: "c3", name: "C3"}
//     ]);
//   });

//   test("filter num_employees <=2", async function () {
//     let companies = await Company.findAll(
//       {maxEmployees: 2}
//     );
//     expect(companies).toEqual([
//         {handle: "c1", name: "C1"},
//         {handle: "c2", name: "C2"}
//       ]);
//     });
  
//   test("filter num_employees > largest company", async function () {
//     let companies = await Company.findAll(
//       {minEmployees: 4}
//     );
//     expect(companies).toEqual([]);
//   });
  
//   test("filter name (case insensitve)", async function () {
//     let companies = await Company.findAll(
//       {name: 'c2'}
//     );
//     expect(companies).toEqual([
//       { handle: "c2", name: "C2"}
//     ]);
//   });

//   test("min > max", async function () {
//     expect.assertions(1);
//     try {
//       await Company.findAll({
//         minEmployees: 3,
//         maxEmployees: 2
//       })
//     } catch (err) {
//       expect(err).toBeTruthy();
//     }
//   })
  
//   test("filter like name", async function () {
//     let companies = await Company.findAll(
//       {name: '2'}
//     );
//     expect(companies).toEqual([
//       {handle: "c2",name: "C2"}
//     ]);
//   });
// })

describe("get", function() {
  test("succeeds", async function () {
    let job = await Job.get(engId);
    expect(job).toEqual({
      id: engId,
      title: "engineer",
      salary: 1000,
      equity: "0.2",
      company_handle: "c1",
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await Job.get("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("create", function () {
  test("succeeds", async function () {
    let job = await Job.create({
      title: "Test",
      salary: 1,
      equity: 0.23,
      company_handle: "c2",
    });

    expect(job).toEqual({
      id: expect.any(Number),
      title: "Test",
      salary: 1,
      equity: "0.23",
      company_handle: "c2",
    });
    /**Filtering by title because only one job with title 'test' */
    const result = await db.query(`SELECT *
                                   FROM jobs
                                   WHERE title = 'Test'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "Test",
        salary: 1,
        equity: "0.23",
        company_handle: "c2",
      },
    ]);
  });

  /*Not testing for dupe because a company can post the same job*/
  // test("fails with dupe", async function () {
  //   expect.assertions(1);
  //   try {
  //     await Job.create({
  //       title: "Test",
  //       salary: 1,
  //       equity: 0.23,
  //       company_handle: "c2",
  //     });
  //   } catch (err) {
  //     expect(err).toBeTruthy();
  //   }
  // });
});

describe("update", function () {
  test("succeeds", async function () {
    let job = await Job.update(engId, {
      title: "New",
    });
    expect(job).toEqual({
      id: engId,
      title: "New",
      salary: 1000,
      equity: '0.2',
      company_handle: "c1",
    });

    const result = await db.query(`SELECT *
                                   FROM jobs
                                   WHERE id = ${engId}`);
    expect(result.rows).toEqual([
      {
        id: engId,
        title: "New",
        salary: 1000,
        equity: '0.2',
        company_handle: "c1",
      },
    ]);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Job.update("nope", {
        name: "New",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with no data", async function () {
    expect.assertions(1);
    try {
      await Job.update(engId, {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await Job.remove(engId);
    const res = await db.query(
        "SELECT * FROM jobs WHERE id=$1", [engId]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Job.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
})
