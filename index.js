const bodyParser = require('body-parser')
	, cookieParser = require('cookie-parser')
	, configs = require('./configs')
	, debug = require('debug')
	, express = require('express')
	, favicon = require('serve-favicon')
	, gtfs = require('gtfs')
	, logger = require('morgan')
	, mongoose = require('mongoose')
	, pug = require('pug')
	, stylus = require('stylus')
;

const app = express()
	, dbUri = configs.get('dburi')
;

mongoose.Promise = global.Promise;
if (mongoose.connection.readyState !== 1) {
	mongoose.connect(dbUri, {useMongoClient: true});
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'build')));

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
		});
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
		});
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
		});
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
		});
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});
