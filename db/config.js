const config = require('../config');
const util = require('util');
const mysql = require('mysql2');
//const Sequelize = require('sequelize');

const database = config.DB.NAME;
const username = config.DB.USERNAME;
const password = config.DB.PASSWORD;

const pool = mysql.createPool({
	host: config.DB.HOST,
	user: config.DB.USERNAME,
	password: config.DB.PASSWORD,
	database: config.DB.NAME,
	waitForConnections: true,
	connectionLimit: 20,
	queueLimit: 0,
	enableKeepAlive: true,
	keepAliveInitialDelay: 0
});

// const sequelize = new Sequelize(database, username, password, {
// 	host: config.DB.HOST,
// 	dialect: 'mysql',
// 	port: config.DB.PORT,
// 	pool: {
// 		max: 10,
// 		min: 0,
// 		idle: 10000,
// 		acquire: 10000
// 	},
// 	logging: config.APP_ENV == 'DEV' ? console.log : false
// });

// sequelize
// 	.sync({
// 		force: false,
// 		logging: false
// 	})
// 	.then(function () {
// 		console.log('DB connection sucessful.');
// 	})
// 	.catch(err => {
// 		console.log('error has occured', err);
// 		process.exit()
// 	});

const db = pool;
//const promisePool = sequelize;
db.query = util.promisify(db.query);

module.exports = { db };