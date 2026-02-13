const accountModel = require("../models/account-model")
const utilities = require("../utilities")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver Account view
* *************************************** */
async function buildAccount(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Deliver Update view
* *************************************** */
async function buildUpdate (req, res, next) {
  const account_id = req.params.account_id
  let nav = await utilities.getNav()
  res.render("account/update", {
    title: "Account Update",
    nav,
    errors: null,
    account_id: account_id,
  })
}



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body
  
  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration. (HASHPW)')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("form-success",`Congratulations, you\'re registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("form-fail", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}


/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) { // OLD FUNCTION
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const logResult = await accountModel.loginAccount(
    account_email,
    account_password
  )

  console.log(`logResult: ${logResult}`)
  if (logResult) {
    req.flash("form-success",`Login success. Welcome ${logResult.account_firstname}!`)
    res.redirect("/")
    // res.status(201).render("account/login", {
    //   title: "Login",
    //   nav,
    // })
  } else {
    req.flash("form-fail", "Login failed. Wrong email and/or password.")
    res.status(501).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
}

async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
      if(process.env.NODE_ENV === 'development') {
        console.log("DEV")
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        console.log("PROD")
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }

      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error(`Access Forbidden. Exception ${error}`)
  }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function accountLogout(req, res) { // OLD FUNCTION
  res.clearCookie('jwt')
  req.flash("form-success",`Logout success.`)
  res.redirect("/")
}


/* ****************************************
*  Process Account Update
* *************************************** */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const accountData = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)
  if (!accountData) {
    const nav = await utilities.getNav()
    req.flash("notice", "Update failed. Please review your information.")
    res.status(400).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  } else {
    // UPDATE COOKIE
    delete accountData.account_password
    const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
    if(process.env.NODE_ENV === 'development') {
      console.log("DEV")
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
    } else {
      console.log("PROD")
      res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
    }
    
    req.flash("form-success", "Your information has been updated.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration. (HASHPW)')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const accountData = await accountModel.updatePassword(account_id, hashedPassword)
  if (!accountData) {
    const nav = await utilities.getNav()
    req.flash("notice", "Password update failed. Please try again.")
    res.status(400).render("account/update", {
      title: "Account Update",
      nav,
      errors: null,
      account_id,
    })
    return
  } else {
    req.flash("form-success", "Your password has been updated.")
    res.redirect(`/account/update/${account_id}`)
  }
}


module.exports = { buildAccount, buildRegister, buildLogin, buildUpdate, registerAccount, loginAccount, accountLogin, accountLogout, updateAccount, updatePassword }