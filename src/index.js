const status = require('./response-status')
const ValidateError = require('./validate-error')
const responseStatus = require('./response-status')
// const logErr = require('./logerr')
// const isDev = process.env.NODE_ENV === 'development'

/**
 * setup exception middlewares
 */
exports.setupExceptionMiddlewares = function(app, appname = '') {
	/**
	 * error handling
	 */
	app.use((err, req, res, ignore) => {
		if (typeof err === "string") {
			res.json({status: status.SERVICE_ERROR, body: err})
		} else {
			console.log(err)
			res.json({status: status.INTERNAL_ERROR, body: 'internal error!'})
			// if (!isDev) { // log error
			// 	logErr(appname, req.originalUrl, null, err.message)
			// }
		}
	})
	app.use((req, res, ignore) => {
		res.json({status: status.REQUEST_NOT_FOUND, body: 'request not found!'})
	})
}

/**
 * response middleware
 */
exports.responseMiddleware = function (req, res, next) {

	res.success = (data) => {
		return res.json({ status: status.SUCCESS, body: data })
	}

	res.failure = (err) => {
		if(typeof err === "string") {
			res.json({ status: status.SERVICE_ERROR, body:  err.toString() })
		} else if(err instanceof ValidateError) {
			res.json({ status: status.REQUEST_ERROR, body:  err.errors[0].msg })
		} else {
			res.json({ status: status.SERVICE_ERROR, body: err.message })
		}
	}

	return next()
}

/**
 * response status
 */
exports.responseStatus = responseStatus