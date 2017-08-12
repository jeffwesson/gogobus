const APIKEY = '006f34c1-cee0-4e9b-a709-576e2d7658f6';
const APIURL = 'https://api.transitfeeds.com/v1';
const RANGE = (def => {
	try {
		return range = parseFloat(window.gogobus.dataLayer.range);
	} catch (e) {
		console.trace(e);
		return def;
	}
})(0.8);
var el = document.querySelector('#title');
var btn = document.querySelector('#btn');
var _loc;

navigator.geolocation.getCurrentPosition(res => {
	console.log(`lat: ${res.coords.latitude}`);
	console.log(`lng: ${res.coords.longitude}`);
	_loc = res;
	btn.removeAttribute('disabled');
}
, err => {
	console.error(err);
});

const increment = function increment(rgb) {
	let rgbRe = /([0-9]{0,3}),\s?([0-9]{0,3}),\s?([0-9]{0,3})/g;
	let match = rgbRe.exec(rgb);
	let r = Number(match[1]);
	let g = Number(match[2]);
	let b = Number(match[3]);
	return `rgb(${r + 1}, ${g + 1}, ${b + 1})`;
};

const makeRequest = function makeRequest(cfg) {
	return new Promise(function(resolve, reject) {
		let {body, method, url} = cfg
			, xhr = new XMLHttpRequest()
			;

		xhr.open(method, url, true);
		xhr.onload = function() {
			if (this.status >= 200 && this.status < 300) {
				resolve(this.response);
			} else {
				reject({
					status: this.status
					, statusText: this.statusText
				});
			}
		};
		xhr.onerror = function() {
			reject({
				status: this.status
				, statusText: this.statusText
			});
		};
		xhr.send(body);
	});
};

const compare = function compare(a, b) {
	a = Number(a.toFixed(5));
	b = Number(b.toFixed(5));
	return a === b || (a - RANGE <= b && b <= a + RANGE) || (b - RANGE <= a && a <= b + RANGE);
};

const composeUrl = function composeUrl(path, params) {
	params = Object.assign({key: APIKEY}, params);
	if (typeof params === 'object') {
		params = Object.keys(params).map((k) => {
			return `${k}=${params[k]}`;
		}).join('&');
	}
	return `${APIURL}/${path}${params ? '?' + params : ''}`;
}

el.addEventListener('click', e => {
	let styles = window.getComputedStyle(e.currentTarget);
	e.currentTarget.style.color = increment(styles.color);
});

btn.addEventListener('click', () => {
	let feeds = [];
	makeRequest({
		method: 'GET'
		, url: composeUrl('getLocations')
	})
		.then(data => {
			let localLocations = JSON.parse(data).results.locations.filter(loc => {
				return compare(loc.lat, _loc.coords.latitude) && compare(loc.lng, _loc.coords.longitude);
			});
			localLocations.forEach(loc => {
				makeRequest({
					method: 'GET'
					, url: composeUrl('getFeeds', {
						location: loc.id
						, descendents: 1
						, page: 1
						, limit: 10000
					})
				}).then(data => {
					feeds = feeds.concat(JSON.parse(data).results.feeds);
					if (feeds.length === 23) {
						console.log(JSON.stringify(feeds.map(f => {
							return {"agencyKey": f.t, "url": f.u.d || f.u.i};
						})));
					}
				}).catch(err => console.trace(err));
			});
		})
		.catch(err => {
			console.log(err);
		})
		;
});
