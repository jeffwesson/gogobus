const nconf = require('nconf')
	, path = require('path')
	;

nconf
	.env()
	.file({
		file: path.join(__dirname, './_config.json')
	})
	;

module.exports = nconf;
