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
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false,
  name: 'sessionId',
}))

app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

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
app.use(static)
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)

// 404 Route
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Error Handler
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const status = err.status || 500
  const message = status === 404 ? err.message : 'Oh no! There was a crash.'
  res.status(status).render("errors/error", {
    title: status,
    message,
    nav
  })
})

/* ***********************
 * Server Listen
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'

app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`)
})
