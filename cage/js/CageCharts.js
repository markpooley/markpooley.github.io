//dimensions
var aspect = .45;
var width = $("#cageGauge").width();
var height = width * aspect
var arcOuterRadius = width / 4,
	arcInnerRadius =  arcOuterRadius *.60;

//color variables
var colLow = "#FFFF00",
	colHi = "#FF0000";

//Gauge text generation
var textX = $('#arc').width()/ 2
var textY = $('#cageGauge').height()

var start = 0 - Math.PI/2; //Starting point of arc gauge
var p = Math.PI/2; //ending point of arc on gauge
var intervals = [0,20,40,60,80,100]; //intervals for Cage Guage animation
var watched = 0, //count of watched
	total = 0; //total count of entries

////pull data from csv for analysis
//d3.csv('Data/CageData.csv', function(data){
//	dataset = data;
//	count = 0;
//	watched = 0;
//	data.forEach(function(d){
//		watched = watched + parseInt(+d.Status)
//		count++
//	})
//	done = watched/count * 100
//	intervals.push(done)
//
//	return dataset = dataset;
//
//});

//get number of elements watched and unwatched
var unwatched = d3.selectAll('.unwatched')[0].length
var watched = d3.selectAll('.watched')[0].length
var pctDone = function(watched,unwatched){
	total = watched + unwatched;
	if (watched == 0){
		done = 0
	} else {
		done = watched/total * 100
	}
	return done
}
done = pctDone(watched,unwatched)
intervals.push(done)


//basic arc setup.
var arc = d3.svg.arc()
	.innerRadius(arcInnerRadius)
	.outerRadius(arcOuterRadius)
	.startAngle(start);

//color scales and linear scaling of percent to radians for arc drawing
//scale for scaling a pct number to the arc
var arcScale = d3.scale.linear().domain([0,100]).range([0-Math.PI/2,Math.PI/2]);

//scale arc positions to a color scale
var colorScale = d3.scale.linear().domain([start,p]).range([colLow,colHi])

//scale status intervals to the range of possible input values
var statusScale = d3.scale.quantize()
	.domain([0,100])
	.range(['The bunny is in the box','Lowrider, Donny',"Finding some friggin' rockets!","Not The Bees!","Sh*t's gettin radical!","'Deadfall' freaking out scene"])


// Create the SVG container, and apply a transform such that the origin is the
// center of the canvas. This way, we don't need to position arcs individually.
var svg = d3.select("#cageGauge").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('id','gaugeSVG')
    .append('g')
    	.attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")");

//text label
var statusLabel = svg.append('text').attr('id','statusLabel')
	.attr('x', 0)
	.attr('y',0)
	.text('Status:')
	.style('text-anchor','middle')
	.style('font-size','12px')

//current status label that will be updated
var text = svg.append('text').attr('id','status')

var gaugeLabel = svg.append('text').attr('id','gaugeLabel')
	.attr('x',0)
	.attr('y',-(arcOuterRadius + 15))
	.text('The Cage Gauge')
	.style('text-anchor','middle')
	.style('font-size','22px')

// An arc function with all values bound except the endAngle. So, to compute an
// SVG path string for a given angle, we pass an object with an endAngle
// property to the `arc` function, and it will return the corresponding string.
var background = svg.append('path')
    .datum({endAngle:(Math.PI/2)})
    .style('fill','#ddd')
    .attr('d',arc)
    .attr('id','arc')
    .attr('x',width/2)
    .attr('');

//foreground svg
var foreground = svg.append('path')
	.datum({endAngle: start})
	.style('fill',function(d){
		return colorScale(d.endAngle);
	})
	.style('opacity', 1.0)
	.attr('arc',arc)

//draw the main gauge and transition through all the intervals
//
function draw(data){
	for(i = 0; i < data.length;i++){
		var n = data[i]
		foreground.transition()
			.delay(1000*i)
			.duration(250)
			.ease('linear')
			.call(arcTween,arcScale(n))
		.style('fill',function(){
			return colorScale(arcScale(n));
		})
		d3.select('#status')
			.transition()
			.delay(1050*i)
			.duration(255)
			.ease('linear')
		.attr('x',textX)
		.attr('y', + 20)
		.text(function(){return statusScale(n);})
		.attr('font-size', '12 px')
		.style('fill','black')
		.style('text-anchor','middle');
	}
};

//draw the intervals
$(document).ready(draw(intervals));


//function to draw new arcs from the the previous one
function arcTween(transition, newAngle) {
	transition.attrTween('d',function(d){
		var interpolate = d3.interpolate(d.endAngle, newAngle);
		return function(t) {
			d.endAngle = interpolate(t);
			return arc(d)
		};
	});
};