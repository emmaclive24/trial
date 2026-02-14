/* =====================================================
   SAFE DATABASE REBUILD
   Drops objects in correct dependency order
   ===================================================== */

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS classification CASCADE;
DROP TABLE IF EXISTS account CASCADE;
DROP TYPE IF EXISTS account_type;


/* =====================================================
   CREATE TYPE
   ===================================================== */

CREATE TYPE account_type AS ENUM (
  'Client',
  'Employee',
  'Admin'
);


/* =====================================================
   CREATE TABLE: account
   ===================================================== */

CREATE TABLE account (
  account_id SERIAL PRIMARY KEY,
  account_firstname VARCHAR(50) NOT NULL,
  account_lastname VARCHAR(50) NOT NULL,
  account_email VARCHAR(100) UNIQUE NOT NULL,
  account_password VARCHAR(255) NOT NULL,
  account_type account_type DEFAULT 'Client'
);


/* =====================================================
   CREATE TABLE: classification
   ===================================================== */

CREATE TABLE classification (
  classification_id SERIAL PRIMARY KEY,
  classification_name VARCHAR(50) NOT NULL
);


/* =====================================================
   CREATE TABLE: inventory
   ===================================================== */

CREATE TABLE inventory (
  inv_id SERIAL PRIMARY KEY,
  inv_make VARCHAR(50) NOT NULL,
  inv_model VARCHAR(50) NOT NULL,
  inv_description TEXT NOT NULL,
  inv_image VARCHAR(100) NOT NULL,
  inv_thumbnail VARCHAR(100) NOT NULL,
  classification_id INT NOT NULL
    REFERENCES classification(classification_id)
);


/* =====================================================
   INSERT DATA: classification
   ===================================================== */

INSERT INTO classification (classification_name)
VALUES
  ('Sport'),
  ('SUV'),
  ('Truck'),
  ('Sedan');


/* =====================================================
   INSERT DATA: inventory
   ===================================================== */

INSERT INTO inventory (
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  classification_id
)
VALUES
  (
    'GM',
    'Hummer',
    'small interiors but powerful performance',
    '/images/hummer.jpg',
    '/images/hummer-tn.jpg',
    2
  ),
  (
    'Ferrari',
    '488 Spider',
    'High-performance Italian sports car',
    '/images/ferrari-488.jpg',
    '/images/ferrari-488-tn.jpg',
    1
  ),
  (
    'Porsche',
    '911',
    'Legendary German sports car',
    '/images/porsche-911.jpg',
    '/images/porsche-911-tn.jpg',
    1
  );


/* =====================================================
   TASK 1 – QUERY #4 (REQUIRED BY RUBRIC)
   MUST RUN AFTER DATA INSERT
   ===================================================== */

UPDATE inventory
SET inv_description = REPLACE(
  inv_description,
  'small interiors',
  'a huge interior'
)
WHERE inv_make = 'GM'
  AND inv_model = 'Hummer';


/* =====================================================
   TASK 1 – QUERY #6 (FINAL QUERY IN FILE)
   MUST BE LAST STATEMENT
   ===================================================== */

UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
