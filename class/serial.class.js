const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const JSON5 = require('json5');
const EventEmitter = require('events');
//~ const heapdump = require('./class/heapdump.class.js').init('./logs');

function splitStringAtInterval (string, interval) {
  var result = [];
  for (var i=0; i<string.length; i+=interval)
    result.push(string.substring (i, i+interval));
  return result;
}

'use strict;'
class serial extends EventEmitter {
	constructor( port, baud, com_type='ascii' ) {
		super();
		const self = this;
		self.conf = {
				port:port,
				baud:baud,
				com_type:com_type,
			};

		this.connect();
	}

	connect(){
		const self = this;
		self.port = new SerialPort(self.conf.port, {
				baudRate: parseInt(self.conf.baud)
			},
			function (err) {
				if (err) {
					let msg = 'Error: '+ err.message;
					//~ SerialPort.list(function (err, ports) {
						//~ ports.forEach(function (port) {
							//~ msg += '\n'+port.comName + ' : ' + port.pnpId + ' ' + port.manufacturer;
						//~ });
					//~ });

					self.emit('error',msg);
					return;
				}
			}
		);

		self.port.on('close', function () {
			self.emit('error',self.conf.port + ' is closed');
			//~ console.log('Connected to:' , self.conf.port , ' baudrate:' , self.conf.baud , 'bps');
		});

		self.port.on('open', function () {
			self.emit('open','Connected to:' + self.conf.port + ' baudrate:' + self.conf.baud + 'bps');
			//~ console.log('Connected to:' , self.conf.port , ' baudrate:' , self.conf.baud , 'bps');
		});

		if(self.conf.com_type==='hex'){
			self.port.on('data', (data) => {
				let raw = data.toString('hex');
				let received = splitStringAtInterval(raw,2);
				let response = {};

				response = {
					status:true,
					received:received,
					raw:raw,
					length:received.length
				};

				if(received.length < 17){
					response.status=false;
					response.message='received data length is '+received.length;
				}

				self.emit('data',response);
				//~ console.log(self.conf.com_type,':',received,received.length);
			});
		}
		else{
			self.lineStream = self.port.pipe(new Readline('\n'));
			self.lineStream.on('data', function (data) {
				let response = {};
				try {
					response = JSON5.parse(data);
				}
				catch (err) {
					response = data;
				}

				self.emit('data',response);
				//~ console.log(self.conf.com_type,':',jsonObj);
			});
		}
	}
}

module.exports = serial;
