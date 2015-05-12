//dimensions
var aspect = 1.4;
var width = $("#chart").width();
var height = width/ aspect;


var chart = c3.generate({
	bindto: "#chart",
	data:{
		columns: [
		['year', 20,40,60,80],
		['number',25,35,45,65]
		]
		type: 'bar'
	},
	bar: {
		width:  {
			ratio: 0.80
		}
	}
})