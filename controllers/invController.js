const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

/* ***************************
 *  Build inventory by classification view
 * ************************** */
async function buildByClassificationId (req, res, next) {
  const classification_id = req.params.classificationId
  
  
  let classification_name = null
  try{
    const classification = await invModel.getClassificationById(classification_id)
    classification_name = classification.classification_name
  } catch {
    console.log(`Error getting classification name with ID: ${classification_id}`)
    classification_name = " "
  }
  
  const data = await invModel.getInventoryByClassificationId(classification_id)
  let grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()

  if (data){
    res.render("./inventory/classification", {
      title: classification_name + " Vehicles",
      nav,
      grid,
    })
  }   
}


/* ***************************
 *  Build inventory details view
 * ************************** */
async function buildDetailByInvId (req, res, next) {
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
async function buildManagement (req, res, next) {
  console.log("********************************************")
  let nav = await utilities.getNav()
  let content = await utilities.getManagementOptions();
  const classificationSelect = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Management",
    nav,
    content,
    classificationSelect,
  })
}

async function buildAddClassification (req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add a new vehicle classification",
    nav,
    errors: null
  })
}

async function buildAddInventory (req, res, next) {
  let nav = await utilities.getNav()
  let classificationDropdown = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add a new vehicle to the inventory",
    nav,
    classificationDropdown,
    errors: null
  })
}

async function buildUpdateInventory (req, res, next) {
  const inv_id = req.params.invId
  const item = (await invModel.getInventoryDetailsByInvId(inv_id))[0]
  
  const name = `${item.inv_make} ${item.inv_model}`

  let nav = await utilities.getNav()
  let classificationDropdown = await utilities.buildClassificationList(item.classification_id)

  res.render("inventory/edit-inventory", {
    title: "Update vehicle: " + name,
    nav,
    classificationDropdown,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_description: item.inv_description,
    inv_image: item.inv_image,
    inv_thumbnail: item.inv_thumbnail,
    inv_price: item.inv_price,
    inv_miles: item.inv_miles,
    inv_color: item.inv_color,
    classification_id: item.classification_id,
  })
}

async function buildDeleteInventory (req, res, next) {
  const inv_id = req.params.invId
  const item = (await invModel.getInventoryDetailsByInvId(inv_id))[0]
  
  const name = `${item.inv_make} ${item.inv_model}`

  let nav = await utilities.getNav()
  const classification_name = (invModel.getClassificationById(item.classification_id)).classification_name

  res.render("inventory/delete-inventory", {
    title: "Delete vehicle: " + name,
    nav,
    errors: null,
    inv_id: item.inv_id,
    inv_make: item.inv_make,
    inv_model: item.inv_model,
    inv_year: item.inv_year,
    inv_image: item.inv_image,
    inv_price: item.inv_price,
    inv_miles: item.inv_miles,
    inv_color: item.inv_color,
    classification_name: classification_name,
  })
}

async function addClassification (req, res) {
  const { classification_name } = req.body
  const addResult = await invModel.addClassification( classification_name )

  let nav = await utilities.getNav()

  if (addResult) {
    req.flash("form-success",`New classification added: ${classification_name}`)
    // res.redirect("/inv")let nav = await utilities.getNav()
  
    let content = await utilities.getManagementOptions();
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      content,
    })
  } else {
    req.flash("form-fail", "Sorry, failed to add the new classification.")
    res.status(501).render("inventory/add-classification", {
      title: "Add a new classification",
      nav,
      errors: null
    })
  }
}

async function addInventory (req, res) {
  const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
  const addResult = await invModel.addInventory( inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id )
  let nav = await utilities.getNav()

  console.log(addResult);

  if (addResult) {
    req.flash("form-success",`New vehicle added: ${inv_make} ${inv_model} ${inv_year}`)
    let content = await utilities.getManagementOptions();
    res.status(201).render("inventory/management", {
      title: "Management",
      nav,
      content,
    })
  } else {
    let classificationDropdown = await utilities.buildClassificationList(classification_id)
    req.flash("form-fail", "Sorry, failed to add the new vehicle.")
    res.status(501).render("inventory/add-inventory", {
      title: "Add a new vehicle to the inventory",
      nav,
      errors: null,
      classificationDropdown,
    })
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("form-success", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Update vehicle: " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_id } = req.body

  const deleteResult = await invModel.deleteInventory( inv_id )

  if (deleteResult) {
    req.flash("form-success", `${deleteResult.inv_make} ${deleteResult.inv_model} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const item = (await invModel.getInventoryDetailsByInvId(inv_id))[0]
    const classification_name = (invModel.getClassificationById(item.classification_id)).classification_name

    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/delete-inventory", {
      title: `Delete vehicle: ${inv_make} ${inv_model}`,
      nav,
      errors: null,
      inv_id: item.inv_id,
      inv_make: item.inv_make,
      inv_model: item.inv_model,
      inv_year: item.inv_year,
      inv_image: item.inv_image,
      inv_price: item.inv_price,
      inv_miles: item.inv_miles,
      inv_color: item.inv_color,
      classification_name: classification_name,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
async function getInventoryJSON (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


module.exports = { buildByClassificationId, buildDetailByInvId, buildManagement, buildAddClassification, buildAddInventory, buildUpdateInventory, buildDeleteInventory, addClassification, addInventory, updateInventory, deleteInventory, getInventoryJSON }