/**
 *
 * @authors Mark Pooley (mark-pooley@uiowa.edu)
 * @date    2015-04-29 14:40:28
 * @version $Id$
 */
var colors = ['#004358','#1F8A70','#BEDB39','#FFE11A','#FD7400']
var pie = c3.generate({
	bindto: "#pie-job1",
	data: {
		//get data
		columns: [
		['Data Mangement', 25],
		['Map Generation', 25],
		['Support Services', 25],
		['Scripting', 25]
		],
		type: 'donut',
		onclick: function(d,i){console.log("onclick",d, i);},
		onmouseover: function(d,i){console.log("onmouseover", d, i);},
		onmouseout: function(d,i){console.log("onmouseout",d,i);}
	},
	donut: { title: 'Responsibilities'},
	color: { pattern: colors },
	legend: { show: false},
	transition: {duration: 1500}
});

var pie1 = c3.generate({
	bindto: "#pie-job2",
	data: {
		//get data
		columns: [
		['Data Mangement', 20],
		['Map Generation', 55],
		['Scripting', 25]
		],
		type: 'donut',
		onclick: function(d,i){console.log("onclick",d, i);},
		onmouseover: function(d,i){console.log("onmouseover", d, i);},
		onmouseout: function(d,i){console.log("onmouseout",d,i);}
	},
	donut: {title: 'Responsibilities'},
	legend: { show: false},
	color: {pattern: colors}
});

var pie2 = c3.generate({
	bindto: "#Job3",
	data: {
		//get data
		columns: [
		['Tteaching', 75],
		['Grading', 15],
		['Students', 10]
		],
		type: 'donut',
		onclick: function(d,i){console.log("onclick",d, i);},
		onmouseover: function(d,i){console.log("onmouseover", d, i);},
		onmouseout: function(d,i){console.log("onmouseout",d,i);}
	},
	donut: {title: 'Responsibilities'},
	legend: { show: false},
	color: {pattern: colors}
});