"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const {
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with username, password.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
        `SELECT username,
                  password,
                  first_name,
                  last_name,
                  email,
                  is_admin
           FROM users
           WHERE username = $1`,
        [username],
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /** Register user with data.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws BadRequestError on duplicates.
   **/

  static async register(
      { username, password, first_name, last_name, email, is_admin }) {
    const duplicateCheck = await db.query(
        `SELECT username
           FROM users
           WHERE username = $1`,
        [username],
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${data.username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
        `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            is_admin)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING username, first_name, last_name, email, is_admin`,
        [
          username,
          hashedPassword,
          first_name,
          last_name,
          email,
          is_admin,
        ],
    );

    const user = result.rows[0];

    return user;
  }

  /** Find all users.
   *
   * Returns [{username, first_name, last_name, email }]
   * (empty array if none found)
   * */
  static async findAll() {

    const usersRes = await db.query(
        `SELECT username, first_name, last_name, email
           FROM jobs
           ORDER BY name`);

    return usersRes.rows;
  }


    /** Given a user username, return data about the user.
   *
   * Returns { username, first_name, last_name, email, is_admin }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(username) {
    const res = await db.query(
      `SELECT username, first_name, last_name, email, is_admin 
           FROM users
           WHERE username = $1`,
      [username]);

    const user = res.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

    /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {first_name, last_name, email, password}
   *
   * Returns {username, first_name, last_name, email, is_admin}
   *
   * Throws NotFoundError if not found.
   */

  static async update(username, data) {
    if (Object.keys(data).length === 0) throw new BadRequestError("No data");

    if(password in data){
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    const { setCols, values } = sqlForPartialUpdate(data);
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING username, 
                                first_name,
                                last_name, 
                                email,
                                is_admin` 
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }

    /** Delete given user from database; returns username deleted.
   *
   * Throws NotFoundError if user not found.
   **/

  static async remove(username) {
    const result = await db.query(
      `DELETE
           FROM users
           WHERE id = $1
           RETURNING username`,
      [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);
    return user;
  }
}

module.exports = User;
