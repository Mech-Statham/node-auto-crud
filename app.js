const express = require('express');
const path = require('path');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const { APP_ENV, WEB } = require('./config');
const commonRoutes = require('./routes/common-routes');

const app = express();

// helmet used to secure HTTP headers
app.use(helmet());

// Common middlewares
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '/public')));

// sanitize request data
app.use(xss());


// to validate and limit incoming requests per IP
//app.use(rateLimiter);

let corsOptions = {};
if (APP_ENV === 'PRD') {
	const whitelist = [WEB];
	corsOptions = {
		origin(origin, callback) {
			if (whitelist.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		methods: ['GET', 'OPTIONS', 'PUT', 'POST', 'DELETE']
	};
}

app.use(cors(corsOptions));
app.use("/v1",commonRoutes);

// if trying to access incorrect route
app.use((req, res, next) => {
	res.status(404).send({ status: false });
});

global.dirname = __dirname;

module.exports = app;
