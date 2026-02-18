/**
 * CSE 340 Primary Server File
 */
require("dotenv").config()
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const flash = require('connect-flash')

// Routes & Modules
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const utilities = require("./utilities/")
const pool = require('./database/') 

const app = express()

/* ***********************
 * Middleware
 *************************/

// 1. Static assets should always be first to avoid unnecessary session checks
app.use(static) 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// 2. Session Middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true, // Note: Render users may still need to create this manually
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false,
  name: 'sessionId',
}))

// 3. Flash & Messages
app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// 4. JWT Token Check
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") 

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// 404 Route
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Error Handler
* Polished to prevent "Headers already sent" errors
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  // FIX: Check if headers were already sent to prevent app crash
  if (res.headersSent) {
    return next(err)
  }

  const status = err.status || 500
  const message = (status == 404) ? err.message : 'Oh no! There was a crash. Maybe try a different route?'
  
  res.status(status).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Server Listen
 *************************/
const port = process.env.PORT || 5500
// On Render, '0.0.0.0' is better than 'localhost' for the host binding
const host = process.env.HOST || '0.0.0.0'

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`)
})
