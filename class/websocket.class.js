const JSON5 = require('json5');
const EventEmitter = require('events');

'use strict;'
class websocket extends EventEmitter {
	constructor(url, autoReconnect = true, parseJSON = true) {
		super();
		const self = this;
		self.parseJSON = parseJSON;
		self.autoReconnect = autoReconnect;
		self.url = url.replace(/http/i, 'ws');
		this.connect();
	}

	connect() {
		const self = this;
		let ws = new WebSocket(self.url);

		ws.onopen = function (data) {
			self.emit('open', 'Connection to ' + self.url + ' established');
		};

		ws.onmessage = function (msg) {
			let data = msg.data;

			if (self.parseJSON) {
				try {
					data = JSON5.parse(data);
				}
				catch (error) {
					data = data;
				}
			}

			self.emit('message', data);
		};

		ws.onclose = function (e) {
			if(self.autoReconnect){
				console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
				setTimeout(function () {
					self.connect();
				}, 1000);
			}
		};

		ws.onerror = function (error) {
			console.error(error);
			self.emit('Socket encountered error: ', error.message, 'Closing socket');
			ws.close();
		};
	}
}

module.exports = websocket;
