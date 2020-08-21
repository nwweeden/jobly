"use strict";

const db = require("../db");
const { sqlForPartialUpdate, sqlForJobsFiltering } = require("../helpers/sql");

const {
  BadRequestError,
  NotFoundError,
} = require("../expressError");

class Job {

  /** Find all jobs.
 *
 * jobFilters may include:
 * {title (string), minSalary (integer), hasEquity (boolean)}
 * 
 * Returns [{ id, title }, ...] (empty list if none found)
 * */
  static async findAll(jobFilters) {
    let filterValues;
    let where = ''

    if (Object.keys(jobFilters).length > 0) {
      const filters = sqlForJobsFiltering(jobFilters);
      // console.log('FILTERS AREEEEEEEEE:', filters)
      where = filters.whereClause || '';
      filterValues = filters.values || [];
    }
    const jobsRes = await db.query(
      `SELECT id, title
      FROM jobs
      ${where}
      ORDER BY title`, filterValues);

    return jobsRes.rows;
  }

  /** Given a job id, return data about the job.
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    if (!parseInt(id)) throw new NotFoundError(`it's a string!: ${id}`)
    const jobRes = await db.query(
      `SELECT id, title, salary, equity, company_handle 
           FROM jobs
           WHERE id = $1`,
      [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   * */

  static async create({ title, salary, equity, company_handle }) {
    // TODO consider furhter our assumption that duplicate jobs are not a problem

    const newJob = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
      [
        title,
        salary,
        equity,
        company_handle,
      ],
    );
    const job = newJob.rows[0];

    return job;
  }


  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity, company_handle}
   *
   * Returns {id, title, salary, equity, company_handle}
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    if (Object.keys(data).length === 0) throw new BadRequestError("No data");

    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title,
                                salary, 
                                equity, 
                                company_handle`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }


  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    // console.log('TYPE OF ID IS:', parseInt(id))
    if (!parseInt(id)) throw new NotFoundError(`it's a string!: ${id}`)

    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id, company_handle, title`,
      [id]);
    console.log('OUR JOB WE ARE TRYING TO FIND:', id, result.rows[0])
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }
}

module.exports = Job