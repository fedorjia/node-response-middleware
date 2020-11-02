let status = require('./response-status')
// const ValidateError = require('./validate-error')

/**
 * response status
 */
exports.responseStatus = status

/**
 * reset status
 */
exports.resetStatus = function(newStatus = {}) {
	status = Object.assign(status, newStatus)
}

/**
 * setup exception middlewares
 */
exports.setupExceptionMiddlewares = function(app) {
	app.use((err, req, res, ignore) => {
		if (typeof err === "string") {
			res.json({status: status.SERVICE_ERROR, body: null, message: err})
		} else {
			if (err.hasOwnProperty('status') && err.hasOwnProperty('message')) {
				// err.message = err.message;
				err.body = null;
				return res.json(err)
			}

			console.log(err)
			res.json({status: status.INTERNAL_ERROR, body: null, message: 'internal error!'})
		}
	})

	app.use((req, res, ignore) => {
		res.json({status: status.REQUEST_NOT_FOUND, body: null, message: 'request not found!'})
	})
}

/**
 * response middleware
 */
exports.responseMiddleware = async (req, res, next) => {
	res.success = (data) => {
		return res.json({ status: status.SUCCESS, body: data, message: '' })
	}

	res.failure = (err) => {
		if(typeof err === "string") {
			res.json({ status: status.SERVICE_ERROR, body: null, message:  err.toString() })
		} else if (err.name === 'validate') {
			res.json({ status: status.REQUEST_ERROR, body: null, message:  err.errors[0].msg })
		} else {
			res.json({ status: status.SERVICE_ERROR, body: null, message: err.message })
		}
	}

	return next()
}
