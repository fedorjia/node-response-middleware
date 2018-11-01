const axios = require('axios')

const status = require('./response-status')
const ValidateError = require('./validate-error')
const responseStatus = require('./response-status')
// const logErr = require('./logerr')
// const isDev = process.env.NODE_ENV === 'development'

const filterBody = function(body = {}) {
	const rs = {}
	for (let k in body) {
		if (JSON.stringify(body[k]).length < 64) { // exclude value which very long
			rs[k] = body[k]
		}
	}
	return rs
}

/**
 * setup exception middlewares
 *
 *	isUseLog: 是否使用logger,
 *	logUrl:   logger的URL
 *	extra: {
 *		app: 业务名
 *	}
 */
exports.setupExceptionMiddlewares = function(app, {isUseLog = false, logUrl = null, extra = {}}) {
	/**
	 * error handling
	 */
	app.use((err, req, res, ignore) => {
		if (typeof err === "string") {
			res.json({status: status.SERVICE_ERROR, body: err})
		} else {
			if (err.hasOwnProperty('status') && err.hasOwnProperty('body')) {
				return res.json(err)
			}

			console.log(err)
			res.json({status: status.INTERNAL_ERROR, body: 'internal error!'})

			// log error
			if (isUseLog && logUrl) {
				axios({
					method: 'POST',
					url: logUrl,
					data: {
						url: req.originalUrl,
						method: req.method.toLowerCase(),
						content: JSON.stringify({
							query: req.query,
							body: filterBody(req.body)
						}),
						message: err.message,
						...extra
					}
				})
			}
		}
	})

	app.use((req, res, ignore) => {
		res.json({status: status.REQUEST_NOT_FOUND, body: 'request not found!'})
	})
}

/**
 * response middleware
 *
 *  isUseLog: 是否使用log,
 *	logUrl:   log请求的URL,
 *	extra: {
 *		app: 业务名,
 *		created_type: 操作人类型，默认1
 *	}
 */
exports.responseMiddleware = function({isUseLog = false, logUrl = null, extra = {}}) {
	return async (req, res, next) => {

		const method = req.method.toLowerCase()
		const user = res.locals.user

		res.success = (data) => {

			// log action
			if (isUseLog && logUrl) {
				if (method !== 'get' && user) {
					axios({
						method: 'POST',
						url: logUrl,
						data: {
							url: req.originalUrl,
							method: method,
							content: JSON.stringify({
								query: req.query,
								body: filterBody(req.body)
							}),
							createdBy: user.id,
							...extra
						}
					})
				}
			}

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
}

/**
 * response status
 */
exports.responseStatus = responseStatus