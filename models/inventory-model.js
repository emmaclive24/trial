const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}
async function getClassificationById(classification_id){
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification WHERE classification_id=$1`,
      [classification_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationById error " + error)
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}

/* ***************************
 *  Get inventory details by vehicle_id
 * ************************** */
async function getInventoryDetailsByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory i
      JOIN classification c 
      ON c.classification_id = i.classification_id
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryDetailsByInvId error " + error)
  }
}



async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */
async function deleteInventory( inv_id ) {
  try {
    const sql = "DELETE FROM public.inventory WHERE inv_id = $1 RETURNING *"
    const data = await pool.query(sql, [inv_id])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}


async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const name = await pool.query(sql, [classification_name])
    return name.rowCount
  } catch (error) {
    return error.message
  }
}

async function checkExistingInventory(inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "SELECT * FROM inventory WHERE inv_make = $1 AND inv_model = $2 AND inv_year = $3 AND inv_description = $4 AND inv_price = $5 AND inv_miles = $6 AND inv_color = $7 AND classification_id = $8"
    const name = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id])
    return name.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = {getClassifications, getClassificationById, getInventoryByClassificationId, getInventoryDetailsByInvId, addClassification, addInventory, updateInventory, deleteInventory, checkExistingClassification, checkExistingInventory};