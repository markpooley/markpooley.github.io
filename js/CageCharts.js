//dimensions
var aspect = 1.8;
var width = $("#chart").width();
var height = width/ aspect;
radius = height/2-10

//Create an SVG and append to #map div
var watched = 0;
var dataset;
d3.csv('Data/CageData.csv', function(data){
	dataset = data
	for (var i = 0; i < dataset.length; i++) {
		if (data[i].Status == "Unwatched"){
			watched ++
		}
	}
});
console.log(watched)

var width = 960,
    height = 500;

// Create the SVG container, and apply a transform such that the origin is the
// center of the canvas. This way, we don't need to position arcs individually.
var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

//scale data to radians
var arcScale = d3.scale.linear().domain([0,100]).range([0-Math.PI/2,Math.PI/2]);
var colorScale = d3.scale.ordinal()
	.domain(['#9CA0F6',"#AA63B8","#F66CA2",'#AA2A24',"#771505"])

data = [[0,20,'#9CA0F6'],[20,40,"#AA63B8"],[40,60,"#F66CA2"],[60,80,'#AA2A24'],[80,100,"#771505"]]

// An arc function with all values bound except the endAngle. So, to compute an
// SVG path string for a given angle, we pass an object with an endAngle
// property to the `arc` function, and it will return the corresponding string.
var arcBack = d3.svg.arc()
    .innerRadius(150)
    .outerRadius(240)
    .startAngle(0-Math.PI/2)
    .endAngle(Math.PI/2);

function drawArc(a){
	var arcGauge = d3.svg.arc()
	.innerRadius(150)
	.outerRadius(240)
	.startAngle(0-Math.PI/2)
	.endAngle(a)

	var guage = svg.append('path').attr('d',arcGauge).attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")")
	.transition()
		.ease('elastic')
		.duration(750)
	.style('flll',function(){return colorScale(a);})
	.attr('class','cageRage')


}
done = 60/74 * 100

//draw the thing
drawArc(arcScale(done))

var back = svg.append("path").attr('d',arcBack).attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")")
	.style('fill', 'gray')
	.attr('class','cageGauge');


//gauge.append('text')
//		.attr('x',width /2)
//		.attr('y', height / 3)
//		.text('Gauge')
//		.attr('font-size','16px')
//

//gauge.append('path').attr('d',arc).attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")")

var rageScale = [
	[0, 'Bunny is in the Box'],
	[20, 'Eating a Peach'],
	[40, 'looking for a prom queen'],
	[60, "Let's Ride!"],
	[80, "Sh*t's gettin radical"],
	[100, "'Deadfall' freaking out scene"]
]