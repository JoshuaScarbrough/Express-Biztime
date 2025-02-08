/** Routes for companies. */

// Express so that you can run your server
const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")

// Connecting to your db
const db = require("../db");

// router variable to allow you to run app
let router = new express.Router();


/** GET / => list of companies.
 *
 * =>  {companies: [{code, name, descrip}, {code, name, descrip}, ...]}
 *
 * This get request pulls up the information about the company. The code and name and ordering them by the name. It must be a async function 
 * because the call to the database takes time. The res.json wouldn't return anything because the call would be made after the res is returned. 
 * Thats why we need an async function and we must await the response. 
 * 
 * */

router.get("/", async function (req, res, next) {
  try {
    const result = await db.query(
          `SELECT code, name 
           FROM companies 
           ORDER BY name`
    );

    return res.json({"companies": result.rows});
  }

  catch (err) {
    return next(err);
  }
});


/** GET /[code] => detail on company
 *
 * =>  {company: {code, name, descrip, invoices: [id, ...]}}
 *
 * This get request is a request that makes a call to the query string. Thats why we have the :code because we have to insert a code.
 * 
 * */

router.get("/:code", async function (req, res, next) {
  try {

    // This req.params.code takes the code out of the query string when going to the route. 
    let code = req.params.code;

    // Takes the code out of the query string and returns the specific company due to code. 
    const compResult = await db.query(
          `SELECT code, name, description
           FROM companies
           WHERE code = $1`,
        [code]
    );

    // Takes the code out of the query string and returns the specific invoice due to code. 
    const invResult = await db.query(
          `SELECT id
           FROM invoices
           WHERE comp_code = $1`,
        [code]
    );

    // Takes the code out of the query string and returns the industries that the company is in / falls under
    const industry = await db.query(
      `SELECT industry_code 
       FROM industry_company
       WHERE company_code = $1`,
      [code]
  );

    // Gives the error message if the user inserts an improper code
    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;
    const industries = industry.rows;

    company.invoices = invoices.map(inv => inv.id);

    return res.json({"company": company, industries});
  }

  catch (err) {
    return next(err);
  }
});


/** POST / => add new company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */
 
router.post("/", async function (req, res, next) {
  try {
    let {name, description} = req.body;
    let code = slugify(name, {lower: true});

    const result = await db.query(
          `INSERT INTO companies (code, name, description) 
           VALUES ($1, $2, $3) 
           RETURNING code, name, description`,
        [code, name, description]);

    return res.status(201).json({"company": result.rows[0]});
  }

  catch (err) {
    return next(err);
  }
});


/** PUT /[code] => update company
 *
 * {name, descrip}  =>  {company: {code, name, descrip}}
 *
 * */

router.put("/:code", async function (req, res, next) {
  try {
    let {name, description} = req.body;
    let code = req.params.code;

    const result = await db.query(
          `UPDATE companies
           SET name=$1, description=$2
           WHERE code = $3
           RETURNING code, name, description`,
        [name, description, code]);

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({"company": result.rows[0]});
    }
  }

  catch (err) {
    return next(err);
  }

});


/** DELETE /[code] => delete company
 *
 * => {status: "added"}
 *
 */

router.delete("/:code", async function (req, res, next) {
  try {
    let code = req.params.code;

    const result = await db.query(
          `DELETE FROM companies
           WHERE code=$1
           RETURNING code`,
        [code]);

    if (result.rows.length == 0) {
      throw new ExpressError(`No such company: ${code}`, 404)
    } else {
      return res.json({"status": "deleted"});
    }
  }

  catch (err) {
    return next(err);
  }
});


module.exports = router;