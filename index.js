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

app.use((req, res, next) => {
	let { secret } = req.headers;
	if (req.url.indexOf('/v1') > -1) {
		if (secret !== configs.get('API_SECRET')) {
			res.status(401);
			res.statusMessage = 'Invalid secret.'
			res.send({ status: 401, statusMessage: 'Invalid secret.'});
			return;
		}
	}
	next();
});

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

// API
//
app.get('/v1/agencies', (req, res) => {
	gtfs.agencies()
		.then(agencies => {
			res.send({ agencies });
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.render('index', {
				title: 'Agencies Error'
			});
		})
		;
});

app.get('/v1/routes/:agency', (req, res) => {
	let { agency } = req.params;
	gtfs.getRoutesByAgency(agency)
		.then(routes => {
			res.send({ routes });
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.render('index', {
				title: `${agency} routes error`
			});
		})
		;
});

app.get('/v1/routes/:route_id', (req, res) => {
	let { route_id } = req.params;
	gtfs.getRoutesById(route_id)
		.then(routes => {
			res.send({ routes });
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.render('index', {
				title: `${agency} routes error`
			});
		})
		;
});

app.get('/v1/stops/:agency/:route', (req, res) => {
	let { agency, route } = req.params;
	gtfs.getStopsByRoute(agency, route)
		.then(stops => {
			res.send({ stops });
		})
		.catch(err => {
			res.status(500);
			res.statusMessage = console.trace(err).toString();
			res.render('index', {
				title: `${route} stops error`
			});
		})
		;
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));
