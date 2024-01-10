const express = require('express');
const router = express.Router();
const { db } = require('../db/config');
const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const schemaFilePath = path.join(__dirname, '..', 'schema.json');
const schema = JSON.parse(fs.readFileSync(schemaFilePath, 'utf8'));



// Create for admins
router.post('/admins', async (req, res) => {
  try {
    // Generate Joi schema based on the columns array
    const validationSchema = generateValidationSchema([{"name":"id","type":"integer","primaryKey":true,"validate":false},{"name":"user_id","type":"integer","validate":true,"required":true},{"name":"name","type":"string","searchable":true,"validate":true,"required":true},{"name":"address","type":"string","searchable":true,"validate":true},{"name":"city","type":"string","searchable":true,"validate":true},{"name":"state","type":"string","validate":true},{"name":"dob","type":"string","validate":true},{"name":"admin_type","type":"string","validate":true,"required":true},{"name":"is_active","type":"integer","validate":true},{"name":"created_at","type":"integer","validate":false},{"name":"updated_at","type":"integer","validate":false}]);
    // Validate the request body against the generated schema
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    // Set default values
    req.body.created_at = currentTimestamp;
    req.body.updated_at = currentTimestamp;
    req.body.is_active = 1;

    const result = await db.query(
      'INSERT INTO admins (user_id, name, address, city, state, dob, admin_type, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        
        req.body.user_id,
        
        req.body.name,
        
        req.body.address,
        
        req.body.city,
        
        req.body.state,
        
        req.body.dob,
        
        req.body.admin_type,
        
        req.body.is_active,
        
        req.body.created_at,
        
        req.body.updated_at,
        
      ]
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all for admins
router.get('/admins', async (req, res) => {
  try {
    let qString = 'SELECT * FROM admins WHERE 1=1';
    
    const currentTable = schema.tables.find(t => t.name === 'admins');
    
    // Check for search
    if (req.query.search && currentTable && currentTable.columns.some(col => col.searchable)) {
      qString += ' AND (';
      qString += currentTable.columns
        .filter(col => col.searchable)
        .map(col => `${col.name} LIKE ?`)
        .join(' OR ');
      qString += ')';
    }

    // Apply filters based on request parameters
    if (req.query.filterColumn && req.query.filterValue && currentTable.columns.some(col => col.name === req.query.filterColumn)) {
      qString += ` AND ${req.query.filterColumn} = ?`;
    }

    // Sorting
    if (req.query.sortBy && req.query.sortOrder) {
      const validColumns = currentTable.columns.map(col => col.name);
      if (validColumns.includes(req.query.sortBy)) {
        qString += ` ORDER BY ${req.query.sortBy} ${req.query.sortOrder.toUpperCase()}`;
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    qString += ` LIMIT ${limit} OFFSET ${offset}`;

    const queryParams = [];

    // Add search parameters
    if (req.query.search) {
      queryParams.push(...currentTable.columns.filter(col => col.searchable).map(col => `%${req.query.search}%`));
    }

    // Add filter parameters
    if (req.query.filterColumn && req.query.filterValue) {
      queryParams.push(req.query.filterValue);
    }

    const results = await db.query(qString, queryParams);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read one
router.get('/admins/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM admins WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(user[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update for admins
router.put('/admins/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Generate Joi schema based on the columns array
    const validationSchema = generateValidationSchema([{"name":"id","type":"integer","primaryKey":true,"validate":false},{"name":"user_id","type":"integer","validate":true,"required":true},{"name":"name","type":"string","searchable":true,"validate":true,"required":true},{"name":"address","type":"string","searchable":true,"validate":true},{"name":"city","type":"string","searchable":true,"validate":true},{"name":"state","type":"string","validate":true},{"name":"dob","type":"string","validate":true},{"name":"admin_type","type":"string","validate":true,"required":true},{"name":"is_active","type":"integer","validate":true},{"name":"created_at","type":"integer","validate":false},{"name":"updated_at","type":"integer","validate":false}]);
    // Validate the request body against the generated schema
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const currentEpochTimestamp = Math.floor(new Date().getTime() / 1000);

    // Filter out null or undefined values from the request body
    const updateFields = Object.entries(req.body)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key} = ?`)
      .join(', ');

    const result = await db.query(
      `UPDATE admins SET ${updateFields}, updated_at = ? WHERE id = ?`,
      [
        ...Object.values(req.body).filter(value => value !== null && value !== undefined),
        currentEpochTimestamp,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete
router.delete('/admins/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM admins WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      const currentEpochTimestamp = Math.floor(new Date().getTime() / 1000);
      await db.query('UPDATE admins SET is_active=0, updated_at=? WHERE id = ?', [currentEpochTimestamp, req.params.id]);
      res.json({ message: 'Record deleted successfully' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Create for accounts
router.post('/accounts', async (req, res) => {
  try {
    // Generate Joi schema based on the columns array
    const validationSchema = generateValidationSchema([{"name":"id","type":"integer","primaryKey":true,"validate":false},{"name":"name","type":"string","searchable":true,"validate":true,"required":true},{"name":"address","type":"string","searchable":true,"validate":true},{"name":"city","type":"string","searchable":true,"validate":true},{"name":"state","type":"string","validate":true},{"name":"website","type":"string","validate":true},{"name":"office_email","type":"string","searchable":true,"validate":true},{"name":"office_phone","type":"string","searchable":true,"validate":true},{"name":"office_fax","type":"string","validate":true},{"name":"other_description","type":"string","validate":true},{"name":"is_active","type":"integer","validate":true},{"name":"created_at","type":"integer","validate":false},{"name":"updated_at","type":"integer","validate":false}]);
    // Validate the request body against the generated schema
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const currentTimestamp = Math.floor(new Date().getTime() / 1000);
    // Set default values
    req.body.created_at = currentTimestamp;
    req.body.updated_at = currentTimestamp;
    req.body.is_active = 1;

    const result = await db.query(
      'INSERT INTO accounts (name, address, city, state, website, office_email, office_phone, office_fax, other_description, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        
        req.body.name,
        
        req.body.address,
        
        req.body.city,
        
        req.body.state,
        
        req.body.website,
        
        req.body.office_email,
        
        req.body.office_phone,
        
        req.body.office_fax,
        
        req.body.other_description,
        
        req.body.is_active,
        
        req.body.created_at,
        
        req.body.updated_at,
        
      ]
    );

    res.json({ id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read all for accounts
router.get('/accounts', async (req, res) => {
  try {
    let qString = 'SELECT * FROM accounts WHERE 1=1';
    
    const currentTable = schema.tables.find(t => t.name === 'accounts');
    
    // Check for search
    if (req.query.search && currentTable && currentTable.columns.some(col => col.searchable)) {
      qString += ' AND (';
      qString += currentTable.columns
        .filter(col => col.searchable)
        .map(col => `${col.name} LIKE ?`)
        .join(' OR ');
      qString += ')';
    }

    // Apply filters based on request parameters
    if (req.query.filterColumn && req.query.filterValue && currentTable.columns.some(col => col.name === req.query.filterColumn)) {
      qString += ` AND ${req.query.filterColumn} = ?`;
    }

    // Sorting
    if (req.query.sortBy && req.query.sortOrder) {
      const validColumns = currentTable.columns.map(col => col.name);
      if (validColumns.includes(req.query.sortBy)) {
        qString += ` ORDER BY ${req.query.sortBy} ${req.query.sortOrder.toUpperCase()}`;
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    qString += ` LIMIT ${limit} OFFSET ${offset}`;

    const queryParams = [];

    // Add search parameters
    if (req.query.search) {
      queryParams.push(...currentTable.columns.filter(col => col.searchable).map(col => `%${req.query.search}%`));
    }

    // Add filter parameters
    if (req.query.filterColumn && req.query.filterValue) {
      queryParams.push(req.query.filterValue);
    }

    const results = await db.query(qString, queryParams);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Read one
router.get('/accounts/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM accounts WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.json(user[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update for accounts
router.put('/accounts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Generate Joi schema based on the columns array
    const validationSchema = generateValidationSchema([{"name":"id","type":"integer","primaryKey":true,"validate":false},{"name":"name","type":"string","searchable":true,"validate":true,"required":true},{"name":"address","type":"string","searchable":true,"validate":true},{"name":"city","type":"string","searchable":true,"validate":true},{"name":"state","type":"string","validate":true},{"name":"website","type":"string","validate":true},{"name":"office_email","type":"string","searchable":true,"validate":true},{"name":"office_phone","type":"string","searchable":true,"validate":true},{"name":"office_fax","type":"string","validate":true},{"name":"other_description","type":"string","validate":true},{"name":"is_active","type":"integer","validate":true},{"name":"created_at","type":"integer","validate":false},{"name":"updated_at","type":"integer","validate":false}]);
    // Validate the request body against the generated schema
    const { error } = validationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const currentEpochTimestamp = Math.floor(new Date().getTime() / 1000);

    // Filter out null or undefined values from the request body
    const updateFields = Object.entries(req.body)
      .filter(([key, value]) => value !== null && value !== undefined)
      .map(([key, value]) => `${key} = ?`)
      .join(', ');

    const result = await db.query(
      `UPDATE accounts SET ${updateFields}, updated_at = ? WHERE id = ?`,
      [
        ...Object.values(req.body).filter(value => value !== null && value !== undefined),
        currentEpochTimestamp,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete
router.delete('/accounts/:id', async (req, res) => {
  try {
    const user = await db.query('SELECT * FROM accounts WHERE id = ?', [req.params.id]);
    if (user.length === 0) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      const currentEpochTimestamp = Math.floor(new Date().getTime() / 1000);
      await db.query('UPDATE accounts SET is_active=0, updated_at=? WHERE id = ?', [currentEpochTimestamp, req.params.id]);
      res.json({ message: 'Record deleted successfully' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;


// Function to generate Joi validation schema
function generateValidationSchema(columns) {
  const schema = {};
  columns.forEach(col => {
    if (col.validate) {
      let fieldSchema;

      switch (col.type) {
        case 'string':
          fieldSchema = Joi.string();
          break;
        case 'integer':
          fieldSchema = Joi.number();
          break;
        // Add more cases as needed for other types

        default:
          fieldSchema = Joi.any(); // Default to any if the type is not recognized
      }

      if (col.required) {
        fieldSchema = fieldSchema.required();
      }

      schema[col.name] = fieldSchema;
    }
  });

  return Joi.object(schema);
}
