const { name } = require("ejs");
const utilities = require(".");
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator");
const validation = {};


/*  **********************************
 *  Add Classification | Validations
 * ********************************* */
validation.addClassificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .notEmpty()
      .withMessage("A valid classification name is required.")
      .custom(async (classification_name) => {
          const nameExists = await invModel.checkExistingClassification(classification_name)
          
          if (nameExists){
            throw new Error("Classification already exists, please try again with another name.")
          }
      })
  ];
};
validation.checkAddData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = []
  errors = validationResult(req)
  console.log(errors)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      errors,
      title: "Add a new vehicle classification",
      nav,
      classification_name,
    })
    return
  }
  next()
}

/*  **********************************
 *  Add Inventory | Validations
 * ********************************* */
validation.addInventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a correct value for make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a correct value for model."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 1900, max: 2030 })
      .withMessage("Please provide a correct value for year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a correct value for description."),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a correct value for price."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide a correct value for miles."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a correct value for color."),
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please select a classification."),
  ];
};

/*  **********************************
 *  Update Inventory | Validations
 * ********************************* */
validation.updateInventoryRules = () => {
  return [
    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Failed to get the vehicle ID."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a correct value for make."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a correct value for model."),
    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 1900, max: 2030 })
      .withMessage("Please provide a correct value for year."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a correct value for description."),
    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .isFloat({ min: 0 })
      .withMessage("Please provide a correct value for price."),
    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .isInt({ min: 0 })
      .withMessage("Please provide a correct value for miles."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a correct value for color."),
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please select a classification."),
  ];
};

validation.checkAddInventoryData = async (req, res, next) => {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  let errors = []
  errors = validationResult(req)
  console.log(errors)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationDropdown = await utilities.buildClassificationList(classification_id)
    
    req.flash("form-fail", "Sorry, failed to add the new vehicle.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add a new vehicle to the inventory",
      errors,
      nav,
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classificationDropdown
    })
    return
  }
  next()
}

validation.checkUpdateInventoryData = async (req, res, next) => {
  const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body

  let errors = []
  errors = validationResult(req)
  console.log(errors)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationDropdown = await utilities.buildClassificationList(classification_id)
    
    req.flash("form-fail", "Sorry, failed to add the new vehicle.")
    res.status(501).render("inventory/edit-inventory", {
      title: `Update vehicle: ${inv_make} ${inv_model}`,
      errors,
      nav,
      inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classificationDropdown
    })
    return
  }
  next()
}


module.exports = validation