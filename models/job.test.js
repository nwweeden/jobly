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
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      { id: expect.any(Number), title: "cfo" },
      { id: expect.any(Number), title: "engineer" },
      { id: expect.any(Number), title: "recruiter" },
    ]);
  });

  test("equity equals false", async function () {
    let jobs = await Job.findAll({
      hasEquity: false
    });
    
    expect(jobs).toEqual([
      { id: expect.any(Number), title: "cfo" },
      { id: expect.any(Number), title: "engineer" },
      { id: expect.any(Number), title: "recruiter" },
    ]);
  });

  test("filter minSalary >= 11000", async function () {
    let jobs = await Job.findAll(
      {minSalary: 11000}
    );
    expect(jobs).toEqual([
      {id: expect.any(Number), title: "recruiter"},
    ]);
  });

  test("filter equity > 0", async function () {
    let jobs = await Job.findAll(
      {hasEquity: true}
    );
    expect(jobs).toEqual([
        {id: expect.any(Number), title: "cfo"},
        {id: expect.any(Number), title: "engineer"},
      ]);
    });
    
    test("filter title (case insensitve)", async function () {
      let jobs = await Job.findAll(
        {title: 'CFO'}
      );
      expect(jobs).toEqual([
        {id: expect.any(Number), title: "cfo"}
      ]);
    });

  test("salary is greater than largest company", async function () {
    let jobs = await Job.findAll(
      {minSalary: 1000000}
    );
    expect(jobs).toEqual([]);
  })
  
  test("filter like title", async function () {
    let jobs = await Job.findAll(
      {title: 'gin'}
    );
    expect(jobs).toEqual([
      {id: expect.any(Number), title: "engineer"},
    ]);
  });
})

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
