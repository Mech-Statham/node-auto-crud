const Dotenv = require('dotenv');


Dotenv.config({ silent: true});
//Dotenv.config({ silent: true, path: "../.env" });

module.exports = {
	API_LIMIT: process.env.API_LIMIT || 50,
	APP_ENV: process.env.APP_ENV,
	WEB: process.env.WEB,
	IMAGE_PROFILE_URL: process.env.IMAGE_PROFILE_URL || '',
	IMAGE_PROFILE_PATH: process.env.IMAGE_PROFILE_PATH || 'images/',
	FILE_PROFILE_PATH: process.env.FILE_PROFILE_PATH || 'profiles/',
	FILE_PROFILE_URL: process.env.FILE_PROFILE_URL || '',
	DB: {
		USERNAME: process.env.DB_USERNAME,
		PASSWORD: process.env.DB_PASSWORD,
		NAME: process.env.DB_NAME,
		HOST: process.env.DB_HOST,
		DIALECT: process.env.DB_DIALECT,
		PORT: process.env.DB_PORT
	},
	HTTP_STATUS_CODES: {
		OK: 200,
		CREATED: 201,
		ACCEPTED: 202,
		NO_CONTENT: 204,
		BAD_REQUEST: 400,
		UNAUTHORIZED: 401,
		FORBIDDEN: 403,
		NOT_FOUND: 404,
		UNPROCESSABLE_ENTITY: 422,
		TOO_MANY_REQUESTS: 429,
		INTERNAL_SERVER_ERROR: 500,
		BAD_GATEWAY: 502,
		SERVICE_UNAVAILABLE: 503
	},
	dataStatusText: {
		ACTIVE: 1,
		1: 'Active',
		INACTIVE: 0,
		0: 'Inactive',
		DELETED: 2,
		2: 'Deleted',
		NA: 'Unknown'
	},
	REDIS: {
		REDIS_HOST: process.env.REDIS_HOST || 'localhost',
		REDIS_PORT: process.env.REDIS_PORT || 6379
	},
	JWT: {
		SECRET_KEY: process.env.SECRET_KEY || 'test',
		EXPIRY: process.env.JWT_EXPIRY || ''
	},
	requestHeaders: {
		CONTENT_TYPE: 'Content-Type',
		REQ_TIME: 'X-Req-Time',
		REQ_AUTH: 'X-Auth-Token'
	},
	pageConfig: {
		DEFAULT: 10,
		USERS: 10,
		PRODUCTS: 10
	},

	user_type: {
		ADMIN: 1,
		1: 'ADMIN',
		SALES: 2,
		2: 'SALES',
		HR: 3,
		3: 'HR',
		OPERATION: 4,
		4: 'OPERATION'
	}
};
