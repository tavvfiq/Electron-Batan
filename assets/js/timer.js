const moment = require('moment');

function msToTime(duration) {
	let milliseconds = parseInt((duration%1000)/100)
			, seconds = parseInt((duration/1000)%60)
			, minutes = parseInt((duration/(1000*60))%60)
			, hours = parseInt((duration/(1000*60*60))%24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function toMysqlTime(duration) {
	let milliseconds = parseInt((duration%1000))
			, seconds = parseInt((duration/1000)%60)
			, minutes = parseInt((duration/(1000*60))%60)
			, hours = parseInt((duration/(1000*60*60))%24);

	hours = (hours < 10) ? "0" + hours : hours;
	minutes = (minutes < 10) ? "0" + minutes : minutes;
	seconds = (seconds < 10) ? "0" + seconds : seconds;

	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

function toMysqlTimestamp(ms){
	ms = parseInt(ms);
	return moment(ms).format('YYYY-MM-DD HH:mm:ss');
}

function setCurrentSection(){
	let sectionName = localStorage.getItem('section');

	if(sectionName !== null && sectionName !== 'login-section'){
		let getTimer = localStorage.getItem('timer-'+sectionName);

		if(getTimer == null){
			setTimer('init-'+sectionName);
			setTimer('start-'+sectionName);
		}
	}

	return;
};

function getSectionTimer(sectionName,formatted=true){
	let currentTimer = localStorage.getItem('timer-'+sectionName);

	if(currentTimer != null){
		return (formatted==true)?(msToTime(currentTimer)):(currentTimer);
	}
}

function getAllTimer(){
	let sectionName = localStorage.getItem('section');
	return {
		start : toMysqlTimestamp(localStorage.getItem('timer-start-'+sectionName)),
		duration : getSectionTimer(sectionName,false),
		current : toMysqlTimestamp(Date.now()),
	};
}

function getDowntimeDuration(){
	let duration = localStorage.getItem('timer-downtime');
	return (duration==null)?(0):(duration);
}

function setTimer(sectionName,date = null){
	if(date == null){
		date = new Date();
		date = date.getTime();
	}

	localStorage.setItem('timer-'+sectionName,date);
	return;
}

function deleteTimer(sectionName){
	localStorage.removeItem('timer-'+sectionName);
	return;
}

function updateTimer(){
	let sectionName = localStorage.getItem('section');
	let timerStatus = localStorage.getItem('timer-status');

	if(timerStatus && sectionName !== null && sectionName !== 'login-section'){
		let date = new Date();
		let getTimer = localStorage.getItem('timer-init-'+sectionName);

		if(timerStatus==true && getTimer !== null){
			let timer = date.getTime() - Number(getTimer);
			setTimer(sectionName,timer);
			setTimer('init-downtime');
		}
		else if(sectionName !== 'login-section'){
			setTimer('init-'+sectionName);
			setTimer('start-'+sectionName);

			let downtimeTimer = localStorage.getItem('timer-init-downtime');
			if(downtimeTimer == null || isNaN(downtimeTimer)){
				setTimer('init-downtime',date.getTime());
			}
			else{
				let timer = date.getTime() - Number(downtimeTimer);
				setTimer('downtime',timer);
			}
		}
	}
	return;
}

function runTimer(status = true){
	let timerStatus = +localStorage.getItem('timer-status');
	let sectionName = localStorage.getItem('section');
	status = +status;

	if(timerStatus==null){
		localStorage.setItem('timer-status',+true);
		return;
	}
	else{
		//resuming timer
		if(!timerStatus && status){
			if(sectionName !== 'login-section'){
				let initTimer = localStorage.getItem('timer-init-'+sectionName);
				setTimer('init-'+sectionName,initTimer-getSectionTimer(sectionName,false));
				//~ deleteTimer(sectionName);
			}
		}
		else if(timerStatus && !status){
			if(sectionName !== 'login-section'){
				let initTimer = localStorage.getItem('timer-init-downtime');
				setTimer('init-downtime',initTimer-getSectionTimer('downtime',false));
				//~ deleteTimer(sectionName);
			}
		}

		localStorage.setItem('timer-status',status);
	}

	return;
}

function initTimer(){
	let timerStatus = localStorage.getItem('timer-status');

	if(timerStatus == null){
		runTimer(true);
	}
}

function timer(){
	initTimer();
	setCurrentSection();
	updateTimer();
	return;
}

module.exports = {
	timer : timer
	,getSectionTimer : getSectionTimer
	,getAllTimer : getAllTimer
	,getDowntimeDuration : getDowntimeDuration
	,toMysqlTimestamp : toMysqlTimestamp
	,toMysqlTime : toMysqlTime
	,runTimer : runTimer
};
