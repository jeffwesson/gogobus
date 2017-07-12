const RANGE = 0.8;
var el = document.querySelector('#title');
var btn = document.querySelector('#btn');
var _loc;

navigator.geolocation.getCurrentPosition(res => {
	_loc = res;
	btn.removeAttribute('disabled');
}
, err => {
	console.error(err);
});

const increment = function(rgb) {
	let rgbRe = /([0-9]{0,3}),\s?([0-9]{0,3}),\s?([0-9]{0,3})/g;
	let match = rgbRe.exec(rgb);
	let r = Number(match[1]);
	let g = Number(match[2]);
	let b = Number(match[3]);
	return `rgb(${r + 1}, ${g + 1}, ${b + 1})`;
};

const compare = function (a, b) {
	a = Number(a.toFixed(5));
	b = Number(b.toFixed(5));
	return a === b || (a - RANGE <= b && b <= a + RANGE) || (b - RANGE <= a && a <= b + RANGE);
};

el.addEventListener('click', e => {
	let styles = window.getComputedStyle(e.currentTarget);
	e.currentTarget.style.color = increment(styles.color);
});

btn.addEventListener('click', e => {
	let xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://api.transitfeeds.com/v1/getLocations?key=006f34c1-cee0-4e9b-a709-576e2d7658f6', true);
	xhr.addEventListener('load', e => {
		console.log(JSON.parse(xhr.response).results.locations.length + ' initial locations');
		let localLocations = JSON.parse(xhr.response).results.locations.filter(loc => {
			return compare(loc.lat, _loc.coords.latitude) && compare(loc.lng, _loc.coords.longitude);
		});
		console.log(localLocations);
		console.log(localLocations.map(l => l.id));
	});
	xhr.send();
});
