const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* **************************************
* Build the Inventory Details view HTML
* ************************************ */
Util.buildInventoryDetailsGrid = async function(data){
  let grid
  if(data.length > 0){
    const vehicle = data[0]
    
    grid = '<span>' + vehicle.inv_description + '</span>'
    grid += '<div id="inv-details">'

    grid += '<div id="details-picture">'
    grid += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors">'
    grid += '</div>'
    
    grid += '<div id="details-info">'
    
    grid += '<div id="details-info-labels">'
    grid += '<p>Make: </p>' 
    grid += '<p>Model: </p>' 
    grid += '<p>Year: </p>' 
    grid += '<p>Color: </p>' 
    grid += '<p>Type: </p>' 
    grid += '<p>Miles: </p>' 
    grid += '<p>Price: </p>' 
    grid += '</div>'

    grid += '<div id="details-info-values">'
    grid += '<p>' + vehicle.inv_make + '</p>'
    grid += '<p>' + vehicle.inv_model + '</p>'
    grid += '<p>' + vehicle.inv_year + '</p>'
    grid += '<p>' + vehicle.inv_color + '</p>'
    grid += '<p>' + vehicle.classification_name + '</p>'
    grid += '<p>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + '</p>'
    grid += '<p>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>'
    grid += '</div>'
    
    grid += '</div>'
        
    grid += '</div>'
  
    grid += '<hr>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

Util.getManagementOptions = async function (requ, res, next) {
  let options =
  '<div class="mgt-main">'+
  ' <h3>Select the item you need to add:</h3>'+
  ' <div>'+
  '     <a href="/inv/classification">Classification</a>'+
  '     <a href="/inv/inventory">Inventory</a>'+
  ' </div>'+
  '</div>'
  return options
}


Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classification_id" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

Util.buildNoVehiclesFound = function (){
  return `<h4>No vehicles found for this category</h4>`;
}

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("notice","Please log in.")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    
    res.locals.accountData = accountData
    res.locals.loggedIn = 1

    next()
   })
 } else {
  next()
 }
}



/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedIn) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkIfAdminOrEmployee = (req, res, next) => {
  if (res.locals.accountData.account_type == "Admin" || res.locals.accountData.account_type == "Employee") {
    next();
  } else {
    res.clearCookie('jwt')
    req.flash("notice",`You don't have access to this site, please login as Admin or Employee.`)
    res.redirect("/")
  }
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util