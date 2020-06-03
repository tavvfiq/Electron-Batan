const path = require('path');
const __basedir = path.dirname(require.main.filename);
const fetch = require('node-fetch');
const querystring = require('querystring');
const time = require('./timer.js');
const JSON5 = require('json5');

const __api = require(__basedir + '/lib/__api.js');
const api = new __api();

const config = require(__basedir + '/assets/config.js');
const Highcharts = require('highcharts');

const __INTERVAL = 245000;

$.fn.extend({
	disable: function (state) {
		return this.each(function () {
			var $this = $(this);
			if ($this.is('input, button, textarea, select'))
				this.disabled = state;
			else
				$this.toggleClass('disabled', state);
		});
	}
});

function getStorage(key) {
	return localStorage.getItem(key);
}

function showNotification(text, type = 'success', ms = 4000) {
	const container = document.getElementById("alert-container");

	let alertId = 'alert-' + Date.now();

	let alert = document.createElement('div');
	alert.setAttribute('id', alertId);
	alert.setAttribute('class', 'col-12 py-1 alert alert-' + type);
	alert.setAttribute('role', 'alert');
	alert.setAttribute('style', 'font-size:10.5pt;display:none;');
	alert.innerHTML = text;

	container.appendChild(alert);

	let elem = document.querySelector('#' + alertId);
	$(elem)
	.slideDown('fast');

	let dismiss = setInterval(function () {
		$(elem)
		.slideUp()
		.delay(10)
		.queue(function () {
			$(this)
			.remove();
		});

		clearInterval(dismiss);
	}, ms);
}

function showPopup(popupName = false) {
	if (popupName === false) {
		$('.popup')
		.hide('fast');
		return;
	}

	let isLoggedIn = localStorage.getItem("isLoggedIn");

	let ini = $('#' + popupName + '-popup');
	ini.siblings('.popup')
	.hide();
	ini.show('fast');

};

function showSection(sectionName) {
	let isLoggedIn = localStorage.getItem("isLoggedIn");

	if (isLoggedIn == null) {
		sectionName = "display-section";
	}

	//add previous-section, just in case
	if (localStorage.getItem('section') !== localStorage.getItem('previous-section')) {
		localStorage.setItem('previous-section', localStorage.getItem('section'));
	}

	localStorage.setItem('section', sectionName);

	showUserInfo();

	let ini = $('#' + sectionName);
	ini.siblings('.section')
	.hide();
	ini.show('fast');

	//send log each 5 minutes if section is production-section
	if (sectionName === 'production-section') {
		let sendLog = setInterval(async function () {
			//if current section is not production-section, clear interval
			if (localStorage.getItem('section') !== 'production-section') {
				clearInterval(sendLog);
			}
			else {
				let spk = JSON5.parse(localStorage.getItem('data-spk'));
				let data = {
					NoSPK: spk.spkNoSPK,
					Operator: localStorage.getItem('userId'),
					TotalPcs: +localStorage.getItem('production-total-pcs') * +localStorage.getItem('section-var-cavitynumber'),
					TotalScrap: localStorage.getItem('production-total-scrap'),
					CavityNumber: +localStorage.getItem('section-var-cavitynumber'),
					WaktuProduksi: time.toMysqlTime(+time.getSectionTimer(sectionName, false)),
					WaktuDowntime: time.toMysqlTime(+time.getDowntimeDuration())
				};

				await api.saveLog(data);
			}
		}, 300000);
	}

	$('.resumetime-button')
	.hide();
	$('.downtime-button')
	.show();
	$(".errorMessage")
	.html('');
};

function setLoginError(message) {
	$(".errorMessage")
	.html((message != null || message !== undefined) ? (message) : (''));
	setTimeout(function () {
		$(".errorMessage")
		.html('');
	}, 5000);
}

function showUserInfo() {
	let userId = localStorage.getItem("userId");

	if (userId !== null) {
		$('.header-username')
		.html(userId);
	}
}

function resetGUI() {
	$('.element-shown')
	.show();
	$('.element-hidden')
	.hide();
	$('.header-username')
	.html('');
	$('.resumetime-button')
	.hide();
	$('.downtime-button')
	.show();
}

function showProductionButton(arr) {
	if (arr instanceof Array) {
		const container = document.querySelector('.production-button-group');
		container.innerHTML = "";

		for (let idx = 0; idx < arr.length; idx++) {
			const button = document.createElement('button');
			button.setAttribute('class', 'btn btn-primary production-button');
			button.setAttribute('data-scrapid', arr[idx].scrapId);
			button.innerHTML = arr[idx].scrapNama;

			container.appendChild(button);
		}

		showDandoriList();
		showProductionCavityList();
	}
	else {
		console.error('Wrong Format ');
	}
	return;
}

function addObjectValueById(obj) {
	for (let key in obj) {
		$('#' + key)
		.html(obj[key]);
	}
	return;
}

function showDandoriList() {
	let arr = config.dandori;

	const container = document.querySelector('.dandori-list');
	container.innerHTML = "";
	let colWidth = 'col-' + String(Math.floor(12 / arr.length));

	for (let idx in arr) {
		const button = document.createElement('button');
		button.setAttribute('id', 'dandori-button-' + arr[idx].jenis);
		button.setAttribute('class', 'show-section btn btn-outline-success btn-lg mr-3');
		button.setAttribute('data-jenisdandori', arr[idx].jenis);
		button.setAttribute('data-section', 'dandori');
		button.innerHTML = arr[idx].jenis;

		container.appendChild(button);
	}

	return;
}

function showProductionCavityList() {

	return;
}

function logout() {
	localStorage.clear();
	resetGUI();
	showSection('display-section');
}

function displaySpinner(shown = true) {
	if (shown) {
		$('.spinner-wrapper')
		.fadeIn('fast');
	}
	else {
		$('.spinner-wrapper')
		.fadeOut('fast');
	}
}

function getCurrentSectionName(isNameOnly = true) {
	let section = localStorage.getItem('section');
	return (isNameOnly) ? (section.replace('-section', '')) : (section);
}

function createAdditionalInfo(data) {
	let color = ["primary", "info", "success", "secondary", "dark", "danger"];
	let container = document.querySelector('#info-container');
	container.innerHTML = '';
	let template = document.querySelector('.template-additionalInfo');
	//~ console.log(data);

	for (let key in data) {
		//~ console.log(key, data[key], typeof data[key])
		if (typeof data[key] !== 'object') {
			let title = key.replace(/([A-Z])/g," $1")
				.split(' ')
				.map(
					w => w[0].toUpperCase() + w.substr(1).toLowerCase()
				)
				.join(' ');
			let child = $(template)
			.clone();
			child.removeClass("component");
			child.removeClass("template-additionalInfo");

			child.children('.info-title').html(title);
			child.children('.info-value').html(data[key]);

			child.appendTo(container);
		}
	}

	//~ for(let idx = 0; idx < data.length; idx++){
	//~ let child = $(template).clone();

	//~ child.removeClass("component");
	//~ child.removeClass("template-additionalInfo");

	//~ child.children('.info-title').html(data[idx].text);
	//~ child.children('.info-value').html(data[idx].value);

	//~ child.appendTo(container);
	//~ }
}

function createCard(data) {
	let color = ["primary", "info", "success", "secondary", "dark", "danger"];
	let container = document.querySelector('#card-deck');
	container.innerHTML = '';
	let template = document.querySelector('.template-card');
	//~ console.log(data);

	for (let idx = 0; idx < data.length; idx++) {
		let card = $(template)
		.clone();
		let header = card.children('.card-header');
		let body = card.children('.card-body');

		card.removeClass("component");
		card.removeClass("template-card");

		header.html(data[idx].text);
		header.addClass("bg-" + color[idx % color.length] + " text-white");

		body.children('.card-title')
		.html(data[idx].value);

		card.appendTo(container);
	}
}

function initHighcharts(chartData,target,animated=true) {
	Highcharts.chart('card-deck', {
    chart: {
			type: 'column',
			height: 390
    },

    title: {
			style : {
				display : 'none'
			}
    },

		credits: false,

		yAxis: {
			title: {
				text: 'Suhu'
			},
			labels: {
					format: '{value:,.0f}',
					style : {
						fontWeight : '1000'
					}
			},
			plotLines: [{
					value: chartData.target[0],
					color: 'blue',
					dashStyle: 'shortdash',
					width: 2,
					label: {
						text: chartData.target[0],
						align:'left',
						x:-30,
						y:4,
						style : {
							fontWeight : '1000'
						},
					}
			}],
		},

    xAxis: {
			labels: {
				style: {
					fontSize: '8',
					fontWeight : '1000'
				}
			 }
			,categories: chartData.time
    },
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'middle'
		},

    plotOptions: {
				column: {
						animation: animated,
						zones: [{
								value: target, // Values up to 10 (not including) ...
								color: 'red' // ... have the color blue.
						},{
								color: 'green' // Values from 10 (including) and up have the color red
						}]
				},
        series: {
            enableMouseTracking: false
        }
    },

		series: [
			{
				name: 'Target',
				type:	'spline',
				color : '#0000FF',
				dashStyle: 'shortdash',
				marker: {
					enabled: false
        },
				data: [chartData.target[0]]
			},
			{
				name: 'Total OK',
				type:	'column',
				color : '#1EEB07',
				dataLabels: {
					enabled: true
				},
				data: chartData.totalOK
			},
		],

		responsive: {
			rules: [{
				condition: {
					maxWidth: 500
				},
				chartOptions: {
					legend: {
						layout: 'horizontal',
						align: 'center',
						verticalAlign: 'bottom'
					}
				}
					}]
		}

	});

}

async function login() {
	let login = await api.login();
	localStorage.setItem('token', login.data[0].token);
}

async function fetchPeriodicData(updateCard = true) {
	let fetch = await api.fetchPeriodicData();
	let fetchTime = new Date();
	localStorage.setItem('display-data', JSON5.stringify(fetch.data));

	let mainData = [
		{
			text: "Produksi Aktual",
			value: fetch.data.totalPcs + " Pcs"
		},
		{
			text: "Rencana Produksi",
			value: fetch.data.plannedOrder + " Pcs"
		},
		{
			text: "Pcs/Jam",
			value: fetch.data.pcsPerHour + " Pcs/Jam"
		},
		{
			text: "Scrap (%)",
			value: fetch.data.percentScrap + "%"
		},
		{
			text: "Produksi Aktual / Target (Pcs)",
			value: fetch.data.totalPcs + " / " + fetch.data.plannedOrder
		},
		{
			text: "Waktu Aktual / Target",
			value: fetch.data.totalTime + " / " + fetch.data.plannedTime
		},
	];

	let additionalData = [
		{
			text: "No SPK",
			value: fetch.data.noSPK
		},
		{
			text: "Nama Produk",
			value: fetch.data.produkNama
		},
		{
			text: "Material",
			value: fetch.data.material
		},
		{
			text: "Warna",
			value: fetch.data.warna
		},
		{
			text: "Molding",
			value: fetch.data.molding
		},
		{
			text: "Jumlah Cavity",
			value: fetch.data.cavityNumber
		},
	];

	createCard(mainData);
	createAdditionalInfo(additionalData);

	return {
		mainData: mainData,
		additionalData: additionalData
	};
}

async function generateChart(data = null,animated=true){
	displaySpinner(true);
	try{
		let stats;
		if(data == null){
			stats = await api.getProductionStats();
		}
		else{
			stats = data;
		}

		if(stats.status){
			initHighcharts(stats.data.chartPerHour,stats.data.pcsPerJam,animated);

			delete stats.data.targetTime;
			delete stats.data.pcsPerJam;
			delete stats.data.productionDuration;

			stats.data.cycleTime += " s";
			stats.data.totalOrder += " pcs";
			stats.data.totalOK += " pcs";
			stats.data.totalScrap += " pcs";

			createAdditionalInfo(stats.data);

			displaySpinner(false);
		}
	}
	catch(error){
		showNotification(String(error));
	}
}

$(document).ready(async function () {
	// fetch data with api for initial data
	await generateChart();

	const __ws = require(__basedir + '/class/websocket.class.js');
	const ws = new __ws(config.__backendURL+'/ws/utils/getStatsByMachineId/1');

	ws.on('open',(data) => {
		console.log(data);
		//~ generateChart(data);
	});

	ws.on('message',(data) => {
		//~ console.log(data);
		generateChart(data,false);
	});

	//fetch periodic data each 5 minutes
	//~ setInterval(generateChart, __INTERVAL);

	//show the only section
	showSection('display-section');
});
