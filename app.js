/** BizTime express application. */

// Express so that you can run your server
const express = require("express");

// ExpressError for error handling.
const ExpressError = require("./expressError");

// Calling the routes for companies and invoices
const companiesRoutes = require("./routes/companies");
const invoicesRoutes = require("./routes/invoices");

// making app a variable and setting it for express to be able to make routes 
const app = express();

// app.use with express.json() allows the post request to come back with a josn response
app.use(express.json());

//??
app.use("/companies", companiesRoutes);
app.use("/invoices", invoicesRoutes);


/** 404 handler, what this does is allow 404 errors to be brought up when you call the ExpressError */
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;