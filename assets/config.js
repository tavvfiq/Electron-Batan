const path = require('path');
const __basedir = path.dirname(require.main.filename);

const configuration = {
	__backendURL : 'https://be.dcs.stechoq.com',
	//~ __backendURL : 'http://localhost:3000',
	rsa : {
		pubkey : __basedir+'/assets/key/public.spki',
		privkey : __basedir+'/assets/key/private.pkcs8',
	},
	dbId : 66,
	dandori:[
		{
			jenis:'MOLD+MATERIAL',
			waktu:'00:25:00',
		},
		{
			jenis:'MOLD',
			waktu:'00:15:00',
		},
		{
			jenis:'MATERIAL',
			waktu:'00:10:00',
		},
		{
			jenis:'PURGING',
			waktu:'00:05:00',
		},
	],
	downtime : [
		'MOLD','SETTING','MESIN','MATERIAL','OPERATOR','PLN'
	],
	localDB : {
    "connectionLimit" : 1000,
    "connectTimeout"  : 3000,
    "acquireTimeout"  : 3000,
    "timeout"         : 3000,
    "host"     : "localhost",
    "user"     : "root",
    "password" : "",
    "database" : "dcs_local_tmp",
    "gracefulExit": true
	},
};

module.exports = configuration;
