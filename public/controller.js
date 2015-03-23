var bgColor = 'rgb(125, 125, 125)';

function log(message) {
	return;
	var ta = document.getElementsByTagName('textarea')[0],
		NL = "\n";

	ta.value = message + NL + ta.value.substr(0, 1024);
}

function writeMessage(str) {
	var cnv = document.getElementsByTagName('canvas')[0],
		ctx = cnv.getContext('2d');

	ctx.fillStyle=bgColor;
	ctx.fillRect(0, 0, cnv.width, cnv.height);
	ctx.font="75pt Helvetica";
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	ctx.fillStyle="rgb(0,0,0)";

	if (! (str instanceof Array)) {
		str = str.split("\n");
	}

	var lines = str,
		lineHeight = 125,
		textHeight = lines.length * lineHeight,
		sy = Math.max(lineHeight, cnv.height / 2 - textHeight);

	for (var i = 0, l = lines.length; i < l; i++) {
		ctx.fillText(lines[i], cnv.width /2, sy + i * lineHeight, cnv.width - 10);
	}
}

function unsup() {
	writeMessage("Unfortunately,\nyour web browser\ndoesn't support all\nrequired features.\nSorry.");
}

function init() {
	var cnv = document.getElementsByTagName('canvas')[0],
		ctx = cnv.getContext('2d'),
		host = window.location.host,
		lastSpeed = null,
		n = 0;

	log('init');

	cnv.width = window.innerWidth;
	cnv.height = window.innerHeight;

	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, cnv.width, cnv.height);

	var wsUrl = 'ws://' + host + ':8080/',
		ws = new WebSocket(wsUrl);

	log('attempting connect to ' + wsUrl);

	ws.onopen = function wsOpen(e) {
		log('connected');
		writeMessage('Connected');
		window.addEventListener('devicemotion', motionAccelChange, false);
		this.send(JSON.stringify({type: "player"}));
	};
	ws.onclose = function wsClose(e) {
		log('disconnected');
		writeMessage('Disconnected');
		window.removeEventListener('devicemotion', motionAccelChange);
	};
	ws.onmessage = function wsMessage(e) {
		log('message: ' + e.data);
		try {
			var data = JSON.parse(e.data);

			if ("color" in data) {
				bgColor = data.color;
			}

			if ("message" in data) {
				writeMessage(data.message);
			}

			if ("disconnect" in data) {
				ws.close();
			}
		} catch (e) {

		}
	}
	ws.onerror = function wsError(e) {
		log('error');
	}


	function motionAccelChange(e) {
		var motion = Math.max(-8, Math.min(8, e.accelerationIncludingGravity.y)),
			speed = {
				x: 0,
				y: Math.round(motion / 16 * 2 * 10) / 10
				};

		sendSpeed(speed);
	}

	function sendSpeed(speed) {
		log(speed.y);

		if (lastSpeed !== null && lastSpeed.y === speed.y) {
			log('not sending');
			return;
		}

		log(ws.send(JSON.stringify(speed)) ? 'sent' : 'not sent');
		lastSpeed = speed;
	}

	function resetSpeed(e) {
		window.removeEventListener('devicemotion', motionAccelChange);

		var speed = { x: 0, y: 0 };

		log('mousedown');

		ctx.fillStyle = 'rgb(255, 0, 0)';
		ctx.fillRect(0, 0, cnv.width, cnv.height);

		sendSpeed(speed);
	}

	function enableSpeed(e) {
		window.addEventListener('devicemotion', motionAccelChange, false);

		log('mouseup');

		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, cnv.width, cnv.height);
	}


	cnv.addEventListener('mousedown', resetSpeed, false);
	cnv.addEventListener('mouseup', enableSpeed, false);
	cnv.addEventListener('touchstart', resetSpeed, false);
	cnv.addEventListener('touchend', enableSpeed, false);
}

var hasWebSocket = 'WebSocket' in window,
	hasMotionEv = 'DeviceMotionEvent' in window;

if (hasWebSocket && hasMotionEv) {
	window.addEventListener('load', init, false);
} else {
	window.addEventListener('load', unsup, false);
}