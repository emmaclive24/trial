const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


/* ***************************
 *  Build inventory details view
 * ************************** */
invCont.buildDetailByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryDetailsByInvId(inv_id)
  // if (!data || data.length === 0){
  //   const error = new Error(`There are no vehicles with the ID '${inv_id}'.`)
  //   error.status = "404";
  //   throw error;
  // }
  const grid = await utilities.buildInventoryDetailsGrid(data)
  let nav = await utilities.getNav()
  const make = data[0].inv_make
  const model = data[0].inv_model
  const year = data[0].inv_year
  res.render("./inventory/detail", {
    title: make+" "+model+" "+year,
    nav,
    grid,
  })
}


/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  let content = await utilities.getManagementOptions();
  res.render("./inventory/management", {
    title: "Management",
    nav,
    content
  })  
}

invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add a new classification",
    nav,
  })
}

invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-inventory", {
    title: "Add an item to the inventory",
    nav,
  })
}

invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body
  console.log("########## POST Classification ##########")
  const addResult = await invModel.addClassification( classification_name )

  let nav = await utilities.getNav()

  if (addResult) {
    req.flash("form-success",`New classification added: ${classification_name}`)
    // res.redirect("/inv")
    res.status(201).render("./", {
      title: "Management",
      nav,
    })
  } else {
    req.flash("form-fail", "Sorry, failed to add the new classification.")
    res.status(501).render("inv/classification", {
      title: "Add a new classification",
      nav,
    })
  }
}


module.exports = invCont