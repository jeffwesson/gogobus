const configs = require('./configs.js')
	, express = require('express')
	, gtfs = require('gtfs')
	, mongoose = require('mongoose')
	, pug = require('pug')
	;

const PORT = configs.get('PORT') || 3333;
const MONGODB_URI = configs.get('MONGODB_URI') || 'mongodb://localhost:27017/gtfs';

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI, { useMongoClient: true });

var app = express();

app.set('views', './views');
app.set('view engine', 'pug');
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.render('index', {
		title: 'Home'
	});
});

app.get('/get-locations/range/:range', (req, res) => {
	res.render('get-locations', {
		data: {
			range: req.params.range
		}
		, title: 'Get Locations'
	});
});

app.get('/v1/agencies', (req, res) => {
	gtfs.agencies()
		.then(agencies => {
			res.render('agencies', {
				data: { agencies }
				, title: 'Agencies'
			});
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.
			res.render('index', {
				title: 'Agencies Error'
			});
		})
		;
});

app.get('/v1/routes/:agency', (req, res) => {
	let agencyKey = req.params.agency;
	gtfs.getRoutesByAgency(agencyKey)
		.then(routes => {
			res.render('routes', {
				data: { routes }
				, title: `${agencyKey} routes`
			});
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.
			res.render('index', {
				title: `${agencyKey} routes error`
			});
		})
		;
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
