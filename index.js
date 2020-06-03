const SerialPort = require('serialport');
const ModbusRTU = require("modbus-serial");
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/serial/by-id/usb-1a86_USB2.0-Serial-if00-port0', {
    baudRate: 57600
});

const thermocouple = new ModbusRTU();

thermocouple.connectRTUBuffered("/dev/serial/by-id/usb-FTDI_FT232R_USB_UART_A107JMRN-if00-port0", {
    baudRate: 9600
});

const ch1_addr = 0x03E8;
const ch2_addr = 0x03EE;
const ch3_addr = 0x03F4;
const ch4_addr = 0x03FA;

thermocouple.setID(1);
// thermocouple.setTimeout(500);

const parser = new Readline();
port.pipe(parser);

var sens1_data = [0, 0];
var sens2_data = [0, 0];
var sens3_data = [0, 0];
var sens4_data = [0, 0];
var sens5_data = [0, 0];

var sens1_max_val = 0;
var sens2_max_val = 0;
var sens3_max_val = 0;
var sens4_max_val = 0;
var sens5_max_val = 0;

var sens1_data_index = 0;
var sens2_data_index = 0;
var sens3_data_index = 0;
var sens4_data_index = 0;
var sens5_data_index = 0;

var data_length = 9;
var interval = 10;
var inc = 1;

var data = [{
    data: generate(sens1_data_index, 0, sens1_data, data_length, function (x) {
        return x;
    }),
    xaxis: 1,
    yaxis: 1,
    lines: {
        show: true
    }
}];

var data2 = [{
    data: generate(sens2_data_index, 0, sens2_data, data_length, function (x) {
        return x;
    }),
    xaxis: 1,
    yaxis: 1,
    lines: {
        show: true
    }
}];

var data3 = [{
    data: generate(sens3_data_index, 0, sens3_data, data_length, function (x) {
        return x;
    }),
    xaxis: 1,
    yaxis: 1,
    lines: {
        show: true
    }
}];

var data4 = [{
    data: generate(sens4_data_index, 0, sens4_data, data_length, function (x) {
        return x;
    }),
    xaxis: 1,
    yaxis: 1,
    lines: {
        show: true
    }
}];

var data5 = [{
    data: generate(sens5_data_index, 0, sens5_data, data_length, function (x) {
        return x;
    }),
    xaxis: 1,
    yaxis: 1,
    lines: {
        show: true
    }
}];

function HSLAToHexA(h, s, l, a) {
    // Repeat code from HSLToHex(h,s,l) until 3 `toString(16)`s
    // console.log(h)
    // console.log(s)
    // console.log(l)
    // console.log(a)
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }



    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
    a = Math.round(a * 255).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;
    if (a.length == 1)
        a = "0" + a;
    // console.log("#" + r + g + b)
    return "#" + r + g + b; //+ a;
}

setInterval(function () {
    get_data_modbus();
}, 1000);

function get_data_modbus() {
    if (sens1_data.length === data_length + 1) {
        var i;
        for (i = 0; i < data_length; i++) {
            sens3_data[i] = sens3_data[i + 1];
            sens2_data[i] = sens2_data[i + 1];
            sens1_data[i] = sens1_data[i + 1];

        }
        thermocouple.readInputRegisters(ch1_addr, 1).then(function (data) {
            sens1_data[data_length] = data.data[0];
            thermocouple.readInputRegisters(ch2_addr, 1).then(function (data) {
                sens2_data[data_length] = data.data[0];
                thermocouple.readInputRegisters(ch3_addr, 1).then(function (data) {
                    sens3_data[data_length] = data.data[0];
                });
            });
        });
        sens1_data_index += inc;
        sens2_data_index += inc;
        sens3_data_index += inc;

    } else {
        thermocouple.readInputRegisters(ch1_addr, 1).then(function (data) {
            sens1_data[sens1_data.length] = data.data[0];
            thermocouple.readInputRegisters(ch2_addr, 1).then(function (data) {
                sens2_data[sens2_data.length] = data.data[0];
                thermocouple.readInputRegisters(ch3_addr, 1).then(function (data) {
                    sens3_data[sens3_data.length] = data.data[0];
                });
            });
        });
    }
    if(sens1_data[Math.abs(sens1_data.length - 1)] > sens1_max_val && sens1_data[Math.abs(sens1_data.length - 1)] != 31000){
        sens1_max_val = sens1_data[Math.abs(sens1_data.length - 1)];
    }
    if(sens2_data[Math.abs(sens2_data.length - 1)] > sens2_max_val && sens2_data[Math.abs(sens2_data.length - 1)] != 31000){
        sens2_max_val = sens2_data[Math.abs(sens2_data.length - 1)];
    }
    if(sens3_data[Math.abs(sens3_data.length - 1)] > sens3_max_val && sens3_data[Math.abs(sens3_data.length - 1)] != 31000){
        sens3_max_val = sens3_data[Math.abs(sens3_data.length - 1)];
    }
    document.getElementById('tmp_received').innerHTML = Math.round(sens1_data[Math.abs(sens1_data.length - 1)]);
    document.getElementById('tmp_received2').innerHTML = Math.round(sens2_data[Math.abs(sens2_data.length - 1)]);
    document.getElementById('tmp_received3').innerHTML = Math.round(sens3_data[Math.abs(sens3_data.length - 1)]);
    document.getElementById('temp1_max').innerHTML = Math.round(sens1_max_val);
    document.getElementById('temp2_max').innerHTML = Math.round(sens2_max_val);
    document.getElementById('temp3_max').innerHTML = Math.round(sens3_max_val);
    var for_hsl = sens1_data[Math.abs(sens1_data.length - 1)];
    if (sens1_data[Math.abs(sens1_data.length - 1)] > 500) {
        for_hsl = 500;
    }
    var for_hsl2 = sens2_data[Math.abs(sens2_data.length - 1)];
    if (sens2_data[Math.abs(sens2_data.length - 1)] > 500) {
        for_hsl2 = 500;
    }
    var for_hsl3 = sens3_data[Math.abs(sens3_data.length - 1)];
    if (sens3_data[Math.abs(sens3_data.length - 1)] > 500) {
        for_hsl3 = 500;
    }
    var for_hsl_max = sens1_max_val;
    if (sens1_max_val > 500) {
        for_hsl_max = 500;
    }
    var for_hsl2_max = sens2_max_val;
    if (sens2_max_val > 500) {
        for_hsl2_max = 500;
    }
    var for_hsl3_max = sens3_max_val;
    if (sens3_max_val > 500) {
        for_hsl3_max = 500;
    }
    document.getElementById('tmp_received').style.color = HSLAToHexA(Math.round(125 - (for_hsl / 4)), 100, 65, 50);
    document.getElementById('tmp_received2').style.color = HSLAToHexA(Math.round(125 - (for_hsl2 / 2)), 100, 65, 50);
    document.getElementById('tmp_received3').style.color = HSLAToHexA(Math.round(125 - (for_hsl3 / 2)), 100, 65, 50);
    document.getElementById('temp1_max').style.color = HSLAToHexA(Math.round(125 - (for_hsl_max / 4)), 100, 65, 50);
    document.getElementById('temp2_max').style.color = HSLAToHexA(Math.round(125 - (for_hsl2_max / 2)), 100, 65, 50);
    document.getElementById('temp3_max').style.color = HSLAToHexA(Math.round(125 - (for_hsl3_max / 2)), 100, 65, 50);
}

parser.on('data', line => {
    console.log("OOOOOOOOY")
    console.log(`> ${line}`)
    document.getElementById('readData').innerHTML = line;

    var obj = JSON.parse(line);
    document.getElementById('press').innerHTML = Math.round(obj.data[3]);
    document.getElementById('tension').innerHTML = Math.round(obj.data[4]);
    if(obj.data[3] > sens4_max_val){
        sens4_max_val = obj.data[3];
    }
    if(obj.data[4] > sens5_max_val){
        sens5_max_val = obj.data[4];
    }
    document.getElementById('max_press').innerHTML = Math.round(sens4_max_val);
    document.getElementById('max_tension').innerHTML = Math.round(sens5_max_val);
    var for_hsl4 = obj.data[3];
    if (obj.data[3] > 250) {
        for_hsl4 = 250;
    }
    var for_hsl5 = obj.data[4];
    if (obj.data[4] > 250) {
        for_hsl5 = 250;
    }
    var for_hsl4_max = sens4_max_val;
    if (sens4_max_val > 250) {
        for_hsl4_max = 250;
    }
    var for_hsl5_max = sens5_max_val;
    if (sens5_max_val > 250) {
        for_hsl5_max = 250;
    }
    document.getElementById('press').style.color = HSLAToHexA(Math.round(125 - (for_hsl4 / 2)), 100, 65, 50);
    document.getElementById('tension').style.color = HSLAToHexA(Math.round(125 - (for_hsl5 / 2)), 100, 65, 50);
    document.getElementById('max_press').style.color = HSLAToHexA(Math.round(125 - (for_hsl4_max / 2)), 100, 65, 50);
    document.getElementById('max_tension').style.color = HSLAToHexA(Math.round(125 - (for_hsl5_max / 2)), 100, 65, 50);

    if (sens4_data.length === data_length + 1) {
        var i;
        for (i = 0; i < data_length; i++) {
            sens5_data[i] = sens5_data[i + 1];
            sens4_data[i] = sens4_data[i + 1];

        }
        sens5_data[data_length] = obj.data[4];
        sens4_data[data_length] = obj.data[3];
        sens4_data_index += inc;
        sens5_data_index += inc;
    } else {
        sens5_data[sens5_data.length] = obj.data[4];
        sens4_data[sens4_data.length] = obj.data[3];
    }
});

function generate(start, end, data, data_length, fn) {
    var res = [];
    for (var i = 0; i <= data_length; ++i) {
        var x = start + i / data_length * (end - start)
        if (data !== undefined) {

            res.push([x, data[i]]);
        }
    }
    return res;
}

var options = {
    axisLabels: {
        show: true
    },
    xaxes: [{
        axisLabel: "Time (s)",
        position: 'bottom',
    }],
    yaxes: [{
        position: "left",
        color: "black",
        axisLabel: "Temperature",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 3,
        autoScale: 'loose',
        autoScaleMargin: null,
        growOnly: true,
        min: 0,
        max: 50.0,
        forceMinZero: true
    }],
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    },
    legend: {
        show: true,
        noColumns: 0,
        labelFormatter: function (label, series) {
            return "<font color=\"white\">" + label + "</font>";
        },
        backgroundColor: "#000",
        backgroundOpacity: 0.9,
        labelBoxBorderColor: "#000000",
        position: "nw"
    },
    grid: {
        hoverable: true,
        borderWidth: 3,
        mouseActiveRadius: 50,
        backgroundColor: {
            colors: ["#ffffff", "#EDF5FF"]
        },
        axisMargin: 20
    }
};

var options2 = {
    axisLabels: {
        show: true
    },
    xaxes: [{
        axisLabel: "Time (s)",
        position: 'bottom',
    }],
    yaxes: [{
        position: "left",
        color: "black",
        axisLabel: "Pressure",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 3,
        autoScale: 'loose',
        autoScaleMargin: null,
        growOnly: true,
        min: 0,
        max: 50.0
    }],
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    },
    legend: {
        show: true,
        noColumns: 0,
        labelFormatter: function (label, series) {
            return "<font color=\"white\">" + label + "</font>";
        },
        backgroundColor: "#000",
        backgroundOpacity: 0.9,
        labelBoxBorderColor: "#000000",
        position: "nw"
    },
    grid: {
        hoverable: true,
        borderWidth: 3,
        mouseActiveRadius: 50,
        backgroundColor: {
            colors: ["#ffffff", "#EDF5FF"]
        },
        axisMargin: 20
    }
};

var options3 = {
    axisLabels: {
        show: true
    },
    xaxes: [{
        axisLabel: "Time (s)",
        position: 'bottom',
    }],
    yaxes: [{
        position: "left",
        color: "black",
        axisLabel: "Tension",
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 12,
        axisLabelFontFamily: 'Verdana, Arial',
        axisLabelPadding: 3,
        autoScale: 'loose',
        autoScaleMargin: null,
        growOnly: true,
        min: 0,
        max: 50.0
    }],
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    },
    legend: {
        show: true,
        noColumns: 0,
        labelFormatter: function (label, series) {
            return "<font color=\"white\">" + label + "</font>";
        },
        backgroundColor: "#000",
        backgroundOpacity: 0.9,
        labelBoxBorderColor: "#000000",
        position: "nw"
    },
    grid: {
        hoverable: true,
        borderWidth: 3,
        mouseActiveRadius: 50,
        backgroundColor: {
            colors: ["#ffffff", "#EDF5FF"]
        },
        axisMargin: 20
    }
};

function update_temperature() {
    var dataset = [{
        label: "Sens 1",
        data: generate(sens1_data_index, sens1_data_index + interval, sens1_data, data_length, function (x) {
            return x;
        }),
        xaxis: 1,
        yaxis: 1,
        color: "#339afe",
        lines: {
            show: true
        },
        // splines: {
        //     show: true,
        //     tension: 0.3765,
        //     lineWidth: 1.25,
        // }
    }, {
        label: "Sens 2",
        data: generate(sens2_data_index, sens2_data_index + interval, sens2_data, data_length, function (x) {
            return x;
        }),
        xaxis: 1,
        yaxis: 1,
        color: "#56ab2f",
        lines: {
            show: true
        },
        // splines: {
        //     show: true,
        //     tension: 0.3765,
        //     lineWidth: 1.25,
        // }
    }, {
        label: "Sens 3",
        data: generate(sens3_data_index, sens3_data_index + interval, sens3_data, data_length, function (x) {
            return x;
        }),
        xaxis: 1,
        yaxis: 1,
        color: "#3C3B3F",
        lines: {
            show: true
        },
        // splines: {
        //     show: true,
        //     tension: 0.3765,
        //     lineWidth: 1.25,
        // }
    }];

    var plot = $.plot("#placeholder", dataset, options);
    plot.draw();
    window.requestAnimationFrame(update_temperature);
}

function update_pressure() {

    data4 = [{
        label: "Sens 4",
        data: generate(sens4_data_index, sens4_data_index + interval, sens4_data, data_length, function (x) {
            return x;
        }),
        xaxis: 1,
        yaxis: 1,
        color: "#339afe",
        lines: {
            show: true
        },
        // splines: {
        //     show: true,
        //     tension: 0.3765,
        //     lineWidth: 1.25,
        // }
    }];


    var plot = $.plot("#placeholder2", data4, options2);
    plot.draw();
    window.requestAnimationFrame(update_pressure);
}

function update_tension() {
    data5 = [{
        label: "Sens 4",
        data: generate(sens5_data_index, sens5_data_index + interval, sens5_data, data_length, function (x) {
            return x;
        }),
        xaxis: 1,
        yaxis: 1,
        color: "#339afe",
        lines: {
            show: true
        },
        // splines: {
        //     show: true,
        //     tension: 0.3765,
        //     lineWidth: 1.25,
        // }
    }];

    var plot = $.plot("#placeholder3", data5, options3);
    plot.draw();
    window.requestAnimationFrame(update_tension);
}

var clicked = false,
    clickY;
$(document).on({
    'mousemove': function (e) {
        clicked && updateScrollPos(e);
    },
    'mousedown': function (e) {
        clicked = true;
        clickY = e.pageY;
    },
    'mouseup': function () {
        clicked = false;
        $('html').css('cursor', 'auto');
    }
});

var updateScrollPos = function (e) {
    $('html').css('cursor', 'row-resize');
    $(window).scrollTop($(window).scrollTop() + (clickY - e.pageY));
}

window.requestAnimationFrame(update_temperature);
window.requestAnimationFrame(update_pressure);
window.requestAnimationFrame(update_tension);