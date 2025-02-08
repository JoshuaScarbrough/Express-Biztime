/** Routes for industries. */

const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


router.get("/", async function (req, res, next){
    try{
        const result = await db.query(
            `SELECT company_code, industry_code
             FROM industry_company`
        )

        return res.json({"Industry / Company": result.rows[0]})

    } catch(err) {
        return next(err)
    }

})


router.post("/", async function (req, res, next){
    try{
        let {code, industry} = req.body;

        const result = await db.query(
            `INSERT INTO industries (code, industry)
             VALUES ($1, $2)
             RETURNING code, industry`,
             [code, industry]
        );

        return res.json({"industry": result.rows[0]});

    } catch(err){
        return next(err);
    }
})






module.exports = router;