const path = require('path');
const __basedir = path.dirname(require.main.filename);

const fetch = require('node-fetch');
const sha512 = require('js-sha512').sha512;
const md5 = require('md5');

const config = require(__basedir+'/assets/config.js');

const __enc = require(__basedir+'/class/enc.class.js');
const enc = new __enc(config.rsa);

const __mysql = require(__basedir+'/class/db.class.js');
const localDB = new __mysql(config.localDB);

class __api{
	__saveToLocalDB(body){
		let request = JSON.stringify(body);

		let sql = {
				query : 'INSERT INTO tmp_request(`requestBody`,`requestMD5`) VALUES(?,?)',
				params : [
					request
					,md5(request)
				]
			};

		return localDB.query(sql.query,sql.params)
		.then(results => {
			return {
				status : true,
				data : results
			}
		})
		.catch(error => {
			return {
				status : false,
				data : error
			}
		});
	}

	__doRunQuery2(token,body,localBackup = true){
		return fetch((config.__backendURL + '/action/runQuery2'), {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-type': 'application/json',
				'Authorization' : 'Bearer '+token
			}
		})
		.then(response => response.json())
		.then(response => {
			if(!response.status){
				return new Promise((resolve,reject)=>{
					reject(response.error);
				});
			}
			console.log(response);
			return response;

		})
		.catch(async error => {
			console.error(error);
			if(localBackup){
				console.error(error,'Attempting to save to local DB instead');
				let saveToLocal = await this.__saveToLocalDB(body);
				return {
					status:false,
					error:error,
					saveToLocal : saveToLocal
				};
			}
			else{
				return {
					status:false,
					error:error
				};
			}
		});
	}

	async saveShift(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "INSERT INTO tb_shift(`shiftNoSPK`,`shiftOperator`,`shiftJenis`,`shiftAdditionalInfo`,`shiftWaktuMulai`,`shiftWaktuSelesai`,`shiftDurasi`,`shiftDurasiDwontime`) VALUES(?,?,?,?,?,?,?,?)",
				params:[
					[
						data.NoSPK
						,data.Operator
						,data.Jenis
						,data.AdditionalInfo
						,data.WaktuMulai
						,data.WaktuSelesai
						,data.Durasi
						,data.DurasiDowntime
					]
				]
			};

		let exec = await this.__doRunQuery2(token,body);

		return exec;
	}

	async saveProduksiScrap(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "INSERT INTO tb_produksi(`produksiNoSPK`,`produksiOperator`,`produksiScrapId`) VALUES(?,?,?)",
				params:[
					[
						data.NoSPK
						,data.Operator
						,data.ScrapId
					]
				]
			};

		let exec = await this.__doRunQuery2(token,body);

		return exec;
	}

	async saveEvent(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "INSERT INTO tb_produksi_event(`peventNoSPK`,`peventType`,`peventData`) VALUES(?,?,?)",
				params:[
					[
						data.NoSPK
						,data.Type
						,data.Data
					]
				]
			};

		let exec = await this.__doRunQuery2(token,body);

		return exec;
	}

	async saveLog(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "INSERT INTO tb_produksi_log(`plogNoSPK`,`plogOperator`,`plogTotalPcs`,`plogTotalScrap`,`plogCavityNumber`,`plogWaktuProduksi`,`plogWaktuDowntime`) VALUES(?,?,?,?,?,?,?)",
				params:[
					[
						data.NoSPK
						,data.Operator
						,data.TotalPcs
						,(data.TotalScrap==null)?(0):(data.TotalScrap)
						,data.CavityNumber
						,data.WaktuProduksi
						,data.WaktuDowntime
					]
				]
			};

		let exec = await this.__doRunQuery2(token,body);

		return exec;
	}

	async saveSensorData(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "INSERT INTO tb_sensor(`sensorNoSPK`,`sensorJSON`) VALUES(?,?)",
				params:[
					[
						data.NoSPK
						,data.JSON
					]
				]
			};

		let exec = await this.__doRunQuery2(token,body);

		return exec;
	}
	async getProductionStats(){
		let mesinId = 1;
		let token = localStorage.getItem('token');
		let data = await fetch(config.__backendURL+'/utils/getStatsByMachineId/'+mesinId,{
			method: 'GET',
			headers: {
				'Content-type': 'application/json',
				'Authorization' : 'Bearer '+token
			}
		})
		.then(response => response.json())
		.then(response => {
			//~ console.log(response);
			return response;
		})
		.catch(error => {
			console.error(error);
			return {status:false};
		});

		return data;
	}

	async fetchPeriodicData(data){
		let token = localStorage.getItem('token');
		let body = {
				dbId:config.dbId,
				query: "SELECT bb.spkNoSPK AS noSPK, bb.spkTotalWaktu AS plannedTime, bb.spkTotalOrder AS plannedOrder, aa.plogCavityNumber AS cavityNumber, aa.plogTotalPcs AS totalPcs, aa.plogTotalScrap AS totalScrap, aa.plogWaktuProduksi AS productionTime, aa.plogWaktuDowntime AS downtime, SEC_TO_TIME( TIME_TO_SEC(aa.plogWaktuProduksi) + TIME_TO_SEC(aa.plogWaktuDowntime) ) AS totalTime, ROUND(aa.plogTotalPcs/((TIME_TO_SEC(aa.plogWaktuProduksi) + TIME_TO_SEC(aa.plogWaktuDowntime))/3600)) AS pcsPerHour, (aa.plogTotalScrap/aa.plogTotalPcs*100) AS percentScrap, bb.spkMolding AS molding, bb.spkMaterial AS material, bb.spkWarna AS warna, cc.produkNama AS produkNama, aa.timestamp AS timestamp  FROM tb_produksi_log AS aa JOIN tb_spk AS bb ON plogNoSPK = bb.spkNoSPK  JOIN tb_produk AS cc ON bb.spkProdukId=cc.produkId  ORDER BY timestamp DESC LIMIT 1",
				params:[]
			};

		let exec = await this.__doRunQuery2(token,body,false);

		return exec;
	}

	async login(data){
		return fetch((config.__backendURL + '/auth/login'), {
			method: 'POST',
			body: JSON.stringify({
				data:{
					userId	: "agos",
					password	: "password"
				}
			}),
			headers: {
				'Content-type': 'application/json'
			}
		})
		.then(response => response.json())
		.then(response => {
			if(!response.status){
				return new Promise((resolve,reject)=>{
					reject(response.error);
				});
			}

			return response;
		})
		.catch(error=>{
			return {
				status:false,
				error:error
			};
		});
	}
}

module.exports = __api;
