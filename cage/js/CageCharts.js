//dimensions
var aspect = .75;
var width = $("#cageGauge").width();
var height = width * aspect
var arcOuterRadius = width / 2,
	arcInnerRadius =  arcOuterRadius *.55;

//color variables
var colLow = "#FFFF00",
	colHi = "#FF0000";

//Gauge text generation
var textX = $('#arc').width()/ 2
var textY = $('#cageGauge').height()

//set up variables for drawing
var start = 0 - Math.PI/2; //Starting point of arc gauge
var p = Math.PI/2; //ending point of arc on gauge
var intervals = [0,20,40,60,80,100]; //intervals for Cage Guage animation
var watched = 0, //count of watched
	total = 0; //total count of entries


var yrstart = new Date('2015-06-01'),
	today = new Date();

var getDays = function(start,today){
	time = (today-start)/(24*60*60*1000);
	if (time < 0){
		time = 0;
	}
	return time;
}


//get number of days since start
var days = [getDays(yrstart,today)]

//pull data from csv for aggregate freakouts and cage kills
d3.csv('Data/CageData.csv', function(data){
	dataset = data;
	var kills = 0,
		freaks = 0;
	data.forEach(function(d){
		kills = kills + parseInt(+d.Kills)
		freaks = freaks + parseInt(+d.Freakouts)

	})
	d3.select('#cageKills').append('svg')
		.attr('width', width)
		.attr('height',height)
		.attr('id','cageKills')
		.append('text')
		.text(kills)
		.attr('id','kills')
		.attr('x',width / 2)
		.attr('y',height / 2)
		.style('text-anchor','middle')
		//.style('font-size','48px')

	d3.select('#cageFreakouts').append('svg')
		.attr('width',width)
		.attr('height',height)
		.attr('id','cageFreaks')
		.append('text')
		.text(freaks)
		.attr('id','freaks')
		.attr('x',width / 2)
		.attr('y',height / 2)
		.style('text-anchor','middle')
		//.style('font-size','48px')

	console.log(kills, freaks)
});

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

//status label for Cage Gauge
var statusLabel = svg.append('text').attr('id','statusLabel')
	.attr('x', 0)
	.attr('y',0)
	.text('Status:')
	.style('text-anchor','middle')
	.style('font-size','12px')

//current status label that will be updated
var text = svg.append('text').attr('id','status')

// Add SVG to time gauge
var timeSVG = d3.select('#timeCage').append('svg')
	.attr("width",width)
	.attr('height',height)
	.attr('id','timeGauge')
	.append('g')
		.attr("transform", "translate(" + width / 2 + "," + height / 1.5 + ")")

//add background to time svg
var timeBackground = timeSVG.append('path')
	.datum({endAngle:(Math.PI/2)})
	.style('fill','#ddd')
	.attr('d',arc)
	.attr('id','timeArc')
	.attr('x',width/2);


var timeForeground = timeSVG.append('path')
	.datum({endAngle: start})
	.style('fill',function(d){
		return colorScale(d.endAngle);
	})
	.style('opacity',1)
	.attr('arc',arc)

var daysText = timeSVG.append('text').attr('id','daysLabel')
	.attr('x', 0)
	.attr('y',0)
	.style('text-anchor','middle')
	.style('font-size','12px')


//var gaugeLabel = svg.append('text').attr('id','gaugeLabel')
//	.attr('x',0)
//	.attr('y',-(arcOuterRadius + 15))
//	.text('The Cage Gauge')
//	.style('text-anchor','middle')
//	.style('font-size','22px')

// An arc function with all values bound except the endAngle. So, to compute an
// SVG path string for a given angle, we pass an object with an endAngle
// property to the `arc` function, and it will return the corresponding string.
var background = svg.append('path')
    .datum({endAngle:(Math.PI/2)})
    .style('fill','#ddd')
    .attr('d',arc)
    .attr('id','arc')
    .attr('x',width/2);


//foreground svg
var foreground = svg.append('path')
	.datum({endAngle: start})
	.style('fill',function(d){
		return colorScale(d.endAngle);
	})
	.style('opacity', 1.0)
	.attr('arc',arc)

function drawTime(days){
	n = days/365 *100
	timeForeground.transition()
		.delay(1000)
		.duration(250*n)
		.ease('linear')
		.call(arcTween,arcScale(n))
	.style('fill',function(){
		return colorScale(arcScale(n));
	})
	d3.select('#daysLabel')
		.transition()
		.delay(1050)
		.duration(255)
		.ease('linear')
	.attr('x',textX)
	.attr('y', + 20)
	.text(d3.format('.0f')(days) + ' Days')
	.attr('font-size', "12 px")
	.attr('fill','black')
	.attr('text-anchor', 'middle');
}


//draw the main gauge and transition through all the intervals
//
function drawGauge(data){
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
$(document).ready(drawGauge(intervals));
$(document).ready(drawTime(days));

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