"use strict";

const db = require("../db.js");
const Company = require("./company.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("findAll", function () {
  test("all no filter", async function () {
    let companies = await Company.findAll({});
    expect(companies).toEqual([
      { handle: "c1", name: "C1" },
      { handle: "c2", name: "C2" },
      { handle: "c3", name: "C3" },
    ]);
  });

  test("filter num_employees >= 3", async function () {
    let companies = await Company.findAll(
      {minEmployees: 3}
    );
    expect(companies).toEqual([
      {handle: "c3", name: "C3"}
    ]);
  });

  test("filter num_employees <=2", async function () {
    let companies = await Company.findAll(
      {maxEmployees: 2}
    );
    expect(companies).toEqual([
        {handle: "c1", name: "C1"},
        {handle: "c2", name: "C2"}
      ]);
    });
  
  test("filter num_employees > largest company", async function () {
    let companies = await Company.findAll(
      {minEmployees: 4}
    );
    expect(companies).toEqual([]);
  });
  
  test("filter name (case insensitve)", async function () {
    let companies = await Company.findAll(
      {name: 'c2'}
    );
    expect(companies).toEqual([
      { handle: "c2", name: "C2"}
    ]);
  });

  test("min > max", async function () {
    expect.assertions(1);
    try {
      await Company.findAll({
        minEmployees: 3,
        maxEmployees: 2
      })
    } catch (err) {
      expect(err).toBeTruthy();
    }
  })
  
  test("filter like name", async function () {
    let companies = await Company.findAll(
      {name: '2'}
    );
    expect(companies).toEqual([
      {handle: "c2",name: "C2"}
    ]);
  });
})

describe("get", function () {
  test("succeeds", async function () {
    let company = await Company.get("c1");
    expect(company).toEqual({
      handle: "c1",
      name: "C1",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
      jobs: [{
        id: expect.any(Number),
        title: 'engineer',
        salary: 1000,
        equity: '0.2'},
      {
        id: expect.any(Number),
        title: 'recruiter',
        salary: 12000,
        equity: null
      }]
    });
  });

  test("fails", async function () {
    expect.assertions(1);
    try {
      await Company.get("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("create", function () {
  test("succeeds", async function () {
    let company = await Company.create({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    expect(company).toEqual({
      handle: "test",
      name: "Test",
      num_employees: 1,
      description: "Test Description",
      logo_url: "http://test.img",
    });
    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'test'`);
    expect(result.rows).toEqual([
      {
        handle: "test",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      },
    ]);
  });

  test("fails with dupe", async function () {
    expect.assertions(1);
    try {
      await Company.create({
        handle: "c1",
        name: "Test",
        num_employees: 1,
        description: "Test Description",
        logo_url: "http://test.img",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("succeeds", async function () {
    let company = await Company.update("c1", {
      name: "New",
    });
    expect(company).toEqual({
      handle: "c1",
      name: "New",
      num_employees: 1,
      description: "Desc1",
      logo_url: "http://c1.img",
    });

    const result = await db.query(`SELECT *
                                   FROM companies
                                   WHERE handle = 'c1'`);
    expect(result.rows).toEqual([
      {
        handle: "c1",
        name: "New",
        num_employees: 1,
        description: "Desc1",
        logo_url: "http://c1.img",
      },
    ]);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.update("nope", {
        name: "New",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with no data", async function () {
    expect.assertions(1);
    try {
      await Company.update("c1", {});
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("remove", function () {
  test("succeeds", async function () {
    await Company.remove("c1");
    const res = await db.query(
        "SELECT * FROM companies WHERE handle=$1", ["c1"]);
    expect(res.rows.length).toEqual(0);
  });

  test("fails if not found", async function () {
    expect.assertions(1);
    try {
      await Company.remove("nope");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
