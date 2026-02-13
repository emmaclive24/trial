// Needed Resources 
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/index")
const validate = require('../utilities/account-validation')
const accountController = require("../controllers/accountController")


router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccount));

router.get("/login", utilities.handleErrors(accountController.buildLogin));

router.get("/register", utilities.handleErrors(accountController.buildRegister));

router.get("/logout", utilities.handleErrors(accountController.accountLogout));

router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdate));

// Process the registration data
router.post(
  "/register",
  validate.registationRules(),
  validate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process the login data
router.post(
  "/login",
  validate.loginRules(),
  validate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

router.post(
  "/update",
  validate.accountUpdateRules(),
  validate.checkAccountUpdateData,
  utilities.handleErrors(accountController.updateAccount));

router.post(
  "/password",
  validate.passwordUpdateRules(),
  validate.checkPasswordUpdateData,
  utilities.handleErrors(accountController.updatePassword));

module.exports = router;
