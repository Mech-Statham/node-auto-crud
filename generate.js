const fs = require('fs');
const ejs = require('ejs');

// Read the schema
const schema = JSON.parse(fs.readFileSync('schema.json', 'utf-8'));

// Read the EJS template
const template = fs.readFileSync('crud-template.ejs', 'utf-8');

// Render the template with the schema
const generatedCode = ejs.render(template, { schema });

// Write the generated code to a file
fs.writeFileSync('./routes/common-routes.js', generatedCode);

console.log('Code generation complete!');
