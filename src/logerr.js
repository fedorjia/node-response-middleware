/**
 * 错误日志
 */
const axios = require('axios')
const BUSINESS = 'feizhi-handset-api'

module.exports = (url, args, message) => {

	axios({
		method: 'post',
		// url: `${setting.URL_LOGGER}`,
		data: {
			business: BUSINESS,
			url,
			args: args? JSON.stringify(args): null,
			message
		}
	})
}
