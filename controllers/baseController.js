const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res){ // <-- Method 1 to export the function (implicit): "baseController.buildHome"
  const nav = await utilities.getNav()
  // req.flash("notice", "This is a flash message.")
  res.render("index", {title: "Home", nav})
}

module.exports = baseController // <-- Method 2 to export the function