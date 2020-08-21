"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken
} = require("./_testCommon");

let engId;

beforeAll(commonBeforeAll);

beforeEach(async function() {
  await commonBeforeEach();
  /*get an id for one of our jobs to use in tests*/
  // const test = await db.query('SELECT * FROM jobs')
  // console.log('ALL JOBS@!$#@!$!@$%!:', test)
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

describe("POST /jobs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "Test",
          salary: 1,
          equity: 0.23,
          company_handle: "c2",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "Test",
        salary: 1,
        equity: "0.23",
        company_handle: "c2",
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "Test",
          salary: 1,
          equity: 0.23,
          company_handle: "c2",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for user", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "Test",
          salary: 1,
          equity: "0.23",
          company_handle: "c2",
          _token: u1Token
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "Test",
          salary: 1,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: 123,
          salary: 1,
          equity: 0.23,
          company_handle: "c2",
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});



describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            { id: expect.any(Number), title: "cfo" },
            { id: expect.any(Number), title: "engineer" },
            { id: expect.any(Number), title: "recruiter" },
          ],
    });
  });

  test("get with multiple filters success", async function () {
    const resp = await request(app)
      .get("/jobs")
      .send({minSalary: 10000, hasEquity: false})

      expect(resp.body).toEqual({
      jobs:[{
        id: expect.any(Number), title: "cfo", 
      },
      {
        id: expect.any(Number), title: "recruiter"
      }] 
    });
  });

  test("get with one filter success", async function () {
    const resp = await request(app)
      .get("/jobs")
      .send({title: 'cfo'})

      expect(resp.body).toEqual({
      jobs:[{
        id: expect.any(Number), title: "cfo" 
      }]
    });
  });

    test("No jobs meet filter", async function () {
      const resp = await request(app).get("/jobs")
        .send({title:'job does not exist'});
      expect(resp.body).toEqual({jobs: []});
  });


  test("fails for invalid filters", async function () {
    const resp = await request(app)
      .get(`/jobs`)
      .send({title: 123});
    
      expect(resp.statusCode).toEqual(400);
    });

  test("test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .send({ _token: u1Token });
    expect(resp.statusCode).toEqual(500);
  });
});


describe("GET /jobs/:id", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs/${engId}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "engineer",
        salary: 1000,
        equity: "0.2",
        company_handle: "c1"
      },
    });
  });

  test("fails for job id missing", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });

});


describe("PATCH /jobs/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .patch(`/jobs/${engId}`)
        .send({
          title: "Senior Engineer",
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      job: {
        id: engId,
        title: "Senior Engineer",
        salary: 1000,
        equity: "0.2",
        company_handle: "c1"
      },
    });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${engId}`)
        .send({
          title: "Senior Engineer",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for user", async function () {
    const resp = await request(app)
        .patch(`/jobs/${engId}`)
        .send({
          title: "Senior Engineer",
          _token: u1Token
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${engId}`)
        .send({
          id: 1,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${engId}`)
        .send({
          title: 123,
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /jobs/:id", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .delete(`/jobs/${engId}`)
        .send({
          _token: adminToken,
        });
    expect(resp.body).toEqual({
      deleted: {
        id: engId,
        company_handle:'c1',
        title: 'engineer'
      }
    });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${engId}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for user", async function () {
    const resp = await request(app)
        .delete(`/jobs/${engId}`)
        .send({
          _token: u1Token
        })
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for missing job", async function () {
    const resp = await request(app)
        .delete(`/jobs/nope`)
        .send({
          _token: adminToken,
        });
    expect(resp.statusCode).toEqual(404);
  });
  // TODO: do we want to specifiy the type of error a missing job isFinite(number/string?)
})
