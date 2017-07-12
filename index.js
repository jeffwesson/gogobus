const configs = require('./configs.js')
	, express = require('express')
	, mongoose = require('mongoose')
	, pug = require('pug')
	;

const PORT = configs.get('PORT') || 3333;

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.render('index', {
		title: 'Title Goes Here'
	});
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));